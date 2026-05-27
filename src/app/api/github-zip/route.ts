import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const repo = searchParams.get('repo');
  let branch = searchParams.get('branch')

  if (!user || !repo || !branch) {
    return new Response(JSON.stringify({ error: 'Missing query params' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const zipUrl = `https://codeload.github.com/${user}/${repo}/zip/refs/heads/${branch || 'main'}`;
  
  try {
    const response = await fetch(zipUrl);
    if (!response.ok) throw new Error('GitHub fetch failed');
    
    const buffer = await response.arrayBuffer();
    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Cache-Control': 'no-store, max-age=0',
      }      
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch zip' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}