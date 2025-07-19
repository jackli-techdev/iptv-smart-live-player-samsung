"use strict";
var channel = {
    prevFocusDom: [],
    topMenuDoms: $(".menu-item"),
    bottomDoms: $(".live-catchup-button-list"),
    videoControlDoms: $(".live-video-control-icon i"),
    favButtonDom: $("#live-Favorite-button"),
    favIconDom: $('#live-video-control-fav-icon'),
    channelDoms: [],
    categoryDoms: [],
    categories: [],
    movies: [],
    currentCategoryIndex: -1,
    currentChannelId: 0,
    shortEpgLimitCount: 30,
    channelHoverTimer: null,
    next_programme_timer: null,
    channelHoverTimeout: 500,
    fullScreenTimer: null,
    isControlBarVisible: false,
    streamId: 0,
    prevRoute: "",
    audioTracksDoms: [],
    audioTrackConfirmBtnDoms: $("#channel-audio-tracks-modal .audio-track-btn"),
    currentAudioTrackIndex: -1,
    channelNum: 0,
    channelNumTimer: null,
    currentRenderCount: 0,
    renderCountIncrement: 40,
    keys: {
        focusedPart: "categorySelection",
        categorySelection: 0,
        channelSelection: 0,
        topMenuSelection: 1,
        videoControlSelection: 0,
        controlBar: 0,
        prevFocus: "",
        audioTracksSelection: 0,
        audioTrackConfirmSelection: 0
    },

    init: function () {
        currentRoute = "channel-page";
        var _this = this;
        this.prevFocusDom = [];
        var keys = this.keys;
        var categories = movieHelper.getCategories("live", false, true);
        this.categories = categories;

        displayCurrentPage(currentRoute);
        this.renderSearchBar();
        this.renderCategoryDoms();
        $(this.topMenuDoms).removeClass("selected");
        $(this.topMenuDoms).removeClass("active");
        $(this.topMenuDoms[1]).addClass("selected");
        $(this.bottomDoms).removeClass("active");
        var currentCategoryIndex = -1;
        this.currentRenderCount = 0;
        this.emptyChannelContainer();
        for (var i = 0; i < categories.length; i++) {
            if (categories[i].movies.length > 0) {
                currentCategoryIndex = i;
                break;
            }
        }

        keys.categorySelection = currentCategoryIndex;
        this.currentCategoryIndex = currentCategoryIndex;
        this.hoverCategory(currentCategoryIndex);

        this.showCategoryChannels(
            categories[currentCategoryIndex].category_name,
            currentCategoryIndex
        );

        if (categories[currentCategoryIndex].movies.length > 0) {
            this.hoverChannel(0);
            this.showMovie(this.movies[0]);
        }

        $("#channel-page-bottom-container").removeClass("hide");
    },

    renderSearchBar: function () {
        $("#search-by-video-title").innerHTML = "";
        $("#search-by-video-title").html(
            '<div id="vod-series-search-bar" onmouseenter="channel.focusSearchItem()">' +
            '<img src="images/search.png" class="search-icon">' +
            '<input id="search-value" onkeyup="channel.searchValueChange()" onchange="channel.searchValueChange()">' +
            "</div>"
        );
    },

    renderCategoryDoms: function () {
        var html = "";
        this.categories.map(function (item, index) {
            var translatedCategoryName = "";
            if (item.category_id === "all") {
                translatedCategoryName = currentWords['all'];
                translatedCategoryName = translatedCategoryName == undefined ? "All" : translatedCategoryName;
            } else if (item.category_id === "recent") {
                translatedCategoryName = currentWords['recently_viewed'];
                translatedCategoryName = translatedCategoryName == undefined ? "Recently Viewed" : translatedCategoryName;
            } else if (item.category_id === "favorite") {
                translatedCategoryName = currentWords['favorites'];
                translatedCategoryName = translatedCategoryName == undefined ? "Favorites" : translatedCategoryName;
            } else
                translatedCategoryName = item.category_name;

            var cIndex = item.category_name === 'All' ? 'live-all-category' : '';
            html +=
                '<div class="channel-page-category-item flex-container ' + cIndex + '" ' +
                '   onmouseenter="channel.hoverCategory(' +
                index +
                ')" ' +
                '   onclick="channel.handleMenuClick()"' +
                ">" +
                '<div class = "live-category-name flex-container">' +
                translatedCategoryName +
                "</div>" +
                '<div class="flex-container live-category-length' + (item.category_id === "favorite" ? " live-fav-category" : item.category_id === "recent" ? " live-recent-category-length" : "") + '">' +
                item.movies.length +
                "</div>" +
                "</div>";
        });
        $("#channel-page-categories-container").html(html);
        this.categoryDoms = $(".channel-page-category-item");
    },

    selectCategory: function (category_name, category_index) {
        var keys = this.keys;
        $(".full-screen-category-name").text(
            category_index + 1 + " • Group : " + category_name
        );
        $(".channel-page-category-item").removeClass("selected");
        this.categoryDoms = $(".channel-page-category-item");
        $(this.categoryDoms[keys.categorySelection]).addClass("selected");
        moveScrollPosition(
            $("#channel-page-categories-container"),
            this.categoryDoms[keys.categorySelection],
            "vertical",
            false
        );
    },

    goBack: function () {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "audioTracksModal":
                keys.audioTracksSelection = 0;
                $("#channel-audio-tracks-modal").modal("hide");
                keys.focusedPart = "fullScreen";
                break;
            case "audioTrackConfirmBtn":
                keys.audioTracksSelection = 0;
                $("#channel-audio-tracks-modal").modal("hide");
                keys.focusedPart = "fullScreen";
                break;
            case "videoControlSelection":
                if (this.isControlBarVisible) {
                    clearTimeout(this.fullScreenTimer);
                    this.hideControlBar();
                } else {
                    this.zoomInOut(false);
                }
                break;
            case "fullScreen":
                if (this.prevRoute == "entire-search-page") {
                    closeVideo();
                    $("#entire-search-page").removeClass("hide");
                    $(".top-bar").addClass("hide");
                    $("#channel-page").addClass("hide");
                    $("#channel-page .player-container").removeClass("expanded");
                    currentRoute = this.prevRoute;
                } else {
                    if (this.isControlBarVisible) {
                        clearTimeout(this.fullScreenTimer);
                        this.hideControlBar();
                    } else {
                        this.zoomInOut(false);
                        $(".top-bar").removeClass("hide");
                    }
                }
                break;
            case "channelSearchBar":
                $("#search-value").blur();
                $("#search-value").val("");
                this.unFocusSearchItem();
                this.Exit();
                break;
            case "categorySelection":
            case "channelSelection":
            case "bottomSelection":
            case "topMenuSelection":
                this.Exit();
                break;
        }
    },

    Exit: function () {

        closeVideo();

        var keys = this.keys;
        keys.focusedPart = "channelSelection";
        this.zoomInOut(false);
        $("#channel-page").addClass("hide");
        $(this.bottomDoms).removeClass("active");
        clearTimeout(this.fullScreenTimer);
        $("#home-page").removeClass("hide");
        currentRoute = "home-page";
    },

    showCategoryChannels: function (category_name, category_index) {
        var categories = this.categories;
        var category = categories[category_index];
        this.movies = category.movies;
        if (this.movies.length === 0) {
            var noChannels = currentWords["no_channels"];
            showToast(noChannels, "");
            return;
        } else {
            this.renderChannels();
        }
    },

    renderChannels: function () {
        var _this = this;
        var streamIds = getStreamIds(LiveModel.favoriteIds, 'live');
        var htmlContents = "";
        this.movies
            .slice(
                _this.currentRenderCount,
                _this.currentRenderCount + this.renderCountIncrement
            ).map(function (movie, index) {
                var tempChannelNumber = _this.currentRenderCount + index + 1;
                var epg_icon = '<img src="images/settings/clock.png"  class = "catchup-click-img" />';
                htmlContents +=
                    '<div class="channel-menu-item flex-container" data-channel_id="' +
                    movie.stream_id +
                    '" ' +
                    '   data-index="' + tempChannelNumber +
                    '" ' +
                    '   onmouseenter="channel.hoverChannel(' +
                    (tempChannelNumber - 1) +
                    ')"' +
                    '   onclick="channel.handleMenuClick()"' +
                    ">" +
                    '<span class = "flex-container align-center"><span class="channel-number">' +
                    tempChannelNumber +
                    "</span>" +
                    '<img class="channel-icon" src="' +
                    movie.stream_icon +
                    '" onerror="this.src=\'' +
                    config.liveIcon +
                    "'\">" +
                    (movie.tv_archive == 1 ? epg_icon : "") +
                    " " +
                    "</span>" +
                    '<span class = "live-channel-name">' + movie.name + '</span>' +
                    (streamIds.includes(movie.stream_id)
                        ? '<i><img src="images/star-yellow.png" class="favorite-icon" /></i>'
                        : "") +
                    "</div>";
            });
        _this.currentRenderCount += this.renderCountIncrement;
        $("#channel-page-menu-container").append(htmlContents);
        this.channelDoms = $("#channel-page-menu-container .channel-menu-item");

    },

    emptyChannelContainer: function () {
        $("#channel-page-menu-container").html("");
    },

    goChannelNum: function (new_value) {
        var keys = this.keys;
        var tempNum = this.channelNum;
        if (tempNum != 0 || (tempNum == 0 && new_value != 0)) {
            tempNum = tempNum * 10 + new_value;
            this.channelNum = tempNum;
            var that = this;
            $('#keyboard-channel-number').text(tempNum);
            if (this.channelNumTimer) {
                clearTimeout(this.channelNumTimer);
                this.channelNumTimer = null;
            }
            this.channelNumTimer = setTimeout(function () {
                var movies = that.movies;
                var isMovie = false;
                if (tempNum > movies.length)
                    isMovie = false;
                else {
                    isMovie = true;
                    keys.channelSelection = tempNum - 1;
                    that.hoverChannel(keys.channelSelection);
                }
                if (!isMovie) {
                    var noChannels = currentWords["no_channels"];
                    showToast(noChannels, "");
                }
                $('#keyboard-channel-number').text("");
                that.channelNum = 0;
            }, 2000);
        }
    },

    updateFavCategoryLength: function (increment) {
        var updatedLength = LiveModel.favoriteIds.length + increment;
        $(".live-fav-category").text(updatedLength)
    },

    addOrRemoveFav: function () {
        var keys = this.keys;

        var streamIds = getStreamIds(LiveModel.favoriteIds, 'live');

        if (channel.prevRoute === 'entire-search-page') {
            var isFavorite = streamIds.includes(this.streamId);
        } else {
            var isFavorite = streamIds.includes(currentMovie.stream_id);
            currentMovie = this.movies[keys.channelSelection];
        }

        var action = isFavorite ? 'remove' : 'add';
        var word = isFavorite ? (currentWords['add_to_favorite'] || 'Add to Favorite') : (currentWords['remove_favorites'] || 'Remove from Favorites');
        if (action === 'add') {
            this.updateFavCategoryLength(1);
            movieHelper.addRecentOrFavoriteMovie('live', currentMovie, 'favorite');
            $(this.channelDoms[keys.channelSelection]).append('<i><img src="images/star-yellow.png" class="favorite-icon" /></i>');
            $('.fav-img').attr('src', 'images/star-yellow.png');
            if (this.categories[this.currentCategoryIndex].category_name === "Favorites")
                this.showCategoryChannels(
                    this.categories[this.currentCategoryIndex].category_name,
                    this.currentCategoryIndex
                );
        } else {
            this.updateFavCategoryLength(-1);
            movieHelper.removeRecentOrFavoriteMovie('live', currentMovie.stream_id, 'favorite');
            $(this.channelDoms[keys.channelSelection]).find('.favorite-icon').remove();
            $('.fav-img').attr('src', 'images/star.png');
            if (this.categories[this.currentCategoryIndex].category_name === "Favorites")
                this.showCategoryChannels(
                    this.categories[this.currentCategoryIndex].category_name,
                    this.currentCategoryIndex
                );
        }
        $(this.favButtonDom).text(word).data('action', action).trigger('update');
        $(this.favIconDom).text(word).data('action', action).trigger('update');
    },

    goToMovies: function () {

        closeVideo();

        $("#channel-page .player-container").removeClass("expanded");
        $("#channel-page-bottom-container").removeClass("hide");
        this.keys.focusedPart = "channelSelection";
        $("#live-channel-controls-container").slideUp();
        home.clickMainMenu(1);
    },

    hoverGoToMovies: function () {
        $("#channel-page .player-container").removeClass("expanded");
        $("#channel-page-bottom-container").removeClass("hide");
        this.keys.focusedPart = "channelSelection";
        $("#live-channel-controls-container").slideUp();
    },

    goToSeries: function () {
        closeVideo();
        $("#channel-page .player-container").removeClass("expanded");
        $("#channel-page-bottom-container").removeClass("hide");
        this.keys.focusedPart = "channelSelection";
        $("#live-channel-controls-container").slideUp();
        home.clickMainMenu(2);
    },

    hoverGoToSeries: function () {
        closeVideo();
        $("#channel-page .player-container").removeClass("expanded");
        $("#channel-page-bottom-container").removeClass("hide");
        this.keys.focusedPart = "channelSelection";
        $("#live-channel-controls-container").slideUp();
        home.clickMainMenu(2);
    },

    goToEntireSearch: function () {
        closeVideo();
        $("#channel-page .player-container").removeClass("expanded");
        $("#channel-page-bottom-container").removeClass("hide");
        this.keys.focusedPart = "channelSelection";
        $("#live-channel-controls-container").slideUp();
        entireSearch.entireSearch("channel-page");
    },

    goToCatchUpPage: function () {
        var keys = this.keys;

        this.channelDoms = $("#channel-page-menu-container .channel-menu-item");
        this.hoverChannelId = $(this.channelDoms[keys.channelSelection]).data(
            "channel_id"
        );
        var movie = getCurrentMovieFromId(
            this.hoverChannelId,
            this.movies,
            "stream_id"
        );
        if (settings.playlist.playlistType === "xc") {
            channel.getAllProgrammes(this.hoverChannelId, movie);
        }
        else {
            keys.focusedPart = "fullScreen";
            showNoEPGToast();
        }
    },

    hoverGoToCatchUpPage: function (index) {
        var keys = this.keys;
        keys.focusedPart = "bottomSelection";
        this.unFocusSearchItem();
        keys.bottomSelection = index;
        $(this.prevFocusDom).removeClass("active");
        this.prevFocusDom = this.bottomDoms[index];
        $(this.bottomDoms[index]).addClass("active");
    },

    hoverVideoControlIcon: function (index) {
        var keys = this.keys;
        keys.videoControlSelection = index;
        if (keys.videoControlSelection < 0) keys.videoControlSelection = 0;
        if (keys.videoControlSelection >= this.videoControlDoms.length)
            keys.videoControlSelection = this.videoControlDoms.length - 1;
        $(this.videoControlDoms).removeClass("active");
        $(this.videoControlDoms[keys.videoControlSelection]).addClass("active");
        this.showControlBar(false);
    },

    getAllProgrammes: function (streamId, movie) {
        var allEPGUrl = getAllEPGUrl(streamId);
        var that = this;
        $.ajax({
            method: "get",
            url: allEPGUrl,
            success: function (data) {

                if (!data.epg_listings || data.epg_listings.length === 0) {
                    showNoEPGToast();
                    return;
                }

                settings.saveSettings("movieProgrammes", data.epg_listings, "");
                var temp_epgData = [];

                var formatText = "Y-MM-DD HH:mm";
                data.epg_listings.map(function (item) {
                    var endFormat = isTimestampOrDateFormat(item.end);

                    temp_epgData.push({
                        start: getLocalChannelTime(item.start).format(formatText),
                        stop: endFormat === "dateFormat" ? getLocalChannelTime(item.end).format(formatText) : getLocalChannelTime(item.stop).format(formatText),
                        title: getAtob(item.title),
                        description: getAtob(item.description),
                        channel_id: item.channel_id,
                        lang: item.lang,
                        id: item.id,
                        start_timestamp: item.start_timestamp,
                        stop_timestamp: item.stop_timestamp,
                        epg_id: item.epg_id,
                        has_archive: item.has_archive == undefined ? 0 : item.has_archive
                    });
                });

                if (temp_epgData.length > 0) {
                    var programmes = temp_epgData;
                    closeVideo();
                    $("#channel-page").addClass("hide");
                    catchup.init(movie, programmes);
                } else {
                    showNoEPGToast();
                    that.keys.focusedPart = "fullScreen";
                }
            },
            error: function (e) {
                console.log(e);
            }
        });
    },

    showNextProgrammes: function () {
        var id = "next-program-container";
        var movie = this.movies[this.keys.channelSelection];
        $("#channel-title").text(movie.name);

        var temp = LiveModel.getNextProgrammes(this.programmes);

        var current_program_exist = temp["current_program_exist"];
        var programmes = temp.programmes;
        var k = 0;
        var htmlContent = "";
        for (var i = 0; i < programmes.length; i++) {
            htmlContent +=
                '<div class="next-program-item ' +
                (k == 0 && current_program_exist ? "current" : "") +
                '">' +
                '<span class="program-time">' +
                programmes[i].start.substring(11) +
                " ~ " +
                programmes[i].stop.substring(11) +
                "</span>" +
                programmes[i].title +
                "</div>";
            k++;
            if (k >= 4) break;
        }

        if (k > 0) $("#" + id).html(htmlContent).show();
        else $("#" + id).hide().html("");

        var current_program,
            next_program,
            current_program_title = "No Info",
            current_program_time = "",
            next_program_title = "No Info",
            next_program_time = "";
        if (current_program_exist) {
            current_program = programmes[0];
            if (programmes.length > 1) next_program = programmes[1];
        } else {
            if (programmes.length > 0) next_program = programmes[0];
        }
        if (current_program) {
            current_program_title = current_program.title;
            current_program_time =
                current_program.start.substring(11) +
                " ~ " +
                current_program.stop.substring(11);
        }
        if (next_program) {
            next_program_title = next_program.title;
            next_program_time =
                next_program.start.substring(11) +
                " ~ " +
                next_program.stop.substring(11);
        }
        $(".full-screen-program-name.current").text(current_program_title);
        $(".full-screen-program-time.current").text(
            current_program != undefined ? current_program.start.substring(11) : ""
        );
        $(".full-screen-program-name.next").text(next_program_title);
        $(".full-screen-program-time.next").text(
            next_program != undefined ? next_program.start.substring(11) : ""
        );
    },

    updateNextProgrammes: function () {
        this.showNextProgrammes();

        clearInterval(this.next_programme_timer);
        var that = this;
        this.next_programme_timer = setInterval(function () {
            that.showNextProgrammes();
        }, 60000);
    },

    getEpgProgrammes: function () {
        var that = this;
        var programmes = [];
        this.programmes = [];
        that.showNextProgrammes();
        var movie = this.movies[this.keys.channelSelection];
        if (settings.playlist.playlistType === "xc") {
            if (timeFormat == 12) {
                var formatText = "YYYY-MM-DD hh:mm a";
            } else var formatText = "YYYY-MM-DD HH:mm";

            var playlist = settings.playlist;
            // var eurl = playlistEndpoint + "player_api.php?username=" + playlist.userName + "&password=" + playlist.password + "&action=get_short_epg&stream_id=" + movie.stream_id + "&limit=" + this.shortEpgLimitCount;
            var eurl = playlistEndpoint + "player_api.php?username=" + playlist.userName + "&password=" + playlist.password + "&action=get_simple_data_table&stream_id=" + movie.stream_id;
            $.ajax({
                method: "get",
                url: eurl,
                success: function (data) {
                    data.epg_listings.map(function (item) {
                        var endFormat = isTimestampOrDateFormat(item.end);
                        programmes.push({
                            start: getLocalChannelTime(item.start).format(formatText),
                            stop: endFormat === "dateFormat" ? getLocalChannelTime(item.end).format(formatText) : getLocalChannelTime(item.stop).format(formatText),
                            title: getAtob(item.title),
                            description: getAtob(item.description),
                            channel_id: item.channel_id,
                            lang: item.lang,
                            id: item.id,
                            start_timestamp: item.start_timestamp,
                            stop_timestamp: item.stop_timestamp,
                            epg_id: item.epg_id,
                            has_archive: item.has_archive == undefined ? 0 : item.has_archive
                        });
                    });

                    var currentDate = getTodayDate(formatText);
                    var currentLiveProgram = programmes.filter(function (program) {
                        return program.start < currentDate;
                    });

                    if (currentLiveProgram.length > 0) {
                        channel.currentProgramDuration =
                            currentLiveProgram[0].stop_timestamp -
                            currentLiveProgram[0].start_timestamp;
                    }

                    that.programmes = programmes;
                    that.updateNextProgrammes();
                }
            });
        }
    },

    zoomInOut: function (state) {
        if (!state) {
            $("#channel-page .player-container").removeClass("expanded");
            $("#channel-page-bottom-container").removeClass("hide");
            $("#live-channel-controls-container").slideUp();
            this.keys.focusedPart = "channelSelection";
        } else {
            $("#channel-page-bottom-container").addClass("hide");
            $("#channel-page .player-container").addClass("expanded");

            $("#live-channel-controls-container").slideDown();
            var that = this;
            var keys = this.keys;
            this.isControlBarVisible = true;
            keys.focusedPart = "fullScreen";
            clearTimeout(this.timeOut);
            this.timeOut = setTimeout(function () {
                that.hideControlBar();
            }, 10000);
        }
    },

    showMovie: function (currentChannel) {
        currentMovie = currentChannel;
        var url,
            movie_id = currentMovie.stream_id;
        if (settings.playlist.playlistType === "xc") {
            var extension = getLocalStorageData('liveStreamFormat');
            if (extension === null)
                extension = 'ts';
            url = getMovieUrl(movie_id, "live", extension);
        } else if (settings.playlist.playlistType === "general")
            url = currentMovie.url;
        closeVideo();
        mediaPlayer.live_init(
            "channel-page-video",
            "channel-page"
        );
        try {
            mediaPlayer.playAsync(url);
        } catch (e) { }
        this.currentChannelId = movie_id;

        $(".full-screen-channel-name").text(
            currentMovie.num + " " + currentMovie.name
        );
        $(".full-screen-channel-logo").attr("src", currentMovie.stream_icon);
        if (!checkForAdult(currentMovie, "movie", LiveModel.categories))
            movieHelper.addRecentOrFavoriteMovie("live", currentMovie, "recent"); // add to recent live channels
        this.checkAddFavStatus(currentMovie);
    },

    checkAddFavStatus: function (currentMovie) {
        var streamIds = getStreamIds(LiveModel.favoriteIds, 'live');
        var isFavorite = streamIds.includes(currentMovie.stream_id);
        if (isFavorite) {
            $(this.channelDoms[this.keys.channelSelection]).append('<i><img src="images/star-yellow.png" class="favorite-icon" /></i>');
            $('.fav-img').attr('src', 'images/star-yellow.png');
        } else {
            $(this.channelDoms[this.keys.channelSelection]).find('.favorite-icon').remove();
            $('.fav-img').attr('src', 'images/star.png');
        }

        var word = isFavorite ? (currentWords['remove_favorites'] || 'Remove from Favorites') : (currentWords['add_to_favorite'] || 'Add to Favorite');

        $(this.favButtonDom).text(word).data('action', isFavorite ? 'remove' : 'add').trigger('update');
        $(this.favIconDom).text(word).data('action', isFavorite ? 'remove' : 'add').trigger('update');
    },

    showEntireSearchLiveMovie: function (currentChannel, prevRoute) {
        this.prevRoute = prevRoute;
        currentRoute = "channel-page";
        var keys = this.keys;
        currentMovie = currentChannel
        this.streamId = currentChannel.stream_id;
        var url,
            movie_id = currentChannel.stream_id;
        if (settings.playlist.playlistType === "xc") {
            var extension = getLocalStorageData('liveStreamFormat');
            if (extension === null)
                extension = 'ts';
            url = getMovieUrl(movie_id, "live", extension);
        } else if (settings.playlist.playlistType === "general")
            url = currentChannel.url;
        closeVideo();
        mediaPlayer.live_init(
            "channel-page-video",
            "channel-page"
        );
        try {
            mediaPlayer.playAsync(url);
        } catch (e) { }
        this.currentChannelId = movie_id;
        $(".full-screen-channel-name").text(currentMovie.name);
        $(".full-screen-channel-logo").attr("src", currentMovie.stream_icon);

        $("#channel-page-bottom-container").addClass("hide");
        $("#channel-page .player-container").addClass("expanded");
        this.showControlBar(true);
        $("#app").removeClass("hide");
        $("#channel-page").removeClass("hide");
        $(".top-bar").removeClass("hide");
        keys.focusedPart = "fullScreen";
    },

    showNextChannel: function (increment) {
        var keys = this.keys;
        var prevFocus = keys.focusedPart;
        keys.channelSelection += increment;
        if (keys.channelSelection < 0) keys.channelSelection = 0;
        if (keys.channelSelection >= this.channelDoms.length)
            keys.channelSelection = this.channelDoms.length - 1;
        var that = this;
        setTimeout(function () {
            var movie = that.movies[keys.channelSelection];
            that.currentChannelId = movie.stream_id;
            that.showMovie(that.movies[keys.channelSelection]);
        }, 400);
        this.hoverChannel(keys.channelSelection);
        this.showControlBar(true);
    },

    playOrPause: function () {
        if (mediaPlayer.state == mediaPlayer.STATES.PLAYING) {
            try {
                mediaPlayer.pause();
                changePlayerStateIcon(this.videoControlDoms[1], false);
            } catch (e) { }
        } else {
            try {
                mediaPlayer.play();
                changePlayerStateIcon(this.videoControlDoms[1], true);
            } catch (e) { }
        }
    },

    getCurrentCategorMovies: function () {
        var category = this.categories[this.currentCategoryIndex];
        return category.movies;
    },

    searchValueChange: function () {
        var search_value = $("#search-value").val();
        var currentMovies = JSON.parse(JSON.stringify(this.movies));
        var currentCategoryMovies = this.getCurrentCategorMovies();

        var filtered_movies = [];
        if (search_value == "") {
            filtered_movies = currentCategoryMovies;
        } else {
            search_value = search_value.toLowerCase();
            filtered_movies = currentMovies.filter(function (movie) {
                if (!movie.name) return false;
                return movie.name.toLowerCase().includes(search_value);
            });
        }

        this.keys.channelSelection = 0;
        this.currentRenderCount = 0;
        this.emptyChannelContainer();
        this.movies = filtered_movies;
        this.filtered_movies = filtered_movies;
        this.renderChannels();
    },

    hideControlBar: function () {
        $("#live-channel-controls-container").slideUp();
        $("#live-channel-title").slideUp();
        $(".control-level-1").removeClass("hide");
        $(".control-level-2").addClass("hide");
        this.isControlBarVisible = false;
    },

    showControlBar: function (move_focus) {
        $("#live-channel-controls-container").slideDown();
        var that = this;
        var keys = this.keys;
        this.isControlBarVisible = true;
        if (move_focus) {
            keys.focusedPart = "videoControlSelection";
            keys.prevFocus = "videoControlSelection";
            keys.videoControlSelection = 0;
            $(this.videoControlDoms).removeClass("active");
            $(this.videoControlDoms[keys.videoControlSelection]).addClass("active");
        }
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(function () {
            that.hideControlBar();
        }, 10000);
    },

    hoverCategory: function (index) {
        var keys = this.keys;
        keys.focusedPart = "categorySelection";
        keys.categorySelection = index;
        $(this.prevFocusDom).removeClass("active");
        $(this.categoryDoms[index]).addClass("active");
        this.prevFocusDom = this.categoryDoms[index];
        moveScrollPosition(
            $("#channel-page-categories-container"),
            this.categoryDoms[index],
            "vertical",
            false
        );
    },

    hoverbottom: function (index) {
        var keys = this.keys;
        keys.focusedPart = "bottomSelection";
        keys.bottomSelection = index;
        $(this.prevFocusDom).removeClass("active");
        $(this.bottomDoms[index]).addClass("active");
        this.prevFocusDom = this.bottomDoms[index];
    },

    hoverChannel: function (index) {
        var keys = this.keys;
        keys.focusedPart = "channelSelection";
        keys.channelSelection = index;
        this.unFocusSearchItem();
        $(this.prevFocusDom).removeClass("active");
        this.channelDoms = $("#channel-page-menu-container .channel-menu-item");
        $(this.channelDoms[index]).addClass("active");
        this.prevFocusDom = this.channelDoms[index];
        clearTimeout(this.channelHoverTimer);
        var that = this;
        var category = this.categories[this.currentCategoryIndex];
        this.movies = category.movies;

        clearTimeout(this.channelHoverTimer);
        channel.channelHoverTimer = setTimeout(function () {
            that.getEpgProgrammes();
        }, that.channelHoverTimeout);
        var currentMovieTemp = this.movies[keys.channelSelection];
        currentMovie = currentMovieTemp;
        this.checkAddFavStatus(currentMovieTemp);
        if (keys.channelSelection >= this.currentRenderCount - 5)
            this.showCategoryChannels(
                this.categories[this.currentCategoryIndex].category_name,
                this.currentCategoryIndex
            );
        moveScrollPosition(
            $("#channel-page-menu-container"),
            this.channelDoms[keys.channelSelection],
            "vertical",
            false
        );
    },

    focusSearchItem: function () {
        var keys = this.keys;
        keys.focusedPart = "channelSearchBar";
        $(this.topMenuDoms).removeClass("active");
        $(this.prevFocusDom).removeClass("active");
        $("#search-by-video-title").addClass("active");

        $(".search-icon").attr("src", "images/search-yellow.png");
        this.prevFocusDom = $("#search-by-video-title");
    },

    unFocusSearchItem: function () {
        $("#search-by-video-title").removeClass("active");
        $(".search-icon").attr("src", "images/search.png");
    },

    hoverTopBarMenu: function (index) {
        var keys = this.keys;
        keys.focusedPart = "topMenuSelection";
        keys.topMenuSelection = index;
        this.unFocusSearchItem();
        $(this.topMenuDoms).removeClass("active");
        $(this.prevFocusDom).removeClass("active");
        this.prevFocusDom = this.topMenuDoms[index];
        $(this.topMenuDoms[index]).addClass("active");
        $("#sort-button-container").removeClass("active");
        $(".search-back-btn").removeClass("active");
        vodSeries.keys.focusedPart = "topMenuSelection";
        vodSeries.keys.topMenuSelection = index;
    },

    selectChannel: function () {
        var keys = this.keys;
        $(".channel-menu-item").removeClass("selected");
        this.channelDoms = $("#channel-page-menu-container .channel-menu-item");
        $(this.channelDoms[keys.channelSelection]).addClass("selected");
        moveScrollPosition(
            $("#channel-page-menu-container"),
            this.channelDoms[keys.channelSelection],
            "vertical",
            false
        );
    },

    handleMenuClick: function () {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "categorySelection":
                var category = this.categories[keys.categorySelection];

                if ((category.category_id !== 'favorite' && category.category_id !== 'recent') && keys.categorySelection === this.currentCategoryIndex) return;
                else $("#search-value").val("");

                this.currentRenderCount = 0;
                keys.channelSelection = 0;
                this.currentCategoryIndex = keys.categorySelection;

                var is_adult = checkForAdult(category, "category", []);
                if (is_adult && !parentControlDisable) {
                    parentConfirm.init(currentRoute, '', '');
                    return;
                }

                this.emptyChannelContainer();
                this.selectCategory(category.category_name, this.currentCategoryIndex);
                this.showCategoryChannels(
                    category.category_name,
                    this.currentCategoryIndex
                );
                break;
            case "fullScreen":
                if (!this.isControlBarVisible) {
                    this.showControlBar(false);
                }
                break;
            case "channelSelection":
                var selectedCategoryID = this.categories[keys.categorySelection].category_id;
                var streamId = this.movies[keys.channelSelection].stream_id;
                if (this.currentChannelId == streamId) {
                    this.zoomInOut(true);
                } else {
                    this.selectChannel();
                    if (selectedCategoryID === 'all') {
                        var isAdult = checkForAdultByVideo(this.movies[keys.channelSelection].category_id, this.categories)
                        if (isAdult && !parentControlDisable) {
                            parentConfirm.init(currentRoute, 'all', 'live');
                        } else
                            this.showMovie(this.movies[keys.channelSelection]);
                    } else
                        this.showMovie(this.movies[keys.channelSelection]);
                }
                break;
            case "bottomSelection":
                $(this.bottomDoms[keys.bottomSelection]).trigger("click");
                break;
            case "topMenuSelection":
                if (keys.topMenuSelection != 4) {
                    currentRoute = "home-page";
                    $("#channel-page").addClass("hide");
                    $(this.topMenuDoms[keys.topMenuSelection]).trigger("click");
                }
                break;
            case "videoControlSelection":
                if (this.isControlBarVisible) {
                    if (keys.videoControlSelection === 4) {
                        channel.addOrRemoveFav();
                        return;
                    } else if (keys.videoControlSelection === 1) {
                        channel.showAudioTracksModal();
                        return;
                    } else {
                        this.hideControlBar();
                        $(this.videoControlDoms[keys.videoControlSelection]).trigger("click");
                    }
                } else {
                    this.showControlBar(false);
                }
                break;
            case "audioTracksModal":
                $(this.audioTracksDoms).find("input").prop("checked", false);
                $(this.audioTracksDoms[keys.audioTracksSelection])
                    .find("input")
                    .prop("checked", true);
                break;
            case "audioTrackConfirmBtn":
                $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).trigger("click");
                this.confirmAudioTrack();
                break;
            case "channelSearchBar":
                $("#search-value").focus();
                break;
        }
    },

    hoverTopMenuBar: function () {
        var keys = this.keys;
        keys.focusedPart = "topMenuSelection";
        $(".channel-page-category-item").removeClass("active");
        $(".channel-menu-item ").removeClass("active");
        this.activeTopMenuItem();
    },

    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "categorySelection":
                keys.categorySelection += increment;
                $("#search-value").blur();
                if (keys.categorySelection >= this.categoryDoms.length) {
                    keys.categorySelection = this.categoryDoms.length - 1;
                } else if (keys.categorySelection < 0) {
                    keys.categorySelection = 0;
                    this.hoverTopMenuBar();
                } else
                    this.hoverCategory(keys.categorySelection);
                break;
            case "channelSelection":
                $("#search-value").blur();
                keys.channelSelection += increment;
                if (keys.channelSelection >= this.channelDoms.length) {
                    keys.channelSelection = this.channelDoms.length - 1;
                } else if (keys.channelSelection < 0) {
                    keys.channelSelection = 0;
                    this.hoverTopMenuBar();
                } else if (keys.channelSelection >= this.currentRenderCount - 5) {
                    this.showCategoryChannels(
                        this.categories[this.currentCategoryIndex].category_name,
                        this.currentCategoryIndex
                    );
                }
                this.hoverChannel(keys.channelSelection);
                break;
            case "fullScreen":
                if (increment > 0) {
                    $(".control-level-1").addClass("hide");
                    $(".control-level-2").removeClass("hide");
                    keys.videoControlSelection = 0;
                    this.showControlBar(true);
                }
                break;
            case "topMenuSelection":
                if (increment > 0) {
                    $(this.topMenuDoms).removeClass("active");
                    this.hoverCategory(keys.categorySelection);
                }
                break;
            case "channelSearchBar":
                if (increment > 0) {
                    $(this.topMenuDoms).removeClass("active");
                    $("#search-value").blur();
                    this.hoverChannel(0);
                }
                break;
            case "videoControlSelection":
                if (increment > 0) {
                    if (!this.isControlBarVisible) {
                        this.showControlBar(true);
                    } else {
                        $(".control-level-1").addClass("hide");
                        $(".control-level-2").removeClass("hide");
                        keys.videoControlSelection = 0;
                        this.showControlBar(true);
                    }
                } else {
                    this.keys.focusedPart = "fullScreen";
                    $(".control-level-1").removeClass("hide");
                    $(".control-level-2").addClass("hide");
                }
                break;
            case "audioTracksModal":
                keys.audioTracksSelection += increment;
                if (keys.audioTracksSelection >= this.audioTracksDoms.length) {
                    $(this.audioTracksDoms).removeClass("active");
                    keys.audioTracksSelection = this.audioTracksDoms.length - 1;
                    keys.focusedPart = "audioTrackConfirmBtn";
                    $(this.audioTrackConfirmBtnDoms).removeClass('active')
                    $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).addClass('active')
                    return;
                } else if (keys.audioTracksSelection < this.audioTracksDoms.length && keys.audioTracksSelection >= 0) {
                    this.hoverAudioTracks(keys.audioTracksSelection);
                    return;
                } else if (keys.audioTracksSelection < 0) {
                    keys.audioTracksSelection = 0;
                    return;
                }
                break;
            case "audioTrackConfirmBtn":
                if (increment < 0) {
                    keys.focusedPart = "audioTracksModal";
                    this.hoverAudioTracks(keys.audioTracksSelection);
                    $(this.audioTrackConfirmBtnDoms).removeClass('active')
                }
                break;
        }
    },

    moveChannelGroup: function (increment) {
        var keys = this.keys;
        var menus = this.channelDoms;

        keys.channelSelection += increment * 14;

        if (keys.channelSelection >= menus.length) {
            keys.channelSelection = menus.length - 1;
            return;
        }
        if (keys.channelSelection < 0) {
            keys.channelSelection = 0;
            this.hoverTopMenuBar();
            return;
        }
        this.hoverChannel(keys.channelSelection);
        return;
    },

    activeTopMenuItem: function () {
        $(this.topMenuDoms).removeClass("active");
        $(this.topMenuDoms[this.keys.topMenuSelection]).addClass("active");
    },

    hoverAudioTracks: function (index) {
        var keys = this.keys;
        keys.focusedPart = "audioTracksModal";
        $(this.audioTracksDoms).removeClass("active");
        $(this.audioTrackConfirmBtnDoms).removeClass('active')
        if (index >= 0) {
            keys.audioTracksSelection = index;
            moveScrollPosition(
                $("#channel-audio-tracks-selection-container"),
                this.audioTracksDoms[keys.audioTracksSelection],
                "vertical",
                false
            );
        } else
            keys.audioTracksSelection =
                this.audioTracksDoms.length + index;
        $(this.audioTracksDoms[keys.audioTracksSelection]).addClass(
            "active"
        );
    },

    renderAudioTracks: function (items) {
        var htmlContent = "";
        items.map(function (item, index) {
            var fullLanguage = !item[1].language ? 'English' : vodSeriesPlayer.getFullLanguage(item[1].language);
            htmlContent +=
                '<div class="audio-tracks-item"  onmouseenter="channel.hoverAudioTracks(' + index + ')" onclick="channel.handleMenuClick()">'
                + '<input class="magic-radio" type="radio" name="radio" id="channel-disable-audio-tracks-' + index + '" value="' + index + '">'
                + '<label for="channel-disable-audio-tracks">' + fullLanguage + '</label>'
                + '</div>';
        })
        return htmlContent;
    },

    showAudioTracksModal: function () {
        var noAudio = currentWords["no_audio"];
        var _this = this;
        try {
            var obj = mediaPlayer.getAudioTracks();
            var result = Object.keys(obj).map(function (key) {
                return [key, obj[key]];
            });
            // var result = [["0", { language: "es", enabled: true }], ["1", { language: "es", enabled: false }], ["2", { language: "en", enabled: false }]];
            channelAudioTracks = result;
            this.keys.focusedPart = "audioTracksModal";
            var htmlContent = this.renderAudioTracks(result);

            $("#live-channel-controls-container").slideUp();
            $("#live-channel-title").slideUp();
            $(".control-level-1").removeClass("hide");
            $(".control-level-2").addClass("hide");
            this.isControlBarVisible = false;

            $("#channel-audio-tracks-selection-container").html(htmlContent);
            $('#channel-audio-tracks-modal').modal('show');
            var audioTracksMenus = $('#channel-audio-tracks-modal').find('.audio-tracks-item');
            channel.audioTracksDoms = audioTracksMenus;
            $(audioTracksMenus[0]).addClass('active');
            $(audioTracksMenus[0]).find('input').prop('checked', true);
            $(this.audioTrackConfirmBtnDoms).removeClass('active');
            result.map(function (item, index) {
                if (item[0] == _this.currentAudioTrackIndex) {
                    _this.keys.audioTracksSelection = index;
                    $(audioTracksMenus).removeClass('active');
                    $(audioTracksMenus).find('input').prop('checked', true);
                    $(audioTracksMenus[index]).addClass('active');
                    $(audioTracksMenus[index]).find('input').prop('checked', true);
                }
            });
        }
        catch (e) {
            this.keys.focusedPart = "videoControlSelection";
            showToast(noAudio, "");
        }
    },

    confirmAudioTrack: function () {
        var index = $("#channel-audio-tracks-modal")
            .find("input[type=radio]:checked")
            .val();
        $("#channel-audio-tracks-modal").modal("hide");
        channel.currentAudioTrackIndex = index;
        this.keys.focusedPart = "fullScreen";
        channelAudioTracks[index][1].enabled = true;
    },

    cancelAudioTracks: function () {
        $("#channel-audio-tracks-modal").modal("hide");
        this.keys.audioTracksSelection = 0;
        this.keys.focusedPart = "fullScreen";
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        switch (keys.focusedPart) {
            case "categorySelection":
                if (increment > 0) {
                    if (this.movies.length > 0) {
                        keys.focusedPart = "channelSelection";
                        this.hoverChannel(keys.channelSelection);
                    }
                } else {
                    this.hoverTopMenuBar();
                }
                break;
            case "channelSelection":
                if (increment < 0) {
                    keys.focusedPart = "categorySelection";
                    this.hoverCategory(keys.categorySelection);
                }
                if (increment > 0) {
                    keys.focusedPart = "bottomSelection";
                    keys.bottomSelection = 0;
                    this.hoverbottom(keys.bottomSelection);
                }
                break;
            case "bottomSelection":
                keys.bottomSelection += increment;
                if (keys.bottomSelection > 2) {
                    keys.bottomSelection = 2;
                } else if (keys.bottomSelection < 0) {
                    keys.focusedPart = "channelSelection";
                    this.hoverChannel(keys.channelSelection);
                } else {
                    this.hoverbottom(keys.bottomSelection);
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
            case "channelSearchBar":
                if (increment < 0 && !isKeyboard) {
                    this.keys.focusedPart = "topMenuSelection";
                    $(".search-icon").attr("src", "images/search.png");
                    $("#search-value").blur();
                    this.unFocusSearchItem();
                    this.activeTopMenuItem();
                }
                break;
            case "fullScreen":
                this.showNextChannel(1 * increment);
                break;
            case "videoControlSelection":
                var showLevel1 = $(".control-level-1").css("display");
                if (showLevel1 === "block") {
                    this.showNextChannel(1 * increment);
                } else {
                    keys.videoControlSelection += increment;
                    this.hoverVideoControlIcon(keys.videoControlSelection);
                }
                break;
            case "audioTrackConfirmBtn":
                keys.audioTrackConfirmSelection = keys.audioTrackConfirmSelection === 1 ? 0 : 1;
                $(this.audioTrackConfirmBtnDoms).removeClass('active')
                $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).addClass('active');
                break;
        }
    },

    HandleKey: function (e) {
        var keys = this.keys;
        switch (e.keyCode) {
            case tvKey.ArrowLeft:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.ArrowRight:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.ArrowUp:
                this.handleMenusUpDown(-1);
                break;
            case tvKey.ArrowDown:
                this.handleMenusUpDown(1);
                break;
            case tvKey.Enter:
                this.handleMenuClick();
                break;
            case tvKey.ChannelUp:
                if (keys.focusedPart === "fullScreen" || keys.focusedPart === "videoControlSelection") this.showNextChannel(1);
                break;
            case tvKey.ChannelDown:
                if (keys.focusedPart === "fullScreen" || keys.focusedPart === "videoControlSelection") this.showNextChannel(-1);
                break;
            case tvKey.Back:
                this.goBack();
                break;
            case tvKey.ColorF0Red:
                this.goToMovies();
                break;
            case tvKey.ColorF1Green:
                this.goToSeries();
                break;
            case tvKey.ColorF2Yellow:
                this.addOrRemoveFav();
                break;
            case tvKey.ColorF3Blue:
                this.goToEntireSearch();
                break;
            case tvKey.N1:
                this.goChannelNum(1);
                break;
            case tvKey.N2:
                this.goChannelNum(2);
                break;
            case tvKey.N3:
                this.goChannelNum(3);
                break;
            case tvKey.N4:
                this.goChannelNum(4);
                break;
            case tvKey.N5:
                this.goChannelNum(5);
                break;
            case tvKey.N6:
                this.goChannelNum(6);
                break;
            case tvKey.N7:
                this.goChannelNum(7);
                break;
            case tvKey.N8:
                this.goChannelNum(8);
                break;
            case tvKey.N9:
                this.goChannelNum(9);
                break;
            case tvKey.N0:
                this.goChannelNum(0);
                break;
            case tvKey.MediaPause:
                this.playOrPause();
                break;
            case tvKey.MediaPlay:
                this.playOrPause();
                break;
            case tvKey.MediaPlayPause:
                this.playOrPause();
                break;
            case tvKey.MediaRewind:
                this.moveChannelGroup(-1);
                break;
            case tvKey.MediaFastForward:
                this.moveChannelGroup(1);
                break;
        }
    }
};
