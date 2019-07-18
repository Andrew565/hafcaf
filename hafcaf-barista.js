/**
 * @param {{ id: string; [x: string]: any;}} page
 * @param {?string} path
 * @param {object} hfcf
 */
const Barista = (page, path, hfcf) => {
  /**
   * @param {{ id: string; [x: string]: any;}} pageObj
   */
  const fetchPage = async pageObj => {
    // lookup either at the path provided or relative to the home page the page whose name matches the pageObj id
    const pagePath = path || "pages";
    const res = await fetch(`${pagePath}/${pageObj.id}.html`);
    const innerHTML = (await res.ok) ? res.text() : Promise.resolve("");
    return { ...page, innerHTML }; // return as an object to be processed by addRoute
  };

  fetchPage(page).then(page => hfcf.addRoute(page));
};

export default Barista;

export function HireBarista(hfcf) {
  hfcf.Barista = (page, path) => Barista(page, path, hfcf);
}
