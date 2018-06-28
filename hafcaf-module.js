var hafcaf = {
  routes: [],
  config: {
    activeClass: "active", // By default, will add the 'active' class to the link for the current route
    linkClass: null, // Class(es) to add to link 'a' tags
    linkTag: "li", // Which tag to use for link containers
    linkTagClass: null, // Class(es) to add to linkTag tags
    loadingHTML: "<p>Loading...</p>", // Default content while a page is loading
    mainID: "main-container", // ID of the element where pages should be added
    navID: "nav-list", // ID of the element where link tags should be added
    pageClass: null, // Class(es) to add to page containers
    pageTag: "div" // Which tag to use for page containers
  },
  addRoute: function(options) {
    let id = options.id;

    // Check if a route already exists with the given ID
    if (this.routes[id] !== undefined) {
      console.error(`A route with the ID ${id}already exists.`);
      return false;
    }

    // Add the route and it's options to the collection of routes
    this.routes[id] = options;

    // Add the route to the navigation menu if linkText provided
    if (options.linkLabel) {
      var newEl = document.createElement(this.config.linkTag);

      if (options.linkTagClass || this.config.linkTagClass) {
        newEl.classList.add(options.linkTagClass || this.config.linkTagClass);
      }

      var newLink = document.createElement("a");
      newLink.href = `#${id}`;
      newLink.innerHTML = options.linkLabel;

      // Add classes to the link, if present
      if (options.linkClass || this.config.linkClass) {
        newLink.classList.add(options.linkClass || this.config.linkClass);
      }

      newEl.appendChild(newLink);
      document.getElementById(this.config.navID).appendChild(newEl);
    }

    // Create a new page
    var newEl = document.createElement(this.config.pageTag);
    newEl.id = id;

    // Add classes to the page, if present
    if (options.pageClass || this.config.pageClass) {
      newEl.classList.add(options.pageClass || this.config.pageClass);
    }

    // If this new route provides html, add it to the DOM, else use the loadingHTML
    newEl.innerHTML = options.innerHTML || this.config.loadingHTML;

    // Add page to the DOM
    document.getElementById(this.config.mainID).appendChild(newEl);
  },
  default: "home",
  updateRoute: function(options) {
    let id = options.id;
    const route = this.routes[id];

    if (!route) {
      console.error('A route with the ID "' + id + '" does not exist, cannot update it.');
      return false;
    }

    if (options.linkHTML) {
      // First, find the link's 'a' tag by looking up the link's href
      const linkEl = document.querySelector("a[href='#" + id + "']");

      // Then, update the link's innerHTML with the new content
      linkEl.innerHTML = options.linkHTML;
    }

    if (options.innerHTML) {
      // First, find the page via its id
      const pageEl = document.getElementById(id);

      // Then, update the page's innerHTML with the new content
      pageEl.innerHTML = options.innerHTML;
    }

    if (options.onRender) route.onRender = options.onRender;

    // If this route has an onRender function, call it
    if (route.onRender) route.onRender();

    this.routeChange();
  },
  routeChange: function() {
    // Get the new hash, which is the route to be rendered
    const routeID = location.hash.slice(1);

    // From the routes known to hafcaf, pick out the matching one
    const route = this.routes[routeID];

    // If there are routes and the desired route is not found, redirect to default page
    if (this.routes.length > 0 && !route) window.location.hash = this.default;

    if (route) {
      // Remove any existing active classes upon route changing
      const { activeClass } = this.config;
      for (var el of document.getElementsByClassName(activeClass)) {
        el.classList.remove(activeClass);
      }

      // Next, find the new route's 'a' tag by looking up the link's href
      const linkEl = document.querySelector("a[href='#" + routeID + "']");

      // Make it active
      linkEl.classList.add(activeClass);

      // If the route was found and the route has a "onRender" callback, call it
      if (route.onRender) route.onRender();
    }
  },
  init(config) {
    if (config) this.config = config;

    // Add a global listener for 'hashchange', since this framework relies on hash-based routing
    window.addEventListener("hashchange", function() {
      window["hafcaf"].routeChange();
    });

    // Set hash to default if no hash
    if (!window.location.hash) {
      window.location.hash = this.default;
    } else {
      this.routeChange();
    }
  }
};

export default hafcaf;
