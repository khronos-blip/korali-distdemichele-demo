const PREFIX = '/demos/de-michele';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === PREFIX) {
      url.pathname = `${PREFIX}/`;
      return Response.redirect(url.toString(), 308);
    }
    if (!url.pathname.startsWith(`${PREFIX}/`)) return new Response('Not found', { status: 404 });
    const relativePath = url.pathname.slice(PREFIX.length) || '/';
    url.pathname = relativePath === '/' ? '/index.html' : relativePath;
    return env.ASSETS.fetch(new Request(url, request));
  }
};
