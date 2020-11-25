self.addEventListener("install", event => {
  console.log("service worker installed");
});

self.addEventListener("activate", event => {
  clients.claim();
});

caches.keys().then(function (names) {
  for (let name of names) caches.delete(name);
});

let basePath;

self.addEventListener('message', (event) => {
  if (event.data.resetBasepath) basePath = null;
});

const handleRequest = async event => {
  console.log(event);

  let requestedUrl;

  const url = event.request.url;
  const referrer = event.request.referrer;

  // Get CF domain of current url and requested url
  // => "https://124125.cloudfront.net"
  const urlDomain = url.match(/[^\/]+\/\/[^\.]+\.cloudfront\.net/);
  const referrerDomain = referrer.match(/[^\/]+\/\/[^\.]+\.cloudfront\.net/);

  // Get basepath of referrer
  // => ["125125.cloudfront.net", "branch/commit"]
  const referrerBasePathMatch = referrer.match(
    /[^\/]+\/\/[^\.]+\.cloudfront.net\/([^\/]+\/[^\/]+)/
  );

  // Get basepath and remaining path of requested url
  // => "about/index"
  const urlPathMatch = url.match(/[^\/]+\/\/[^\.]+\.cloudfront.net\/(.*)/);

  // => "branch/commit"
  basePath = basePath || (referrerBasePathMatch && referrerBasePathMatch[1]) || '';

  console.log('basePath:', basePath);
  // check if the domains are both for same cloudfront
  // If they are we need to make sure it has basePath prepended
  if ((referrerDomain && urlDomain) && (referrerDomain[0] === urlDomain[0])) {
    let urlPath = urlPathMatch && urlPathMatch[1] || '';
    let req;

    if (urlPath.startsWith('/')) urlPath = urlPath.slice(1);
    if (urlPath.endsWith('/') || urlPath === '') urlPath += 'index';
    if (urlPath && !urlPath.includes('.')) urlPath += '.html';

    // if it already has basepath send req as is
    if (urlPath.match(basePath)) {      
      urlPath = urlDomain + '/' + urlPath

    // prepend basepath
    } else {
      urlPath = urlDomain + '/' + basePath + '/' + urlPath;
    }

    console.log('urlPath:', urlPath);

    req = new Request(urlPath, {
      ...event.request,
    });

    console.log("request:", req);

    return fetch(req)
      .then(res => res)
      .catch(err => console.log("err:", err));
  }

  // if not origin domain then just forward the initial request
  return fetch(event.request)
    .then(res => res)
    .catch(err => console.log("err:", err));
};

self.addEventListener("fetch", event => {
  event.respondWith(handleRequest(event));
});
