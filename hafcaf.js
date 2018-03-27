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
      hafcaf.routeID = location.hash.slice(1);
      hafcaf.route = hafcaf.routes[hafcaf.routeID];
      hafcaf.routeEl = document.getElementById(hafcaf.routeID);
      if (hafcaf.route && hafcaf.route.rendered) hafcaf.route.rendered();
    },
    init: function() {
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

  window.hafcaf = hafcaf;
})();

hafcaf.init();
