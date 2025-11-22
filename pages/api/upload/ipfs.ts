import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import FormData from 'form-data';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

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
    const apiKey = process.env.PINATA_API_KEY;
    const secretKey = process.env.PINATA_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return res.status(500).json({
        success: false,
        error: 'Pinata API credentials not configured',
      });
    }

    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB
      keepExtensions: true,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: 'Failed to parse form data',
        });
      }

      try {
        const formData = new FormData();
        const fileArray = Array.isArray(files.file) ? files.file : [files.file];
        const uploadedFiles: string[] = [];

        // Add files to form data
        for (const file of fileArray) {
          if (file) {
            const fileStream = fs.createReadStream(file.filepath);
            formData.append('file', fileStream, file.originalFilename || 'file');
            uploadedFiles.push(file.originalFilename || 'file');
          }
        }

        if (uploadedFiles.length === 0) {
          return res.status(400).json({
            success: false,
            error: 'No files provided',
          });
        }

        // Add metadata
        const metadata = JSON.stringify({
          name: `trademark-assets-${Date.now()}`,
        });
        formData.append('pinataMetadata', metadata);

        // Upload to Pinata
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'pinata_api_key': apiKey,
            'pinata_secret_api_key': secretKey,
            ...formData.getHeaders(),
          },
          body: formData as any,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Pinata upload failed');
        }

        const data = await response.json();

        return res.status(200).json({
          success: true,
          data: {
            cid: data.IpfsHash,
            files: uploadedFiles,
            url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
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