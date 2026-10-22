// Host-aware internal rewrites for the current Cloudflare Pages project.
// Only the explicit routes in _routes.json invoke this Function.
const COM_ROUTES = Object.freeze({
  '/': '/en/',
  '/kz': '/',
  '/kz/': '/',
  '/privacy': '/en/privacy/',
  '/privacy/': '/en/privacy/',
  '/kz/privacy': '/privacy/',
  '/kz/privacy/': '/privacy/',
  '/gptads': '/gptads/en/',
  '/gptads/': '/gptads/en/',
  '/gptads/kz': '/gptads/',
  '/gptads/kz/': '/gptads/',
  '/robots.txt': '/robots-com.txt',
  '/sitemap.xml': '/sitemap-com.xml'
});

export async function onRequest(context) {
  const { request, env } = context;
  if (request.method !== 'GET' && request.method !== 'HEAD') return context.next();
  const url = new URL(request.url);
  if (!/^(?:www\.)?skvoznyak\.com$/i.test(url.hostname)) return context.next();
  const target = COM_ROUTES[url.pathname];
  if (!target) return context.next();
  const assetUrl = new URL(request.url);
  assetUrl.pathname = target;
  return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
}
