# `hafcaf`

_The No-Framework SPA Solution_

## Introduction

`hafcaf` is an extremely minimal (less than 3kb) single-page application (SPA) library, designed for people who want to rapidly create websites and apps without having to learn a whole new way to do so.

There's no complicated DSL (domain-specific language) here, no hoops and loops to jump through to get up and running. If you know plain HTML, CSS, and JavaScript and can follow a tiny bit of instruction, you can be creating a SPA in less than five minutes.

- No build tools needed - but you can integrate with them if you wish.
- Works as far back as IE 9.
- Designed to require the use of as little JavaScript as possible.
- Should play nice with pretty much all CSS frameworks (let me know if you find one that doesn't work and I'll fix it).
- Can still be used with other JavaScript frameworks if desired - hafcaf will provide the routing.

Before I continue, `hafcaf` is heavily inspired by [this article by Heydon Pickering](https://www.smashingmagazine.com/2015/12/reimagining-single-page-applications-progressive-enhancement/).

If you like what I'm doing, would you consider [buying me a ko-fi](https://ko-fi.com/C0C6ZHE7)? Thanks!

- [Introduction](#introduction)

- [How the Magic Happens](#how-the-magic-happens)

- [Installation](#installation)

- [Usage](#usage)

  - [Adding to your page](#adding-to-your-page)

  - [Setting up your page](#setting-up-your-page)

- [`hafcaf.js`](#hafcafjs)

  - [Dynamic Page Loading](#dynamic-page-loading)

  - [`addRoute` with Static Content](#addroute-with-static-content)

  - [`addRoute` and `updateRoute` with Dynamic Content](#addroute-and-updateroute-with-dynamic-content)

  - [The `onRender` function and `exitFunctions` collection](#the-onrender-function-and-exitfunctions-collection)

- [API](#api)

  - [Configuration Options](#configuration-options)

  - [hafcaf.addRoute()](#hafcafaddroute)

  - [hafcaf.init()](#hafcafinit)

  - [hafcaf.routeChange()](#hafcafroutechange)

  - [hafcaf.updateRoute()](#hafcafupdateroute)

- [Licensing](#licensing)

- [Contributing](#contributing)

- [Contributors](#contributors)

### How the Magic Happens

Heydon Pickering's article does a bang-up job of explaining everything in detail, but here's the gist: instead of JavaScript-powered url re-routing - which often requires server-side directives to redirect all urls to your index.html file -`hafcaf` uses CSS-based routing using the `:target` pseudo-class. This pseudo-class automatically responds to anchor tags that point to internal IDs using the `href="#link"` syntax.

Don't worry, it's much easier than it sounds. Here's an example. Given this incredibly stripped-down example webpage code:

```html
<main>
  <section id="section1">
    I'm the content for section one.
    <a href="#section2">Section Two</a>
    <a href="#home">Home</a>
  </section>
  <section id="section2">
    I'm the content for section two.
    <a href="#section1">Section One</a>
    <a href="#home">Home</a>
  </section>
  <section id="home">
    I'm the content for the Home page.
    <a href="#section1">Section One</a>
    <a href="#section2">Section Two</a>
  </section>
</main>
```

Using `hafcaf`, if you point your browser to `https://www.yourdomain.com/#section2`, then the content for section 2 would show instead of both sections' content. `hafcaf` does this by hiding all content that isn’t being targeted, effectively showing only one 'page’ of content at a time. By default, hafcaf shows the last block of content; in the example above, “home” would show by default.

## Installation

1. Clone the repository.
2. Run `npm install` to install dependencies.
3. Run `npm run build` to build the project. The output will be in the `dist` directory.

## Usage

### Adding to your page

Add the CSS file to your `<head>` using a standard `<link>` like this: `<link rel="stylesheet" href="../path/to/hafcaf.css">`.

Import `hafcaf` from the source or the built module.
```html
<script type="module">
  import hafcaf from "./dist/hafcaf.min.js"; // or "./src/index.js" for development
  hafcaf.init();
</script>
```

### Setting up your page

`hafcaf` currently makes very few assumptions about how your content is going to be laid out, except for one: your page container is assumed to be a `<main>` element. This is a semantic choice, so it should be what you were going to do anyways. If you absolutely have to have a different container element, you can modify the `hafcaf.css` file to meet your needs.

So, what else do you need to setup? While it's not required to have a 'home' page pre-defined, you'll find it speeds up the feel of your page load (Time to Interactive) and improves the quality of your users' experience if you have a home page already part of your `index.html`.

To add a new page to your site, the only requirements are a container element like a div or section, and the content of the page itself (otherwise you’ll render an empty page). Here's an example of two extremely simple pages that link to each other:

```html
<main id="main-container">
  <div id="second-page">
    <h1>This is another page</h1>
    <a href="#home">Go back home</a>
  </div>
  <div id="home">
    <h1>This is my home page</h1>
    <a href="#second-page">Go to next page</a>
  </div>
</main>
```

If you want, you can load up all of your pages this way (statically), or you can load additional pages dynamically. Remember that whatever content is last within the `main-container` will be the content rendered by default (i.e. when the url is `/` by itself).

Up to this point, we haven't needed to use any JavaScript at all. If static page loading meets you where you're at and provides all you need, then by all means, don't bother loading the JavaScript file! That's the whole point of this library: you can have as little JavaScript in your site/app as you want, without sacrificing the speed and UX goodness of a SPA.

### `hafcaf.js`

If you don't mind a little bit of JavaScript in your codebase and want some fancy features like dynamic and/or lazy page loading, the `hafcaf.min.js` file gives you a lot of power in only 1.9 KB of JS. Here are some of the benefits of the `hafcaf` JavaScript module:

- Support for asynchronous/dynamic page loading
- Support for lazy-loading (only request and load content when the user requests to view it)
- Automatic population and activation of a navigation menu (e.g. setting a menu item with a `.active` class)
- Addition of `onRender` actions which fire if and when a page is loaded

If you just want the API for the JS side of hafcaf, feel free to skip down to the API section of this README. If you’re interested in more detailed descriptions of these features and would like to see some examples, continue on.

### Dynamic Page Loading

There are a few different ways to make use of the dynamic page loading functionality, but the key parts boil down to two API methods: `addRoute` and `updateRoute`. What these methods do is probably pretty self-explanatory: `addRoute` adds a route entry to hafcaf's collection of routes, and `updateRoute` modifies the content and/or settings.

#### `addRoute` with Static Content

To add a route, you have to first get the content for your route. You can add this in a static way - like in the Setting Up Your Page section above - by having the page already existing in the `index.html` file from the start. The advantage to this approach is obvious: the content is already there, so additional network calls to fetch additional pages are unnecessary.

But if the page is already there, why bother ‘registering’ it with `hafcaf`? There are two primary benefits: making use of `onRender` callback functions (which will be covered later), and automatic updating of a navigation menu when you go from one page to another. Let’s look at some example code (you can find this in this repository’s `index.html` file):

```html
<body>
  <nav role="navigation">
    <ul id="nav-list">
      <li>
        <a href="#home">Home</a>
      </li>
      <li>
        <a href="#another-view">Page 2</a>
      </li>
    </ul>
  </nav>
  <main id="main-container" role="main">
    <div id="another-view">
      <h1>Page 2</h1>
      <p>This is another view.</p>
    </div>
    <div id="home">
      <h1>Home</h1>
      <p>Static content is the best content.</p>
    </div>
  </main>
</body>
```

Remember that inside the main container the last block is rendered by default when there’s no route (i.e. `/`) or when the route doesn’t exist. To accommodate that, the ‘home’ page comes last.

Right now - with `hafcaf.css` - this page would work fine, with the nav list of links rendered on every page, but only each page’s content being displayed depending on which link is clicked. The only trick would be that the nav links wouldn’t show which page you are on - that is, they have no ‘active’ state. You could write some extra CSS or JS to detect which page your user is looking at and highlight the appropriate link, or you can let `hafcaf.js` handle it for you. Here’s how to add the routes to `hafcaf`:

```javascript
var anotherView = {
  id: "another-view"
};

hafcaf.addRoute(anotherView);
```

It really is that easy. There are more details on all of the configuration options for the `addRoute` method in the API section below. What we do here is add the ID for the page to the `routes` registry. `hafcaf` internally has a `routeChange` function that will update the navigation links whenever the route changes (e.g. from `#home` to `#another-view`). You only have to add routes that are in addition to the `#home` route, as `hafcaf` assumes you will always have at least that (though the ID of the home route can be changed in the `hafcaf` configuration, see below).

#### Loading Dynamic Content with Barista

Now let’s look at adding pages that aren’t loaded statically with your `index.html` file. With hafcaf's Barista module, you can use the `fetch` API to load pages dynamically, and then use `updateRoute` to inject the content into the page. `hafcaf` and Barista were designed to handle ‘asynchronous’ content in a very graceful way, that will fit into any flow or framework with ease. Starting with the page from the previous section, let’s add a page 3.

```html
<!-- page3.html -->
<div id="page-three">
	<h1>Page 3</h3>
  <p>Even moar content.</p>
</div>
```

Note that there’s no extra `DOCTYPE`, `head`, or `body` sections, only the content we want for the third page. This is because we’re going to inject it directly into the existing page, so it doesn’t need all the extra definitions of a normal html page.

Then, in your site’s main JavaScript file (or even in the index.html, if you want), setup the `Barista` module to load the page object, but with an extra (and optional) `linkLabel` configuration option specified:

```javascript
const exampleDynamicView = {
  id: "page-3",
  linkLabel: "Page 3"
};

const Barista = HireBarista(hafcaf);
Barista(exampleDynamicView);
```

Barista takes two arguments:

1. The page object to be added to the site
2. The path to the page's HTML file (relative to the root of the site)

The path is optional, and defaults to `pages/`. Barista also assumes that the page's HTML file is named the same as the page's ID, so in this case, it would look for `pages/page-3.html`.

The `linkLabel` property tells `hafcaf` to add a new entry to the page's menu with the label we specified, "Page 3". This extra property is optional if you want to define your menu a different way, or if you don't have a menu. See the full API section below for all of the configuration options, including how to control how menu items are rendered.

For my old website, I chose to make all of the pages load dynamically (mostly for the fanciness of it). So I created an array of page objects, then looped over them; adding each one, in turn, to the site.

```javascript
// Array of page objects to be fetched and processed by hafcaf
const pages = [
  { id: "about-me", linkLabel: "<i class='fas fa-address-card'></i>About Me" },
  { id: "code", linkLabel: "<i class='fas fa-code'></i>Code" },
  { id: "talks", linkLabel: "<i class='fas fa-microphone-alt'></i>Talks" },
  { id: "games", linkLabel: "<i class='fas fa-dice'></i>Games" },
  { id: "art", linkLabel: "<i class='fas fa-palette'></i>Art" }
];

const Barista = HireBarista(hafcaf);

pages.forEach(page => {
  Barista(page);
});
```

### The `onRender` function and `exitFunctions` collection

Whether adding or updating a route, one of the options you can attach to the route is an `onRender` function. This function will be called every time the route is rendered to the screen; i.e. when a link is clicked or other code executed which changes the hash part of the current URL.

The `onRender` function is an excellent place to setup event listeners and to subscribe to pub/sub services or functions such as an Observer Pattern state management library like MobX, a long-polling or server push listener, or a WebSocket-based stream.

For an example, let's imagine a page that has a very simple counting mechanism. There's a button, and a span that shows the value of the counter variable, initially set at “0”. I hope you come up with more creative ideas for your apps. ;)

So here’s the setup. Remember, this can be done statically using `addRoute()` alone, or dynamically with the help of `updateRoute()`.

```javascript
hafcaf.addRoute({
  id: "counter",
  innerHTML: "<section><span id='counter__display'>0</span><button id='counter__button'>Add 1</button></sec>",
  onRender: function() {
    // storing the counter var globally for simplicity’s sake in this demo
    window.counter = 0;

    // create the event handler
    function incrementCounter() {
      counter++;
      document.getElementById("counter__display").innerHTML = counter;
    }

    // setup the listener
    const button = document.getElementById("counter__button");
    button.addEventListener("click", incrementCounter, false);

    // create a disposer to remove the event listener on exit
    const disposer = function() {
      button.removeEventListener("click", incrementCounter, false);
    };
    hafcaf.exitFunctions.push(disposer);
  }
});
```

That’s all it takes. You just made a SPA without a framework and only one dependency: hafcaf.

## API

_At long last, the API section!_

### Configuration Options

There are two ways to change the default configuration options. If you want to change only a few options, you can overwrite them individually like this:

`hafcaf.config.pageClass = "prettyPage";`

If you wish to change several options all at once, you can merge your changes like this:

```javascript
const oldConfig = hafcaf.config;
const newConfig = {(your changes)};
hafcaf.config = {...oldConfig, newConfig};
```

Below are the available configuration options along with their default values.

| **Option**       | **Default Value**     | **Description**                                                                                                 |
| ---------------- | --------------------- | --------------------------------------------------------------------------------------------------------------- |
| **activeClass**  | "active"              | Specifies the css classname to be added to the link for the current route. May be a string of multiple classes. |
| **linkClass**    | null                  | Class(es) to add to link 'a' tags.                                                                              |
| **linkTag**      | "li"                  | Which tag to use for link containers.                                                                           |
| **linkTagClass** | null                  | Class(es) to add to linkTag tags.                                                                               |
| **loadingHTML**  | `"<p>Loading...</p>"` | Default content while a page is loading.                                                                        |
| **mainID**       | "main-container"      | ID of the element where pages should be added.                                                                  |
| **navID**        | "nav-list"            | ID of the element where link tags should be added.                                                              |
| **pageClass**    | null                  | Class(es) to add to page containers.                                                                            |
| **pageTag**      | "div"                 | Which tag to use for page containers.                                                                           |

### hafcaf.addRoute()

addRoute is the method to use when you wish to add a route for hafcaf to keep track of. It takes a configuration object, all properties of which are optional except for `id`.

#### addRoute() Options

| **Option**         | **Description**                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **id**             | The identifier to be used for this route. **Required**                                                                                                                                                                                                                                                                                                                              |
| **linkLabel**      | What text to use when creating a menu item for this route. A menu item will not be created if a linkLabel is not provided.                                                                                                                                                                                                                                                          |
| **linkTagClass**   | What css classnames to give to the menu item container for this route.                                                                                                                                                                                                                                                                                                              |
| **linkLabelClass** | What css classnames to give to the actual link inside the menu item container for this route.                                                                                                                                                                                                                                                                                       |
| **pageClass**      | What css classnames to give to the page for this route.                                                                                                                                                                                                                                                                                                                             |
| **innerHTML**      | The content of the page. If not provided, will default to config.loadingHTML. Can be set or overwritten later using hafcaf.updateRoute().                                                                                                                                                                                                                                           |
| **onRender**       | A function which will be called each time this route is rendered (made active). Can include multiple functions within itself, if desired. When composing your onRender, keep in mind to take advantage of the hafcaf.listeners collection, which can be used to hold removeEventListener calls and other functions you would like to run when hafcaf switches away from this route. |

### hafcaf.init()

The `init()` function assigns its config object as the config (defaults) for hafcaf. Though it's recommended to only change the individual values needed, this option is provided in case you wish to change several or all values at once.

`init()` additionally sets up a `"hashchange"` event listener on the `window` object, so that the `routeChange()` function will be called when the route changes. Finally, `init()` will set the hash to the `defaultRouteID` if it has not already been set (for instance, when following a link to a hafcaf site or refreshing a page) and will then call `hafcaf.routeChange()` to make sure the pertinent routines are executed.

#### init() config param

See the configuration options object above.

### hafcaf.routeChange()

`routeChange()` is a function called by `hafcaf` everytime a route is changed. You likely will not ever need to call it directly.

The first thing it does is check to make sure the route desired is being tracked by hafcaf already. If it is, then the next step is to remove the `activeClass` from any existing elements that might have it. Third, if there are any functions in `hafcaf.exitFunctions`, then call those. Fourthly, find the menu item for the new active route and make it active. Finally, if the new route has an `onRender` function registered, call it.

### hafcaf.updateRoute()

`updateRoute()` is used - naturally - to update a route's content. In addition to the page's content, one can also update the route's link's `innerHTML` and the route's `onRender` function. `updateRoute()` calls `routeChange()` at the end if the user is currently viewing the route that was just updated.

### updateRoute() Options

| **Option**    | **Description**                                                                    |
| ------------- | ---------------------------------------------------------------------------------- |
| **id**        | The id attribute of the route you wish to update. **Required**                     |
| **linkHTML**  | New html that will replace the current html inside this route's link's container.  |
| **innerHTML** | New html that will replace the currrent html inside this route's page's container. |
| **onRender**  | A new function to replace any previous `onRender` function for this route.         |

## Licensing

The Unlicense, but if you mention me that'd be nice.

## Contributing

I'll gladly accept questions, comments, suggestions, and pull requests.

## Contributors

- [Andrew Steele](https://github.com/andrew565)
