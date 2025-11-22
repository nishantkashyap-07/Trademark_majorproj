import type { NextApiRequest, NextApiResponse } from 'next';

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

    const metadata = req.body;

    if (!metadata) {
      return res.status(400).json({
        success: false,
        error: 'No metadata provided',
      });
    }

    // Upload JSON to Pinata
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': apiKey,
        'pinata_secret_api_key': secretKey,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `trademark-metadata-${Date.now()}`,
        },
      }),
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
        url: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`,
      },
    });
  } catch (error: any) {
    console.error('Metadata Upload Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload metadata to IPFS',
    });
  }
}
