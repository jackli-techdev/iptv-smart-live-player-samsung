"use strict";
var catchupListPage = {
    player: null,
    keys: {
        focused_part: "categorySelection",
        categorySelection: 0,
        channelSelection: 0
    },
    catchupCategories: [],
    categoryDoms: $(".catchup-page-category-item"),
    channelDoms: $(".catchup-channel-menu-item"),
    catchups: [],
    movie: {},
    dates: [],
    current_date_index: 0,
    current_program_index: 0,
    programmes: {},
    full_screen_video: false,
    start_time: "",
    duration: 0,
    channel_id: "",
    current_programming_index: "",
    prevSearchVal: "",

    init: function () {
        current_route = "catchup-list-page";
        $("#catchup-list-search-input").val("");
        $("#catchup-list-page").removeClass("hide");
        $("#home-page").addClass("hide");
        $("#channel-page").addClass("hide");
        this.keys.focused_part = "categorySelection";
        var catchupCategories = this.getCatchCategories('');

        this.catchupCategories = catchupCategories;
        if (catchupCategories.length > 0) {
            this.renderCategories(catchupCategories);
            this.hoverCategory(0);
        } else
            showToast("There is no chachup data", "");
    },

    getCatchCategories: function (searchValue) {

        var categories = MovieHelper.getCategories("live", false, true);
        if (searchValue === '') {
            var catchupCategories = categories.filter(function (category) {
                return category.catchups !== undefined && category.catchups.length !== 0
            });
        } else {
            var catchupCategories = categories.filter(function (category) {
                var lowerCaseName = category.category_name.toLowerCase();
                return category.catchups !== undefined && category.catchups.length !== 0 && lowerCaseName.includes(searchValue)
            });
        }


        return catchupCategories

    },

    renderCategories: function (catchupCategories) {
        var html = "";
        catchupCategories.map(function (item, index) {
            html +=
                '<div class = "element-6">' +
                '<div class="catchup-page-category-item" ' +
                '   onmouseenter="catchupListPage.hoverCategory(' +
                index +
                ')" ' +
                '   onclick="catchupListPage.handleMenuClick()"' +
                ">" +
                '<div class = "catchup-category-name">' +
                item.category_name +
                "</div>" +
                '<div class = "catchup-category-length">' +
                item.catchups.length +
                "</div>" +
                '<span class="catchup-category-arrow">></span>' +
                // '<img src="images/right-arrow.png"  class = "catchup-nav-img" />' +
                '</div>' +
                "</div>";
        });
        $("#catchup-category-section").html(html);
        $("#catchup-category-section").removeClass("hide")
    },



    searchValueChange: function () {
        clearTimeout(this.search_key_timer);
        var that = this;
        this.search_key_timer = setTimeout(function () {
            var searchValue = $("#catchup-list-search-input").val();
            searchValue = searchValue.toLowerCase();
            if (that.prev_keyword === searchValue) return;
            if (that.keys.prev_focus === "categorySelection") {
                if (searchValue !== "") {
                    var catchupCategories = that.getCatchCategories(searchValue);
                } else {
                    var catchupCategories = that.getCatchCategories('');
                }
                that.renderCategories(catchupCategories);
            } else {
                that.showCategoryChannels(searchValue);
            }

            that.prev_keyword = searchValue;
        }, this.search_key_timout);
    },

    hoverSearchItem: function () {
        this.unFocusCategory();
        this.unFocusChannel();
        this.focusSearchBar();
    },

    hoverCategory: function (index) {
        var keys = this.keys;
        keys.categorySelection = index;
        keys.focused_part = "categorySelection"
        this.unFocusSearchBar();
        this.categoryDoms = $(".catchup-page-category-item")
        $(this.categoryDoms).removeClass("active");
        $(this.categoryDoms[index]).addClass("active");
        moveScrollPosition(
            $("#catchup-category-section"),
            this.categoryDoms[index],
            "vertical",
            false
        );
    },

    hoverChannel: function (index) {
        var keys = this.keys;
        keys.channelSelection = index;
        keys.focused_part = "channelSelection"
        this.unFocusSearchBar();
        this.channelDoms = $(".catchup-channel-menu-item")
        $(this.channelDoms).removeClass("active");
        $(this.channelDoms[index]).addClass("active");
        moveScrollPosition(
            $("#catchup-channel-section"),
            this.channelDoms[index],
            "vertical",
            false
        );
    },

    renderCatchupChannels: function () {
        var htmlContents = "";
        this.catchups.map(function (movie, index) {
            var streamIds = getStreamIds(LiveModel.favorite_ids, 'live');
            htmlContents +=
                '<div class = "element-4">' +
                '<div class="catchup-channel-menu-item" data-channel_id="' +
                movie.stream_id +
                '" ' +
                '   data-index="' +
                index +
                '" ' +
                '   onmouseenter="catchupListPage.hoverChannel(' +
                index +
                ')"' +
                '   onclick="catchupListPage.handleMenuClick()"' +
                ">" +
                '<span><span class="channel-number">' +
                movie.num +
                "</span>" +
                '<img class="channel-icon" src="' +
                movie.stream_icon +
                '" onerror="this.src=\'' +
                default_live_icon +
                "'\">" +
                "</span>" +
                movie.name +
                (streamIds.includes(movie.stream_id)
                    ? '<i><img src="images/star-yellow.png" class="favorite-icon" /></i>'
                    : "") +
                '</div>' +
                "</div>";
        });
        $("#catchup-channel-section").html(htmlContents);
    },

    showCategoryChannels: function (searchValue) {
        var keys = this.keys;
        keys.focused_part = "channelSelection";

        var catchupCategories = this.catchupCategories;
        var category = catchupCategories[keys.categorySelection];
        if (searchValue === "") {
            this.catchups = category.catchups;
        } else {
            var catchups = category.catchups.filter(function (catchup) {
                var lowerCaseName = catchup.name.toLowerCase();
                return lowerCaseName.includes(searchValue)
            });
            this.catchups = catchups;
        }

        this.renderCatchupChannels();

        keys.channelSelection = 0;
        this.channel_doms = $("#catchup-channel-section .catchup-channel-menu-item");
        $("#catchup-category-section").addClass('hide');
        $("#catchup-channel-section").removeClass('hide');
        $(this.channel_doms[0]).addClass("active");

    },

    goToCatchUpPage: function () {
        var keys = this.keys;

        this.channelDoms = $(".catchup-channel-menu-item");
        this.hoverChannelId = $(this.channelDoms[keys.channelSelection]).data(
            "channel_id"
        );
        var movie = getCurrentMovieFromId(
            this.hoverChannelId,
            this.catchups,
            "stream_id"
        );
        channel_page.get_all_programmes(this.hoverChannelId, movie, 'catchup-list-page');
    },

    focusSearchBar: function () {
        $("#catchup-list-search").addClass("active");
        $("#catchup-list-search-input").focus();
        this.keys.focused_part = "searchBar";
    },

    unFocusSearchBar: function () {
        $("#catchup-list-search").removeClass("active");
        $("#catchup-list-search-input").blur();
    },

    unFocusCategory: function () {
        this.categoryDoms = $(".catchup-page-category-item")
        $(this.categoryDoms).removeClass("active");
    },

    unFocusChannel: function () {
        this.channelDoms = $(".catchup-channel-menu-item")
        $(this.channelDoms).removeClass("active");
    },

    goBack: function () {
        var keys = this.keys;
        showLoader(false);
        switch (keys.focused_part) {
            case "categorySelection":
                $("#catchup-list-page").addClass("hide");
                goToHomePage();
                break;
            case "channelSelection":
                keys.focused_part = 'categorySelection';
                keys.prev_focus = 'categorySelection';
                this.hoverCategory(0);
                $("#catchup-channel-section").addClass('hide')
                $("#catchup-category-section").removeClass('hide');
                $("#catchup-list-search-input").val(this.prevSearchVal);
                break;
            case "searchBar":
                if (keys.prev_focus === "categorySelection") {
                    $("#catchup-list-page").addClass("hide");
                    $("#catchup-list-search-input").val("");
                    goToHomePage();
                } else {
                    keys.focused_part = 'categorySelection';
                    keys.prev_focus = 'categorySelection';
                    this.hoverCategory(0);
                    $("#catchup-channel-section").addClass('hide')
                    $("#catchup-category-section").removeClass('hide');
                }
                break;
        }

    },

    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        this.categoryDoms = $(".catchup-page-category-item");
        this.channelDoms = $(".catchup-channel-menu-item");
        switch (keys.focused_part) {
            case "categorySelection":
                if ((keys.categorySelection === 0 || keys.categorySelection === 1) && increment < 0) {
                    keys.focused_part = "searchBar";
                    this.unFocusCategory();
                    keys.prev_focus = "categorySelection";
                    this.focusSearchBar();
                } else {
                    var prev_selection = keys.categorySelection;
                    keys.categorySelection += catchupCategoryColumNum * increment;
                    if (keys.categorySelection >= this.categoryDoms.length) {
                        if (prev_selection > catchupCategoryColumNum - 1) {
                            keys.categorySelection = prev_selection;
                            return;
                        }
                        keys.categorySelection = this.categoryDoms.length - 1;
                    }
                    if (keys.categorySelection < 0) {
                        keys.categorySelection = prev_selection;
                        return;
                    }
                    this.hoverCategory(keys.categorySelection);
                }

                break;
            case "channelSelection":
                if ((keys.channelSelection === 0 || keys.channelSelection === 1) && increment < 0) {
                    keys.focused_part = "channelSearchSelection";
                    this.unFocusChannel();
                    keys.prev_focus = "channelSelection";
                    this.focusSearchBar();
                } else {
                    var prev_selection = keys.channelSelection;
                    keys.channelSelection += catchupChannelColumNum * increment;
                    if (keys.channelSelection >= this.channelDoms.length) {
                        if (prev_selection > catchupChannelColumNum - 1) {
                            keys.channelSelection = prev_selection;
                            return;
                        }
                        keys.channelSelection = this.channelDoms.length - 1;
                    }
                    if (keys.channelSelection < 0) {
                        keys.channelSelection = prev_selection;
                        return;
                    }
                    this.hoverChannel(keys.channelSelection);
                }
                break;
            case "searchBar":
                if (increment > 0) {
                    if (keys.prev_focus === "categorySelection") {
                        keys.focused_part = "categorySelection";
                        keys.categorySelection = 0;
                        this.hoverCategory(keys.categorySelection);
                    } else {
                        keys.focused_part = "channelSelection";
                        keys.channelSelection = 0;
                        this.hoverChannel(keys.channelSelection);
                    }
                }
                break;
        }
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        this.categoryDoms = $(".catchup-page-category-item")
        switch (keys.focused_part) {
            case "categorySelection":
                keys.categorySelection += increment;
                if (keys.categorySelection < 0) keys.categorySelection = 0;
                if (keys.categorySelection >= this.categoryDoms.length)
                    keys.categorySelection = this.categoryDoms.length - 1;
                this.hoverCategory(keys.categorySelection);
                break;
            case "channelSelection":
                keys.channelSelection += increment;
                if (keys.channelSelection < 0) keys.channelSelection = 0;
                if (keys.channelSelection >= this.channelDoms.length)
                    keys.channelSelection = this.channelDoms.length - 1;
                this.hoverChannel(keys.channelSelection);
                break;
        }
    },

    handleMenuClick: function () {
        var keys = this.keys;
        switch (keys.focused_part) {
            case "categorySelection":
                var category = this.catchupCategories[keys.categorySelection + 1];
                var is_adult = checkForAdult(category, "category", []);
                if (is_adult) {
                    parent_confirm_page.init(current_route, '', '');
                    return;
                }
                this.prevSearchVal = $("#catchup-list-search-input").val();
                $("#catchup-list-search-input").val("");
                this.showCategoryChannels('');
                break;
            case "channelSelection":
                this.goToCatchUpPage();
                break;
        }
    },

    HandleKey: function (e) {
        var focused_part = this.keys.focused_part;
        switch (e.keyCode) {
            case tvKey.RIGHT:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.LEFT:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.DOWN:
                this.handleMenusUpDown(1);
                break;
            case tvKey.UP:
                this.handleMenusUpDown(-1);
                break;
            case tvKey.ENTER:
                this.handleMenuClick();
                break;
            case tvKey.RED:
                // home_page.init();
                break;
            case tvKey.RETURN:
                this.goBack();
                break;
        }
    }
};
