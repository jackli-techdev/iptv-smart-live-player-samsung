"use strict";
var home = {
    menuDoms: [],
    prevFocusDom: [],
    keys: {
        focusedPart: "menuSelection",
        menuSelection: 0,
        reloadModalBtnSelection: 0
    },
    reloadModalButnDoms: $("#reload-modal button"),

    init: function () {
        playlists.isError = false;
        if (!playlists.isError)
            $(".exit-index").addClass("hide");

        $("#app").removeClass("hide");
        for (var i = 0; i < 8; i++) {
            this.menuDoms[i] = $('[index="' + i + '"]');
        }
        exit.prevRoute = "home-page";
        if (currentRoute !== "exit-page") currentRoute = "home-page";
        displayCurrentPage(currentRoute);
        renderLaunguagesModal();
        this.hoverMainMenu(0);
        this.keys.focusedPart = "menuSelection";
        this.keys.reloadModalBtnSelection = 0;
    },

    hoverMainMenu: function (index) {
        this.keys.menuSelection = index;
        $(this.prevFocusDom).removeClass("active");
        $(this.menuDoms[index]).addClass("active");
        this.prevFocusDom = this.menuDoms[index];
    },

    showUserAccounts: function () {
        $("#user-account-mac-address").text(macAddress);
        $(".user-account-device-key").text(deviceKey);
        $("#user-account-expire-date").text(expireDate);
        if (isTrial == 2)
            $("#user-account-is_trial").text("Active");
        else
            $("#user-account-is_trial").text("Free Trial");
        $("#user-account-modal").modal("show");
        this.keys.focusedPart = "userAccountModal";
    },

    showReloadModal: function () {
        $("#reload-modal").modal("show");
        this.keys.focusedPart = "reloadModalSelection";
        this.hoverReloadModalBtn(this.keys.reloadModalBtnSelection);
    },

    hoverReloadModalBtn: function (index) {
        this.keys.reloadModalBtnSelection = index;
        $(this.reloadModalButnDoms).removeClass("active");
        $(this.reloadModalButnDoms[this.keys.reloadModalBtnSelection]).addClass("active");
    },

    reloadConfirm: function (index) {
        $("#reload-modal").modal("hide");
        if (index === 0) {
            currentRoute = "login";
            showLoadImage();
            $("#app").addClass("hide");
            login.getPlayListDetail('reload');
            initRangeSlider();
            settings.initFromLocal();
        } else {
            this.keys.focusedPart = "menuSelection";
        }
    },

    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "menuSelection":
                keys.menuSelection += increment;
                if (increment > 0) {
                    if (keys.menuSelection === 1 || keys.menuSelection === 4 || keys.menuSelection === 5 || keys.menuSelection === 8) {
                        keys.menuSelection = keys.menuSelection - 1;
                    } else if (keys.menuSelection === 2 || keys.menuSelection === 3) {
                        keys.menuSelection = keys.menuSelection + 1;
                    }
                } else {
                    if (keys.menuSelection === -1 || keys.menuSelection === 0 || keys.menuSelection === 1 || keys.menuSelection === 4) {
                        keys.menuSelection = keys.menuSelection + 1;
                    } else if (keys.menuSelection === 2 || keys.menuSelection === 3) {
                        keys.menuSelection = keys.menuSelection - 1;
                    }
                }
                this.hoverMainMenu(keys.menuSelection);
                break;
        }
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "menuSelection":
                keys.menuSelection += increment;
                if (increment > 0) {
                    if (keys.menuSelection === 3) {
                        keys.menuSelection = 5;
                    } else if (keys.menuSelection === 5) {
                        keys.menuSelection = 7;
                    }
                    else if (keys.menuSelection === 6 || keys.menuSelection === 7 || keys.menuSelection === 8) {
                        keys.menuSelection = keys.menuSelection - 1;
                    }
                } else {
                    if (keys.menuSelection === -1 || keys.menuSelection === 2) {
                        keys.menuSelection = 0;
                    } else if (keys.menuSelection === 4 || keys.menuSelection === 5) {
                        keys.menuSelection = 2;
                    }
                    else if (keys.menuSelection === 6) {
                        keys.menuSelection = 4;
                    }
                }
                this.hoverMainMenu(keys.menuSelection);
                break;
            case "reloadModalSelection":
                var keys = this.keys;
                keys.reloadModalBtnSelection = keys.reloadModalBtnSelection === 0 ? 1 : 0;
                this.hoverReloadModalBtn(keys.reloadModalBtnSelection);
                break;
        }
    },

    handleMenuClick: function () {
        if (this.keys.focusedPart === "reloadModalSelection")
            this.reloadConfirm(this.keys.reloadModalBtnSelection);
        else
            $(this.menuDoms[this.keys.menuSelection]).trigger("click");
    },

    clickTopBarMenu: function (index) {
        closeVideo();
        var noMovies = this.currentVideoType == "vod" ? currentWords['no_movies'] : currentWords["no_series"];
        switch (index) {
            case 0:
                currentRoute = "home-page";
                displayCurrentPage(currentRoute);
                break;
            case 1:
                channel.init();
                break;
            case 2:
                if (entireMovies.length === 0) {
                    showToast(noMovies, "");
                    return;
                } else
                    vodSeries.init("vod");
                break;
            case 3:
                if (entireSeries.length === 0) {
                    showToast(noMovies, "");
                    return;
                } else
                    vodSeries.init("series");
                break;
        }
    },

    clickMainMenu: function (index) {
        var noMovies = this.currentVideoType == "vod" ? currentWords['no_movies'] : currentWords["no_series"];

        switch (index) {
            case 0:
                channel.init();
                break;
            case 1:
                if (entireMovies.length === 0) {
                    showToast(noMovies, "");
                    return;
                } else
                    vodSeries.init("vod");
                break;
            case 2:
                if (entireSeries.length === 0) {
                    showToast(noMovies, "");
                    return;
                } else
                    vodSeries.init("series");
                break;
            case 3:
                this.showUserAccounts();
                break;
            case 4:
                $("#setting-page").addClass("hide");
                $("#channel-page").addClass("hide");
                playlists.init("home-page");
                break;
            case 5:
                setting.init();
                break;
            case 6:
                this.showReloadModal();
                break;
            case 7:
                this.goBack();
                break;
        }
    },

    goBack: function () {
        var keys = this.keys;
        if (keys.focusedPart === "menuSelection") {
            exit.init(currentRoute);
        } else if (keys.focusedPart === "userAccountModal") {
            $("#user-account-modal").modal("hide");
            keys.focusedPart = "menuSelection";
        }
        else if (keys.focusedPart === "reloadModalSelection") {
            $("#reload-modal").modal("hide");
            this.keys.focusedPart = "menuSelection"; keys.focusedPart = "menuSelection";
        }
    },

    HandleKey: function (e) {
        unFocusSearchBars();
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
