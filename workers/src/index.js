function getErrorPage(subdomain) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>404 Not Found - ${subdomain}.nodebox.vinitngr.xyz</title>
  <style>
    body { font-family: Arial, sans-serif; background: #f9f9f9; color: #333; text-align: center; padding: 3rem; }
    h1 { font-size: 3rem; margin-bottom: 1rem; }
    p { font-size: 1.25rem; margin-bottom: 2rem; }
    a { color: #007acc; text-decoration: none; font-weight: bold; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>404 - Page Not Found</h1>
  <p>The requested resource does not exist.</p>
  <p>See Uploaded projects <a href="https://nodebox.vinitngr.xyz/community">here</a></p>
  <p>creator : <a href="https://portfolio.vinitngr.xyz">vinitngr.xyz</a></p>
</body>
</html>`;
}


export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const parts = url.hostname.split('.');
      const subdomain = parts.length > 3 ? parts[0].toLowerCase() : "portfolio";
      const path = url.pathname === "/" ? "/index.html" : url.pathname;

      const targetUrl = `${env.CLOUDFRONT_URL}/${subdomain}${path}`;
      const resp = await fetch(targetUrl, {
        method: request.method,
        headers: request.headers,
      });

      if (resp.status === 403) {
        return new Response(getErrorPage(subdomain), {
          status: 404,
          headers: { "Content-Type": "text/html" },
        });
      }

      const noBodyStatuses = [101, 204, 205, 304];
      const hasCacheHeader = request.headers.has("if-none-match") || request.headers.has("if-modified-since");

      if (noBodyStatuses.includes(resp.status)) {
        if (resp.status === 304 && hasCacheHeader) {
          return new Response(null, {
            status: 304,
            headers: resp.headers,
          });
        }

        const body = await resp.text();
        return new Response(body, {
          status: 200,
          headers: resp.headers,
        });
      }

      return resp;
    } catch (err) {
      return new Response("Worker Error:\n" + err.message, {
        status: 500,
        headers: { "content-type": "text/plain" },
      });
    }
  },
};
