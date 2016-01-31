/**
 * Voice commands
 * @author Cory McCartan
 */

"use strict";

(function() {
    var commands = {
        "define word*": function(word) {
            vm.changeView("dict");
            vm.input.dict = word;
            vm.searchDictionary();
        }
    };

    annyang.addCommands(commands);
})();
