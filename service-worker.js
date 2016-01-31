/**
 * Service Worker for offline use.
 */
var CACHE_VERSION = "v1";
var STATIC_CACHE = [
    "https://storage.googleapis.com/code.getmdl.io/1.0.6/material.blue_grey-indigo.min.css"
    "bower_components/material-design-lite/material.min.js",
    "https://fonts.googleapis.com/css?family=Roboto:400,500,700,300",
    "https://fonts.googleapis.com/icon?family=Material+Icons",
    "data/dictionary.json",
];
var DYNAMIC_CACHE = [
    location.pathname.replace("service-worker.js", ""), // basepath
    "index.html",
    "layout.html",
    "manifest.json",
    "css/main.css",
    "js/main.js",
    "js/load.js",
    "js/voice.js",
    "js/storage.js",
    "js/router.js",
    "js/layout.js"
];
var CACHE = STATIC_CACHE.concat(DYNAMIC_CACHE);

// say what we want cached
this.addEventListener("install", function(e) {
    e.waitUntil(
        caches.open(CACHE_VERSION)
        .then(function(cache) {
            return cache.addAll(CACHE); 
        })
    );
});

// route requests the right way
this.addEventListener("fetch", function(e) {
    var url = new URL(e.request.url);

    var has = function(arr, test) {
        var length = arr.length
        for (var i = 0; i < length; i++) {
           if (arr[i] === test || 
                   (arr[i] === test.slice(1) && test !== "/") )
               return true; 
        }
        return false;
    };

    if (has(STATIC_CACHE, url.pathname)) { // prefer cached version
        e.respondWith(caches.match(e.request));
    } else if (has(DYNAMIC_CACHE, url.pathname)) { // prefer network version
        e.respondWith(
            fetch(e.request)
            .catch(function(r) {
                return caches.match(e.request);
            })
        );
    } else { // try cache, if not then get from network, then cache
        e.respondWith(
            caches.match(e.request)
            .then(function(response) {
                return response || fetch(e.request.clone())
                .then(function(r) {
                    return caches.open(CACHE_VERSION)
                    .then(function(cache) {
                        cache.put(e.request, r.clone());
                        return r;
                    })
                });
            })
        )
    }

});
