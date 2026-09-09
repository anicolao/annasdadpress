import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("dist");
http
  .createServer(async (req, res) => {
    try {
      const pathname = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      let file = path.resolve(root, "." + pathname);
      if (!file.startsWith(root + path.sep) && file !== root) throw Error();
      if ((await stat(file)).isDirectory())
        file = path.join(file, "index.html");
      const data = await readFile(file);
      res.setHeader(
        "Content-Type",
        {
          html: "text/html; charset=utf-8",
          css: "text/css",
          svg: "image/svg+xml",
          webp: "image/webp",
          pdf: "application/pdf",
          png: "image/png",
          xml: "application/xml",
          txt: "text/plain",
        }[file.split(".").pop()] || "application/octet-stream",
      );
      res.end(data);
    } catch {
      res.statusCode = 404;
      res.end(await readFile(path.join(root, "404.html")));
    }
  })
  .listen(4173, "127.0.0.1", () =>
    console.log("Preview: http://127.0.0.1:4173"),
  );
