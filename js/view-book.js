"use strict";

loadComponent("view-book", "components/view-book.html", {
    props: ["isbn"],
    data: () => ({
        app: appData,
    })
});
