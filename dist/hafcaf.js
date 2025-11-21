// src/hafcaf-barista.js
var Barista = (page, path, hfcf) => {
  const fetchPage = async (pageObj) => {
    const pagePath = path || "pages";
    const res = await fetch(`${pagePath}/${pageObj.id}.html`);
    const innerHTML = res.ok ? await res.text() : "";
    return { ...page, innerHTML };
  };
  fetchPage(page).then((pageData) => hfcf.addRoute(pageData));
};
var hafcaf_barista_default = Barista;
function HireBarista(hfcf) {
  hfcf.Barista = (page, path) => Barista(page, path, hfcf);
}

// src/hafcaf-tamper.js
var tamp = (tmpl, values) => Object.keys(values).reduce((acc, key) => {
  return acc.replace(new RegExp(`{${key}}`, "g"), values[key]);
}, tmpl);
var hafcaf_tamper_default = tamp;

// src/hafcaf.js
var hafcaf = {
  /**
   * @typedef {Object} route
   * @prop {string} id  - The identifier to be used for this route.
   * @prop {string} [linkClass]=null - What classname(s) to add to the 'a' tags used to create menu items.
   * @prop {string} [linkHTML]=null - What HTML/text to use when creating a menu item for this route. A menu item will not be created if linkHTML is not provided.
   * @prop {string} [linkTagClass] - What css classes to give to the menu item container for this route.
   * @prop {string} [pageClass] - What css classes to give to the page for this route.
   * @prop {string} [innerHTML] - The content of the page. If not provided, will default to config.loadingHTML. Can be set or overwritten later using hafcaf.updateRoute().
   * @prop {function} [onRender] - A function which will be called each time this route is rendered (made active). Can include multiple functions within itself, if desired. When composing your onRender, keep in mind to take advantage of the hafcaf.listeners collection, which can be used to hold removeEventListener calls and other functions you would like to run when hafcaf switches away from this route.
   */
  /**
   * @type {{ [key: string]: route }}
   * @description A collection of all of the routes registered with hafcaf.
   */
  routes: {},
  /**
   * @typedef {Object} config
   * @prop {string} activeClass="active" - What classname(s) to apply to the link container for the current route.
   * @prop {string | undefined} [linkClass] at classname(s) to add to the 'a' tags used to create menu items.
   * @prop {string} linkTag="li" - What tag to use for the link container for a route's menu item.
   * @prop {string | undefined} [linkTagClass] - What classname(s) to give to the menu item container for this route.
   * @prop {string} loadingHTML - The default HTML to display when a route hasn't yet been updated with its real content. Useful when loading routes dynamically using AJAX or Fetch.
   * @prop {string} mainID="main-container" - The id attribute of the container to which pages should be added.
   * @prop {string} navID="nav-list" - The id attribute of the container to which menu items should be added.
   * @prop {string | undefined} [pageClass] - What css classnames to give to route pages.
   * @prop {string} pageTag="div" - What tag to use when creating a page's container.
   */
  /** @type {config} */
  config: {
    activeClass: "active",
    linkClass: void 0,
    linkTag: "li",
    linkTagClass: void 0,
    loadingHTML: "<p>Loading...</p>",
    mainID: "main-container",
    navID: "nav-list",
    pageClass: void 0,
    pageTag: "div"
  },
  /**
   * @property {array} exitFunctions - Holds a collection of functions to be called when the current route changes, as a convenience for onRender functions that add event listeners and the like. Especially useful for cancelling subscriptions to streams or long-polling operations. Will get automatically called at the beginning of every routeChange() call.
   * @type {Function[]}
   */
  exitFunctions: [],
  /**
   * addRoute() is the method to use when you wish to add a route for hafcaf to keep track of. It takes a configuration object, all properties of which are optional except for `id`.
   * @param {route} newRoute
   */
  addRoute(newRoute) {
    const id = newRoute.id;
    if (this.routes[id] !== void 0) {
      console.error(
        `A route with the ID ${id} already exists. Please use the updateRoute() method if you wish to update it, or change this route's ID if you still want to add it.`
      );
      return;
    }
    this.routes[id] = newRoute;
    if (newRoute.linkHTML) {
      const newEl = document.createElement(this.config.linkTag);
      const linkTagClass = newRoute.linkTagClass || this.config.linkTagClass;
      if (linkTagClass) {
        newEl.classList.add(linkTagClass);
      }
      const newLink = document.createElement("a");
      newLink.href = `#${id}`;
      newLink.innerHTML = newRoute.linkHTML;
      const linkClass = newRoute.linkClass || this.config.linkClass;
      if (linkClass) {
        newLink.classList.add(linkClass);
      }
      newEl.appendChild(newLink);
      document.getElementById(this.config.navID)?.appendChild(newEl);
    }
    const doesNotExist = document.getElementById(id) === null;
    if (doesNotExist) {
      const newEl = document.createElement(this.config.pageTag);
      newEl.id = id;
      const pageClass = newRoute.pageClass || this.config.pageClass;
      if (pageClass) {
        newEl.classList.add(pageClass);
      }
      newEl.innerHTML = newRoute.innerHTML || this.config.loadingHTML;
      document.getElementById(this.config.mainID)?.appendChild(newEl);
    }
    const currentRouteID = location.hash.slice(1);
    if (id === currentRouteID)
      this.routeChange();
  },
  /**
   * @property {string} - The id attribute of the route to redirect to if hafcaf is asked to redirect to a route that doesn't exist. When creating your initial html, this should be the last page in the list of pages in your page container.
   */
  defaultRouteID: "home",
  /**
   * updateRoute() is used - naturally - to update a route's content. In addition to the page's content, one can also update the route's link's innerHTML and the route's onRender function. updateRoute() calls routeChange() at the end if the user is currently viewing the route that was just updated.
   * @param {route} routeToUpdate
   */
  updateRoute(routeToUpdate) {
    const id = routeToUpdate.id;
    const route = this.routes[id];
    if (!route) {
      console.error(`A route with the ID ${id} does not exist, cannot update it.`);
      return false;
    }
    if (routeToUpdate.linkHTML) {
      const linkEl = document.querySelector(`a[href='#${id}']`);
      if (linkEl)
        linkEl.innerHTML = routeToUpdate.linkHTML;
    }
    if (routeToUpdate.innerHTML) {
      const pageEl = document.getElementById(id);
      if (pageEl)
        pageEl.innerHTML = routeToUpdate.innerHTML;
    }
    if (routeToUpdate.onRender)
      route.onRender = routeToUpdate.onRender;
    const currentRouteID = location.hash.slice(1);
    if (id === currentRouteID)
      this.routeChange();
  },
  /**
   * routeChange() is a function called by hafcaf everytime a route is changed. You likely will not ever need to call it directly. The first thing it does is check to make sure the route desired is being tracked by hafcaf already. If it is, then the next step is to remove the `activeClass` from any existing elements that might have it. Third, if there are any functions in {@link hafcaf.exitFunctions}, then call those. Fourthly, find the menu item for the new active route and make it active. Finally, if the new route has an `onRender` function registered, call it.
   */
  routeChange() {
    const routeID = location.hash.slice(1);
    let route = this.routes[routeID] || this.routes[this.defaultRouteID];
    if (!route)
      return;
    const { activeClass } = this.config;
    for (const el of document.getElementsByClassName(activeClass)) {
      el.classList.remove(activeClass);
    }
    while (this.exitFunctions.length > 0) {
      this.exitFunctions.pop()?.();
    }
    const linkEl = document.querySelector(`a[href='#${route.id}']`);
    if (linkEl)
      linkEl.classList.add(activeClass);
    if (route.onRender !== void 0)
      route.onRender();
    if (window.location.hash.slice(1) !== route.id) {
      window.location.hash = route.id;
    }
  },
  /**
   * The init() function assigns its config object as the config (defaults) for hafcaf. Though it's recommended to only change the individual values needed, this option is provided in case you wish to change several or all values at once.
   *
   * init() additionally sets up a "hashchange" event listener on the window object, so that the routeChange() function will be called when the route changes. Finally, init() will set the hash to the defaultRouteID if it has not already been set (for instance, when following a link to a hafcaf site or refreshing a page) and will then call hafcaf.routeChange() to make sure the pertinent routines are executed.
   * @param {config} config
   */
  init(config) {
    if (config)
      this.config = { ...this.config, ...config };
    window.addEventListener("hashchange", () => {
      this.routeChange();
    });
    if (!window.location.hash) {
      window.location.hash = this.defaultRouteID;
    }
    this.routeChange();
  }
};
var hafcaf_default = hafcaf;

// src/index.js
var src_default = hafcaf_default;
export {
  hafcaf_barista_default as Barista,
  HireBarista,
  hafcaf_tamper_default as Tamp,
  src_default as default
};
//# sourceMappingURL=hafcaf.js.map
