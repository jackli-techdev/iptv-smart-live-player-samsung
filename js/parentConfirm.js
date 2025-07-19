"use strict";
var parentConfirm = {
    keys: {
        menuSelection: 0
    },
    menuDoms: $(".parent-confirm-item"),
    prevRoute: "",
    categoryName: "",
    streamType: "",
    movie: null,

    init: function (prevRoute, categoryName, streamType) {
        this.prevRoute = prevRoute;
        this.categoryName = categoryName;
        this.streamType = streamType;
        currentRoute = "parent-confirm-page";
        $(this.menuDoms[0]).find("input").val("");
        this.hoverMenuItem(0);
        $("#parent-confirm-password-error").hide();
        $("#parent-confirm-modal").modal("show");
    },

    goBack: function () {
        $("#parent-confirm-modal").modal("hide");
        if (this.prevRoute === "vod-summary-page" || this.prevRoute === "series-summary-page")
            currentRoute = "vod-series-page";
        else
            currentRoute = this.prevRoute;
    },

    hoverMenuItem: function (index) {
        var keys = this.keys;
        keys.menuSelection = index;
        $(this.menuDoms).removeClass("active");
        $(this.menuDoms[index]).addClass("active");
    },

    hoverConfirmBtn: function (index) {
        currentRoute = 'parent-confirm-page'
        var keys = this.keys
        keys.menuSelection = index
        this.hoverMenuItem(index);
    },

    hoverInputBox: function () {
        $(this.menuDoms).removeClass("active");
        $(this.menuDoms[0]).find("input").focus();
        this.hoverMenuItem(0);
    },

    handleMenuClick: function () {
        var keys = this.keys;
        switch (keys.menuSelection) {
            case 0:
                $(this.menuDoms[0]).find("input").val("");
                $(this.menuDoms[0]).find("input").focus();
                break;
            case 1:
                var password = $(this.menuDoms[0]).find("input").val();
                $("#parent-confirm-password-error").hide();
                if (password != parentPassword) {
                    $("#parent-confirm-password-error").slideDown();
                    return;
                }
                $("#parent-confirm-modal").modal("hide");
                currentRoute = this.prevRoute;
                if (this.prevRoute === "channel-page") {
                    if (this.categoryName === 'all')
                        channel.showMovie(channel.movies[channel.keys.channelSelection]);
                    else {
                        channel.emptyChannelContainer();
                        channel.showCategoryChannels(this.categoryName, channel.currentCategoryIndex);
                        $(".channel-page-category-item").removeClass("selected");
                        var categoryDoms = $(".channel-page-category-item");
                        $(categoryDoms[channel.keys.categorySelection]).addClass("selected");
                    }

                } else if (this.prevRoute === "vod-series-page") {
                    if (this.categoryName === 'all') {
                        if (this.streamType === 'vod')
                            vodSummary.init("vod-series-page");
                        else
                            seriesSummary.init("vod-series-page");
                    }
                    else
                        vodSeries.showCategoryContent();
                } else if (this.prevRoute === "setting-page") {
                    var currentItem = $(".disable-parent-control-modal-option");
                    $($(currentItem).find("input")[0]).prop("checked", false);
                    saveToLocalStorage('parentControlDisable', true);
                    parentControlDisable = true;
                    var text = currentWords["disable"];
                    var eText = currentWords["enable_parent_control"];
                    $(".parent-control-status").text(text);
                    $(".disable-parent-control-text").text(eText);
                }
                break;
            case 2:
                this.goBack();
                break;
        }
    },

    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        if (keys.menuSelection >= 1 && increment > 0) return;
        if (keys.menuSelection >= 1 && increment < 0) {
            keys.menuSelection = 0;
            $(this.menuDoms[0]).find("input").focus();
        }
        else if (keys.menuSelection == 0 && increment > 0) {
            keys.menuSelection = 1;
            $(this.menuDoms[0]).find("input").blur();
        }
        this.hoverMenuItem(keys.menuSelection);
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        if (keys.menuSelection >= 1) {
            keys.menuSelection += increment;
            if (keys.menuSelection < 1) keys.menuSelection = 0;
            if (keys.menuSelection > 2) keys.menuSelection = 2;
            this.hoverMenuItem(keys.menuSelection);
        }

    },

    HandleKey: function (e) {
        switch (e.keyCode) {
            case tvKey.ArrowRight:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.ArrowLeft:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.ArrowDown:
                this.handleMenusUpDown(1);
                break;
            case tvKey.ArrowUp:
                this.handleMenusUpDown(-1);
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
