const isSPA = STAGEHAND_IS_SPA;
const allPageRoutesServedFromIndex = STAGEHAND_INDEX_ROUTES;

window.addEventListener("DOMContentLoaded", function (e) {
  console.log(e);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("https://STAGEHAND_PLACEHOLDER/stagehand_sw.js")
      .catch(err => console.error("Service worker registration failed", err));

    const iframe = document.querySelector("iframe");
    const basepath = window.location.pathname;
    
    let path = window.location.href.split("#")[1];
    if (path && path[0] === '/') path = path.slice(1);
    
    let iframePolling;
    let iframePath;

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
          const iframeTitle = ((irame.contentWindow && iframe.contentWindow.document) || iframe.contentDocument).title;
          window.history.pushState({}, iframeTitle, `#${iframePath || 'index'}`);
          document.title = `Stagehand: ${iframeTitle}`;
        }
      }, 500);
    }

    const setIframeSrc = (path) => {
      if (isSPA) {
        iframe.src = basepath + "index.html";
      } else if (allPageRoutesServedFromIndex) {
        if (path && !path.endsWith("/")) path += "/";
        if (path === "index/") path = "";

        iframe.src = basepath + (path || "") + "index.html";
      } else {
        if (path && path.endsWith('/')) path += 'index';

        iframe.src = basepath + (path || "index") + ".html";
      }
    }

    console.log('change location: ', basepath + (path || 'index') + '.html')    
    setIframeSrc(path);

    iframePolling = polliFrame();

    window.addEventListener('popstate', function(e) {
      console.log(e);
      clearInterval(iframePolling);

      const newPath = window.location.hash.slice(1) || '';
      console.log(basepath + newPath + '.html')

      setIframeSrc(newPath)
      iframePolling = polliFrame();
    });

    console.log(navigator.serviceWorker);
  } else {
    console.log("Service worker not supported");
  }
});
