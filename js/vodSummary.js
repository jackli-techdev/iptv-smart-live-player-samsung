"use strict";
var vodSummary = {
    keys: {
        index: 0,
        focusedPart: 'actionBtnSelection',
        sliderSelection: 0
    },
    minBtnIndex: 0,
    action_btns: $(".vod-action-btn"),
    isFavorite: false,
    prevRoute: "",

    init: function (prevRoute) {
        var that = this;
        this.prevRoute = prevRoute;
        this.keys.focusedPart = "actionBtnSelection";

        $("#vod-summary-image-wrapper img").attr("src", "");
        $("#vod-summary-name").text(currentMovie.name);

        $(".vod-series-background-img").attr("src", "");
        $("#vod-summary-image-wrapper img").attr(
            "src",
            currentMovie.stream_icon
                ? currentMovie.stream_icon
                : config.placeholderImg
        );

        var streamIds = getStreamIds(VodModel.favoriteIds, "vod");
        this.isFavorite = streamIds.includes(currentMovie.stream_id);

        if (this.isFavorite) {
            $("#vod-favorite-icon").attr("src", "images/star-yellow.png");
            $($(".vod-action-btn")[2]).data("action", "remove");
        } else {
            $("#vod-favorite-icon").attr("src", "images/star.png");
            $($(".vod-action-btn")[2]).data("action", "add");
        }

        if (settings.playlist.playlistType === "xc") {
            $.getJSON(
                playlistEndpoint +
                "player_api.php?username=" +
                userName +
                "&password=" +
                password +
                "&action=get_vod_info&vod_id=" +
                currentMovie.stream_id,
                function (response) {
                    var info = response.info;
                    if (info.releasedate != "") {
                        $("#vod-summary-release-date").text(info.releasedate);
                    }
                    if (info.duration != "00:00:00")
                        $("#vod-summary-release-length").text(info.duration);
                    $("#vod-summary-description").text(info.description);
                    $(".vod-genre-text-content").text(info.genre);
                    $(".vod-genre-text-year").text(info.year);
                    $(".vod-cast-content").text(info.cast);
                    that.getCasts(info.tmdb_id);
                    currentMovie.info = info;

                    $(that.action_btns).removeClass("active");
                    $(that.action_btns[0]).addClass("active");
                    var rating = 0;
                    if (
                        typeof currentMovie.rating === "undefined" ||
                        currentMovie.rating === ""
                    )
                        rating = 0;
                    else rating = parseFloat(currentMovie.rating);

                    if (isNaN(rating)) rating = 0;

                    if (rating == 0) {
                        $("#vod-rating-container").find(".rating-upper").css({ width: "100%" });
                        $("#vod-rating-container").find(".rating-upper").css({ "filter": "grayscale(100%)" });
                    } else {
                        $("#vod-rating-container").find(".rating-upper").css({ width: rating * 10 + "%" });
                        $("#vod-rating-container").find(".rating-upper").css({ "filter": "initial" });
                    }

                    $("#vod-rating").text((rating).toFixed(1));
                    var backdrop_image = "images/background.jpg";
                    try {
                        backdrop_image = info.backdrop_path[0];
                    } catch (e) { }
                    $(".vod-series-background-img").attr("src", backdrop_image);
                    that.keys.index = 0;
                    currentMovie.youtubeTrailer = response.info.youtube_trailer;
                    if (
                        currentMovie.youtubeTrailer != "undefined" &&
                        currentMovie.youtubeTrailer != null &&
                        currentMovie.youtubeTrailer.trim() !== ""
                    ) {
                        that.minBtnIndex = 0;
                        $("#vod-watch-trailer-button").show();
                    } else {
                        that.minBtnIndex = 1;
                        $("#vod-watch-trailer-button").hide();
                    }
                    currentRoute = "vod-summary-page";
                    $("#entire-search-page").addClass("hide");
                    $("#vod-series-page").addClass("hide");
                    $(".top-bar").addClass("hide");
                    $("#vod-summary-page").removeClass("hide");
                }
            );
        } else {
            $('#casts-container').html("");
            $(".cast-title").addClass("hide");
            this.minBtnIndex = 0;
            currentMovie.info = {};

            $("#vod-watch-trailer-button").hide();
            $("#vod-summary-release-date").text("");
            $("#vod-summary-release-length").text("");
            $("#vod-summary-release-cast").text("");
            $("#vod-summary-description").text("");
            $(that.action_btns).removeClass("active");
            $(that.action_btns[0]).addClass("active");

            if (VodModel.favoriteIds.includes(currentMovie.stream_id)) {
                $($(".vod-action-btn")[2]).data("action", "remove");
                $(".favorite-badge-wrapper").addClass("active");
            } else {
                $($(".vod-action-btn")[2]).data("action", "add");

                $(".favorite-badge-wrapper").removeClass("active");
            }
            var rating = 0;
            if (
                typeof currentMovie.rating === "undefined" ||
                currentMovie.rating === ""
            )
                rating = 0;
            else rating = parseFloat(currentMovie.rating);

            if (isNaN(rating)) rating = 0;
            if (rating == 0) {
                $("#vod-rating-container").find(".rating-upper").css({ width: "100%" });
                $("#vod-rating-container").find(".rating-upper").css({ "filter": "grayscale(100%)" });
            } else {
                $("#vod-rating-container").find(".rating-upper").css({ width: rating * 10 + "%" });
                $("#vod-rating-container").find(".rating-upper").css({ "filter": "initial" });
            }
            $("#vod-rating").text(rating.toFixed(1));

            that.keys.index = 0;
            currentMovie.youtubeTrailer = "";
            currentRoute = "vod-summary-page";
            $("#vod-series-page").addClass("hide");
            $("#vod-summary-page").removeClass("hide");
        }
        currentRoute = "vod-summary-page";
        $('#vod-summary-action-container').css("margin-top", "330px");
    },

    getCasts: function (tmdb_id) {
        var _this = this;
        $('#casts-container').html("");
        $.ajax({
            method: "get",
            url: config.TMDB_ENDPOINT + tmdb_id + '/credits?api_key=' + config.tmdbAPIKey,
            success: function (response) {
                $(".cast-title").removeClass("hide");
                var cast = response.cast;
                var htmlContents = '';
                cast.map(function (item, index) {
                    if (item.profile_path !== null) {
                        htmlContents += _this.makeCastSlider(item, index);
                    }
                    $('#casts-container').html(htmlContents);
                });
            }
        }).catch(function (e) {
            $(".cast-title").addClass("hide");
            console.log(e);
        });
    },

    makeCastSlider: function (item, index) {
        var htmlContent =
            '<div class="cast-item-container" onmouseenter = "vodSummary.hoverCast(' + index + ')" data-channel_id="' +
            index +
            '">' +
            '<div class="cast-item-wrapper cast-item" data-stream_id = "' +
            index +
            '">' +
            '<img class="movie-item-thumbernail position-relative" src="' + config.TMDB_IMAGE_PREF + item.profile_path + '" onerror="this.src=\'images/cast-default.jpg\'">' +
            '<div class="movie-grid-item-title-wrapper position-relative">' +
            '<p class="movie-thumbernail-title position-absolute">' +
            item.original_name +
            "</p>" +
            "</div>" +
            "</div>" +
            "</div>";
        return htmlContent;
    },

    moveCastSliders: function (increment) {
        var keys = this.keys;
        keys.sliderSelection += increment;
        var movieContainers = $("#casts-container");
        var movieItems = $(movieContainers[0]).find(
            ".cast-item-wrapper"
        );
        this.unFocusCast();

        if (keys.sliderSelection < 0)
            keys.sliderSelection = 0;
        if (keys.sliderSelection >= movieItems.length)
            keys.sliderSelection = movieItems.length - 1;
        var movie_item_container = $(
            movieItems[keys.sliderSelection]
        ).closest(".cast-item-container");
        $(movieItems[keys.sliderSelection]).addClass("active");

        this.changeMovieScrollPosition(
            $(movieContainers[0]),
            movie_item_container
        );
    },

    changeMovieScrollPosition: function (parent_element, movie_element) {
        var parent_width = $(parent_element).width();
        var padding_left = parseInt(
            $(parent_element).css("padding-left").replace("px", "")
        );
        var padding_right = parseInt(
            $(parent_element).css("padding-right").replace("px", "")
        );
        var child_position = $(movie_element).position();
        var element_width = 240;
        if (child_position.left + element_width >= parent_width - padding_right) {
            $(parent_element).animate(
                {
                    scrollLeft:
                        "+=" +
                        (child_position.left + element_width - parent_width + padding_right)
                },
                10
            );
        }
        if (child_position.left < 0 || child_position.left - padding_left < 0) {
            $(parent_element).animate(
                { scrollLeft: "+=" + (child_position.left - padding_left) },
                10
            );
        }
    },

    unFocusCast: function () {
        $(".cast-item-wrapper").removeClass("active");
    },

    unfocusActinBtn: function () {
        $(".vod-action-btn").removeClass("active");
    },

    hoverCast: function (index) {
        var keys = this.keys;
        keys.sliderSelection = index;
        var movieContainers = $("#casts-container");
        var movieItems = $(movieContainers[0]).find(
            ".cast-item-wrapper"
        );
        this.unFocusCast();
        this.unfocusActinBtn();
        $(movieItems[keys.sliderSelection]).addClass("active");
        $('#vod-summary-action-container').css("margin-top", "20px");
    },

    goBack: function () {
        if (this.prevRoute == "vod-series-page") {
            $("#vod-summary-page").addClass("hide");
            $("#vod-series-page").removeClass("hide");
            $(".top-bar").removeClass("hide");
            currentRoute = this.prevRoute;
            var keys = vodSeries.keys;
            var menuDoms = vodSeries.menuDoms;

            if (this.isFavorite) {
                if (
                    $(menuDoms[keys.menuSelection]).find(".favorite-badge").length == 0
                ) {
                    $(
                        $(menuDoms[keys.menuSelection]).find(".vod-series-menu-item")
                    ).prepend(
                        '<div class="favorite-badge"><i><img src="images/star-yellow.png" width="32" height="32" /></i></div>'
                    );
                }
            } else {
                var category = vodSeries.categories[keys.categorySelection];
                var menuDoms = vodSeries.menuDoms;
                if (category.category_id === "favorite") {
                    $(menuDoms[keys.menuSelection]).remove();
                    if (category.movies.length > 0) {
                        //sortMovies after fav/unfav
                        var key = settings[vodSeries.currentSortKey];
                        vodSeries.movies = getSortedMovies(category.movies, key, "movies");
                        menuDoms = $("#vod-series-menus-container .vod-series-menu-item-container");
                        menuDoms.map(function (index, item) {
                            $(item).data("index", index);
                        });
                        vodSeries.menuDoms = menuDoms;
                        if (keys.menuSelection >= vodSeries.menuDoms.length)
                            keys.menuSelection = vodSeries.menuDoms.length - 1;
                        $(vodSeries.menuDoms[keys.menuSelection]).addClass(
                            "active"
                        );
                    } else {
                        keys.focusedPart = "categorySelection";
                        $(vodSeries.category_doms[keys.categorySelection]).addClass(
                            "active"
                        );
                    }
                } else {
                    $($(menuDoms[keys.menuSelection]).find(".favorite-badge")).remove();
                }
            }
        } else {
            $(".series-detail-page").addClass("hide");
            $(".top-bar").addClass("hide");
            $("#vod-summary-page").addClass("hide");
            $("#entire-search-page").removeClass("hide");
            currentRoute = this.prevRoute;
        }
    },

    showTrailerVideo: function () {
        trailer.back_url = "vod-summary-page";
        if (
            currentMovie.youtubeTrailer === "" ||
            currentMovie.youtubeTrailer == undefined
        ) {
            var noTrailer = currentWords["no_trailer"];
            showToast(noTrailer, "");
        } else {
            trailer.init(currentMovie.youtubeTrailer, currentRoute, "movies");
        }
    },

    showMovie: function () {
        $("#vod-summary-page").addClass("hide");
        vodSeriesPlayer.makeEpisodeDoms("vod-summary-page");
        var prevRoute = this.prevRoute;
        vodSeriesPlayer.init(
            currentMovie,
            "movies",
            "vod-summary-page",
            "",
            prevRoute
        );
    },

    toggleFavorite: function (targetElement) {
        this.isFavorite = !this.isFavorite;
        var action = $(targetElement).data("action");
        if (action === "add") {
            movieHelper.addRecentOrFavoriteMovie("vod", currentMovie, "favorite");
            $(targetElement).data("action", "remove");
            $("#vod-favorite-icon").attr("src", "images/star-yellow.png");
        } else {
            movieHelper.removeRecentOrFavoriteMovie("vod", currentMovie.stream_id, "favorite");
            $(targetElement).data("action", "add");
            $("#vod-favorite-icon").attr("src", "images/star.png");
        }
    },

    hoverButton: function (index) {
        var keys = this.keys;
        this.unFocusCast();
        this.unfocusActinBtn();
        if (settings.playlist.playlistType !== 'xc' && index === 1) {
            keys.index = 2;
        } else {
            keys.index = index;
        }
        $($(".vod-action-btn")[keys.index]).addClass("active");

        $('#vod-summary-action-container').css("margin-top", "330px");
    },

    keyMove: function (increment) {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "actionBtnSelection":
                var minIndex = this.minBtnIndex;
                keys.index += increment;
                if (minIndex == 0) {
                    if (keys.index > 2) keys.index = 2;
                    else if (keys.index < 0) keys.index = 0;
                } else {
                    if (keys.index == 1) {
                        if (increment == 1) {
                            keys.index = 2;
                        } else {
                            keys.index = 0;
                        }
                    } else if (keys.index > 2) {
                        keys.index = 2;
                    } else if (keys.index < 0) keys.index = 0;
                }

                this.hoverButton(keys.index);
                break;
            case "castSelection":
                this.moveCastSliders(increment);
                break;
        }
    },

    keyClick: function () {
        var keys = this.keys;
        if (keys.focusedPart === "actionBtnSelection") {
            var buttons = $(".vod-action-btn");
            var currentButton = buttons[keys.index];
            $(currentButton).trigger("click");
        }
    },

    handleUpDown: function (increment) {
        var keys = this.keys;
        switch (increment) {
            case 1:
                if (keys.focusedPart === 'actionBtnSelection') {
                    keys.focusedPart = 'castSelection';
                    keys.castSelection = 0;
                    if (settings.playlist.playlistType === "xc") {
                        this.unfocusActinBtn();
                        this.hoverCast(0);
                    }
                }
                break;
            case -1:
                if (keys.focusedPart === 'castSelection') {
                    keys.focusedPart = 'actionBtnSelection';
                    this.hoverButton(keys.index);
                }
                break;
        }
    },

    HandleKey: function (e) {
        switch (e.keyCode) {
            case tvKey.ArrowLeft:
                this.keyMove(-1);
                break;
            case tvKey.ArrowRight:
                this.keyMove(1);
                break;
            case tvKey.ArrowUp:
                this.handleUpDown(-1);
                break;
            case tvKey.ArrowDown:
                this.handleUpDown(1);
                break;
            case tvKey.Enter:
                this.keyClick();
                break;
            case tvKey.ColorF2Yellow:
                var favBtnDom = $("#vod-add-favorite-button");
                this.toggleFavorite(favBtnDom);
                break;
            case tvKey.Back:
                this.goBack();
                break;
        }
    }
};
