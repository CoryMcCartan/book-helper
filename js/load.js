/**
 * Program entry point.
 * @author Cory McCartan
 */
 
"use strict";

window.$ = (s) => document.querySelector(s);

window.components = {};
function loadComponent(name, url, options) {
    Vue.component(name, (resolve, reject) => {
        fetch(url).then((r) => r.text()).then((text) => {
            options.template = text;
            options.ready = function() {
                componentHandler.upgradeElements(this.$el);
            };
            options.methods = options.methods();
            resolve(options);
        })
    });
}

// load dictionary
fetch("data/dictionary.json").then((r) => r.json())
.then(function(json) {
    window.Dictionary = json;
});

// service worker for offline
navigator.serviceWorker.register("service-worker.js", {
    scope: location.pathname.replace("index.html", "")
}).then(() => {
    console.log("Service Worker registered.");
});

document.addEventListener("readystatechange", function(e) {
    if (document.readyState !== "complete") return;
    
    $("#app").style.opacity = 1.0;
});
