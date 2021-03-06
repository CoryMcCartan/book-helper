/**
 * Routing functions
 * @author Cory McCartan
 */

"use strict";

window.Router = (function() {
    var self = {};

    var history = window.history;

    self.loadState = function(state) {
        if (!state) return;

        switch (state.view) {
            case "book":
                if (state.book) {
                    vm.currentBook = vm.books[state.book];
                    if (state.reading) {
                        // save old timestamp
                        var ts = state.reading;
                        vm.startReading(); // this will create a new timestamp
                        history.state.reading = ts;
                        vm.timestamp = ts; // overwrite new with old
                    }
                }
                break;
            case "dictionary":
                if (state.word) {
                    vm.input.dict = state.word;
                    setTimeout(vm.searchDictionary, 1500);
                }
                break;
            case "picture":
                vm.showCamera();
                break;
        }

        vm.currentView = vm.views[state.view];
    };

    self.changeView = function(name, replace) {
        if (replace) {
            replaceState({view: name});
        } else {
            pushState({view: name});
        }
    };

    self.addStateData = function(obj) {
        var data = history.state || {};
        // copy over new data
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;

            data[i] = obj[i];
        }
        
        replaceState(data);
    };

    var pushState = function(data) {
        history.pushState(data, document.title, window.location.href);
    };

    var replaceState = function(data) {
        history.replaceState(data, document.title, window.location.href);
    };

    var stateLoader = 

    window.addEventListener("popstate", (e) => self.loadState(e.state));
    window.addEventListener("onload", (e) => self.loadState(history.state));

    return self;
})();
