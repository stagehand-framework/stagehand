self.addEventListener("install", event => {
  console.log("service worker installed");
});

self.addEventListener("activate", event => {
  clients.claim();
});

caches.keys().then(function (names) {
  for (let name of names) caches.delete(name);
});

// const channel = new BroadcastChannel("stagehand");
let basePath;

// let client;

const handleRequest = async event => {
  console.log(event);
  // Send a message to the client

  let requestedUrl;
  // if referrer matches the url and has a mode navigate
  // intercept event and send the url over postMessage
  const url = event.request.url;
  const referrer = event.request.referrer;
  // client = client || event.clientId;

  // Get domain of current url and requested url
  const urlDomain = url.match(/[^\/]+\/\/[^\.]+\.cloudfront\.net/);
  const referrerDomain = referrer.match(/[^\/]+\/\/[^\.]+\.cloudfront\.net/);

  // Get basepath of referrer
  const referrerBasePathMatch = referrer.match(
    /[^\/]+\/\/[^\.]+\.cloudfront.net\/([^\/]+\/[^\/]+)/
  );

  // Get basepath and remaining path of requested url
  const urlPathMatch = url.match(
    /[^\/]+\/\/[^\.]+\.cloudfront.net\/([^\/]+\/[^\/]+)\/(.*)/
  );

  // Base paths
  const referrerBasePath =
    (referrerBasePathMatch && referrerBasePathMatch[1]) || "";
  const urlBasePath = (urlPathMatch && urlPathMatch[1]) || "";

  basePath = basePath || referrerBasePath;

  console.log(referrerBasePath, urlBasePath);
  // check if the domains are both for cloudfront and the request is for an html doc
  if (
    (referrerDomain && referrerDomain[0]) === (urlDomain && urlDomain[0]) &&
    event.request.mode === "navigate"
  ) {
    // Build up domain and base path
    requestedUrl = referrerDomain[0] + "/" + referrerBasePath;
    console.log(requestedUrl);
    let req;
    // If base paths are different that means the url has no base path
    // Add on everything after the cloudfront domain to requestedUrl
    if (referrerBasePath !== urlBasePath) {
      const path = url.split("cloudfront.net");
      requestedUrl += "/" + (path && path[1]);

      // // respond with nothing to iframe
      const controller = new AbortController();
      const signal = controller.signal;

      req = new Request(requestedUrl, {
        mode: "cors",
        signal,
      });

      // if the base paths are the same that means that the iframe was updated by the JS script
      // Make a new request using the proper URL
    } else {
      if (!referrerBasePath) console.log(requestedUrl, urlPathMatch);
      requestedUrl += "/" + urlPathMatch[2] || "";
      req = new Request(requestedUrl, {
        mode: "cors",
        cache: event.request.cache,
        headers: event.request.headers,
        referrer: event.request.referrer,
      });
    }

    return fetch(req)
      .then(res => res)
      .catch(err => console.log("err:", err));

    // to handle everything that isn't HTML (navigation)
  } else if (
    (referrerDomain && referrerDomain[0]) === (urlDomain && urlDomain[0])
  ) {
    // if basepath is there, do nothing, if basepath isn't there, add it
    if (referrerBasePath !== urlBasePath) {
      // Inject basepath to url

      let newBasePath;
      if (referrerBasePath) newBasePath = referrerBasePath + "/";
      const newUrl = url.replace(
        "cloudfront.net/",
        `cloudfront.net/${basePath + "/" || ""}`
      );

      console.log(newUrl);
      const req = new Request(newUrl, {
        mode: "cors",
        cache: event.request.cache,
        headers: event.request.headers,
        referrer: event.request.referrer,
      });

      console.log("request:", req);

      return fetch(req)
        .then(res => res)
        .catch(err => console.log("err:", err));

    } else if (!referrerBasePath) {
      const newUrl = url.replace(
        "cloudfront.net/",
        `cloudfront.net/${basePath + "/" || ""}`
      );

      const req = new Request(newUrl, {
        mode: "cors",
        cache: event.request.cache,
        headers: event.request.headers,
        referrer: event.request.referrer,
      });

      console.log("request:", req);

      return fetch(req)
        .then(res => res)
        .catch(err => console.log("err:", err));
    }
  }

  const req = new Request(event.request.url, {
    ...event.request,
    mode: "cors",
    cache: event.request.cache,
    headers: event.request.headers,
    referrer: event.request.referrer,
  });

  return fetch(req)
    .then(res => res)
    .catch(err => console.log("err:", err));
  console.log("in the postMessage");
};

self.addEventListener("fetch", event => {
  event.respondWith(handleRequest(event));
});
