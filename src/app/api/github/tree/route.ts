import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const branch = searchParams.get('branch') || 'main';

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
  }

  try {
    // Get the latest commit SHA for the branch to get the tree
    const branchRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });
    
    const treeSha = branchRes.data.commit.commit.tree.sha;

    // Get the tree (non-recursive for now, or recursive if needed)
    // We'll use recursive to let the user browse deep
    const treeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/git/trees/${treeSha}?recursive=1`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' }
    });

    const tree = treeRes.data.tree;
    
    // Filter to only include directories and some important files for framework detection
    const folders = tree.filter((item: any) => item.type === 'tree').map((item: any) => item.path);
    const files = tree.filter((item: any) => item.type === 'blob').map((item: any) => item.path);

    return NextResponse.json({ folders, files });
  } catch (error: any) {
    console.error('Error fetching tree:', error?.response?.data || error.message);
    return NextResponse.json({ error: 'Failed to fetch tree' }, { status: 500 });
  }
}
