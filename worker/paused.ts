const message = `<!doctype html>
<html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>作品集暂时关闭</title>
<style>body{margin:0;min-height:100svh;display:grid;place-items:center;font-family:"PingFang SC",system-ui,sans-serif;color:#292a28;background:#fafaf8}h1{font-size:1.4rem;font-weight:500}</style>
</head><body><main><h1>作品集暂时关闭</h1></main></body></html>`;

export default {
  fetch(request: Request): Response {
    return new Response(request.method === "HEAD" ? null : message, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  },
};
