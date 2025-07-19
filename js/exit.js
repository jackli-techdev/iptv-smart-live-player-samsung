"use strict";

var exit = {
    keys: {
        btnSelection: 0
    },
    menuDoms: $("#exit-modal button"),
    prevRoute: "",
    movie: null,

    init: function (prevRoute) {
        this.prevRoute = prevRoute;
        currentRoute = "exit-modal";
        this.hoverMenuItem(0);
        $("#exit-modal").modal("show");
    },

    goBack: function () {
        $("#exit-modal").modal("hide");
        currentRoute = this.prevRoute;
    },

    hoverMenuItem: function (index) {
        var keys = this.keys;
        keys.focusedPart = "btnSelection";
        keys.btnSelection = index;
        $(this.menuDoms).removeClass("active");
        $(this.menuDoms[index]).addClass("active");
    },

    handleMenuClick: function () {
        var keys = this.keys;
        if (keys.focusedPart === "btnSelection") {
            var keys = this.keys;
            switch (keys.btnSelection) {
                case 0:
                    tizen.application.getCurrentApplication().exit();
                    break;
                case 1:
                    this.goBack();
                    break;
            }
        }
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        keys.btnSelection += increment;
        if (keys.btnSelection < 0) keys.btnSelection = 0;
        if (keys.btnSelection > 1) keys.btnSelection = 1;
        this.hoverMenuItem(keys.btnSelection);
    },

    HandleKey: function (e) {
        switch (e.keyCode) {
            case tvKey.ArrowRight:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.ArrowLeft:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.Enter:
                this.handleMenuClick();
                break;
            case tvKey.Back:
                this.goBack();
                break;
        }
    }
};
