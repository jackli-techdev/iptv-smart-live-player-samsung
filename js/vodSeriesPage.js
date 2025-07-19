"use strict";
var vodSeries = {
    movies: [],
    categories: [],
    sortSelectionDoms: $(".sort-modal-item"),
    searchBackDoms: $(".search-back-btn"),
    topMenuDoms: $(".menu-item"),
    prevDom: [],
    keys: {
        focusedPart: "categorySelection",
        categorySelection: 0,
        menuSelection: 0,
        searchBackSelection: 0,
        topMenuSelection: 2,
        selectedCategoryIndex: 0,
        sortSelection: 0,
    },
    categoryDoms: [],
    menuDoms: [],
    searchInputDom: $("#search-by-video-title"),
    currentVideoType: "vod",
    currentSortKey: "vodSort",
    currentModel: {},
    searchKeyTimer: null,
    searchKeyTimout: 400,
    currentRenderCount: 0,
    renderCountIncrement: 40,
    prevKeyword: "",
    prevDom: [],
    currentCategoryIndex: -1,

    init: function (movieType) {
        this.prevDom = null;
        currentRoute = "vod-series-page";
        this.currentVideoType = movieType;
        this.currentSortKey = this.currentVideoType == "vod" ? "vodSort" : "seriesSort";
        this.currentModel = this.currentVideoType == "vod" ? VodModel : SeriesModel;
        this.keys.topMenuSelection = this.currentVideoType == "vod" ? 2 : 3;
        this.currentVideoType == "vod" ? $(".movie_series_img").attr("src", config.movieIcong) : $(".movie_series_img").attr("src", config.seriesIcon);;

        var keys = this.keys;
        this.categories = movieHelper.getCategories(movieType, false, true);
        $(this.topMenuDoms).removeClass("active");
        $(this.topMenuDoms).removeClass("selected");
        $(this.topMenuDoms[keys.topMenuSelection]).addClass("selected");
        displayCurrentPage(currentRoute);
        this.renderSearchBar();
        this.renderCategories();
        this.categoryDoms = $(".vod-series-category-item");
        keys.focusedPart = "categorySelection";

        keys.categorySelection = 0;
        this.currentRenderCount = 0;

        vodSeries.currentCategoryIndex = -1;
        for (var i = 0; i < this.categories.length; i++) {
            if (this.categories[i].movies.length > 0) {
                keys.categorySelection = i;
                keys.selectedCategoryIndex = i;
                break;
            }
        }
        this.showCategoryContent();
        this.hoverCategory(this.categoryDoms[keys.categorySelection]);
        this.initSortByNameIcons();
        this.initSortKey();
    },

    initSortKey: function () {
        var currentSortKey = this.currentVideoType == "vod" ? "vodSort" : "seriesSort";
        var index = 0;

        if (settings[currentSortKey] == "added") {
            index = 0;
        } else if (settings[currentSortKey] == "number") {
            index = 1;
        } else if (settings[currentSortKey] == "rating") {
            index = 2;
        } else if (settings[currentSortKey] == "name") {
            index = 3;
        }
        this.keys.sortSelection = index;
        this.focusSortItem(index);

        $("#sort-button").text($(this.sortSelectionDoms[index]).text());
    },

    activeTopMenuItem: function () {
        $(this.topMenuDoms).removeClass("active");
        $(this.topMenuDoms[this.keys.topMenuSelection]).addClass("active");
    },

    renderCategories: function () {
        var htmlContent = "";
        $("#vod-series-categories-container").html("");
        this.categories.map(function (item, index) {
            var translatedCategoryName = "";
            if (item.category_id === "all") {
                translatedCategoryName = currentWords['all'];
            } else if (item.category_id === "recent") {
                translatedCategoryName = currentWords['resume_to_watch'];
            } else if (item.category_id === "favorite") {
                translatedCategoryName = currentWords['favorites'];
            } else
                translatedCategoryName = item.category_name;

            var cIndex = item.category_name === 'All' ? 'vod-series-all-category' : '';
            htmlContent +=
                '<div class="vod-series-category-item ' + cIndex + '" data-index="' +
                index +
                '"' +
                '   onmouseenter="vodSeries.hoverCategory(this)" ' +
                '   onclick="vodSeries.handleMenuClick()"' +
                "> " +
                '<div class = "vod-series-category-name flex-container align-center">' +
                translatedCategoryName +
                "</div>" +
                "</div>";
        });
        $("#vod-series-categories-container").html(htmlContent);
    },

    renderSearchBar: function () {
        $("#search-by-video-title").innerHTML = "";
        $("#search-by-video-title").html(
            ' <div class="top-menu-titles top-menu-search-bar"style="border:none">' +
            '<div id="vod-series-search-bar" onmouseenter="vodSeries.focusSearchItem()">' +
            '<img src="images/search.png" class = "search-icon" width="28">' +
            '<input id="vod-series-search-value" onkeyup="vodSeries.searchValueChange()" onchange="vodSeries.searchValueChange()" />' +
            "</div>" +
            "</div>"
        );
    },

    goBack: function () {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "menuSelection":
                keys.focusedPart = "categorySelection";
                this.hoverCategory(this.categoryDoms[keys.categorySelection]);
                break;
            case "categorySelection":
                currentRoute = "home-page";
                $("#vod-series-page").addClass("hide");
                $("#home-page").removeClass("hide");
                showLoader(false);
                break;
            case "vodSeriesSearchBar":
                $("#vod-series-search-value").blur();
                this.unFocusSearchItem();
                keys.focusedPart = "categorySelection";
                this.hoverCategory(this.categoryDoms[keys.categorySelection]);
                break;
            case "topMenuSelection":
                keys.focusedPart = "menuSelection";
                break;
            case "sortSelection":
            case "sortByNameSelection":
                keys.focusedPart = "menuSelection";
                $("#sort-modal-container").hide();
                $(this.sortSelectionDoms).removeClass("active");
                break;
            case "sortButton":
                $("#sort-modal-container").hide();
                keys.focusedPart = "sortSelection";
                $("#sort-button-container").addClass("active");
                break;
            case "searchBackSelection":
                $(".back-button").removeClass("active");
                currentRoute = "home-page";
                $("#vod-series-page").addClass("hide");
                $("#home-page").removeClass("hide");
                showLoader(false);
                break;
        }
    },

    selectCategory: function () {
        var keys = this.keys;
        $(".vod-series-category-item").removeClass("selected");
        this.categoryDoms = $(".vod-series-category-item");
        $(this.categoryDoms[keys.categorySelection]).addClass("selected");
        moveScrollPosition(
            $("#vod-series-categories-container"),
            this.categoryDoms[keys.categorySelection],
            "vertical",
            false
        );
    },

    emptyMenuContainer: function () {
        $("#vod-series-menus-container").html("");
    },

    showCategoryContent: function () {
        var keys = this.keys;
        if (this.currentCategoryIndex === keys.categorySelection) return;
        var category = this.categories[keys.categorySelection];
        this.selectCategory();
        this.currentRenderCount = 0;
        this.emptyMenuContainer();
        this.prevKeyword = "";
        $("#vod-series-search-value").val("");
        this.movies = category.movies;

        var translatedCategoryName = "";
        if (category.category_id === "all") {
            translatedCategoryName = currentWords['all'];
            translatedCategoryName = translatedCategoryName == undefined ? "All" : translatedCategoryName;
        } else if (category.category_id === "recent") {
            translatedCategoryName = currentWords['resume_to_watch'];
            translatedCategoryName = translatedCategoryName == undefined ? "Resume to Watch" : translatedCategoryName;
        } else if (category.category_id === "favorite") {
            translatedCategoryName = currentWords['favorites'];
            translatedCategoryName = translatedCategoryName == undefined ? "Favorites" : translatedCategoryName;
        } else
            translatedCategoryName = category.category_name;


        $("#all-vod-counter").innerHTML = "";
        var allVod = "" + translatedCategoryName + " (" + this.movies.length + ")";
        $("#all-vod-counter").html(allVod);

        this.renderCategoryContent('init');

        $("#vod-series-menus-container").scrollTop(0);
        keys.menuSelection = 0;
        vodSeries.currentCategoryIndex = keys.categorySelection;
        $("#vod-series-current-category").text(category.category_name);
    },

    renderResumeWatchContent: function () {
        if (this.movies.length === 0) {
            this.keys.focusedPart = "categorySelection";
            $("#vod-series-menus-container").html("");
        } else {
            var that = this;
            var streamIds = getStreamIds(this.currentModel.favoriteIds, this.currentVideoType);
            var htmlContents = ""

            this.movies.map(function (movie, index) {
                var isFavorite = streamIds.includes(
                    movie[that.currentModel.movieKey]
                );
                if (
                    typeof that.currentModel.savedVideoTimes[movie.stream_id] !=
                    "undefined"
                ) {
                    var width_ =
                        that.currentModel.savedVideoTimes[movie.stream_id]
                            .resumeTime /
                        that.currentModel.savedVideoTimes[movie.stream_id].duration *
                        100;
                } else {
                    var width_ = 0;
                }

                var rating = "0.0";
                if (movie.rating !== undefined && movie.rating !== "")
                    rating = (Number(parseFloat(movie.rating))).toFixed(1);

                htmlContents +=
                    '<div class="vod-series-menu-item-container" data-stream_id="' + movie.stream_id + '" ' +
                    '   data-index="' +
                    (index) +
                    '" ' +
                    '   onmouseenter="vodSeries.hoverMovieItem(this)"' +
                    '   onclick="vodSeries.handleMenuClick()"' +
                    ">" +
                    '   <div class="vod-series-menu-item">' +
                    (isFavorite
                        ? '<div class="favorite-badge"><i><img src="images/star-yellow.png" width="32" height="32" /></i></div>'
                        : "") +
                    '<div class="rating-badge">' + rating + '</div>' +
                    '       <img class="vod-series-icon" src="' +
                    movie['stream_icon'] +
                    '" onerror="this.src=\'' +
                    config.placeholderImg +
                    "'\">" +
                    '       <div class="vod-series-menu-item-title-wrapper">' +
                    (that.currentModel.savedVideoTimes[movie.stream_id]
                        ? that.currentModel.savedVideoTimes[movie.stream_id]
                            .resumeTime /
                            1000 >=
                            config.resumeThredholdTime
                            ? '<div style = "background:black"><div class="resume-progress-bar" style = "width:' +
                            width_ +
                            '%"></div></div>'
                            : ""
                        : "") +
                    '           <div class="vod-series-menu-item-title max-line-2">' +
                    movie.name +
                    "           </div>" +
                    "       </div>" +
                    "   </div>" +
                    "</div>";
            });
            $("#vod-series-menus-container").html(htmlContents);
            this.menuDoms = $(
                "#vod-series-menus-container .vod-series-menu-item-container"
            );
            this.hoverMovieItem(this.menuDoms[this.menuDoms.length - 1]);
        }
    },

    renderCategoryContent: function (status) {

        if (this.movies.length === 0) {
            var noMovies = this.currentVideoType == "vod" ? currentWords['no_movies'] : currentWords["no_series"];
            showToast(noMovies, "");
            return;
        }
        var that = this;
        var keys = this.keys;
        var htmlContents = "";
        var default_icon = "images/placeholder.png";
        var movieKey = "stream_icon";
        var movie__type = this.currentVideoType;
        if (this.currentVideoType !== "vod") movieKey = "cover";

        var category = this.categories[this.keys.selectedCategoryIndex];
        if (category.category_id !== "all") {
            this.movies = this.sortMovies();
        }

        this.movies = this.movies.filter(function (movie) {
            if (!movie.name) return false;

            var lowerCaseName = movie.name.toLowerCase();
            return (!hasWord(lowerCaseName));
        });
        if (this.currentRenderCount < this.movies.length) {
            showLoader(true);
            var that = this;
            var streamIds = getStreamIds(this.currentModel.favoriteIds, this.currentVideoType);
            this.movies
                .slice(
                    this.currentRenderCount,
                    this.currentRenderCount + this.renderCountIncrement
                )
                .map(function (movie, index) {
                    var isFavorite = streamIds.includes(
                        movie[that.currentModel.movieKey]
                    );

                    if (
                        typeof that.currentModel.savedVideoTimes[movie.stream_id] !=
                        "undefined"
                    ) {
                        if (that.currentModel.savedVideoTimes[movie.stream_id].resumeTime / 1000 >= config.resumeThredholdTime) {
                            var width_ = that.currentModel.savedVideoTimes[movie.stream_id].resumeTime / that.currentModel.savedVideoTimes[movie.stream_id].duration * 100;
                        } else {
                            var width_ = 0;
                        }
                    } else {
                        var width_ = 0;
                    }

                    var rating = "0.0";
                    if (movie.rating !== undefined && movie.rating !== "")
                        rating = (Number(parseFloat(movie.rating))).toFixed(1);

                    htmlContents +=
                        '<div class="vod-series-menu-item-container" data-stream_id="' +
                        (movie__type == "vod" ? movie.stream_id : movie.series_id) +
                        '" ' +
                        'data-index="' +
                        (that.currentRenderCount + index) +
                        '" ' +
                        'onmouseenter="vodSeries.hoverMovieItem(this)" ' +
                        'onclick="vodSeries.handleMenuClick()">' +
                        '<div class="vod-series-menu-item">' +
                        '<div class="rating-badge">' + rating + '</div>' +
                        (isFavorite
                            ? '<div class="favorite-badge"><i><img src="images/star-yellow.png" width="32" height="32" /></i></div>'
                            : "") +
                        '<img class="vod-series-icon" src="' +
                        movie[movieKey] +
                        '" onerror="this.src=\'' +
                        default_icon +
                        '\'" />' +
                        '<div class="vod-series-menu-item-title-wrapper">' +
                        '<div class="resume-progressbar-wrapper ' + (width_ === 0 ? " no-bk" : "") + '">' +
                        '<div class="resume-progress-bar" style="width:' + width_ + '%"></div></div>' +
                        '<div class="vod-series-menu-item-title max-line-2">' +
                        movie.name +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';

                });
            this.currentRenderCount += this.renderCountIncrement;
            $("#vod-series-menus-container").append(htmlContents);
            if (status === 'init') {
                this.menuDoms = $(
                    "#vod-series-menus-container .vod-series-menu-item-container"
                );
                keys.menuSelection = 0
                this.hoverMovieItem(this.menuDoms[keys.menuSelection]);
                $(".vod-series-category-item").removeClass("active");
            }

            setTimeout(function () {
                showLoader(false);
            }, 1000);

        }
    },

    sortMovies: function () {
        var that = this;
        var keys = this.keys;
        var currentSortKey =
            this.currentVideoType == "vod" ? "vodSort" : "seriesSort";
        if (that.movies.length) {
            this.movies = getSortedMovies(that.movies, settings[currentSortKey], that.currentVideoType);
            var vodSortKey = getLocalStorageData("vodSortKeyByName");

            var seriesSortKey = getLocalStorageData("SeriesSortKeyByName");
            if (this.currentVideoType === "vod") {
                if (vodSortKey === null) {
                    vodSortKey = 1;
                }
            } else {
                if (seriesSortKey === null) {
                    seriesSortKey = 1;
                }
            }

            $("#sort-button").text($(this.sortSelectionDoms[keys.sortSelection]).text());

            var currentSortKeyByName = this.currentVideoType == "vod" ? vodSortKey : seriesSortKey;
            this.movies = getSortedMoviesByName(this.movies, settings[currentSortKey], currentSortKeyByName);
            return this.movies;
        }
    },

    addOrRemoveFav: function () {
        var keys = this.keys;
        if (keys.focusedPart !== "menuSelection") return;
        var menuDoms = this.menuDoms;
        var movies = this.movies;
        var movie_id_key = this.currentModel.movieKey;

        var streamIds = getStreamIds(this.currentModel.favoriteIds, this.currentVideoType);

        if (!streamIds.includes(movies[keys.menuSelection][movie_id_key])) {
            $(
                $(menuDoms[keys.menuSelection]).find(".vod-series-menu-item")
            ).prepend(
                '<div class="favorite-badge"><i><img src="images/star-yellow.png" width="32" height="32" /></i></div>'
            );
            movieHelper.addRecentOrFavoriteMovie(
                this.currentVideoType,
                movies[keys.menuSelection],
                "favorite"
            );
        } else {
            $($(menuDoms[keys.menuSelection]).find(".favorite-badge")).remove();
            movieHelper.removeRecentOrFavoriteMovie(
                this.currentVideoType,
                movies[keys.menuSelection][movie_id_key],
                "favorite"
            );
            var category = this.categories[this.currentCategoryIndex];
            if (category.category_id === "favorite") {
                $(menuDoms[keys.menuSelection]).remove();
                var menuDoms = $(
                    "#vod-series-menus-container .vod-series-menu-item-container"
                );
                if (category.movies.length > 0) {
                    var key = settings[this.currentSortKey];
                    this.movies = getSortedMovies(category.movies, key, this.currentVideoType);
                    menuDoms.map(function (index, item) {
                        $(item).data("index", index);
                    });
                    this.menuDoms = menuDoms;
                    if (keys.menuSelection >= this.menuDoms.length)
                        keys.menuSelection = this.menuDoms.length - 1;
                    this.hoverMovieItem(this.menuDoms[keys.menuSelection]);
                } else this.hoverCategory(this.categoryDoms[keys.categorySelection]);
            }
        }
    },

    // searchMovie: function () {
    //     var keys = this.keys;
    //     setTimeout(function () {
    //         var tmp = $("#vod-series-search-value").val();
    //         $("#vod-series-search-value")[0].setSelectionRange(
    //             tmp.length,
    //             tmp.length
    //         );
    //     }, 200);
    // },

    searchBackMove: function () {
        var keys = this.keys;
        keys.focusedPart = "searchBackSelection";
        keys.searchBackSelection = 0;
        $(".vod-series-category-item").removeClass("active");
        $(".back-button").addClass("active");
    },

    focusSortItem(index) {
        $(this.sortSelectionDoms).removeClass("active");
        $(this.sortSelectionDoms[index]).addClass("active");
    },

    showSortKeyModal: function () {
        var keys = this.keys;
        this.focusSortItem(keys.sortSelection);
        $("#sort-button-container").removeClass("active");
        $("#sort-modal-container").show();
    },

    changeSortKey: function (key, index) {
        this.currentRenderCount = 0;

        var keys = this.keys;
        var currentSortKey =
            this.currentVideoType == "vod" ? "vodSort" : "seriesSort";
        $("#sort-modal-container").hide();
        if (settings[currentSortKey] != key) {
            keys.sortSelection = index;
            $(this.sortSelectionDoms).removeClass("active");
            $(this.sortSelectionDoms[index]).addClass("active");
            settings.saveSettings(currentSortKey, key, "");
            var movie_type = this.currentVideoType;
            this.movies = getSortedMovies(this.movies, key, movie_type);

            var vodSortKey = getLocalStorageData("vodSortKeyByName");
            var seriesSortKey = getLocalStorageData("SeriesSortKeyByName");
            if (this.currentVideoType === "vod") {
                if (vodSortKey === null) {
                    vodSortKey = 1;
                }
            } else {
                if (seriesSortKey === null) {
                    seriesSortKey = 1;
                }
            }
            var currentSortKeyByName =
                this.currentVideoType == "vod" ? vodSortKey : seriesSortKey;
            var sortKeyName = "added";
            if (keys.sortSelection === 0)
                sortKeyName = "added";
            else if (keys.sortSelection === 1)
                sortKeyName = "number";
            else if (keys.sortSelection === 2)
                sortKeyName = "rating";
            else if (keys.sortSelection === 3)
                sortKeyName = "name";

            this.movies = getSortedMoviesByName(this.movies, sortKeyName, currentSortKeyByName);
            $("#vod-series-menus-container").html("");
            this.renderCategoryContent("");

            if (this.movies.length > 0) {
                keys.focusedPart = "menuSelection";
                keys.menuSelection = 0;
                $("#sort-button-container").removeClass("active");
                this.hoverMovieItemSort();
            }
            $("#sort-button").text($(this.sortSelectionDoms[index]).text());
            $("#vod-series-menus-container").scrollTop(0);
        } else {
            keys.focusedPart = "menuSelection";
            keys.menuSelection = 0;
            $("#sort-button-container").removeClass("active");
            this.hoverMovieItemSort();
        }
    },

    goEntireSearch: function (prevRoute) {
        entireSearch.entireSearch(prevRoute, this.currentVideoType);
    },

    hoverGoEntireSearch: function () {
        var keys = this.keys;
        keys.focusedPart = "searchBackSelection";
        $(this.prevDom).removeClass("active");
        $(this.topMenuDoms).removeClass("active");
        $(this.searchBackDoms[1]).addClass("active");
        this.prevDom = this.searchBackDoms[1];
    },

    hoverSortKeyModal: function () {
        var keys = this.keys;
        keys.focusedPart = "sortSelection";
        this.unFocusSearchItem();
        $(this.prevDom).removeClass("active");
        $(this.topMenuDoms).removeClass("active");
        $(".vod-series-menu-item-container").removeClass("active");
        $("#sort-button-container").addClass("active");
        this.prevDom = $("#sort-button-container");
    },

    hoverChangeSortKey: function (index) {
        var keys = this.keys;
        keys.focusedPart = "sortButton";
        keys.sortSelection = index;
        $(this.prevDom).removeClass("active");
        this.focusSortItem(keys.sortSelection);
        this.prevDom = $(this.sortSelectionDoms[keys.sortSelection]);
    },

    searchValueChange: function () {
        clearTimeout(this.searchKeyTimer);
        var searchValue = $("#vod-series-search-value").val().toLowerCase();
        var that = this;
        this.searchKeyTimer = setTimeout(function () {

            if (that.prevKeyword === searchValue) return;
            var category = that.categories[that.currentCategoryIndex];
            var currentMovies = JSON.parse(JSON.stringify(category.movies));
            currentMovies.sort(function (a, b) {
                if (!a.name || !b.name) return false;
                return a.name.localeCompare(b.name);
            });
            var filteredMovies = [];
            if (searchValue === "") {
                filteredMovies = currentMovies;
            } else {
                filteredMovies = currentMovies.filter(function (movie) {
                    if (!movie.name) return false;
                    return movie.name.toLowerCase().includes(searchValue);
                });
            }
            that.movies = filteredMovies;

            that.emptyMenuContainer();
            that.currentRenderCount = 0;

            that.movies = getSortedMovies(that.movies, that.getSortKey(that.keys.sortSelection), that.currentVideoType);

            that.renderCategoryContent("");

            that.prevKeyword = searchValue;
        }, this.searchKeyTimout);
    },

    getSortKey: function (index) {
        var key = "";
        if (index === 0) {
            key = "added";
        } else if (index === 1) {
            key = "number";
        } else if (index === 2) {
            key = "rating";
        } else if (index === 3) {
            key = "name";
        }
        return key;
    },

    initSortByNameIcons: function () {
        var vodSortKey = getLocalStorageData("vodSortKeyByName");
        var seriesSortKey = getLocalStorageData("SeriesSortKeyByName");
        if (vodSortKey === null)
            vodSortKey = 1;
        if (seriesSortKey === null)
            seriesSortKey = 1;

        var currentSortKey = this.currentVideoType === "vod" ? vodSortKey : seriesSortKey;

        if (currentSortKey === 1) {
            $(".sort-direction-icon").attr("src", "images/svg/sort_dsc.svg");
        } else
            $(".sort-direction-icon").attr("src", "images/svg/sort_asc.svg");
    },

    nameSort: function () {
        var keys = this.keys;
        var vodSortKey = getLocalStorageData("vodSortKeyByName");
        var seriesSortKey = getLocalStorageData("SeriesSortKeyByName");
        if (this.currentVideoType === "vod") {
            if (vodSortKey === null) {
                vodSortKey = 1;
            }
            var newVodSortKey = vodSortKey === 1 ? -1 : 1;
            saveToLocalStorage("vodSortKeyByName", newVodSortKey);
        } else {
            if (seriesSortKey === null) {
                seriesSortKey = 1;
            }
            var newSeriesSortKey = seriesSortKey === 1 ? -1 : 1;
            saveToLocalStorage("SeriesSortKeyByName", newSeriesSortKey);
        }

        var currentSortKey = this.currentVideoType === "vod" ? newVodSortKey : newSeriesSortKey;

        if (currentSortKey === 1) {
            $(".sort-direction-icon").attr("src", "images/svg/sort_dsc.svg");
        } else
            $(".sort-direction-icon").attr("src", "images/svg/sort_asc.svg");

        var sortKeyName = "added";
        if (keys.sortSelection === 0)
            sortKeyName = "added";
        else if (keys.sortSelection === 1)
            sortKeyName = "number";
        else if (keys.sortSelection === 2)
            sortKeyName = "rating";
        else if (keys.sortSelection === 3)
            sortKeyName = "name";
        this.changeSortKey(sortKeyName, keys.sortSelection);

        var currentSortKeyByName =
            this.currentVideoType == "vod" ? newVodSortKey : newSeriesSortKey;

        this.movies = getSortedMoviesByName(this.movies, sortKeyName, currentSortKeyByName);
        $("#vod-series-menus-container").html("");
        this.renderCategoryContentByName();
    },

    renderCategoryContentByName: function () {
        var that = this;
        var htmlContents = "";
        var default_icon = "images/placeholder.png";
        var movieKey = "stream_icon";
        var movie__type = this.currentVideoType;
        if (this.currentVideoType !== "vod") movieKey = "cover";

        vodSeries.currentRenderCount = 0;
        vodSeries.renderCountIncrement = 40;

        if (this.currentRenderCount < this.movies.length) {
            showLoader(true);
            var that = this;
            var streamIds = getStreamIds(this.currentModel.favoriteIds, this.currentVideoType);

            this.movies
                .slice(
                    this.currentRenderCount,
                    this.currentRenderCount + this.renderCountIncrement
                )
                .map(function (movie, index) {
                    var isFavorite = streamIds.includes(
                        movie[that.currentModel.movieKey]
                    );

                    if (
                        typeof that.currentModel.savedVideoTimes[movie.stream_id] !=
                        "undefined"
                    ) {
                        if (that.currentModel.savedVideoTimes[movie.stream_id].resumeTime / 1000 >= config.resumeThredholdTime) {
                            var width_ = that.currentModel.savedVideoTimes[movie.stream_id].resumeTime / that.currentModel.savedVideoTimes[movie.stream_id].duration * 100;
                        } else {
                            var width_ = 0;
                        }
                    } else {
                        var width_ = 0;
                    }

                    var rating = "0.0";
                    if (movie.rating !== undefined && movie.rating !== "")
                        rating = (Number(parseFloat(movie.rating))).toFixed(1);

                    htmlContents +=
                        '<div class="vod-series-menu-item-container" data-stream_id="' +
                        (movie__type == "vod" ? movie.stream_id : movie.series_id) +
                        '" ' +
                        'data-index="' +
                        (that.currentRenderCount + index) +
                        '" ' +
                        'onmouseenter="vodSeries.hoverMovieItem(this)" ' +
                        'onclick="vodSeries.handleMenuClick()">' +
                        '<div class="vod-series-menu-item">' +
                        '<div class="rating-badge">' + rating + '</div>' +
                        (isFavorite
                            ? '<div class="favorite-badge"><i><img src="images/star-yellow.png" width="32" height="32" /></i></div>'
                            : "") +
                        '<img class="vod-series-icon" src="' +
                        movie[movieKey] +
                        '" onerror="this.src=\'' +
                        default_icon +
                        '\'" />' +
                        '<div class="vod-series-menu-item-title-wrapper">' +
                        '<div class="resume-progressbar-wrapper ' + (width_ === 0 ? " no-bk" : "") + '">' +
                        '<div class="resume-progress-bar" style="width:' + width_ + '%"></div></div>' +
                        '<div class="vod-series-menu-item-title max-line-2">' +
                        movie.name +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>';
                });
            this.currentRenderCount += this.renderCountIncrement;
            $("#vod-series-menus-container").append(htmlContents);

            this.menuDoms = $(
                "#vod-series-menus-container .vod-series-menu-item-container"
            );
            this.keys.menuSelection = 0
            this.hoverMovieItem(this.menuDoms[this.keys.menuSelection]);
            setTimeout(function () {
                showLoader(false);
            }, 1000);

        }
    },

    hoverNameSort: function () {
        this.keys.focusedPart = "sortByNameSelection";
        $(this.prevDom).removeClass("active");
        $("#name-sort-container").addClass("active");
        this.prevDom = $("#name-sort-container");
    },

    hoverGoBack: function () {
        var keys = this.keys;
        keys.focusedPart = "searchBackSelection";
        $(this.prevDom).removeClass("active");
        $(this.topMenuDoms).removeClass("active");
        $(this.searchBackDoms[0]).addClass("active");
        this.prevDom = this.searchBackDoms[0];
    },

    hoverCategory: function (targetElement) {
        var keys = this.keys;
        var index = $(targetElement).data("index");
        keys.focusedPart = "categorySelection";
        keys.categorySelection = index;
        $(".vod-series-category-item").removeClass('active');
        $(this.prevDom).removeClass("active");
        $(this.topMenuDoms).removeClass("active");
        $(this.categoryDoms[index]).addClass("active");
        this.prevDom = this.categoryDoms[index];
        moveScrollPosition(
            $("#vod-series-categories-container"),
            this.categoryDoms[index],
            "vertical",
            false
        );
    },

    hoverMovieItemSort: function () {
        var keys = this.keys;
        keys.focusedPart = "menuSelection";
        keys.menuSelection = 0;
        $(this.prevDom).removeClass("active");
        this.menuDoms = $(
            "#vod-series-menus-container .vod-series-menu-item-container"
        );

        $(this.menuDoms[0]).addClass("active");
        this.prevDom = this.menuDoms[0];

        moveScrollPosition(
            $("#vod-series-menus-container"),
            this.menuDoms[0],
            "vertical",
            false
        );
    },

    hoverMovieItem: function (targetElement) {
        var index = $(targetElement).data("index");
        var keys = this.keys;
        keys.focusedPart = "menuSelection";
        keys.menuSelection = index;
        $(this.prevDom).removeClass("active");
        $(this.topMenuDoms).removeClass("active");
        $("#name-sort-container").removeClass("active");
        $(".vod-series-menu-item-container").removeClass('active');
        this.menuDoms = $(
            "#vod-series-menus-container .vod-series-menu-item-container"
        );
        $(this.menuDoms[index]).addClass("active");
        this.prevDom = this.menuDoms[index];
        this.unFocusSearchItem();
        clearTimeout(this.channel_hover_timer);
        moveScrollPosition(
            $("#vod-series-menus-container"),
            this.menuDoms[keys.menuSelection],
            "vertical",
            false
        );
        if (keys.menuSelection >= this.currentRenderCount - 5)
            this.renderCategoryContent("");
    },

    getCategoryName: function (categoryId, categories) {
        var categoryName = categories.filter(function (category) {
            return category.category_id == categoryId
        })[0].category_name.toLowerCase();
        return categoryName;
    },

    handleMenuClick: function () {
        var keys = this.keys;

        switch (keys.focusedPart) {
            case "menuSelection":
                var selectedCategoryID = this.categories[keys.categorySelection].category_id;
                if (this.currentVideoType === "vod") {
                    currentMovie = this.movies[keys.menuSelection];
                    if (this.currentCategoryIndex == 0) {
                        vodSummary.showMovie();
                    } else {
                        if (selectedCategoryID == 'all') {
                            var isAdult = checkForAdultByVideo(currentMovie.category_id, VodModel.categories);
                            if (isAdult && !parentControlDisable) {
                                parentConfirm.init(currentRoute, 'all', 'vod');
                            } else {
                                vodSummary.init("vod-series-page");
                            }
                        } else
                            vodSummary.init("vod-series-page");
                    }
                } else {
                    currentSeries = this.movies[keys.menuSelection];
                    if (keys.selectedCategoryIndex == 0) {
                        seriesSummary.showEpisodesFromRecentlyViewed();
                    } else {
                        if (selectedCategoryID === 'all') {
                            var isAdult = checkForAdultByVideo(currentSeries.category_id, SeriesModel.categories);
                            if (isAdult && !parentControlDisable) {
                                parentConfirm.init(currentRoute, 'all', 'series');
                            }
                            else
                                seriesSummary.init("vod-series-page");
                        } else
                            seriesSummary.init("vod-series-page");
                    }
                }
                break;
            case "vodSeriesSearchBar":
                $("#vod-series-search-value").focus();
                break;
            case "categorySelection":
                var category = this.categories[keys.categorySelection];
                if (this.currentCategoryIndex == keys.categorySelection) return;
                var isAdult = checkForAdult(category, "category", []);
                if (isAdult && !parentControlDisable) {
                    parentConfirm.init(currentRoute, '', '');
                    return;
                }
                keys.selectedCategoryIndex = keys.categorySelection;
                this.showCategoryContent(false);
                break;
            case "sortSelection":
                $("#sort-button-container").trigger("click");
                keys.focusedPart = "sortButton";
                break;
            case "sortButton":
                $(this.sortSelectionDoms[keys.sortSelection]).trigger("click");
                break;
            case "searchBackSelection":
                if (keys.searchBackSelection == 1) {
                    $(".search-button").trigger("click");
                }
                if (keys.searchBackSelection == 0) {
                    $(".back-button").trigger("click");
                }
                break;
            case "topMenuSelection":
                $(this.topMenuDoms[keys.topMenuSelection]).trigger("click");
                break;
            case "sortByNameSelection":
                this.nameSort();
                break;
        }
    },

    focusSearchItem: function () {
        var keys = this.keys;
        keys.focusedPart = "vodSeriesSearchBar";
        $(this.topMenuDoms).removeClass("active");
        $(this.prevDom).removeClass("active");
        $("#search-by-video-title").addClass("active");
        $(".search-icon").attr("src", "images/search-yellow.png");
        this.prevDom = $("#search-by-video-title");
    },

    unFocusSearchItem: function () {
        $("#search-by-video-title").removeClass("active");
        $(".search-icon").attr("src", "images/search.png");
    },

    hoverTopBarMenu: function () {
        var keys = this.keys;
        keys.focusedPart = "topMenuSelection";
        keys.topMenuSelection = this.currentVideoType == "vod" ? 2 : 3;
        this.unFocusSearchItem();
        $(this.topMenuDoms).removeClass("active");
        $(this.prevDom).removeClass("active");
        this.prevDom = this.topMenuDoms[keys.topMenuSelection];
        $(this.topMenuDoms[keys.topMenuSelection]).addClass("active");
    },

    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        var menus = this.menuDoms;
        switch (keys.focusedPart) {
            case "categorySelection":
                keys.categorySelection += increment;
                if (keys.categorySelection < 0) {
                    keys.categorySelection = 0;
                    this.searchBackMove();
                    return;
                }
                if (keys.categorySelection >= this.categoryDoms.length) {
                    keys.categorySelection = this.categoryDoms.length - 1;
                    return;
                }
                this.hoverCategory(this.categoryDoms[keys.categorySelection]);
                break;
            case "menuSelection":
                if (keys.menuSelection > -1 && keys.menuSelection < 5) {
                    if (increment < 0) {
                        this.hoverSortKeyModal();
                    } else {
                        keys.menuSelection += 5 * increment;
                        if (keys.menuSelection >= menus.length)
                            keys.menuSelection = menus.length - 1;
                        if (keys.menuSelection >= this.currentRenderCount - 5)
                            this.renderCategoryContent("");
                        this.hoverMovieItem(this.menuDoms[keys.menuSelection]);
                    }
                } else {
                    keys.menuSelection += 5 * increment;
                    if (keys.menuSelection >= menus.length)
                        keys.menuSelection = menus.length - 1;
                    if (keys.menuSelection >= this.currentRenderCount - 5)
                        this.renderCategoryContent("");
                    this.hoverMovieItem(this.menuDoms[keys.menuSelection]);
                }
                break;
            case "searchBackSelection":
                if (increment > 0) {
                    keys.focusedPart = "categorySelection";
                    keys.categorySelection = 0;
                    $(".back-button").removeClass("active");
                    $(".search-button").removeClass("active");
                    this.hoverCategory(this.categoryDoms[keys.categorySelection]);
                } else {
                    keys.focusedPart = "topMenuSelection";
                    $(".back-button").removeClass("active");
                    $(".search-button").removeClass("active");
                    this.hoverTopBarMenu();
                }
                break;
            case "vodSeriesSearchBar":
                if (increment > 0) {
                    this.unFocusSearchItem();
                    $("#vod-series-search-value").blur();
                    $(this.searchInputDom).removeClass("active");
                    $("#search-by-video-title").removeClass("active");
                    keys.focusedPart = "sortSelection";
                    $("#sort-button-container").addClass("active");
                    $(".vod-series-menu-item-container").removeClass("active");
                }
                break;
            case "sortButton":
                $(".vod-series-menu-item-container").removeClass("active");
                keys.sortSelection += increment;
                if (keys.sortSelection < 0 || keys.sortSelection > 3) {
                    keys.sortSelection = 0;
                }
                this.hoverChangeSortKey(keys.sortSelection);
                break;
            case "sortSelection":
            case "sortByNameSelection":
                $("#sort-button-container").removeClass("active");
                $("#name-sort-container").removeClass("active");
                if (increment < 0) {
                    this.hoverTopBarMenu();
                } else {
                    this.keys.focusedPart = "menuSelection";
                    $(".vod-series-menu-item-container").removeClass("active");
                    $(this.menuDoms[this.keys.menuSelection]).addClass("active");
                }
                break;
            case "topMenuSelection":
                if (increment > 0) {
                    $(this.topMenuDoms).removeClass("active");
                    this.searchBackMove();
                }
                break;
        }
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;

        switch (keys.focusedPart) {
            case "categorySelection":
                if (increment > 0) {
                    if (this.movies.length > 0)
                        this.hoverMovieItem(this.menuDoms[keys.menuSelection]);
                } else {
                    this.searchBackMove();
                }
                break;
            case "menuSelection":
                if (keys.menuSelection % 5 == 0 && increment < 0) {
                    this.hoverCategory(this.categoryDoms[keys.categorySelection]);
                    return;
                }
                keys.menuSelection += increment;
                if (keys.menuSelection < 0) {
                    keys.menuSelection = 0;
                    this.hoverCategory(this.categoryDoms[keys.categorySelection]);
                    return;
                }
                if (keys.menuSelection >= this.menuDoms.length)
                    keys.menuSelection = this.menuDoms.length - 1;

                this.hoverMovieItem(this.menuDoms[keys.menuSelection]);
                if (
                    increment > 0 &&
                    keys.menuSelection >= this.currentRenderCount - 5
                )
                    this.renderCategoryContent("");
                break;
            case "searchBackSelection":
                keys.searchBackSelection += increment;

                if (keys.searchBackSelection == 1) {
                    $(".back-button").removeClass("active");
                    $(".search-button").addClass("active");
                } else if (keys.searchBackSelection <= 0) {
                    keys.searchBackSelection = 0;
                    $(".search-button").removeClass("active");
                    $(".back-button").addClass("active");
                } else if (keys.searchBackSelection > 1) {
                    $(".search-button").removeClass("active");
                    $(".back-button").removeClass("active");
                    if (this.movies.length > 0)
                        this.hoverMovieItem(this.menuDoms[keys.menuSelection]);
                }
                break;
            case "topMenuSelection":
                keys.topMenuSelection += increment;

                if (keys.topMenuSelection < 0) {
                    keys.topMenuSelection = 0;
                } else if (keys.topMenuSelection >= this.topMenuDoms.length) {
                    keys.topMenuSelection = this.topMenuDoms.length - 1;
                    this.focusSearchItem();
                } else
                    this.activeTopMenuItem();
                break;
            case "vodSeriesSearchBar":
                if (window.innerWidth / window.innerHeight === (16 / 9) && increment < 0) {
                    this.keys.focusedPart = "topMenuSelection";
                    $("#vod-series-search-value").blur();
                    this.unFocusSearchItem();
                    this.activeTopMenuItem();
                }
                break;
            case "sortSelection":
                if (increment < 0) {
                    $("#sort-button-container").removeClass("active");
                    this.searchBackMove();
                    return;
                } else {
                    $("#sort-button-container").removeClass("active");
                    keys.focusedPart = "sortByNameSelection";
                    this.hoverNameSort();
                }
                break;
            case "sortByNameSelection":
                if (increment < 0) {
                    keys.focusedPart = "sortSelection";
                    $("#sort-button-container").addClass("active");
                    $(".vod-series-menu-item-container").removeClass("active");
                    $("#name-sort-container").removeClass("active");
                }
                break;
        }
    },

    HandleKey: function (e) {
        switch (e.keyCode) {
            case 65376: // Done
            case 65385: // Cancel
                $("input").blur();
                break;
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
            case tvKey.ColorF2Yellow:
                this.addOrRemoveFav();
                break;
            case tvKey.ColorF3Blue:
                break;
            case tvKey.ColorF1Green:
                break;
            case tvKey.ColorF0Red:
                break;
            case tvKey.MediaPause:
                this.playOrPause();
                break;
            default:
                console.log("No matching");
        }
    }
};
