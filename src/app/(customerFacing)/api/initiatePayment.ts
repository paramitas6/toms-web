import type { NextApiRequest, NextApiResponse } from 'next';

const HELCIM_API_URL = 'https://api.helcim.com/v2/helcim-pay/initialize';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  const { amount, currency } = req.body;

  // Retrieve your Helcim API Access Token from environment variables
  const apiToken = process.env.HELCIM_API_TOKEN;

  if (!apiToken) {
    res.status(500).json({ error: 'Missing API token' });
    return;
  }

  // Prepare the payload for Helcim API
  const payload = {
    paymentType: 'purchase',
    amount,
    currency,
  };

  try {
    const response = await fetch(HELCIM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-token': apiToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      res.status(response.status).json({ error: errorData });
      return;
    }

    const data = await response.json();

    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
