(() => {
  const SITE_VERSION = "artzac-1.0.1";

  const versionAsset = (element, attribute) => {
    const value = element.getAttribute(attribute);

    if (!value) return;
    if (value.startsWith("http")) return;
    if (value.includes("?v=")) return;

    element.setAttribute(attribute, `${value}?v=${SITE_VERSION}`);
  };

  document
    .querySelectorAll('link[rel="stylesheet"][href]')
    .forEach((link) => versionAsset(link, "href"));

  document
    .querySelectorAll("script[src]")
    .forEach((script) => versionAsset(script, "src"));

  document
    .querySelectorAll("img[src]")
    .forEach((img) => versionAsset(img, "src"));
})();