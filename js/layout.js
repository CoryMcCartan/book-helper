/**
 * Navigation bar component.
 * @author Cory McCartan
 */

"use strict";

loadComponent("layout", "layout.html", {
    props: {
        /**
         * View object
         */
        viewObj: {
            type: Object,
            required: true
        },

        /**
         * Reference to current view
         */
        currentView: {
            type: Object,
            required: true,
            twoWay: true
        },

        /**
         * Where to go back to when button is pressed
         */
        previousView: String
    },

    data: () => ({
        /**
         * Whether we are using a modern browser.  
         * Uses an ES6 check.
         * @type {boolean}
         */
        modern: () => true,

        app: window.appData,

        views: window.views
    }),

    computed: {
        active: function() {
            return this.currentView === this.viewObj;
        }
    },

    methods: () => ({
        changeView: window.globalFunctions.changeView,
        goBack: window.globalFunctions.goBack
    })
});
