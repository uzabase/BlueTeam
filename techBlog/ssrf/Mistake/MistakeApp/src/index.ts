import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();

const indexTemplate = (url?: string, content?: string) => `
  <html>
    <head>
      <title>SSRF Example App</title>
    </head>
    <body>
      <h1>入力されたURLをFetchして表示するよ</h1>
      <p>URL: ${url ?? ''}</p>
      <form action="/" method="GET">
      <input type="url" name="url" value="${
        url ?? 'http://localhost:3000/secret'
      }"/>
      <button type="submit">Submit</button>
      </form>
      <a href="/">クリア</a>
      <hr>
      ${content ?? ''}
    </body>
  </html>
`;

app.get('/index', async (c) => {
  const url = c.req.query('url');
  let content = '';

  if (!!url) {
    try {
      const requestUrl = new URL(url);
      content = await fetch(requestUrl.origin + requestUrl.pathname).then(
        (res) => res.text()
      );
    } catch (error) {
      console.error(error);
      content = 'エラーが発生しました';
    }
  }

  return c.html(indexTemplate(url, content));
});

app.get('/secret', (c) => c.json({ message: '公開していないAPIだよ' }));

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
