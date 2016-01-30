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
                componentHandler.upgradeElement(this.$el);
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
