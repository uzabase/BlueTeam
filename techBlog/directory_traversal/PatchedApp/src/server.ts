// expressでサーバーを立ち上げる
import express from "express";
import path from "path";
import fs from "fs";

const app = express();
const port = 3000;

// 画像のディレクトリパスを受け取り、その画像をそのまま返すAPI
app.get("/images", (req, res) => {
  const fileName = req.query.fileName as string;
  // ファイルを読み込む
  const filePath = path.join(__dirname,"public", fileName);

  const parsedPath = path.parse(filePath);
  if (parsedPath.dir !== path.join(__dirname, "public")) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    let contentType = "application/octet-stream";
    if (ext === ".jpg" || ext === ".jpeg") {
      contentType = "image/jpeg";
    } else if (ext === ".png") {
      contentType = "image/png";
    } else if (ext === ".gif") {
      contentType = "image/gif";
    }
  });
  const file = fs.readFileSync(filePath, "utf-8");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
      return;
    }

    // Set the correct Content-Type for the image
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.end(data);
  });
});

const imageListTemplate = (content?: string) => `
  <html>
    <head>
      <title>画像一覧</title>
    </head>
    <body>
      <h1>画像一覧</h1>
      ${content ?? ""}
    </body>
  </html>
`;

// 画像のディレクトリパスの一覧を表示するページ
app.get("/", (req, res) => {
  const files = [
    "image1.png",
    "image2.png",
    "image3.png",
  ];

  const content = files
    .map((fileName: string) => `<img src="/images?fileName=${fileName}" />`)
    .join("");

  res.send(imageListTemplate(content));
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
