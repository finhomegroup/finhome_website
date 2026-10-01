// Shared mode switch and export readiness for the 2026-09-30 series posters.
// ?cover / ?flow select the export; data-render-ready becomes "true" only once
// both brand fonts have loaded and every <img> in the page has decoded, so an
// automated export never captures a fallback face or a missing picture.
(function () {
  var mode = new URLSearchParams(location.search);
  if (mode.has("cover")) document.body.classList.add("cover");
  if (mode.has("flow")) document.body.classList.add("flow");
  var root = document.documentElement;
  // ?hd: a true 2x export (2160 x 2700). OPT-IN per package — only pages whose
  // <body> declares data-hd="true" honour it, so every other poster is unchanged.
  if (mode.has("hd") && document.body.dataset.hd === "true") {
    document.body.classList.add("hd");
    root.classList.add("hd");
    root.dataset.exportSize = "2160x2700";
    // &part=top|bottom: EXPORT-ONLY slicing for capture tools that cap height.
    // Each frame is 2160 x 1350 of the SAME unscaled 2160 x 2700 scene, shifted
    // by 0 or -1350px; the two frames stack back to the full poster.
    var part = mode.get("part");
    if (part === "top" || part === "bottom") {
      document.body.classList.add("hd-part", "hd-part-" + part);
      root.classList.add("hd-part");
      root.dataset.exportPart = part;
      root.dataset.exportSize = "2160x1350";
      root.dataset.exportOffsetY = part === "top" ? "0" : "1350";
    }
  }
  Promise.all([
    document.fonts.load("400 24px MaisonBook", "Thu nhập mỗi tháng ₫"),
    document.fonts.load("500 32px MaisonMedium", "Mỗi tháng còn bao nhiêu?")
  ].concat(Array.prototype.map.call(document.images, function (img) { return img.decode(); })))
    .then(function () { return document.fonts.ready; })
    .then(function () {
      root.dataset.renderReady = "true";
      root.dataset.imagesReady = String(document.images.length);
      root.dataset.brandFonts = Array.from(document.fonts)
        .filter(function (f) { return f.status === "loaded"; })
        .map(function (f) { return f.family; })
        .join(",");
    })
    .catch(function () { root.dataset.renderReady = "false"; });
})();
