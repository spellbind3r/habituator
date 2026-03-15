import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const PORT = Number(process.env.PORT || 4173);
const ROOT = process.cwd();

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const safePath = (urlPath) => {
  const clean = normalize(urlPath.split("?")[0]).replace(/^\.+[\\/]/, "");
  return join(ROOT, clean === "/" ? "index.html" : clean.replace(/^\//, ""));
};

const server = createServer((req, res) => {
  const filePath = safePath(req.url || "/");

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  const mimeType = MIME[extname(filePath)] || "application/octet-stream";
  res.writeHead(200, {
    "Content-Type": mimeType,
    "Cache-Control": "no-cache"
  });

  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Habituator dev server running at http://localhost:${PORT}`);
});
