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

const isLocalhost = (url: string): boolean => {
  const parsedUrl = new URL(url);
  return (
    parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1'
  );
};

app.use('/index', async (c, next) => {
  const url = c.req.query('url');

  try {
    if (!!url && isLocalhost(url)) {
      console.log('localhostだ。さてはSSRFを試みているな');
      return c.html(indexTemplate(url, 'このURLは表示できないよ'));
    }
  } catch (error) {
    console.error("Can't parse url", error);
    return c.html(indexTemplate(url, 'エラーが発生しました'));
  }

  await next();
});

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
