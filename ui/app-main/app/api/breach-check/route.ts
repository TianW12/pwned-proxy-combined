// app-main/app/api/breach-check/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const proxyKey =
      process.env.HIBP_PROXY_API_KEY ||
      process.env.HIBP_API_KEY ||
      '';
    if (!proxyKey) {
      return NextResponse.json(
        { error: 'HIBP_PROXY_API_KEY is not configured on the frontend server.' },
        { status: 500 }
      );
    }

    // Server‑side call to your Django API – no CORS issues here
    // Prefer the internal backend hostname when running inside Docker.
    const baseUrl = (
      process.env.HIBP_PROXY_INTERNAL_URL ||
      'http://backend:8000'
    ).replace(/\/$/, '');
    const response = await fetch(
      `${baseUrl}/api/v3/breachedaccount/${encodeURIComponent(email)}?includeUnverified=true&truncateResponse=false`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: authHeader,
          'X-API-Key': proxyKey,
        },
      }
    );

    const text = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        { error: `Backend API error: ${response.status}`, details: text },
        { status: response.status }
      );
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
