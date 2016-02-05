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
        mode: "overlay"
    },
    dictionary: {
        name: "dictionary",
        display: "Dictionary",
        mode: "overlay"
    },
    takePicture: {
        name: "takePicture",
        display: "Add Picture",
        mode: "overlay"
    },
    showPicture: {
        name: "showPicture",
        display: "View Picture",
        mode: "overlay"
    }
};

window.globalFunctions = {
    /**
     * Change the current view (main-page content).
     * @arg {string} name the ID of the view to change to.
     * @arg {boolean} replace whether to replace the history state or add a new one
     */
    changeView: function(name, replace) {
        // update view
        this.currentView = this.views[name];
        // stop reading if need be
        if (this.currentView.name === "list") vm.stopReading();
        // add to history
        Router.changeView(name, replace);
        // hide the side menu
        var sideMenu = $(".mdl-layout__obfuscator.is-visible");
        if (sideMenu) sideMenu.click(); 

        if (this.dataChanged) this.dataChanged(); // can't hurt
    },

    goBack: function() {
        window.history.back();
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
            dict: null,

            /**
             * Name of picture just taken.
             * @type {string}
             */
            pictureName: null
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
         * @property {string} notes notes the user has taken on the book.
         * @property {array} pictures an array of reference pictures the user has taken.
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
         * Currently taken/displayed picture data.
         */
        currentPictureData: null,

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
        timestamp: -1,

        /**
         * Whether the camera's pictures are taller than they are wide.
         * @type {boolean}
         */
        isTall: true,

        /** 
         * Time spent reading since pressing 'Start Reading'
         */
        sessionTime: "",

        /**
         * Whether the book list is empty
         */
        listEmpty: true,
    },

    computed: {
        /**
         * Total time spent reading current book
         */
        totalTime: function() {
            return this.getTimeString(this.currentBook.timeReading); 
        },

        /**
         * Current reading speed.
         */
        readingSpeed: function() {
            var pages = this.currentBook.currentPage - 1;
            var hours =  this.currentBook.timeReading / 3600000;
            var speed =  Math.round(pages / hours);
            if (isNaN(speed) || !isFinite(speed)) {
                speed = 0;
            }

            return speed;
        },

        bookProgress: function() {
            var amount = this.currentBook.currentPage / this.currentBook.pages;
            $("#book-progress").MaterialProgress.setProgress(100 * amount); 
            return Math.round(100 * amount);
        }
    },

    methods: {
        changeView: window.globalFunctions.changeView,

        goBack: window.globalFunctions.goBack,

        /**
         * Start reading and timing.
         */
        startReading: function() {
            this.isReading = true;
            this.timestamp = Date.now();
            Router.addStateData({reading: this.timestamp});

            // start voice commands
            // annyang.start();

            requestAnimationFrame(this.timerUpdate);
        },

        /**
         * Stop reading and timing, prompt for page number.
         */
        stopReading: function() {
            if (!this.isReading) return;
            this.isReading = false;
            Router.addStateData({reading: false});

            //stop voice commands
            // annyang.abort();

            var interval = Date.now() - this.timestamp;
            this.currentBook.timeReading += interval;
            this.dataChanged();

            $("#dialog-page-number").showModal();
        },

        /**
         * Create a time string for a given interval.
         * @arg interval {number} the interval in ms.
         */
        getTimeString: function(interval) {
            var seconds = ~~(interval / 1000);
            var minutes = ~~(seconds / 60); 
            var hours = ~~(minutes / 60);
            var zero = "0";
            seconds %= 60;
            minutes %= 60;
            // pad
            if (seconds < 10) seconds = "0" + seconds; 
                else seconds = seconds.toString();
            if (minutes < 10) minutes = "0" + minutes; 
                else minutes = minutes.toString();
            
            return `${hours}:${minutes}:${seconds}`;
        },

        /**
         * Force update of timeString
         */
        timerUpdate: function() {
            this.sessionTime = this.getTimeString(Date.now() - this.timestamp);

            if (this.isReading) requestAnimationFrame(this.timerUpdate);
        },

        savePage: function() {
            $("#dialog-page-number").close();
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
                timeReading: 0,
                notes: null,
                pictures: []
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
            Router.addStateData({book: id});
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
         * Load the picture-taking interface
         */
        showCamera: function() {
            var video = $("video");
            var this_out = this; // 'this' inside callback isn't the same

            MediaStreamTrack.getSources(function(sources) {
                var id = null;
                // find ID of rear camera, if one exists
                for (let i = 0; i < sources.length; i++) {
                    if (sources[i].kind === "video") {
                        id = sources[i].id;

                        if (sources[i].facing === "environment") {
                            break;
                        }
                    }
                }

                // use that media device
                navigator.webkitGetUserMedia({
                    audio: false, 
                    video: {
                        optional: [{sourceId: id}]
                    }
                }, function(stream) {
                    video.src = window.URL.createObjectURL(stream);
                    video.onloadedmetadata = function(e) {
                        video.height = e.target.videoHeight;
                        video.width = e.target.videoWidth;

                        video.play();
                    };
                }, () => {});

                this_out.changeView("takePicture");
            });
        },

        takePicture: function() {
            var video = $("video");
            var canvas = document.createElement("canvas");
            canvas.height = video.height;
            canvas.width = video.width;
            var ctx = canvas.getContext("2d");


            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            this.currentPictureData = canvas.toDataURL();

            video.pause();

            $("#dialog-name-picture").showModal();
        },

        cancelPicture: function() {
            try {
                $("#dialog-name-picture").close();   
            } catch (e) {}

            this.currentPictureData = null;
            this.input.pictureName = null;
            
            this.goBack();
        },

        savePicture: function() {
            this.currentBook.pictures.push({
                caption: this.input.pictureName,
                data: this.currentPictureData
            });

            this.dataChanged(); // save
            this.cancelPicture(); // cleanup
        },

        deletePicture: function(picture) {
            this.currentBook.pictures.$remove(picture); 
            this.dataChanged();
        },

        showPicture: function(picture) {
            this.currentPictureData = picture.data;
            this.changeView("showPicture");
        },

        /**
         * Search the dictionary and display the result.
         */
        searchDictionary: function() {
            Router.addStateData({word: this.input.dict});

            var definition = Dictionary[this.input.dict.toUpperCase()];
            if (!definition) {
                this.definition = "Sorry, no definition could be found.";
                return;
            }

            // fix some problems with the JSON
            definition = definition.replace(/(\w)\.(\w)/g, "$1.<br />$2");
            definition = definition.replace(/(\w),(\w)/g, "$1, $2");
            definition = definition.replace(/(\w);(\w)/g, "$1, $2");
            definition = definition.replace(/\](\w)/g, "] $1");
            definition = definition.replace(/See (under )?(\w+)/g, "See <a onclick='vm.dictionaryReference(\"$2\")'>$2</a>");

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
    },
    
    watch: {
        books: function(v) {
            this.listEmpty = !(Object.keys(v).length); 
        }
    }
});

StorageManager.loadData(function(books) {
    if (books) {
        vm.$set("books", books);
        vm.id = Object.keys(books).length; // avoid ID collisions
    } 
    Router.loadState(history.state);

});

if (!history.state) Router.addStateData({view: "list"}); 
