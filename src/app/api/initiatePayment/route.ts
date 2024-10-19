import { NextRequest, NextResponse } from 'next/server';

const HELCIM_API_URL = 'https://api.helcim.com/v2/helcim-pay/initialize';

export async function POST(req: NextRequest) {
  const { amount, currency } = await req.json();

  const apiToken = process.env.HELCIM_API_TOKEN;

  if (!apiToken) {
    return NextResponse.json({ error: 'Missing API token' }, { status: 500 });
  }

  try {
    const response = await fetch(HELCIM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-token': apiToken,
      },
      body: JSON.stringify({ paymentType: 'purchase', amount, currency }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
