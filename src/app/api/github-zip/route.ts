import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = searchParams.get('user');
  const repo = searchParams.get('repo');
  let branch = searchParams.get('branch')

  console.log('getting');
  if (!user || !repo || !branch) {
    return NextResponse.json({ error: 'Missing query params' }, { status: 400 });
  }
  
  const zipUrl = `https://codeload.github.com/${user}/${repo}/zip/refs/heads/${branch}`;
  console.log('zipped');
  
  try {
    const response = await axios.get(zipUrl, { responseType: 'arraybuffer' });
    console.log('got');
    return new Response(response.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch zip' }, { status: 500 });
  }
}