// Shared mode switch and export readiness for the 2026-09-30 series posters.
// ?cover / ?flow select the export; data-render-ready becomes "true" only once
// both brand fonts have loaded and every <img> in the page has decoded, so an
// automated export never captures a fallback face or a missing picture.
(function () {
  var mode = new URLSearchParams(location.search);
  if (mode.has("cover")) document.body.classList.add("cover");
  if (mode.has("flow")) document.body.classList.add("flow");
  var root = document.documentElement;
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
