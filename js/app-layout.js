"use strict";

loadComponent("app", "components/app-layout.html", {
    data: () => ({
        app: appData,
        modern: true
    }),
    ready: componentHandler.upgradeAllRegistered
});
