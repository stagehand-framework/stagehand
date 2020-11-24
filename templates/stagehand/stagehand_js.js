window.addEventListener("DOMContentLoaded", function (e) {
  console.log(e);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("https://STAGEHAND_PLACEHOLDER/stagehand_sw.js")
      .catch(err => console.error("Service worker registration failed", err));

    const iframe = document.querySelector("iframe");
    const basepath = window.location.pathname;
    const path = window.location.href.split("#")[1];
    
    let iframePolling;
    let iframePath;

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ resetBasepath: true });
    }
    
    const polliFrame = () => {
      return setInterval(() => {
        iframePath = (
          iframe.contentWindow || iframe.contentDocument
        ).location.pathname.slice(1) || 'index';
        
        const tempiFramePath = '/' + iframePath;

        if ((tempiFramePath).match(basepath)) {
          iframePath = tempiFramePath.split(basepath)[1];
        }

        if (iframePath.endsWith('.html')) iframePath = iframePath.slice(0, -5);

        if (window.location.hash.slice(1) !== iframePath) {
          console.log('new poll:', iframePath)
          const iframeTitle = (iframe.contentWindow || iframe.contentDocument).document.title;
          window.history.pushState({}, iframeTitle, `#${iframePath || 'index'}`);
        }
      }, 500);
    }

    console.log('change location: ', basepath + (path || 'index') + '.html')
    if (path && path[0] === '/') path = path.slice(1);
    iframe.src = basepath + (path || "index") + ".html";
    iframePolling = polliFrame();

    window.addEventListener('popstate', function(e) {
      console.log(e);
      clearInterval(iframePolling);
      const newPath = window.location.hash.slice(1) || 'index';
      // const newPath = e.target.location.hash.slice(1) || 'index';
      console.log(basepath + newPath + '.html')
      iframe.src = basepath + newPath + '.html';

      iframePolling = polliFrame();

    });

    console.log(navigator.serviceWorker);
  } else {
    console.log("Service worker not supported");
  }
});
