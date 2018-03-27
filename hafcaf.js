(function() {
  var hafcaf = {
    routes: {},
    addRoute: function(id, options) {
      // Check if a route already exists with the given ID
      if (this.routes[id] !== undefined) {
        console.error('A route with the ID "' + id + '" already exists.');
        return false;
      }

      // Add the route and it's options to the collection of routes
      this.routes[id] = options;

      // Add the route to the navigation menu if linkText provided
      if (options.linkHTML) {
        var newEl = document.createElement("li");
        var newLink = document.createElement("a");
        newLink.href = "#" + id;
        newLink.innerHTML = options.linkHTML;

        // Add classes to the link, if present
        if (options.className) {
          newLink.classList.add(options.className);
        }

        newEl.appendChild(newLink);
        document.getElementById("nav-list").appendChild(newEl);
      }

      // If this new route provides html, add it to the DOM
      if (options.innerHTML) {
        var newEl = document.createElement("div");
        newEl.id = id;
        newEl.innerHTML = options.innerHTML;
        document.getElementById("main-container").appendChild(newEl);
      }
    },
    default: "home",
    routeChange: function() {
      // Get the new hash, which is the route to be rendered
      hafcaf.routeID = location.hash.slice(1);

      // From the routes known to hafcaf, pick out the matching one
      hafcaf.route = hafcaf.routes[hafcaf.routeID];

      // From the document, find the containing element for the route to be rendered
      hafcaf.routeEl = document.getElementById(hafcaf.routeID);

      // If the route was found and the route has a "rendered" callback, call it
      if (hafcaf.route && hafcaf.route.rendered) hafcaf.route.rendered();
    },
    init: function() {
      // Add a global listener for 'hashchange', since this framework relies on hash-based routing
      window.addEventListener("hashchange", function() {
        hafcaf.routeChange();
      });

      // Set hash to default if no hash
      if (!window.location.hash) {
        window.location.hash = hafcaf.default;
      } else {
        hafcaf.routeChange();
      }
    }
  };

  // Add hafcaf to the window object so it becomes globally accessible
  window.hafcaf = hafcaf;
})();

// Once the script has instantiated hafcaf, initialize it
hafcaf.init();
