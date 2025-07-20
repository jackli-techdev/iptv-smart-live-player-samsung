"use strict";
var fav_page = {
    channel_num: 0,
    movies: [],
    lives: [],
    series: [],
    initiated: false,
    categories: [],
    category_hover_timer: null,
    prev_route: "",
    keys: {
        focused_part: "fav_search_part",
        slider_selection: -1,
        live_slider_item_index: 0,
        vod_slider_item_index: 0,
        series_slider_item_index: 0
    },
    search_key_timer: "",
    search_key_timout: 400,
    live_current_render_count: 0,
    live_render_count_increment: 15,
    vod_current_render_count: 0,
    vod_render_count_increment: 15,
    series_current_render_count: 0,
    series_render_count_increment: 15,
    prev_keyword: "",
    filtered_lives: [],
    filtered_movies: [],
    filtered_series: [],
    init: function (prev_route) {
        this.prev_route = prev_route;
        var keys = this.keys;
        current_route = "fav-page";
        keys.focused_part = "fav_search_part";

        this.initFavs();
        this.activeSearchBar();
        this.hidePrevPages();

        this.filterfavLives('', 'init');
        this.filterfavMovies('', 'init');
        this.filterfavSeries('', 'init');

    },

    initFavs: function () {
        favLives = LiveModel.categories[2].movies;
        favMovies = VodModel.categories[2].movies;
        favSeries = SeriesModel.categories[2].movies;
        this.filtered_lives = favLives;
        this.filtered_movies = favMovies;
        this.filtered_series = favSeries;

        this.keys.live_slider_item_index = 0;
        this.keys.vod_slider_item_index = 0;
        this.keys.series_slider_item_index = 0;

        this.keys.slider_selection = -1;

        if (favLives.length === 0)
            $("#live-fav-search").addClass("hide");
        if (favMovies.length === 0)
            $("#movie-fav-search").addClass("hide");
        if (favSeries.length === 0)
            $("#series-fav-search").addClass("hide");
    },

    activeSearchBar: function () {
        $("#fav-search-bar").addClass("active");
        $("#fav-page").removeClass("hide");
        $("#fav-search-input").val("");
        $("#fav-search-input").blur();
        $("#fav-search-input").focus();
    },

    hidePrevPages: function () {
        $("#channel-page").addClass("hide");
        hideTopBar();
        $("#home-page").addClass("hide");
    },

    makeSliderMovieItemElement: function (movie, movie_type, index) {
        var extension = "ts";
        if (movie_type === "live") {
            var fall_back_image = "images/icon_live.png";
            extension = movie.container_extension;
            var htmlContent =
                '<div class="fav-live-item-container movie-item-container"  onclick="fav_page.handleMenuClick()" onmouseenter = "fav_page.hoverfavVideo(\'live\', ' +
                index +
                ', 0)" data-channel_id="' +
                movie.stream_id +
                '">' +
                '<div class="movie-item-wrapper live-movie-item" data-movie_type="live" data-stream_id = "' +
                movie.stream_id +
                '">' +
                '<img class="movie-item-thumbernail position-relative  live-item-wrapper-image" src="' +
                movie.stream_icon +
                '" onerror="this.src=\'images/icon_live.png\'">' +
                '<div class="movie-grid-item-title-wrapper position-relative">' +
                '<p class="movie-thumbernail-title position-absolute">' +
                movie.name +
                "</p>" +
                "</div>" +
                "</div>" +
                "</div>";
        } else if (movie_type === "movie") {
            var fall_back_image = "images/default_bg.png";
            extension = movie.container_extension;
            var htmlContent =
                '<div class="fav-movie-item-container movie-item-container" onclick="fav_page.showPreviewVideo()" onmouseenter = "fav_page.hoverfavVideo(\'vod\', ' +
                index +
                ', 1)">' +
                '<div class="fav-movie-item-wrapper movie-item-wrapper" data-movie_type="' +
                movie_type +
                '" data-stream_id="' +
                movie.stream_id +
                '" data-extension="' +
                extension +
                '">' +
                '<div class="fav-movie-item-thumbernail position-relative" style="background-image:url(' +
                movie.stream_icon +
                "),url(" +
                fall_back_image +
                ')">' +
                '<p class="movie-thumbernail-title position-absolute">' +
                movie.name +
                "</p>" +
                "</div>" +
                "</div>" +
                "</div>";
        } else {
            var fall_back_image = "images/default_bg.png";
            var htmlContent =
                '<div class="fav-series-item-container movie-item-container" onclick="fav_page.showPreviewVideo()" onmouseenter = "fav_page.hoverfavVideo(\'series\', ' +
                index +
                ', 2)" data-channel_id="' +
                movie.series_id +
                '">' +
                '<div class="fav-series-item-wrapper movie-item-wrapper" data-movie_type="series" data-series_id = "' +
                movie.series_id +
                '">' +
                '<img class="movie-item-thumbernail position-relative" style = "background:#465A65" src="' +
                movie.cover +
                '" onerror="this.src=\'images/default_bg.png\'">' +
                '<div class="movie-grid-item-title-wrapper position-relative">' +
                '<p class="movie-thumbernail-title position-absolute">' +
                movie.name +
                "</p>" +
                "</div>" +
                "</div>" +
                "</div>";
        }

        return htmlContent;
    },

    favSearch: function (prev_route) {
        try {
            media_player.pause();
        } catch (e) {
            console.log(e);
        }
        var keys = this.keys;
        this.init(prev_route);
        current_route = "fav-search-page";
        $("#fav-search-page").removeClass("hide");
        $("#channel-page").addClass("hide");
        hideTopBar();
        $("#home-page").addClass("hide");
        $("#fav-search-input").val("");
        $("#fav-search-input").blur();
        $("#fav-search-input").focus();
        keys.focused_part = "fav_search_part";
        $("#fav-live-wrapper").html("");
        $("#fav-movies-wrapper").html("");
        $("#fav-series-wrapper").html("");
    },

    initRenderCount: function () {
        this.live_current_render_count = 0;
        this.live_render_count_increment = 15;
        this.vod_current_render_count = 0;
        this.vod_render_count_increment = 15;
        this.series_current_render_count = 0;
        this.series_render_count_increment = 15;
    },
    goBack: function () {
        var prev_route = this.prev_route;
        current_route = prev_route;
        this.prev_keyword = "";
        fav_page.initRenderCount();
        $("#fav-live-wrapper").html("");
        $("#fav-movies-wrapper").html("");
        $("#fav-series-wrapper").html("");

        $("#fav-search-input").val("");
        $("#fav-page").addClass("hide");
        $("#" + prev_route).removeClass("hide");

    },
    showCategoryContent: function () { },
    renderCategoryContent: function () { },
    addOrRemoveFav: function () { },
    searchMovie: function () { },
    searchBackMove: function () { },
    showSortKeyModal: function () { },
    changeSortKey: function (key, index) { },
    searchValueChange: function () {
        clearTimeout(this.search_key_timer);
        var that = this;
        this.search_key_timer = setTimeout(function () {
            var search_value = $("#fav-search-input").val();
            if (search_value !== "") {
                that.filterfavLives(search_value, '');
                that.filterfavMovies(search_value, '');
                that.filterfavSeries(search_value, '');
            } else {
                that.filterfavLives('', 'init');
                that.filterfavMovies('', 'init');
                that.filterfavSeries('', 'init');
            }
            that.initRenderCount();
            that.prev_keyword = search_value;
        }, this.search_key_timout);
    },

    filterfavLives: function (search_value, state) {
        var that = this;
        search_value = search_value.toLowerCase();

        if (state === 'init' || search_value === '') {
            this.filtered_lives = favLives;
            if (that.filtered_lives.length > 0) {
                $("#live-fav-search").removeClass("hide");
                this.renderLiveChannelContent(state);
            } else {
                $("#live-fav-search").addClass("hide");
            }
        } else {
            that.filtered_lives = favLives.filter(function (live) {
                return (
                    live.name.toLowerCase().includes(search_value)
                );
            });
            if (that.filtered_lives.length > 0) {
                $("#live-fav-search").removeClass("hide");
                this.renderLiveChannelContent(state);
            } else {
                $("#live-fav-search").addClass("hide");
            }
        }
    },

    renderLiveChannelContent: function (state) {
        var filtered_lives = this.filtered_lives;
        var htmlContents = "";
        var live_current_render_count_ = this.live_current_render_count;
        filtered_lives
            .slice(
                this.live_current_render_count,
                this.live_current_render_count + this.live_render_count_increment
            )
            .map(function (movie, index) {
                htmlContents += fav_page.makeSliderMovieItemElement(
                    movie,
                    "live",
                    live_current_render_count_ + index
                );
            });

        if (state === 'init') {
            this.live_current_render_count = 0;
        } else
            this.live_current_render_count += this.live_render_count_increment;
        $("#fav-live-wrapper").html("");
        $("#fav-live-wrapper").append(htmlContents);
    },

    filterfavMovies: function (search_value, state) {
        var that = this;
        search_value = search_value.toLowerCase();

        if (state === 'init' || search_value === '') {
            this.filtered_movies = favMovies;
            if (that.filtered_movies.length > 0) {
                $("#movie-fav-search").removeClass("hide");
                this.renderVodContent(state);
            } else {
                $("#movie-fav-search").addClass("hide");
            }
        } else {
            that.filtered_movies = favMovies.filter(function (movie) {
                return (
                    movie.name.toLowerCase().includes(search_value)
                );
            });
            if (that.filtered_movies.length > 0) {
                $("#movie-fav-search").removeClass("hide");
                this.renderVodContent(state);
            } else {
                $("#movie-fav-search").addClass("hide");
            }
        }
    },

    renderVodContent: function (state) {
        var filtered_movies = this.filtered_movies;
        var htmlContents = "";
        var vod_current_render_count_ = this.vod_current_render_count;

        filtered_movies
            .slice(
                this.vod_current_render_count,
                this.vod_current_render_count + this.vod_render_count_increment
            )
            .map(function (movie, index) {
                htmlContents += fav_page.makeSliderMovieItemElement(
                    movie,
                    "movie",
                    vod_current_render_count_ + index
                );
            });
        if (state === 'init') {
            this.vod_current_render_count = 0;
        } else
            this.vod_current_render_count += this.vod_render_count_increment;
        $("#fav-movies-wrapper").html("");
        $("#fav-movies-wrapper").append(htmlContents);
    },

    filterfavSeries: function (search_value, state) {
        var that = this;
        search_value = search_value.toLowerCase();

        if (state === 'init' || search_value === '') {
            this.filtered_series = favSeries;
            if (that.filtered_series.length > 0) {
                $("#series-fav-search").removeClass("hide");
                this.renderSeriesContent(state);
            } else {
                $("#series-fav-search").addClass("hide");
            }
        } else {
            that.filtered_series = favSeries.filter(function (series) {
                return (
                    series.name.toLowerCase().includes(search_value)
                );
            });
            if (that.filtered_series.length > 0) {
                $("#series-fav-search").removeClass("hide");
                this.renderSeriesContent(state);
            } else {
                $("#series-fav-search").addClass("hide");
            }
        }
    },

    renderSeriesContent: function (state) {
        var htmlContents = "";
        var filtered_series = this.filtered_series;
        var series_current_render_count_ = this.series_current_render_count;
        filtered_series
            .slice(
                this.series_current_render_count,
                this.series_current_render_count + this.series_render_count_increment
            )
            .map(function (series, index) {
                htmlContents += fav_page.makeSliderMovieItemElement(
                    series,
                    "series",
                    series_current_render_count_ + index
                );
            });
        if (state === 'init') {
            this.series_current_render_count = 0
        } else
            this.series_current_render_count += this.series_render_count_increment;

        $("#fav-series-wrapper").html("");
        $("#fav-series-wrapper").append(htmlContents);
    },

    hoverSearchItem: function () {
        var keys = this.keys;
        keys.focused_part = "fav_search_part";
        $("#fav-search-input").focus();
        $(".movie-item-wrapper").removeClass("active");
        $("#fav-search-bar").addClass("active");
    },

    hoverfavVideo: function (move_type, index, slider_selection) {
        var keys = this.keys;
        keys.slider_selection = slider_selection;
        $("#fav-search-bar").removeClass("active");
        $(".movie-item-wrapper").removeClass("active");
        var movie_containers = $(".fav-movie-slider-wrapper");
        var movie_items = $(movie_containers[keys.slider_selection]).find(
            ".movie-item-wrapper"
        );
        if (move_type == "live") {
            keys.live_slider_item_index = index;
            keys.focused_part = "fav_live_selection";
            if (keys.live_slider_item_index >= this.live_current_render_count - 2) {
                fav_page.renderLiveChannelContent();
            } else {
                if (keys.live_slider_item_index >= movie_items.length)
                    keys.live_slider_item_index = movie_items.length - 1;
                var movie_item_container = $(
                    movie_items[keys.live_slider_item_index]
                ).closest(".movie-item-container");
                $(movie_items[keys.live_slider_item_index]).addClass("active");
            }
        } else if (move_type == "vod") {
            keys.vod_slider_item_index = index;
            keys.focused_part = "fav_movies_selection";
            if (keys.vod_slider_item_index >= this.vod_current_render_count - 2) {
                fav_page.renderVodContent();
            } else {
                if (keys.vod_slider_item_index >= movie_items.length)
                    keys.vod_slider_item_index = movie_items.length - 1;
                var movie_item_container = $(
                    movie_items[keys.vod_slider_item_index]
                ).closest(".movie-item-container");
                $(movie_items[keys.vod_slider_item_index]).addClass("active");
            }
        } else {
            keys.series_slider_item_index = index;
            keys.focused_part = "fav_series_selection";

            if (
                keys.series_slider_item_index >=
                this.series_current_render_count - 2
            ) {
                fav_page.renderSeriesContent();
            } else {
                if (keys.series_slider_item_index >= movie_items.length)
                    keys.series_slider_item_index = movie_items.length - 1;
                var movie_item_container = $(
                    movie_items[keys.series_slider_item_index]
                ).closest(".movie-item-container");
                $(movie_items[keys.series_slider_item_index]).addClass("active");
            }
        }

        this.changeMovieScrollPosition(
            $(movie_containers[keys.slider_selection]),
            movie_item_container
        );
    },

    goToSearchBar: function () {
        var keys = this.keys;
        keys.focused_part = "fav_search_part";
        var movie_containers1 = $(".fav-movie-slider-wrapper");

        var movie_items0 = $(movie_containers1[0]).find(".movie-item-wrapper");
        var movie_items1 = $(movie_containers1[1]).find(".movie-item-wrapper");
        var movie_items2 = $(movie_containers1[2]).find(".movie-item-wrapper");

        $($(movie_items0)[keys.live_slider_item_index]).removeClass("active");
        $($(movie_items1)[keys.live_slider_item_index]).removeClass("active");
        $($(movie_items2)[keys.live_slider_item_index]).removeClass("active");

        $("#fav-search-bar").addClass("active");
        $("#fav-search-input").focus();
    },


    handleMenuClick: function () {
        var keys = this.keys;
        if (keys.focused_part != "fav_search_part") {
            this.showPreviewVideo();
        }
    },

    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        this.keys.slider_selection += increment;
        if (keys.slider_selection > 2) {
            keys.slider_selection = 2;
        }
        if (keys.slider_selection < -1) {
            keys.slider_selection = -1;
        }

        $("#fav-search-input").blur();
        var movie_containers1 = $(".fav-movie-slider-wrapper");
        switch (keys.focused_part) {
            case "fav_search_part":
                if (increment > 0) {
                    if (this.filtered_lives.length > 0) {
                        keys.focused_part = "fav_live_selection";
                        $("#fav-search-bar").removeClass("active");
                        var movie_items1 = $(movie_containers1[0]).find(".movie-item-wrapper");
                        $($(movie_items1)[keys.live_slider_item_index]).addClass("active");
                    } else if (this.filtered_lives.length === 0 && this.filtered_movies.length > 0) {
                        keys.focused_part = "fav_movies_selection";
                        $("#fav-search-bar").removeClass("active");
                        var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
                        $($(movie_items2)[keys.vod_slider_item_index]).addClass("active");
                    } else if (this.filtered_lives.length === 0 && this.filtered_movies.length === 0 && this.filtered_series.length > 0) {
                        keys.focused_part = "fav_series_selection";
                        $("#fav-search-bar").removeClass("active");
                        var movie_items3 = $(movie_containers1[2]).find(".movie-item-wrapper");
                        $($(movie_items3)[keys.series_slider_item_index]).addClass("active");
                    }
                }
                break;
            case "fav_live_selection":
                if (increment > 0) {
                    var movie_items1 = $(movie_containers1[0]).find(".movie-item-wrapper");
                    if (this.filtered_movies.length > 0) {
                        keys.focused_part = "fav_movies_selection";
                        $($(movie_items1)[keys.live_slider_item_index]).removeClass("active");
                        var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
                        $($(movie_items2)[keys.vod_slider_item_index]).addClass("active");
                    } else if (this.filtered_movies.length === 0 && this.filtered_series.length > 0) {
                        keys.focused_part = "fav_series_selection";
                        $($(movie_items1)[keys.live_slider_item_index]).removeClass("active");
                        var movie_items3 = $(movie_containers1[2]).find(".movie-item-wrapper");
                        $($(movie_items3)[keys.series_slider_item_index]).addClass("active");
                    }
                } else {
                    this.goToSearchBar();
                }
                break;
            case "fav_movies_selection":
                if (increment > 0) {
                    if (this.filtered_series.length > 0) {
                        keys.focused_part = "fav_series_selection";
                        var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
                        $($(movie_items2)[keys.vod_slider_item_index]).removeClass("active");
                        var movie_items3 = $(movie_containers1[2]).find(".movie-item-wrapper");
                        $($(movie_items3)[keys.series_slider_item_index]).addClass("active");
                    }
                } else {
                    if (this.filtered_lives.length > 0) {
                        keys.focused_part = "fav_live_selection";
                        var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
                        $($(movie_items2)[keys.vod_slider_item_index]).removeClass("active");
                        var movie_items1 = $(movie_containers1[0]).find(".movie-item-wrapper");
                        $($(movie_items1)[keys.live_slider_item_index]).addClass("active");
                    } else if (this.filtered_lives.length === 0) {
                        this.goToSearchBar();
                    }
                }
                break;
            case "fav_series_selection":
                if (increment < 0) {
                    if (this.filtered_movies.length > 0) {
                        keys.focused_part = "fav_movies_selection";
                        var movie_items3 = $(movie_containers1[2]).find(".movie-item-wrapper");
                        $($(movie_items3)[keys.series_slider_item_index]).removeClass("active");
                        var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
                        $($(movie_items2)[keys.vod_slider_item_index]).addClass("active");
                    } else if (this.filtered_movies.length === 0 && this.filtered_lives.length > 0) {
                        keys.focused_part = "fav_live_selection";
                        var movie_items2 = $(movie_containers1[2]).find(".movie-item-wrapper");
                        $($(movie_items2)[keys.vod_slider_item_index]).removeClass("active");
                        var movie_items1 = $(movie_containers1[0]).find(".movie-item-wrapper");
                        $($(movie_items1)[keys.live_slider_item_index]).addClass("active");
                    } else if (this.filtered_movies.length === 0 && this.filtered_lives.length < 0) {
                        this.goToSearchBar();
                    }
                }
                break;
        }
    },
    Exit: function () {
        $("#home-page").css({ height: 0 });
        $("#home-page").hide();
        closePlayer();
    },
    showPreviewVideo: function () {
        var keys = this.keys;
        var that = this;
        var movie_containers = $(".fav-movie-slider-wrapper");
        if (keys.focused_part == "fav_live_selection") {
            var movie_items = $(movie_containers[0]).find(".movie-item-wrapper");
            var current_movie_item = $(movie_items[keys.live_slider_item_index]);
        } else if (keys.focused_part == "fav_movies_selection") {
            var movie_items = $(movie_containers[1]).find(".movie-item-wrapper");
            var current_movie_item = $(movie_items[keys.vod_slider_item_index]);
        } else {
            var movie_items = $(movie_containers[2]).find(".movie-item-wrapper");
            var current_movie_item = $(movie_items[keys.series_slider_item_index]);
        }

        var movie_type = $(current_movie_item).data("movie_type");
        var series_id = $(current_movie_item).data("series_id");
        var stream_id = $(current_movie_item).data("stream_id");

        if (movie_type == "live") {
            that.filtered_lives.map(function (live, index) {
                if (live.stream_id == stream_id) {
                    current_movie = live;

                    $("#fav-search-page").addClass("hide");
                    channel_page.showEntireSearchLiveMovie(
                        current_movie,
                        "fav-page"
                    );
                }
            });
        } else if (movie_type == "movie") {
            var stream_id = $(current_movie_item).data("stream_id");

            that.filtered_movies.map(function (movie, index) {
                if (movie.stream_id == stream_id) {
                    current_movie = movie;
                    vod_summary_variables.init("fav-page");
                }
            });
        } else if (movie_type == "series") {
            that.filtered_series.map(function (series, index) {
                if (series.series_id == series_id) {
                    current_series = series;
                    series_summary_page.init("fav-page");
                }
            });
        }
        $("#fav-page").addClass("hide");
    },

    MoveKeyOnMovies: function (increment) {
        var keys = this.keys;
        $(".movie-item-wrapper").removeClass("active");
        if (
            keys.live_slider_item_index > -1 ||
            keys.vod_slider_item_index > -1 ||
            keys.series_slider_item_index > -1
        ) {
            if (keys.focused_part == "fav_live_selection") {
                keys.live_slider_item_index += increment;
                if (keys.live_slider_item_index < 0) keys.live_slider_item_index = 0;
                if (keys.live_slider_item_index >= this.live_current_render_count - 2 && keys.live_slider_item_index > 12) {
                    fav_page.renderLiveChannelContent();
                } else this.renderLoadedContents("live");
            } else if (keys.focused_part == "fav_movies_selection") {
                keys.vod_slider_item_index += increment;
                if (keys.vod_slider_item_index < 0) keys.vod_slider_item_index = 0;
                if (keys.vod_slider_item_index >= this.vod_current_render_count - 2 && keys.vod_slider_item_index > 12) {
                    fav_page.renderVodContent();
                } else this.renderLoadedContents("vod");
            } else if (keys.focused_part == "fav_series_selection") {
                keys.series_slider_item_index += increment;
                if (keys.series_slider_item_index < 0)
                    keys.series_slider_item_index = 0;
                if (keys.series_slider_item_index >= this.series_current_render_count - 2 && keys.series_slider_item_index > 12) {
                    fav_page.renderSeriesContent();
                } else this.renderLoadedContents("series");
            }
        }
    },

    renderLoadedContents: function (move_type) {
        var keys = this.keys;
        var movie_containers = $(".fav-movie-slider-wrapper");
        var movie_items = $(movie_containers[keys.slider_selection]).find(
            ".movie-item-wrapper"
        );
        if (move_type == "live") {
            if (keys.live_slider_item_index >= movie_items.length)
                keys.live_slider_item_index = movie_items.length - 1;
            var movie_item_container = $(
                movie_items[keys.live_slider_item_index]
            ).closest(".movie-item-container");
            $(movie_items[keys.live_slider_item_index]).addClass("active");
        } else if (move_type == "vod") {
            if (keys.vod_slider_item_index >= movie_items.length)
                keys.vod_slider_item_index = movie_items.length - 1;
            var movie_item_container = $(
                movie_items[keys.vod_slider_item_index]
            ).closest(".movie-item-container");
            $(movie_items[keys.vod_slider_item_index]).addClass("active");
        } else {
            if (keys.series_slider_item_index >= movie_items.length)
                keys.series_slider_item_index = movie_items.length - 1;
            var movie_item_container = $(
                movie_items[keys.series_slider_item_index]
            ).closest(".movie-item-container");
            $(movie_items[keys.series_slider_item_index]).addClass("active");
        }

        this.changeMovieScrollPosition(
            $(movie_containers[keys.slider_selection]),
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
        var element_width = 200;
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

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        switch (keys.focused_part) {
            case "fav_live_selection":
                this.MoveKeyOnMovies(increment);
                break;
            case "fav_movies_selection":
                this.MoveKeyOnMovies(increment);
                break;
            case "fav_series_selection":
                this.MoveKeyOnMovies(increment);
                break;
        }
    },

    HandleKey: function (e) {

        switch (e.keyCode) {
            case 65376: // Done
            case 65385: // Cancel
                $("input").blur();
                break;
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
            case tvKey.RETURN:
                this.goBack();
                break;
            case tvKey.RED:
                // home_page.init();
                break;
            default:
                console.log("No matching");
        }

    }
};
