/**
 * UI code.
 * @author Cory McCartan
 */

"use strict";

/**
 * General information and metadata about the app.
 * @type {Object}
 */
window.appData = {
    title: "Books",
    author: "Cory McCartan",
    copyright: "2016"
};

/**
 * @typedef {Object} ViewInstance
 * @desc An object that stores information related to an app view.
 * @property {string} display the user-friendly display name that will
 * show up in the title bar and navigation drawer.
 * @property {string} icon the Material Icons glyph name to display in 
 * the navigaion drawer.
 * @property {string} mode either 'base' or 'overlay'. The latter will show a
 * back button instead of a menu button.
 * @property {string} previous the view to return to when back button is pressed.
 */

/**
 * The various views in the application. 
 * Each element is of type {@link ViewInstance}. Its key is the view's
 * unique ID.
 */
window.views = {
    book: {
        name: "book",
        display: "Read", 
        icon: "local_library", 
        mode: "base"
    },
    list: {
        name: "list",
        display: "Book List",
        icon: "list", 
        mode: "base"
    },
    add: {
        name: "add",
        display: "Add Book",
        mode: "overlay",
        previous: "list"
    },
    dictionary: {
        name: "dictionary",
        display: "Dictionary",
        mode: "overlay",
        previous: "book"
    },
};

window.globalFunctions = {
    /**
     * Change the current view (main-page content).
     * @arg {string} name the ID of the view to change to.
     * @arg {boolean} keepURL whether to keep the curent hash or not
     */
    changeView: function(name, keepURL) {
        // stop reading if necessary
        vm.stopReading();
        // update view
        this.currentView = this.views[name];
        // update hash
        if (!keepURL && this.currentView.mode === "base") {
            window.location.hash = "view=" + name;
        }
        // hide the side menu
        var sideMenu = $(".mdl-layout__obfuscator.is-visible");
        if (sideMenu) sideMenu.click(); 
    }
};

window.vm = new Vue({
    el: "#app",

    data: {
        app: window.appData,

        /**
         * String to display in the title bar and browser tab.
         * @type {string}
         */
        title: "Books",

        views: window.views,

        /**
         * The ID of the current view displayed to the user.
         * @type {string}
         */
        currentView: window.views.list,

        /**
         * Key of the {@link BookInstance} property to sort by in list view.
         * @type {string}
         */
        currentSort: "title",

        /**
         * Whether to sort the list in ascending or descending order.
         * 1 for ascending, -1 for descending.
         * @type {number}
         */
        sortDirection: 1,

        /**
         * A counter variable used to assign IDs to books added.
         * @type {number}
         */
        id: 0,

        /**
         * Form input links
         */
        input: {
            /**
             * Linked to the text input for a book's author.
             * @type {string}
             */
            title: null,

            /**
             * Linked to the text input for a book's title.
             * @type {string}
             */
            author: null,

            /**
             * Linked to the text input for a book's page count.
             * @type {number}
             */
            pagecount: null,

            /**
             * Linked to the text input for the dictionary look-up.
             * @type {string}
             */
            dict: null
        },

        /**
         * @typedef {Object} BookInstance
         * @desc An object that stores information related to a book.
         * @property {string} title the book's title.
         * @property {string} author the book's author.
         * @property {number} pages the number of pages in the book.
         * @property {number} currentPage the last saved reading location.
         * @property {number} timeReading the total time spent reading the book,
         * in seconds.
         */

        /**
         * The books a user has added.
         * They are indexed by {@link id}, and are of type {@link BookInstance}
         */
        books: {},

        /**
         * A pointer/reference to the book currently viewed in Reading mode.
         * @type {BookInstance}
         */
        currentBook: null,

        /**
         * The currently displayed dictionary entry
         * @type {string}
         */
        definition: null,

        /**
         * If the user is currently reading.
         * @type {boolean}
         */
        isReading: false,

        /**
         * Timestamp for when the user started reading.
         * @type {number}
         */
        timestamp: -1
    },

    methods: {
        changeView: window.globalFunctions.changeView,

        /**
         * Start reading and timing.
         */
        startReading: function() {
            this.isReading = true;
            this.timestamp = Date.now();
            if (window.location.hash.indexOf("&reading=true") < 0) {
                window.location.hash += "&reading=true";
            }
        },

        /**
         * Stop reading and timing, prompt for page number.
         */
        stopReading: function() {
            if (!this.isReading) return;
            this.isReading = false;
            window.location.hash = window.location.hash
                .replace("&reading=true", "");
            var interval = Date.now() - this.timestamp;
            this.currentBook.timeReading += interval / 1000;
            this.dataChanged();
        },

        /**
         * Add a book to the list.
         */
        addBook: function() {
            this.$set("books.id_" + this.id++, { // increment ID and store book
                title: this.input.title,
                author: this.input.author,
                pages: this.input.pagecount,
                currentPage: 1,
                timeReading: 0
            });
            this.cancelAdd();
            this.dataChanged();
        },

        /**
         * Clear input fields and close add view.
         */
        cancelAdd: function() {
            this.input.author = null;
            this.input.title = null;
            this.input.pagecount = null;
            this.changeView("list");
        },

        /**
         * Load a book into the reading view.
         * @arg {string} id the ID of the book to load.
         */
        loadBook: function(id) {
            this.currentBook = this.books[id];
            this.changeView("book");
            window.location.hash += "&book=" + id;
        },

        /**
         * Remove a book from the book list and delete all associated data.
         * @arg {string} id the ID of the book to remove.
         */
        removeBook: function(id) {
            Vue.delete(this.books, id);
            this.dataChanged();
        },

        /**
         * Search the dictionary and display the result.
         */
        searchDictionary: function() {
            var definition = Dictionary[this.input.dict.toUpperCase()];
            if (!definition) return;
            // fix some problems with the JSON
            definition = definition.replace(/(\w)\.(\w)/g, "$1.<br />$2");
            definition = definition.replace(/(\w),(\w)/g, "$1, $2");
            definition = definition.replace(/(\w);(\w)/g, "$1, $2");
            definition = definition.replace(/\](\w)/g, "] $1");
            definition = definition.replace(/See (under )?(\w+)/g, "See <a onclick='ViewModel.dictionaryReference(\"$2\")'>$2</a>");

            this.definition = definition;
        },

        /**
         * Helper function to look up word reference.
         * @arg {string} word
         */
        dictionaryReference: function(word) {
            this.input.dict = word;
            this.searchDictionary();
        },

        /** 
         * Called when some permanent data has changed.
         */
        dataChanged: StorageManager.saveData
    }
});

StorageManager.loadData(function(books) {
    if (!books) return;
    vm.$set("books", books);
    vm.id = Object.keys(books).length; // avoid ID collisions

    parseURL();
});

window.addEventListener("beforeunload", function() {
    vm.stopReading();
});

function parseURL() {
    if (window.location.hash === "") return;

    var getQueryVariable = function(variable) {
        var query = window.location.hash.slice(1);
        var vars = query.split('&');

        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');

            if (decodeURIComponent(pair[0]) === variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        return null;
    }

    var view = getQueryVariable("view");

    switch (view) {
        case "book":
            var book = getQueryVariable("book");
            if (book) {
                vm.currentBook = vm.books[book];
                if (getQueryVariable("reading")) {
                    vm.startReading();
                }
            }
            break;
    }

    vm.changeView(view, true);
}

