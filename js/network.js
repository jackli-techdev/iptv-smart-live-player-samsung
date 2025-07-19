"use strict";
var network = {
    init: function () {
        $("#network-modal").modal("show");
    },

    handleMenuClick: function () {
        this.goBack();
    },

    goBack: function () {
        $("#network-modal").modal("hide");
    },

    HandleKey: function (e) {
        switch (e.keyCode) {
            case tvKey.Enter:
                this.handleMenuClick();
                break;
            case tvKey.Back:
                this.goBack();
                break;
        }
    }
};

