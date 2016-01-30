"use strict";

loadComponent("view-list", "components/view-list.html", {
    data: () => ({
        app: appData,
        books: [],
        showAddView: false,
        callNumber: ""
    }),
    methods: {
        addBook: function(book) {
            var call = callNumber;
            this.books.push({call});

            this.showAddView = false;
        },
        removeBook: function(book) {
            this.books.$remove(book);
        }
    },
    ready: componentHandler.upgradeAllRegistered
})
