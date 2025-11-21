/**
 * @typedef {import("./hafcaf.js").default} hafcaf
 */

/**
 * @param {{ id: string; [x: string]: any;}} page
 * @param {?string} path
 * @param {hafcaf} hfcf
 */
const Barista = (page, path, hfcf) => {
  /**
   * @param {{ id: string; [x: string]: any;}} pageObj
   */
  const fetchPage = async pageObj => {
    // lookup either at the path provided or relative to the home page the page whose name matches the pageObj id
    const pagePath = path || "pages";
    const res = await fetch(`${pagePath}/${pageObj.id}.html`);
    const innerHTML = res.ok ? await res.text() : "";
    return { ...page, innerHTML }; // return as an object to be processed by addRoute
  };

  fetchPage(page).then(pageData => hfcf.addRoute(pageData));
};

export default Barista;

/**
 * @param {hafcaf} hfcf
 */
export function HireBarista(hfcf) {
  /**
   * @param {{ id: string; [x: string]: any;}} page
   * @param {?string} path
   */
  hfcf.Barista = (page, path) => Barista(page, path, hfcf);
}
