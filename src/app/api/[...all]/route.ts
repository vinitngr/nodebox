import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'API route not found' }, { status: 404 });
}

export async function POST() {
  return NextResponse.json({ error: 'API route not found' }, { status: 404 });
}


