
export function parseGitHubUrl(url: string) {
  if (!url) return null;

  // Remove .git suffix if present
  url = url.trim().replace(/\.git$/, "");

  // Handle SSH format: git@github.com:owner/repo
  const sshMatch = url.match(/^git@github\.com:([^\/]+)\/([^\/]+)$/);
  if (sshMatch) {
    return { owner: sshMatch[1], repo: sshMatch[2] };
  }

  // Handle HTTP/HTTPS formats: https://github.com/owner/repo or github.com/owner/repo
  const httpMatch = url.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^\/]+)\/([^\/]+)/);
  if (httpMatch) {
    return { owner: httpMatch[1], repo: httpMatch[2] };
  }

  // Handle owner/repo format
  const simpleMatch = url.match(/^([^\/]+)\/([^\/]+)$/);
  if (simpleMatch && !url.includes("://")) {
    return { owner: simpleMatch[1], repo: simpleMatch[2] };
  }

  return null;
}
