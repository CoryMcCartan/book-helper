/**
 * Handles data persistence.
 * @author Cory McCartan
 */

"use strict";

let KEY = "books";

/** 
 * @namespace 
 */
window.StorageManager = {
    /**
     * Save user data to local store.
     */
    saveData: function() {
        localforage.setItem(KEY, vm.books, function(e) {
            if (e) console.log(e);
        });
    },

    /**
     * Load user data from store.
     * @arg {function} callback function to call once data is loaded.
     */
    loadData: function(callback) {
        localforage.getItem(KEY, function(e, value) {
            if (e) console.log(e);

            callback(value);
        });
    }
};
