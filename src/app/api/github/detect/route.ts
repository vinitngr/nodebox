import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');
  const branch = searchParams.get('branch') || 'main';
  const path = searchParams.get('path') || '';

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 });
  }

  const packageJsonUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path ? path + '/' : ''}package.json`;

  try {
    const response = await axios.get(packageJsonUrl);
    const pkg = response.data;
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    let framework = 'unknown';
    if (deps.vite) framework = 'vite';
    else if (deps.next) framework = 'next';
    else if (deps['@angular/core']) framework = 'angular';
    else if (deps.nuxt) framework = 'nuxt';
    else if (deps['@sveltejs/kit']) framework = 'sveltekit';
    else if (deps.react) framework = 'react';

    return NextResponse.json({ framework, pkgName: pkg.name });
  } catch (error) {
    return NextResponse.json({ framework: 'none' });
  }
}
