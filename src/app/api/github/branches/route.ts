import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // Optional: Add GITHUB_TOKEN if you have one to avoid rate limits
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    });

    const branches = response.data.map((b: any) => b.name);
    return NextResponse.json({ branches });
  } catch (error: any) {
    console.error('Error fetching branches:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}
