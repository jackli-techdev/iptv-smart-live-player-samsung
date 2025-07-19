"use strict";
var setting = {
    player: null,
    keys: {
        focusedPart: "menuSelection",
        menuSelection: 0,
        timeFormatSelection: 0,
        hideCategorySelection: 0,
        clearHistoryChannelsSelection: 0,
        clearHistoryChannelsBtnSelection: 0,
        clearHistorySeriesSelection: 0,
        clearHistorySeriesBtnSelection: 0,
        clearHistoryMoviesSelection: 0,
        clearHistoryMoviesBtnSelection: 0,
        textTracksSelection: 0,
        textTracksFontSelection: 1,
        textTracksFontSize: 40,
        textTracksColorSelection: 0,
        textTracksBkSelection: 0,
        liveStreamFormatSelection: 0,
        deleteCacheSelection: 0
    },
    menuDoms: $(".setting-menu-item-wrapper"),
    clearHistorySeriesBtnDoms: $(".clear-history-series-modal-button"),
    clearHistoryChannelsBtnDoms: $(".clear-history-channels-modal-button"),
    clearHistoryMoviesBtnDoms: $(".clear-history-movies-modal-button"),
    textTracksSettingsModalDom: $("#text-tracks-settings-body .hide-category-modal-option"),
    textTracksFontDoms: $(".text-tracks-fontsize-wrapper .increase-fontsize-btn"),
    textTracksColorDoms: $(".text-tracks-color-item .color-item"),
    textTracksBkDoms: $(".text-tracks-background-item .background-item"),
    parentControlDoms: [],
    hideCategoryDoms: [],
    clearHistoryChannelsDoms: [],
    clearHistoryMoviesDoms: [],
    clearHistorySeriesDoms: [],
    hideCategoryMovieType: "",
    clearHistoryMoviesType: "",
    translatedDoms: [],
    languageDoms: [],
    clearHistoryChannelsIds: [],
    clearHistorySeriesIds: [],
    clearHistoryMoviesIds: [],
    prevFocusDom: [],
    liveStreamFormatDoms: [],
    timeFormatDoms: [],

    init: function () {
        var keys = this.keys;
        keys.focusedPart = "menuSelection";
        keys.menuSelection = 0;
        $(this.menuDoms).removeClass("active");
        $(this.menuDoms[0]).addClass("active");
        currentRoute = "setting-page";

        this.updateTextTracksSetting();
        displayCurrentPage(currentRoute);
        $(this.textTracksFontDoms[1]).addClass('active');
        var parentControlDoms = $("#parent-control-modal .parent-modal-input-item-container");
        $("#parent-control-modal .parent-control-modal-button").map(function (
            index,
            item
        ) {
            parentControlDoms.push(item);
        });
        this.parentControlDoms = parentControlDoms;

        var eText = currentWords["enable_parent_control"];
        var dText = currentWords["disable_parent_control"];
        if (parentControlDisable) {
            $(".disable-parent-control-text").text(eText);
        } else {
            $(".disable-parent-control-text").text(dText);
        }
    },

    updateTextTracksSetting: function () {
        var storedTextTracksColor = getLocalStorageData('textTracksColor') !== null ? getLocalStorageData('textTracksColor') : config.textTracksColor;
        var storedTextTracksFontSize = getLocalStorageData('textTracksFontSize') !== null ? getLocalStorageData('textTracksFontSize') : config.textTracksFontSize;
        var storedTextTracksBackgroundColor = getLocalStorageData('textTracksBackgroundColor') !== null ? getLocalStorageData('textTracksBackgroundColor') : config.textTracksBackgroundColor

        $('.text-tracks-font-size').text(storedTextTracksFontSize)
        $(".text-tracks-setting-modal-option-color").css({
            background: storedTextTracksColor
        });
        $(".text-tracks-example-text").css({
            color: storedTextTracksColor
        });


        if (storedTextTracksBackgroundColor !== "none") {
            $(".text-tracks-setting-modal-option-bk").css({
                background: storedTextTracksBackgroundColor
            });
            $(".text-tracks-example-text-item").css({
                background: storedTextTracksBackgroundColor
            });
        }
        else
            $(".text-tracks-setting-modal-option-bk").css({ background: "transparent", border: "solid 1px white" });
    },

    goBack: function () {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "menuSelection":
                $("#setting-page").addClass("hide");
                $("#home-page").removeClass("hide");
                currentRoute = "home-page";
                break;
            case "parentControlModal":
                this.cancelResetParentAccount();
                break;
            case "userAccountModal":
                $("#user-account-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "clearHistoryChannelsModal":
                $("#clear-history-channels-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "clearHistoryChannelsBtn":
                $("#clear-history-channels-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "clearHistoryMoviesModal":
                $("#clear-history-movies-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "clearHistoryMoviesBtn":
                $("#clear-history-movies-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "clearHistorySeriesModal":
                $("#clear-history-series-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "clearHistorySeriesBtn":
                $("#clear-history-series-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "hideCategoryModal":
                $("#hide-category-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "languageSelection":
                $("#language-select-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "timeFormatModal":
                $("#time-format-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "liveStreamFormatModal":
                $("#livestream-format-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "textTracksSettings":
                $("#text-tracks-settings-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "textTracksColorSettings":
                $("#text-tracks-settings-color-modal").modal("hide");
                $("#text-tracks-settings-modal").modal("show");
                keys.focusedPart = "textTracksSettings";
                break;
            case "textTracksBkSettings":
                $("#text-tracks-settings-background-modal").modal("hide");
                $("#text-tracks-settings-modal").modal("show");
                keys.focusedPart = "textTracksSettings";
                break;
            case "disableParentControlModal":
                $("#disable-parent-control-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
            case "deleteCacheSelection":
                $("#delete-cache-modal").modal("hide");
                keys.focusedPart = "menuSelection";
                break;
        }
    },

    showParentControlModal: function () {
        $("#parent-account-valid-error").hide();
        $(".parent-modal-input-wrapper input").val("");
        $("#parent-control-modal").modal("show");
        this.keys.focusedPart = "parentControlModal";
        $(this.parentControlDoms).removeClass("active");
        this.keys.parentControlSelection = 0;
        $(this.parentControlDoms[0]).addClass("active");
        $(this.parentControlDoms[0]).find("input").focus();
    },

    clickParentControl: function (index) {
        var keys = this.keys;
        keys.parentControlSelection = index;
        switch (keys.parentControlSelection) {
            case 0:
                $(this.parentControlDoms[index]).find("input").focus();
                break;
            case 1:
                $(this.parentControlDoms[index]).find("input").focus();
                break;
            case 2:
                $(this.parentControlDoms[index]).find("input").focus();
                // var that = this;
                // setTimeout(function () {
                //     // var tmp = $(that.parentControlDoms[index]).find("input").val();
                //     // $(that.parentControlDoms[index])
                //     //     .find("input")[0]
                //     //     .setSelectionRange(tmp.length, tmp.length);
                // }, 200);
                break;
            case 3:
                this.resetParentAccount();
                break;
            case 4:
                this.cancelResetParentAccount();
                break;
        }
    },

    resetParentAccount: function () {
        $("#parent-account-valid-error").hide();
        var originParentPassword = $("#current_parent_password").val();
        var newPassword = $("#new_parent_password").val();
        var newPasswordConfirm = $("#new_parent_password_confirm").val();
        if (originParentPassword != parentPassword) {
            $("#parent-account-valid-error")
                .text("Current password does not match")
                .slideDown();
            return;
        }
        if (newPassword != newPasswordConfirm) {
            $("#parent-account-valid-error")
                .text("Password does not match")
                .slideDown();
            return;
        }
        parentPassword = newPassword;

        var originData = {
            mac_address: macAddress,
            parent_control: parentPassword
        };
        var encoded = encode(originData);
        $.ajax({
            method: "POST",
            url: config.panelEndPoint + "parent-control/update",
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ data: encoded })
        });

        $("#parent-control-modal").modal("hide");
        this.keys.focusedPart = "menuSelection";
    },

    cancelResetParentAccount: function () {
        $("#parent-control-modal").modal("hide");
        this.keys.focusedPart = "menuSelection";
    },

    getSelectedLanguageWords: function (code) {
        var words = [];
        for (var i = 0; i < languages.length; i++) {
            if (languages[i].code === code) {
                words = languages[i].words;
                break;
            }
        }
        currentWords = words;
    },

    showHideCategoryModal: function (movieType) {
        this.hideCategoryMovieType = movieType;
        var categories;
        if (movieType === "live")
            categories = movieHelper.getCategories("live", true, false);
        if (movieType === "movie" || movieType === "vod")
            categories = movieHelper.getCategories("vod", true, false);
        if (movieType === "series")
            categories = movieHelper.getCategories("series", true, false);
        var htmlContent = "";
        categories.map(function (category, index) {
            htmlContent +=
                '<div class="hide-category-modal-option"' +
                '   onclick="setting.clickHideCategory(' +
                index +
                ')"' +
                '   onmouseenter="setting.hoverHideCategory(' +
                index +
                ')"' +
                ">" +
                '   <input class="hide-category-checkbox" type="checkbox" name="checkbox"' +
                '       id="hide-category-item-' + movieType + '_' + category.category_id +
                '" ' +
                (category.is_hide ? "checked" : "") +
                ' value="' +
                category.category_id +
                '">' +
                '   <label for="-hide-category-item-' + movieType + '_' + category.category_id +
                '">' +
                category.category_name +
                "</label>" +
                "</div>";
        });
        $("#hide-modal-categories-container").html(htmlContent);
        $("#hide-category-modal").modal("show");
        $($(".hide-category-modal-option")).removeClass("active");
        $($(".hide-category-modal-option")[0]).addClass("active");
        $($(".hide-category-btn-wrapper")).removeClass("active");
        var hideCategoryDoms = $(".hide-category-modal-option");
        this.hideCategoryDoms = hideCategoryDoms;
        this.keys.focusedPart = "hideCategoryModal";
        this.keys.hideCategorySelection = 0;
        $(this.hideCategoryDoms).removeClass("active");
        $(this.hideCategoryDoms[0]).addClass("active");
        $("#hide-modal-categories-container").scrollTop(0);
    },

    showTimeFormat: function () {
        $("#time-format-modal").modal("show");

        var _12HourFormat = currentWords["_12_hour_format"];
        var _24HourFormat = currentWords["_24_hour_format"];
        var htmlContent = "";
        htmlContent +=
            '<div class="time-format-modal-option" onclick="setting.clickTimeFormat(0)" onmouseenter= "setting.hoverTimeFormat(0)"  >' +
            '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="time-format-12"' +
            (timeFormat == 12 ? "checked" : "") +
            ' value="12">' +
            '   <label for="time-format-12" data-word_code="_12_hour_format" >' +
            _12HourFormat +
            "</label></div>" +
            '<div class="time-format-modal-option" onclick="setting.clickTimeFormat(1)" onmouseenter= "setting.hoverTimeFormat(1)">' +
            '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="time-format-24"' +
            (timeFormat == 24 ? "checked" : "") +
            ' value="24">' +
            '   <label for="time-format-24" data-word_code="_24_hour_format">' +
            _24HourFormat +
            "</label></div>";
        $("#time-format-modal-container").html(htmlContent);
        $($(".time-format-modal-option")).removeClass("active");
        if (timeFormat == 12) {
            $($(".time-format-modal-option")[0]).addClass("active");
        } else $($(".time-format-modal-option")[1]).addClass("active");
        this.keys.focusedPart = "timeFormatModal";
    },

    showLiveStreamFormat: function () {
        $("#livestream-format-modal").modal("show");
        var htmlContent = "";
        htmlContent +=
            '<div class="livestream-format-modal-option" onclick="setting.clickLiveStreamFormat(0)" onmouseenter= "setting.hoverLiveStreamFormat(0)"  >' +
            '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-format-ts"' +
            (liveStreamFormat == 'ts' ? "checked" : "") +
            ' value="ts">' +
            '   <label for="livestream-format-ts" >MPEGTS (.ts)</label></div>' +
            '<div class="livestream-format-modal-option" onclick="setting.clickLiveStreamFormat(1)" onmouseenter= "setting.hoverLiveStreamFormat(1)">' +
            '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-format-m3u8"' +
            (liveStreamFormat == 'm3u8' ? "checked" : "") +
            ' value="m3u8">' +
            '   <label for="livestream-format-m3u8">HLS (.m3u8)</label></div>';
        $("#livestream-format-modal-container").html(htmlContent);
        $($(".livestream-format-modal-option")).removeClass("active");
        if (liveStreamFormat == 'ts') {
            $($(".livestream-format-modal-option")[0]).addClass("active");
        } else $($(".livestream-format-modal-option")[1]).addClass("active");
        this.keys.focusedPart = "liveStreamFormatModal";
    },

    showDisableParentControlModal: function () {
        $("#disable-parent-control-modal").modal("show");
        var htmlContent = "";
        htmlContent +=
            '<div class="disable-parent-control-modal-option flex-container active" onclick="setting.clickDisableParentControl()" onmouseenter= "setting.hoverDisableParentControl()"  >' +
            '<div class="parent-control-status">Enable</div>' +
            '<label class="switch">' +
            '<input type="checkbox"' +
            (parentControlDisable == false ? "checked" : "") +
            ' > ' +
            '<span class="slider round"></span>' +
            '</label>' +
            '</div > ';
        $("#disable-parent-control-modal-container").html(htmlContent);
        var enableText = currentWords["enable"];
        var eText = currentWords["enable_parent_control"]
        var disableText = currentWords["disable"];
        var dText = currentWords["disable_parent_control"];
        if (parentControlDisable) {
            $(".parent-control-status").text(disableText);
            $(".disable-parent-control-text").text(eText);
        } else {
            $(".parent-control-status").text(enableText);
            $(".disable-parent-control-text").text(dText);
        }
        this.keys.focusedPart = "disableParentControlModal";
    },

    hoverDisableParentControl: function () {
        this.keys.focusedPart = "disableParentControlModal";
    },

    clickDisableParentControl: function () {
        var currentItem = $(".disable-parent-control-modal-option");
        var currentValue = $($(currentItem).find("input")[0]).prop("checked");

        if (currentValue) {
            parentConfirm.init("setting-page", "", "");
        } else {
            $($(currentItem).find("input")[0]).prop("checked", !currentValue);
            var enableText = currentWords["enable"];
            var dText = currentWords["disable_parent_control"];
            $(".parent-control-status").text(enableText);
            $(".disable-parent-control-text").text(dText);
            parentControlDisable = false;
            saveToLocalStorage('parentControlDisable', false);
        }
    },

    clickHideCategory: function (index) {
        var current_item = this.hideCategoryDoms[index];
        var current_value = $($(current_item).find("input")[0]).prop("checked");
        current_value = !current_value;
        $($(current_item).find("input")[0]).prop("checked", current_value);
        if (this.hideCategoryMovieType === "live") {
            movieHelper.saveHiddenCategories("live", index, current_value);
        } else if (
            this.hideCategoryMovieType === "movie" ||
            this.hideCategoryMovieType === "vod"
        ) {
            movieHelper.saveHiddenCategories("vod", index, current_value);
        } else {
            movieHelper.saveHiddenCategories("series", index, current_value);
        }
    },

    clickClearHistoryChannels: function (index, id) {
        var current_item = this.clearHistoryChannelsDoms[index];
        var current_value = $($(current_item).find("input")[0]).prop("checked");
        current_value = !current_value;
        $($(current_item).find("input")[0]).prop("checked", current_value);
        var clearHistoryChannelsIds = this.clearHistoryChannelsIds;

        if (current_value) {
            if (!clearHistoryChannelsIds.includes(id)) {
                clearHistoryChannelsIds.push(id);
            }
        } else {
            let index = clearHistoryChannelsIds.indexOf(id);
            if (index > -1) {
                clearHistoryChannelsIds.splice(index, 1);
            }
        }
        this.clearHistoryChannelsIds = clearHistoryChannelsIds;
    },

    clickClearHistoryMovies: function (index, id) {
        var current_item = this.clearHistoryMoviesDoms[index];
        var current_value = $($(current_item).find("input")[0]).prop("checked");
        current_value = !current_value;
        $($(current_item).find("input")[0]).prop("checked", current_value);
        var clearHistoryMoviesIds = this.clearHistoryMoviesIds;

        if (current_value) {
            if (!clearHistoryMoviesIds.includes(id)) {
                clearHistoryMoviesIds.push(id);
            }
        } else {
            let index = clearHistoryMoviesIds.indexOf(id);
            if (index > -1) {
                clearHistoryMoviesIds.splice(index, 1);
            }
        }
        this.clearHistoryMoviesIds = clearHistoryMoviesIds;
    },

    clickClearHistorySeries: function (index, id) {
        var current_item = this.clearHistorySeriesDoms[index];
        var current_value = $($(current_item).find("input")[0]).prop("checked");
        current_value = !current_value;
        $($(current_item).find("input")[0]).prop("checked", current_value);
        var clearHistorySeriesIds = this.clearHistorySeriesIds;

        if (current_value) {
            if (!clearHistorySeriesIds.includes(id)) {
                clearHistorySeriesIds.push(id);
            }
        } else {
            let index = clearHistorySeriesIds.indexOf(id);
            if (index > -1) {
                clearHistorySeriesIds.splice(index, 1);
            }
        }
        this.clearHistorySeriesIds = clearHistorySeriesIds;
    },

    clickSelectAllClearHistoryChannels: function () {
        var clearHistoryChannelsDoms = this.clearHistoryChannelsDoms;
        var clearHistoryChannelsIds = this.clearHistoryChannelsIds;
        var item_length = clearHistoryChannelsDoms.length;
        for (var i = 0; i < item_length; i++) {
            var current_item = clearHistoryChannelsDoms[i];
            var current_value = $($(current_item)).prop("checked");
            var current_value_id = $($(current_item)).data("channel_id");
            if (!clearHistoryChannelsIds.includes(current_value_id)) {
                clearHistoryChannelsIds.push(current_value_id);
            }
            $($(current_item).find("input")[0]).prop("checked", !current_value);
        }
        this.clearHistoryChannelsIds = clearHistoryChannelsIds;
    },

    clickSelectAllClearHistorySeries: function () {
        var clearHistorySeriesDoms = this.clearHistorySeriesDoms;
        var clearHistorySeriesIds = this.clearHistorySeriesIds;
        var item_length = clearHistorySeriesDoms.length;
        for (var i = 0; i < item_length; i++) {
            var current_item = clearHistorySeriesDoms[i];
            var current_value = $($(current_item)).prop("checked");
            var current_value_id = $($(current_item)).data("series_id");
            if (!clearHistorySeriesIds.includes(current_value_id)) {
                clearHistorySeriesIds.push(current_value_id);
            }
            $($(current_item).find("input")[0]).prop("checked", !current_value);
        }
        this.clearHistorySeriesIds = clearHistorySeriesIds;
    },

    clickSelectAllClearHistoryMovies: function (index, id) {
        var clearHistoryMoviesDoms = this.clearHistoryMoviesDoms;
        var clearHistoryMoviesIds = this.clearHistoryMoviesIds;
        var item_length = clearHistoryMoviesDoms.length;
        for (var i = 0; i < item_length; i++) {
            var current_item = clearHistoryMoviesDoms[i];
            var current_value = $($(current_item)).prop("checked");
            var current_value_id = $($(current_item)).data("series_id");
            if (!clearHistoryMoviesIds.includes(current_value_id)) {
                clearHistoryMoviesIds.push(current_value_id);
            }
            $($(current_item).find("input")[0]).prop("checked", !current_value);
        }
        this.clearHistoryMoviesIds = clearHistoryMoviesIds;
    },

    hoverSelectAllClearHistoryMovies: function () { },

    hoverSelectAllClearHistorySeries: function () { },

    clickTimeFormat: function (index) {
        var timeFormatDoms = $(".time-format-modal-option");
        var current_item = timeFormatDoms[index];
        var temp = 0;
        if (index == 0) temp = 1;

        var temp_item = timeFormatDoms[temp];
        var current_value = $($(current_item).find("input")[0]).prop("checked");

        if (current_value == false)
            current_value = true
        $($(current_item).find("input")[0]).prop("checked", current_value);
        $($(temp_item).find("input")[0]).prop("checked", !current_value);
        if (index == 0) {
            timeFormat = 12;
        } else timeFormat = 24;

        saveToLocalStorage('timeFormat', timeFormat);
    },

    clickLiveStreamFormat: function (index) {
        var liveStreamFormatDoms = $(".livestream-format-modal-option");
        var current_item = liveStreamFormatDoms[index];
        var temp = 0;
        if (index == 0) temp = 1;

        var temp_item = liveStreamFormatDoms[temp];
        var current_value = $($(current_item).find("input")[0]).prop("checked");

        if (current_value == false)
            current_value = true
        $($(current_item).find("input")[0]).prop("checked", current_value);
        $($(temp_item).find("input")[0]).prop("checked", !current_value);
        if (index == 0) {
            liveStreamFormat = 'ts';
        } else liveStreamFormat = 'm3u8';

        saveToLocalStorage('liveStreamFormat', liveStreamFormat);
    },

    showLanguages: function () {
        var keys = this.keys;
        keys.focusedPart = "languageSelection";
        keys.languageSelection = 0;
        this.languageDoms.map(function (index, item) {
            var language = $(item).data("language");
            if (language == settings.language) {
                keys.languageSelection = index;
            }
        });
        $(this.languageDoms).removeClass("active");
        $(this.languageDoms[keys.languageSelection]).addClass("active");
        $("#language-select-modal").modal("show");
        moveScrollPosition(
            $("#select-language-body"),
            this.languageDoms[keys.languageSelection],
            "vertical",
            false
        );
    },

    showTextTracksSettings: function () {
        var keys = this.keys;
        keys.focusedPart = "textTracksSettings";
        keys.textTracksSelection = 0;
        $("#text-tracks-settings-modal").modal("show");
    },

    selectLanguage: function (code, index) {
        settings.saveSettings("language", code, "");
        var keys = this.keys;
        keys.languageSelection = index;
        $(this.languageDoms).removeClass("active");
        $(this.languageDoms[index]).addClass("active");
        $("#language-select-modal").modal("hide");
        keys.focusedPart = "menuSelection";
        this.changeDomsLanguage();
    },

    changeDomsLanguage: function () {
        this.getSelectedLanguageWords(settings.language);
        this.translatedDoms.map(function (index, item) {
            var word_code = $(item).data("word_code");
            if (typeof currentWords[word_code] != "undefined") {
                $(item).text(currentWords[word_code]);
            }
        });
    },

    confirmParentPassword: function () {
        $("#parent-confirm-password-error").hide();
        var typedParentPassword = $("#parent-confirm-password").val();
        if (parentPassword === typedParentPassword) {
            $("#parent-confirm-modal").modal("hide");
            this.keys.focusedPart = this.keys.prev_focus;
            this.showCategoryContent();
        } else {
            $("#parent-confirm-password-error")
                .text("Password does not match")
                .show();
            return;
        }
    },

    cancelParentPassword: function () {
        $("#parent-confirm-modal").modal("hide");
        this.keys.focusedPart = this.keys.prev_focus;
    },

    hoverHideCategory: function (index) {
        var keys = this.keys;
        keys.focusedPart = "hideCategoryModal";
        if (index < 0)
            keys.hideCategorySelection = this.hideCategoryDoms.length + index;
        else keys.hideCategorySelection = index;
        $(this.hideCategoryDoms).removeClass("active");
        $(this.hideCategoryDoms[keys.hideCategorySelection]).addClass("active");
        if (keys.hideCategorySelection < this.hideCategoryDoms.length)
            moveScrollPosition(
                $("#hide-modal-categories-container"),
                this.hideCategoryDoms[keys.hideCategorySelection],
                "vertical"
            );
    },

    hoverTimeFormat: function (index) {
        var keys = this.keys;
        keys.timeFormatSelection = index;
        this.timeFormatDoms = $(".time-format-modal-option");
        $(this.timeFormatDoms).removeClass("active");
        $(this.timeFormatDoms[index]).addClass("active");
        if (keys.timeFormatSelection < this.timeFormatDoms.length)
            moveScrollPosition(
                $("#time-format-modal-container"),
                this.timeFormatDoms[keys.timeFormatSelection],
                "vertical"
            );
    },

    hoverLiveStreamFormat: function (index) {
        var keys = this.keys;
        keys.liveStreamFormatSelection = index;
        this.liveStreamFormatDoms = $(".livestream-format-modal-option");
        $(this.liveStreamFormatDoms).removeClass("active");
        $(this.liveStreamFormatDoms[index]).addClass("active");
        if (keys.liveStreamFormatSelection < this.liveStreamFormatDoms.length)
            moveScrollPosition(
                $("#livestream-format-modal-container"),
                this.liveStreamFormatDoms[keys.liveStreamFormatSelection],
                "vertical"
            );
    },

    hoverParentControl: function (index) {
        var keys = this.keys;
        keys.focusedPart = "parentControlModal";
        keys.parentControlSelection = index;
        $(this.parentControlDoms).removeClass("active");
        $(this.parentControlDoms[index]).addClass("active");
    },

    hoverSettingMenu: function (index) {
        var keys = this.keys;
        keys.menuSelection = index;
        $(this.menuDoms).removeClass("active");
        $(this.menuDoms[index]).addClass("active");
    },

    hoverLanguage: function (index) {
        var keys = this.keys;
        keys.focusedPart = "languageSelection";
        keys.languageSelection = index;
        $(this.languageDoms).removeClass("active");
        $(this.languageDoms[keys.languageSelection]).addClass("active");
        moveScrollPosition(
            $("#select-language-body"),
            this.languageDoms[keys.languageSelection],
            "vertical",
            false
        );
    },

    hoverTimeFormatItem: function () {
        var keys = this.keys;
        keys.focusedPart = "timeFormatModal";
        var timeFormatDoms = $(".time-format-modal-option");
        $(timeFormatDoms).removeClass("active");
        $(timeFormatDoms[keys.timeFormatSelection]).addClass("active");
    },

    hoverLiveStreamFormatItem: function () {
        var keys = this.keys;
        keys.focusedPart = "liveStreamFormatModal";
        var liveStreamFormatDoms = $(".livestream-format-modal-option");
        $(liveStreamFormatDoms).removeClass("active");
        $(liveStreamFormatDoms[keys.liveStreamFormatSelection]).addClass("active");
    },

    clearHistoryChannels: function () {
        var categories;
        categories = movieHelper.getCategories("live", true, true);
        var category = categories[0];
        var channels = category.movies;
        if (!channels.length) {
            var text = currentWords["no_recently_channels"];
            showToast(text, "");
            return;
        }

        var htmlContent = "";
        channels.map(function (channel, index) {
            htmlContent +=
                '<div data-channel_id = "' +
                channel.stream_id +
                '" class="clear-history-channels-modal-option"' +
                '   onclick="setting.clickClearHistoryChannels(' +
                index +
                ",'" + channel.stream_id + "'" +
                ')"' +
                ' onmouseenter="setting.hoverClearHistoryChannels(' +
                index +
                ')"' +
                ">" +
                '   <input class="hide-category-checkbox" type="checkbox" name="checkbox"' +
                '       id="clear-history-channel-' +
                channel.stream_id +
                '" ' +
                "" +
                ' value="' +
                channel.stream_id +
                '">' +
                '   <label for="-clear-history-channel-' +
                channel.stream_id +
                '">' +
                channel.name +
                "</label>" +
                "</div>";
        });
        $("#clear-history-channels-modal-container").html(htmlContent);
        $("#clear-history-channels-modal").modal("show");
        $($(".clear-history-channels-modal-option")).removeClass("active");
        $($(".clear-history-channels-modal-option")[0]).addClass("active");
        $($(".hide-category-btn-wrapper")).removeClass("active");
        var clearHistoryChannelsDoms = $(".clear-history-channels-modal-option");
        this.clearHistoryChannelsDoms = clearHistoryChannelsDoms;
        this.keys.focusedPart = "clearHistoryChannelsModal";
        this.keys.clearHistoryChannelsSelection = 0;
        $(this.clearHistoryChannelsDoms).removeClass("active");
        $(this.clearHistoryChannelsDoms[0]).addClass("active");
        $("#clear-history-channels-modal-container").scrollTop(0);
    },

    clearHistorySeries: function () {
        var categories;
        categories = movieHelper.getCategories("series", true, true);

        var category = categories[0];
        var movies = category.movies;
        if (!movies.length) {
            var text = currentWords["no_recently_series"];
            showToast(text, "");
            return;
        }

        var htmlContent = "";
        movies.map(function (movie, index) {
            htmlContent +=
                '<div data-series_id = "' +
                movie.series_id +
                '" class="clear-history-series-modal-option"' +
                '   onclick="setting.clickClearHistorySeries(' +
                index +
                ",'" + movie.series_id + "'" +
                ')"' +
                ' onmouseenter="setting.hoverClearHistorySeries(' +
                index +
                ')"' +
                ">" +
                '   <input class="hide-category-checkbox" type="checkbox" name="checkbox"' +
                '       id="clear-history-series-' +
                movie.series_id +
                '" ' +
                "" +
                ' value="' +
                movie.series_id +
                '">' +
                '   <label for="clear-history-series-' +
                movie.series_id +
                '">' +
                movie.name +
                "</label>" +
                "</div>";
        });
        $("#clear-history-series-modal-container").html(htmlContent);
        $("#clear-history-series-modal").modal("show");
        $($(".clear-history-series-modal-option")).removeClass("active");
        $($(".clear-history-series-modal-option")[0]).addClass("active");
        $($(".hide-category-btn-wrapper")).removeClass("active");
        var clearHistorySeriesDoms = $(".clear-history-series-modal-option");
        this.clearHistorySeriesDoms = clearHistorySeriesDoms;
        this.keys.focusedPart = "clearHistorySeriesModal";
        this.keys.clearHistorySeriesSelection = 0;
        $(this.clearHistorySeriesDoms).removeClass("active");
        $(this.clearHistorySeriesDoms[0]).addClass("active");
        $("#clear-history-series-modal-container").scrollTop(0);
    },

    clearHistoryMovies: function () {
        this.clear_history_movies_type = "vod";
        var categories;
        categories = movieHelper.getCategories("vod", true, true);
        var category = categories[0];
        var movies = category.movies;
        if (!movies.length) {
            var text = currentWords["no_recently_movies"];
            showToast(text, "");
            return;
        }

        var htmlContent = "";
        movies.map(function (movie, index) {
            htmlContent +=
                '<div class="clear-history-movies-modal-option"' +
                '   onclick="setting.clickClearHistoryMovies(' +
                index +
                ",'" + movie.stream_id + "'" +
                ')"' +
                ' onmouseenter="setting.hoverClearHistoryMovies(' +
                index +
                ')"' +
                ">" +
                '   <input class="hide-category-checkbox" type="checkbox" name="checkbox"' +
                '       id="clear-history-movies-' +
                movie.stream_id +
                '" ' +
                "" +
                ' value="' +
                movie.stream_id +
                '">' +
                '   <label for="clear-history-movies-' +
                movie.stream_id +
                '">' +
                movie.name +
                "</label>" +
                "</div>";
        });
        $("#clear-history-movies-modal-container").html(htmlContent);
        $("#clear-history-movies-modal").modal("show");
        $($(".clear-history-movies-modal-option")).removeClass("active");
        $($(".clear-history-movies-modal-option")[0]).addClass("active");
        $($(".hide-category-btn-wrapper")).removeClass("active");
        var clearHistoryMoviesDoms = $(".clear-history-movies-modal-option");
        this.clearHistoryMoviesDoms = clearHistoryMoviesDoms;
        this.keys.focusedPart = "clearHistoryMoviesModal";
        this.keys.clearHistoryMoviesSelection = 0;
        $(this.clearHistoryMoviesDoms).removeClass("active");
        $(this.clearHistoryMoviesDoms[0]).addClass("active");
        $("#clear-history-movies-modal-container").scrollTop(0);
    },

    clickClearSeriesHistory: function (index) {
        var keys = this.keys;
        if (index == 0 && this.clearHistorySeriesIds.length > 0) {
            var clearHistorySeriesIds = this.clearHistorySeriesIds;
            movieHelper.saveClearHistoryMovies("series", clearHistorySeriesIds);
        } else {
            this.clearHistorySeriesIds = [];
        }
        keys.clearHistorySeriesBtnSelection = 0;
        $(this.clearHistorySeriesBtnDoms).removeClass("active");
        keys.clearHistorySeriesSelection = 0;
        $(this.clearHistorySeriesDoms).removeClass("active");
        $("#clear-history-series-modal").modal("hide");
        keys.focusedPart = "menuSelection";
    },

    hoverClearSeriesHistory: function (index) {
        var keys = this.keys;
        keys.focusedPart = "clearHistorySeriesBtn";
        keys.clearHistorySeriesBtnSelection = index;
        $(this.prevFocusDom).removeClass("active");
        $(".clear-history-series-modal-option").removeClass("active");
        this.prevFocusDom = this.clearHistorySeriesBtnDoms[index];
        $(this.clearHistorySeriesBtnDoms[index]).addClass("active");
    },

    hoverClearHistorySeries: function (index) {
        var keys = this.keys;
        keys.focusedPart = "clearHistorySeriesModal";
        if (index < 0)
            keys.clearHistorySeriesSelection =
                this.clearHistorySeriesDoms.length + index;
        else keys.clearHistorySeriesSelection = index;
        $(".clear-history-series-modal-option").removeClass("active");
        $(this.prevFocusDom).removeClass("active");
        this.prevFocusDom = this.clearHistorySeriesDoms[
            keys.clearHistorySeriesSelection
        ];
        $(this.clearHistorySeriesDoms[keys.clearHistorySeriesSelection]).addClass(
            "active"
        );
        if (keys.clearHistorySeriesSelection < this.clearHistorySeriesDoms.length)
            moveScrollPosition(
                $("#clear-history-series-modal-container"),
                this.clearHistorySeriesDoms[keys.clearHistorySeriesSelection],
                "vertical"
            );
    },

    hoverClearHistoryMovies: function (index) {
        var keys = this.keys;
        keys.focusedPart = "clearHistoryMoviesModal";
        if (index < 0)
            keys.clearHistoryMoviesSelection =
                this.clearHistoryMoviesDoms.length + index;
        else keys.clearHistoryMoviesSelection = index;
        $(this.prevFocusDom).removeClass("active");
        $(".clear-history-movies-modal-option").removeClass("active");
        this.prevFocusDom = this.clearHistoryMoviesDoms[
            keys.clearHistoryMoviesSelection
        ];
        $(this.clearHistoryMoviesDoms[keys.clearHistoryMoviesSelection]).addClass(
            "active"
        );
        if (keys.clearHistoryMoviesSelection < this.clearHistoryMoviesDoms.length)
            moveScrollPosition(
                $("#clear-history-movies-modal-container"),
                this.clearHistoryMoviesDoms[keys.clearHistoryMoviesSelection],
                "vertical"
            );
    },

    hoverClearHistoryChannels: function (index) {
        var keys = this.keys;
        keys.focusedPart = "clearHistoryChannelsModal";
        if (index < 0)
            keys.clearHistoryChannelsSelection =
                this.clearHistoryChannelsDoms.length + index;
        else keys.clearHistoryChannelsSelection = index;
        $(this.prevFocusDom).removeClass("active");
        $(".clear-history-channels-modal-option").removeClass("active");
        this.prevFocusDom = this.clearHistoryChannelsDoms[
            keys.clearHistoryChannelsSelection
        ];
        $(this.clearHistoryChannelsDoms[keys.clearHistoryChannelsSelection]).addClass(
            "active"
        );
        if (keys.clearHistoryChannelsSelection < this.clearHistoryChannelsDoms.length)
            moveScrollPosition(
                $("#clear-history-channels-modal-container"),
                this.clearHistoryChannelsDoms[keys.clearHistoryChannelsSelection],
                "vertical"
            );
    },

    clickClearMoviesHistory: function (index) {
        var keys = this.keys;
        if (index == 0 && this.clearHistoryMoviesIds.length > 0) {
            var clearHistoryMoviesIds = this.clearHistoryMoviesIds;
            movieHelper.saveClearHistoryMovies("vod", clearHistoryMoviesIds);
        } else {
            this.clearHistoryMoviesIds = [];
        }
        keys.clearHistoryMoviesBtnSelection = 0;
        $(this.clearHistoryMoviesBtnDoms).removeClass("active");
        keys.clearHistoryMoviesSelection = 0;
        $(this.clearHistoryMoviesDoms).removeClass("active");
        $("#clear-history-movies-modal").modal("hide");
        keys.focusedPart = "menuSelection";
    },

    hoverClearMoviesHistory: function (index) {
        var keys = this.keys;
        keys.focusedPart = "clearHistoryMoviesBtn";
        keys.clearHistoryMoviesBtnSelection = index;
        $(this.prevFocusDom).removeClass("active");
        $(".clear-history-movies-modal-option").removeClass("active");
        this.prevFocusDom = this.clearHistoryMoviesBtnDoms[index];
        $(this.clearHistoryMoviesBtnDoms[index]).addClass("active");
    },

    clickClearChannelsHistory: function (index) {
        var keys = this.keys;
        if (index == 0 && this.clearHistoryChannelsIds.length > 0) {
            var clearHistoryChannelsIds = this.clearHistoryChannelsIds;
            movieHelper.saveClearHistoryMovies("live", clearHistoryChannelsIds);
        } else {
            this.clearHistoryChannelsIds = [];
        }
        keys.clearHistoryChannelsBtnSelection = 0;
        $(this.clearHistoryChannelsBtnDoms).removeClass("active");
        keys.clearHistoryChannelsSelection = 0;
        $(this.clearHistoryChannelsDoms).removeClass("active");
        $("#clear-history-channels-modal").modal("hide");
        keys.focusedPart = "menuSelection";
    },

    hoverClearChannelsHistory: function (index) {
        var keys = this.keys;
        keys.focusedPart = "clearHistoryChannelsBtn";
        keys.clearHistoryChannelsBtnSelection = index;
        $(this.prevFocusDom).removeClass("active");
        $(".clear-history-channels-modal-option").removeClass("active");
        this.prevFocusDom = this.clearHistoryChannelsBtnDoms[index];
        $(this.clearHistoryChannelsBtnDoms[index]).addClass("active");
    },

    removeTextTracksBKColorActive: function () {
        $(this.textTracksSettingsModalDom).removeClass("active");
    },

    hoverIncreaseTextTracksFontSize: function (index) {
        var keys = this.keys;
        keys.textTracksSelection = 0;
        keys.focusedPart = "textTracksSettings";
        this.removeTextTracksBKColorActive()
        keys.textTracksFontSelection = index;
        if (keys.textTracksSelection == 0) {
            $(this.textTracksFontDoms).removeClass("active");
            $(this.textTracksFontDoms[keys.textTracksFontSelection]).addClass(
                "active"
            );
        }
    },

    increaseTextTracksFontSize: function (increase) {
        var keys = this.keys;

        var storedSubtitleFontSize = getLocalStorageData('textTracksFontSize');
        if (storedSubtitleFontSize !== null)
            keys.textTracksFontSize = storedSubtitleFontSize;

        keys.textTracksFontSize += increase;
        if (keys.textTracksFontSize < 40) {
            keys.textTracksFontSize = 40;
            showToast("The minimum font size is 40px.", "");
        }
        if (keys.textTracksFontSize > 100) {
            keys.textTracksFontSize = 100;
            showToast("The maximum font size is 100px.", "");
        }
        $(".text-tracks-font-size").text(keys.textTracksFontSize);
        config.textTracksFontSize = keys.textTracksFontSize;
        saveToLocalStorage('textTracksFontSize', config.textTracksFontSize);
    },

    hoverTextTracksModalOption: function (index) {
        var keys = this.keys;
        keys.focusedPart = 'textTracksSettings';
        $(this.textTracksSettingsModalDom).removeClass("active");
        $(this.textTracksFontDoms).removeClass("active");
        keys.textTracksSelection = index

        $(this.textTracksSettingsModalDom[keys.textTracksSelection]).addClass(
            "active"
        );
    },

    clickTextTracksModalOption: function (index) {
        var keys = this.keys;
        $("#text-tracks-settings-modal").modal("hide");
        if (index == 0) {
            keys.focusedPart = "textTracksColorSettings";
            $("#text-tracks-settings-color-modal").modal("show");
        } else {
            keys.focusedPart = "textTracksBkSettings";
            $("#text-tracks-settings-background-modal").modal("show");
        }
    },

    hoverTextTrackColor: function (index) {
        var keys = this.keys;
        keys.textTracksColorSelection = index;
        this.hoverSettingColorMenu(keys.textTracksColorSelection);
    },

    hoverTextTracksBackground: function (index) {
        var keys = this.keys;
        keys.focusedPart = "textTracksBkSettings";
        this.hoverSettingBackgroundMenu(index);
    },

    clickTextTrackColor: function (index) {
        config.textTracksColor = config.textTracksColors[index];
        saveToLocalStorage('textTracksColor', config.textTracksColor);
        $(".text-tracks-color-check").addClass("hide");
        $(
            ".text-tracks-color-item .color-" + index + " .text-tracks-color-check"
        ).removeClass("hide");
        $(".text-tracks-example-text").css({ color: config.textTracksColor });
        this.updateTextTracksSetting();
    },

    clickTextTracksBackground: function (index) {
        $(".text-tracks-background-check").addClass("hide");
        $(
            ".text-tracks-background-item .background-" +
            index +
            " .text-tracks-background-check"
        ).removeClass("hide");
        config.textTracksBackgroundColor = config.textTracksBackgroundColors[index];
        saveToLocalStorage('textTracksBackgroundColor', config.textTracksBackgroundColor);
        $(".text-tracks-example-text span").css({
            background: config.textTracksBackgroundColor
        });
        this.updateTextTracksSetting();
    },

    hoverSettingColorMenu: function (index) {
        var keys = this.keys;
        keys.textTracksColorSelection = index;
        keys.focusedPart = "textTracksColorSettings";
        $(this.textTracksColorDoms).removeClass("active");
        $(this.textTracksColorDoms[index]).addClass("active");
    },

    hoverSettingBackgroundMenu: function (index) {
        var keys = this.keys;
        keys.textTracksBkSelection = index;
        keys.focusedPart = "textTracksBkSettings";
        $(this.textTracksBkDoms).removeClass("active");
        $(this.textTracksBkDoms[index]).addClass("active");
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

    showDeleteCacheModal: function () {
        var keys = this.keys;
        $("#delete-cache-modal").modal("show");
        $($('.delete-cache-modal-button')[keys.deleteCacheSelection]).addClass("active")
        keys.focusedPart = "deleteCacheSelection";
    },

    hoverDeleteCacheBtn: function (index) {
        var keys = this.keys;
        keys.focusedPart = "deleteCacheSelection";
        keys.deleteCacheSelection = index;
        $($('.delete-cache-modal-button')).removeClass("active")
        $($('.delete-cache-modal-button')[keys.deleteCacheSelection]).addClass("active")
    },

    clearLocalstorageData: function () {
        var prefix = storageID;

        for (var i = localStorage.length - 1; i >= 0; i--) {
            var key = localStorage.key(i);
            if (key.indexOf(prefix) === 0) { // Check if key starts with prefix
                localStorage.removeItem(key);
            }
        }

        for (var j = 0; j < localStorage.length; j++) {
            console.log(localStorage.key(j));
        }

        VodModel.savedVideoTimes = {};
        SeriesModel.savedVideoTimes = {};
    },

    handleDeleteCacheClick: function () {
        var keys = this.keys;
        $("#delete-cache-modal").modal("hide");
        if (keys.deleteCacheSelection == 0) {
            $('.setting-icon').removeClass("active");
            this.clearLocalstorageData();
            currentRoute = "login";
            showLoadImage();
            $("#app").addClass("hide");
            login.getPlayListDetail('reload');
            initRangeSider();
            settings.initFromLocal();
        } else {
            keys.focusedPart = "menuSelection";
            this.hoverSettingMenu(keys.menuSelection);
        }
    },

    handleMenuClick: function () {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "menuSelection":
                switch (keys.menuSelection) {
                    case 0:
                        this.showParentControlModal();
                        break;
                    case 1:
                        this.showDisableParentControlModal();
                        break;
                    case 2:
                        playlists.init("setting-page");
                        break;
                    case 3:
                        this.showLanguages();
                        break;
                    case 4:
                        this.showHideCategoryModal("live");
                        break;
                    case 5:
                        this.showHideCategoryModal("movie");
                        break;
                    case 6:
                        this.showHideCategoryModal("series");
                        break;
                    case 7:
                        this.showTextTracksSettings();
                        break;
                    case 8:
                        this.clearHistoryChannels();
                        break;
                    case 9:
                        this.clearHistoryMovies();
                        break;
                    case 10:
                        this.clearHistorySeries();
                        break;
                    case 11:
                        this.showDeleteCacheModal();
                        break;
                    case 12:
                        this.showLiveStreamFormat();
                        break;
                    case 13:
                        this.showTimeFormat();
                        break;
                }
                break;
            case "parentControlModal":
                $(this.parentControlDoms[keys.parentControlSelection]).trigger(
                    "click"
                );
                // if (keys.parentControlSelection < 3) {
                //     $(this.parentControlDoms[keys.parentControlSelection])
                //         .find("input")
                //         .focus();
                //     var that = this;
                //     setTimeout(function () {
                //         var tmp = $(that.parentControlDoms[keys.parentControlSelection])
                //             .find("input")
                //             .val();

                //         // $(that.parentControlDoms[keys.parentControlSelection])
                //         //     .find("input")[0]
                //         //     .setSelectionRange(tmp.length, tmp.length);
                //     }, 200);
                // } else
                //     $(this.parentControlDoms[keys.parentControlSelection]).trigger(
                //         "click"
                //     );
                break;
            case "hideCategoryModal":
                $(this.hideCategoryDoms[keys.hideCategorySelection]).trigger("click");
                break;
            case "clearHistoryChannelsModal":
                $(
                    this.clearHistoryChannelsDoms[keys.clearHistoryChannelsSelection]
                ).trigger("click");
                break;
            case "clearHistoryMoviesModal":
                $(
                    this.clearHistoryMoviesDoms[keys.clearHistoryMoviesSelection]
                ).trigger("click");
                break;
            case "clearHistorySeriesModal":
                $(
                    this.clearHistorySeriesDoms[keys.clearHistorySeriesSelection]
                ).trigger("click");
                break;
            case "clearHistorySeriesBtn":
                $(
                    this.clearHistorySeriesBtnDoms[keys.clearHistorySeriesBtnSelection]
                ).trigger("click");
                break;
            case "clearHistoryChannelsBtn":
                $(
                    this.clearHistoryChannelsBtnDoms[
                    keys.clearHistoryChannelsBtnSelection
                    ]
                ).trigger("click");
                break;
            case "clearHistoryMoviesBtn":
                $(
                    this.clearHistoryMoviesBtnDoms[
                    keys.clearHistoryMoviesBtnSelection
                    ]
                ).trigger("click");
                break;
            case "languageSelection":
                $(this.languageDoms[keys.languageSelection]).trigger("click");
                break;
            case "timeFormatModal":
                var timeFormatDoms = $(".time-format-modal-option");
                $(timeFormatDoms[keys.timeFormatSelection]).trigger("click");
                break;
            case "liveStreamFormatModal":
                var liveStreamFormatDoms = $(".livestream-format-modal-option");
                $(liveStreamFormatDoms[keys.liveStreamFormatSelection]).trigger("click");
                break;
            case "textTracksSettings":
                if (keys.textTracksSelection == 0) {
                    $(this.textTracksFontDoms[keys.textTracksFontSelection]).trigger(
                        "click"
                    );
                } else {
                    $(this.textTracksSettingsModalDom[keys.textTracksSelection]).trigger(
                        "click"
                    );
                }
                break;
            case "textTracksColorSettings":
                $(this.textTracksColorDoms[keys.textTracksColorSelection]).trigger(
                    "click"
                );
                break;
            case "textTracksBkSettings":
                $(
                    this.textTracksBkDoms[keys.textTracksBkSelection]
                ).trigger("click");
                break;
            case "disableParentControlModal":
                this.clickDisableParentControl();
                break;
            case "deleteCacheSelection":
                $($('.delete-cache-modal-button')[keys.deleteCacheSelection]).trigger("click");
                break;
        }
    },

    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "menuSelection":
                var prevSelection = keys.menuSelection;
                keys.menuSelection += settingsColumNum * increment;
                if (keys.menuSelection >= this.menuDoms.length) {
                    if (prevSelection > settingsColumNum - 1) {
                        keys.menuSelection = prevSelection;
                        return;
                    }
                    keys.menuSelection = this.menuDoms.length - 1;
                }
                if (keys.menuSelection < 0) {
                    keys.menuSelection = prevSelection;
                    return;
                }
                this.hoverSettingMenu(keys.menuSelection);
                break;
            case "hideCategoryModal":
                keys.hideCategorySelection += increment;
                if (keys.hideCategorySelection < 0) keys.hideCategorySelection = 0;
                if (keys.hideCategorySelection >= this.hideCategoryDoms.length)
                    keys.hideCategorySelection = this.hideCategoryDoms.length - 1;
                $(this.hideCategoryDoms).removeClass("active");
                $(this.hideCategoryDoms[keys.hideCategorySelection]).addClass("active");
                if (keys.hideCategorySelection < this.hideCategoryDoms.length)
                    moveScrollPosition(
                        $("#hide-modal-categories-container"),
                        this.hideCategoryDoms[keys.hideCategorySelection],
                        "vertical"
                    );
                break;
            case "clearHistoryChannelsModal":
                keys.clearHistoryChannelsSelection += increment;
                if (keys.clearHistoryChannelsSelection < 0)
                    keys.clearHistoryChannelsSelection = 0;
                if (
                    keys.clearHistoryChannelsSelection >=
                    this.clearHistoryChannelsDoms.length
                ) {
                    keys.focusedPart = "clearHistoryChannelsBtn";
                    $(
                        this.clearHistoryChannelsBtnDoms[
                        keys.clearHistoryChannelsBtnSelection
                        ]
                    ).addClass("active");
                }

                $(this.clearHistoryChannelsDoms).removeClass("active");
                $(
                    this.clearHistoryChannelsDoms[keys.clearHistoryChannelsSelection]
                ).addClass("active");
                if (
                    keys.clearHistoryChannelsSelection <
                    this.clearHistoryChannelsDoms.length
                )
                    moveScrollPosition(
                        $("#clear-history-channels-modal-container"),
                        this.clearHistoryChannelsDoms[keys.clearHistoryChannelsSelection],
                        "vertical"
                    );
                break;
            case "clearHistoryChannelsBtn":
                if (increment < 0) {
                    $(this.clearHistoryChannelsBtnDoms).removeClass("active");
                    $(
                        this.clearHistoryChannelsDoms[
                        this.clearHistoryChannelsDoms.length - 1
                        ]
                    ).addClass("active");
                    keys.clearHistoryChannelsSelection =
                        this.clearHistoryChannelsDoms.length - 1;

                    keys.focusedPart = "clearHistoryChannelsModal";
                }
                break;
            case "clearHistoryMoviesModal":
                keys.clearHistoryMoviesSelection += increment;
                if (keys.clearHistoryMoviesSelection < 0)
                    keys.clearHistoryMoviesSelection = 0;
                if (
                    keys.clearHistoryMoviesSelection >=
                    this.clearHistoryMoviesDoms.length
                ) {
                    keys.focusedPart = "clearHistoryMoviesBtn";
                    $(
                        this.clearHistoryMoviesBtnDoms[
                        keys.clearHistoryMoviesBtnSelection
                        ]
                    ).addClass("active");
                }

                $(this.clearHistoryMoviesDoms).removeClass("active");
                $(
                    this.clearHistoryMoviesDoms[keys.clearHistoryMoviesSelection]
                ).addClass("active");
                if (
                    keys.clearHistoryMoviesSelection <
                    this.clearHistoryMoviesDoms.length
                )
                    moveScrollPosition(
                        $("#clear-history-movies-modal-container"),
                        this.clearHistoryMoviesDoms[keys.clearHistoryMoviesSelection],
                        "vertical"
                    );
                break;
            case "clearHistoryMoviesBtn":
                if (increment < 0) {
                    $(this.clearHistoryMoviesBtnDoms).removeClass("active");
                    $(
                        this.clearHistoryMoviesDoms[
                        this.clearHistoryMoviesDoms.length - 1
                        ]
                    ).addClass("active");
                    keys.clearHistoryMoviesSelection =
                        this.clearHistoryMoviesDoms.length - 1;

                    keys.focusedPart = "clearHistoryMoviesModal";
                }
                break;
            case "clearHistorySeriesModal":
                keys.clearHistorySeriesSelection += increment;
                if (keys.clearHistorySeriesSelection < 0)
                    keys.clearHistorySeriesSelection = 0;
                if (
                    keys.clearHistorySeriesSelection >=
                    this.clearHistorySeriesDoms.length
                ) {
                    keys.focusedPart = "clearHistorySeriesBtn";

                    $(
                        this.clearHistorySeriesBtnDoms[keys.clearHistorySeriesBtnSelection]
                    ).addClass("active");
                }
                $(this.clearHistorySeriesDoms).removeClass("active");
                this.prevFocusDom = this.clearHistorySeriesDoms[
                    keys.clearHistorySeriesSelection
                ];
                $(
                    this.clearHistorySeriesDoms[keys.clearHistorySeriesSelection]
                ).addClass("active");

                if (
                    keys.clearHistorySeriesSelection <
                    this.clearHistorySeriesDoms.length
                )
                    moveScrollPosition(
                        $("#clear-history-series-modal-container"),
                        this.clearHistorySeriesDoms[keys.clearHistorySeriesSelection],
                        "vertical"
                    );
                break;
            case "clearHistorySeriesBtn":
                if (increment < 0) {
                    $(this.clearHistorySeriesBtnDoms).removeClass("active");
                    $(
                        this.clearHistorySeriesDoms[
                        this.clearHistorySeriesDoms.length - 1
                        ]
                    ).addClass("active");
                    keys.clearHistorySeriesSelection =
                        this.clearHistorySeriesDoms.length - 1;

                    keys.focusedPart = "clearHistorySeriesModal";
                }
                break;
            case "parentControlModal":
                if (increment > 0) {
                    if (keys.parentControlSelection < 3) {
                        keys.parentControlSelection += increment;
                    }
                } else {
                    if (keys.parentControlSelection >= 3) {
                        keys.parentControlSelection = 2;
                    } else {
                        keys.parentControlSelection += increment;
                        if (keys.parentControlSelection < 0) keys.parentControlSelection = 0;
                    }
                }
                $(this.parentControlDoms[0]).find("input").blur();
                $(this.parentControlDoms[1]).find("input").blur();
                $(this.parentControlDoms[2]).find("input").blur();
                $(this.parentControlDoms).removeClass("active");
                // $(this.parentControlDoms[keys.parentControlSelection]).find("input").focus();
                $(this.parentControlDoms[keys.parentControlSelection]).addClass(
                    "active"
                );
                break;
            case "languageSelection":
                keys.languageSelection += increment;
                if (keys.languageSelection < 0)
                    keys.languageSelection = this.languageDoms.length - 1;
                if (keys.languageSelection >= this.languageDoms.length)
                    keys.languageSelection = 0;
                this.hoverLanguage(keys.languageSelection);
                break;
            case "timeFormatModal":
                if (keys.timeFormatSelection == 0) keys.timeFormatSelection = 1;
                else if ((keys.timeFormatSelection = 1)) keys.timeFormatSelection = 0;
                this.hoverTimeFormatItem();
                break;
            case "liveStreamFormatModal":
                if (keys.liveStreamFormatSelection == 0) keys.liveStreamFormatSelection = 1;
                else if ((keys.liveStreamFormatSelection = 1)) keys.liveStreamFormatSelection = 0;
                this.hoverLiveStreamFormatItem();
                break;
            case "textTracksSettings":
                keys.textTracksSelection += increment;
                if (keys.textTracksSelection > 2) {
                    keys.textTracksSelection = 2;
                }
                if (keys.textTracksSelection < 0) {
                    keys.textTracksSelection = 0;
                }
                $(this.textTracksSettingsModalDom).removeClass("active");
                $(this.textTracksFontDoms).removeClass("active");
                if (keys.textTracksSelection == 0) {
                    $(this.textTracksFontDoms[keys.textTracksFontSelection]).addClass(
                        "active"
                    );
                } else
                    $(this.textTracksSettingsModalDom[keys.textTracksSelection]).addClass(
                        "active"
                    );
                break;
            case "textTracksColorSettings":
                var prevtextTracksColorSelection = keys.textTracksColorSelection;
                keys.textTracksColorSelection += 5 * increment;
                if (keys.textTracksColorSelection >= this.textTracksColorDoms.length) {
                    if (prevtextTracksColorSelection > 5 - 1) {
                        keys.textTracksColorSelection = prevtextTracksColorSelection;
                        return;
                    }
                    keys.textTracksColorSelection = this.textTracksColorDoms.length - 1;
                }
                if (keys.textTracksColorSelection < 0) {
                    keys.textTracksColorSelection = prevtextTracksColorSelection;
                    return;
                }
                this.hoverSettingColorMenu(keys.textTracksColorSelection);
                break;
            case "textTracksBkSettings":
                var prevtextTracksBkSelection =
                    keys.textTracksBkSelection;
                keys.textTracksBkSelection += 5 * increment;
                if (
                    keys.textTracksBkSelection >= this.textTracksBkDoms.length
                ) {
                    if (prevtextTracksBkSelection > 5 - 1) {
                        keys.textTracksBkSelection = prevtextTracksBkSelection;
                        return;
                    }
                    keys.textTracksBkSelection =
                        this.textTracksBkDoms.length - 1;
                }
                if (keys.textTracksBkSelection < 0) {
                    keys.textTracksBkSelection = prevtextTracksBkSelection;
                    return;
                }
                this.hoverSettingBackgroundMenu(keys.textTracksBkSelection);
                break;
        }
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;

        switch (keys.focusedPart) {
            case "menuSelection":
                keys.menuSelection += increment;
                if (keys.menuSelection < 0) keys.menuSelection = 0;
                if (keys.menuSelection >= this.menuDoms.length)
                    keys.menuSelection = this.menuDoms.length - 1;
                this.hoverSettingMenu(keys.menuSelection);
                break;
            case "parentControlModal":
                if (keys.parentControlSelection >= 3) {
                    keys.parentControlSelection += increment;
                    if (keys.parentControlSelection < 3)
                        keys.parentControlSelection = 3;
                    if (keys.parentControlSelection > 3 + 1)
                        keys.parentControlSelection = 3 + 1;
                    $(this.parentControlDoms).removeClass("active");
                    $(this.parentControlDoms[keys.parentControlSelection]).addClass(
                        "active"
                    );
                }
                break;
            case "clearHistoryChannelsBtn":
                keys.clearHistoryChannelsBtnSelection += increment;
                if (keys.clearHistoryChannelsBtnSelection >= 2) {
                    keys.clearHistoryChannelsBtnSelection = 2;
                } else if (keys.clearHistoryChannelsBtnSelection < 0) {
                    keys.clearHistoryChannelsBtnSelection = 0;
                }
                $(this.clearHistoryChannelsBtnDoms).removeClass("active");
                $(
                    this.clearHistoryChannelsBtnDoms[
                    keys.clearHistoryChannelsBtnSelection
                    ]
                ).addClass("active");
                break;
            case "clearHistoryMoviesBtn":
                keys.clearHistoryMoviesBtnSelection += increment;
                if (keys.clearHistoryMoviesBtnSelection >= 2) {
                    keys.clearHistoryMoviesBtnSelection = 2;
                } else if (keys.clearHistoryMoviesBtnSelection < 0) {
                    keys.clearHistoryMoviesBtnSelection = 0;
                }
                $(this.clearHistoryMoviesBtnDoms).removeClass("active");
                $(
                    this.clearHistoryMoviesBtnDoms[
                    keys.clearHistoryMoviesBtnSelection
                    ]
                ).addClass("active");
                break;
            case "clearHistorySeriesBtn":
                keys.clearHistorySeriesBtnSelection += increment;
                if (keys.clearHistorySeriesBtnSelection >= 2) {
                    keys.clearHistorySeriesBtnSelection = 2;
                } else if (keys.clearHistorySeriesBtnSelection < 0) {
                    keys.clearHistorySeriesBtnSelection = 0;
                }
                $(this.clearHistorySeriesBtnDoms).removeClass("active");
                $(
                    this.clearHistorySeriesBtnDoms[keys.clearHistorySeriesBtnSelection]
                ).addClass("active");
                break;
            case "textTracksSettings":
                if (keys.textTracksSelection == 0) {
                    if (keys.textTracksFontSelection == 0)
                        keys.textTracksFontSelection = 1;
                    else keys.textTracksFontSelection = 0;
                    $(this.textTracksFontDoms).removeClass("active");
                    $(this.textTracksFontDoms[keys.textTracksFontSelection]).addClass(
                        "active"
                    );
                }
                break;
            case "textTracksColorSettings":
                keys.textTracksColorSelection += increment;
                if (keys.textTracksColorSelection < 0)
                    keys.textTracksColorSelection = 0;
                if (keys.textTracksColorSelection >= this.textTracksColorDoms.length)
                    keys.textTracksColorSelection = this.textTracksColorDoms.length - 1;
                this.hoverSettingColorMenu(keys.textTracksColorSelection);
                break;
            case "textTracksBkSettings":
                keys.textTracksBkSelection += increment;
                if (keys.textTracksBkSelection < 0)
                    keys.textTracksBkSelection = 0;
                if (
                    keys.textTracksBkSelection >= this.textTracksBkDoms.length
                )
                    keys.textTracksBkSelection =
                        this.textTracksBkDoms.length - 1;
                this.hoverSettingBackgroundMenu(keys.textTracksBkSelection);
                break;
            case "deleteCacheSelection":
                keys.deleteCacheSelection = (keys.deleteCacheSelection === 0) ? 1 : 0;
                $($('.delete-cache-modal-button')).removeClass("active")
                $($('.delete-cache-modal-button')[keys.deleteCacheSelection]).addClass("active");
                break;
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
