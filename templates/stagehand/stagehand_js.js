window.addEventListener("DOMContentLoaded", function (e) {
  console.log(e);
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("https://STAGEHAND_PLACEHOLDER/stagehand_sw.js")
      .catch(err => console.error("Service worker registration failed", err));

    const iframe = document.querySelector("iframe");

    const path = window.location.href.split("#")[1];
    const basepath = window.location.pathname;

    iframe.src = basepath + (path || "index") + ".html";

    let iframePath;

    setInterval(() => {
      iframePath = (
        iframe.contentWindow || iframe.contentDocument
      ).location.pathname.slice(1);
      if (window.location.hash.slice(1) !== iframePath) {
        window.history.pushState({}, "iframe", `#${iframePath}`);
      }
    }, 500);

    console.log(navigator.serviceWorker);
  } else {
    console.log("Service worker not supported");
  }
});
