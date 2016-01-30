/**
 * Program entry point and UI code.
 * @author Cory McCartan
 */

"use strict";

window.$ = (s) => document.querySelector(s);

window.ViewModel = new Vue({
    el: "#app",

    data: {
        /**
         * General information and metadata about the app.
         * @type {Object}
         */
        app: {
            title: "Books",
            author: "Cory McCartan",
            copyright: "2016"
        },

        /**
         * String to display in the title bar and browser tab.
         * @type {string}
         */
        title: "Books",

        /**
         * Whether we are using a modern browser.  
         * Uses an ES6 check.
         * @type {boolean}
         */
        modern: () => true,

        /**
         * @typedef {Object} ViewInstance
         * @desc An object that stores information related to an app view.
         * @property {string} display the user-friendly display name that will
         * show up in the title bar and navigation drawer.
         * @property {string} icon the Material Icons glyph name to display in 
         * the navigaion drawer.
         */

        /**
         * The various views in the application. 
         * Each element is of type {@link ViewInstance}. Its key is the view's
         * unique ID.
         */
        views: {
            book: {display: "Read", icon: "local_library", drawer: "inDrawer"},
            list: {display: "Book List", icon: "list", drawer: "inDrawer"},
            add: {display: "Add Book", drawer: "noDrawer"},
            dictionary: {display: "Dictionary", drawer: "noDrawer"},
        },

        /**
         * The ID of the current view displayed to the user.
         * @type {string}
         */
        currentView: "list",

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
        isReading: false
    },

    methods: {
        /**
         * Change the current view (main-page content).
         * @arg {string} name the ID of the view to change to.
         */
        changeView: function(name) {
            this.currentView = name;
            // hide the side menu
            var sideMenu = $(".mdl-layout__obfuscator.is-visible");
            if (sideMenu) sideMenu.click(); 
        },

        /**
         * Add a book to the list.
         */
        addBook: function() {
            this.$set("books.id_" + this.id++, { // increment ID and store book
                title: this.input.title,
                author: this.input.author,
                pages: this.input.pagecount,
                currentPage: 1
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
            this.changeView("list");
        },

        /**
         * Load a book into the reading view.
         * @arg {string} id the ID of the book to load.
         */
        loadBook: function(id) {
            this.currentBook = this.books[id];
            this.changeView("book");
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
    ViewModel.$set("books", books);
    ViewModel.id = Object.keys(books).length; // avoid ID collisions
});

// load dictionary
fetch("data/dictionary.json").then((r) => r.json())
    .then(function(json) {
        window.Dictionary = json;
    });
