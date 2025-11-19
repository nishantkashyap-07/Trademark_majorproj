import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { Web3Storage } from 'web3.storage';

export const config = {
  api: {
    bodyParser: false, // Disable default body parser for file uploads
  },
};

function getWeb3StorageClient() {
  const token = process.env.WEB3_STORAGE_TOKEN;
  if (!token) {
    throw new Error('WEB3_STORAGE_TOKEN is not configured');
  }
  return new Web3Storage({ token });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
    });
  }

  try {
    // Check if Web3Storage token is configured
    if (!process.env.WEB3_STORAGE_TOKEN) {
      return res.status(200).json({
        success: true,
        message: 'Server-side IPFS upload not configured. Use client-side upload via utils/ipfs.ts',
        note: 'Set WEB3_STORAGE_TOKEN environment variable to enable server-side uploads',
      });
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    form.parse(req, async (err: any, fields: any, files: any) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: 'Failed to parse form data',
        });
      }

      try {
        const client = getWeb3StorageClient();
        const uploadFiles: File[] = [];

        // Process uploaded files
        const fileArray = Array.isArray(files.files) ? files.files : [files.files];
        
        for (const file of fileArray) {
          if (file) {
            const fileData = fs.readFileSync(file.filepath);
            const fileName = file.originalFilename || 'file';
            
            uploadFiles.push(
              new File([fileData], fileName, {
                type: file.mimetype || 'application/octet-stream',
              })
            );
          }
        }

        if (uploadFiles.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No files provided',
          });
        }

        // Upload to IPFS
        const cid = await client.put(uploadFiles, {
          name: `trademark-${Date.now()}`,
          maxRetries: 3,
        });

        return res.status(200).json({
          success: true,
          data: {
            cid,
            files: uploadFiles.map(f => f.name),
            url: `https://ipfs.io/ipfs/${cid}`,
          },
        });
      } catch (uploadError: any) {
        console.error('Upload Error:', uploadError);
        return res.status(500).json({
          success: false,
          error: uploadError.message || 'Failed to upload to IPFS',
        });
      }
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}