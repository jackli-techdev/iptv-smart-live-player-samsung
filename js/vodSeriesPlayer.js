"use strict";
var vodSeriesPlayer = {
    player: null,
    backUrl: "vod-summary-page",
    showControl: false,
    timeOut: null,
    hasEpisodes: false,
    keys: {
        focusedPart: "controlBar",
        controlBarSelection: 0,
        infoBarSelection: 0,
        textTracksSelection: 0,
        audioTracksSelection: 0,
        textTrackConfirmSelection: 0,
        audioTrackConfirmSelection: 0,
        prevFocus: "",
        resumeBtnSelection: 0,
        episodeSelection: 0,
        stopPlayerbackBtnSelection: 1,
        delaySelection: 0
    },
    currentTextTrackIndex: -1,
    currentAudioTrackIndex: -1,
    textTracksDoms: [],
    audioTracksDoms: [],
    textTrackConfirmBtnDoms: $(".text-track-btn"),
    delayItemDoms: $(".delay-item"),
    audioTrackConfirmBtnDoms: $("#audio-tracks-modal .audio-track-btn"),
    currentTime: 0,
    videoControlDoms: [],
    videoInfoDoms: $(".video-info-icon"),
    vodInfoTimer: null,
    currentMovie: {},
    resumeTime: 0,
    resumeTimer: null,
    episodeDoms: [],
    resumeBtnDoms: $("#video-resume-modal .resume-action-btn"),
    currentMovieType: "",
    prevRoute: "",
    stopPlaybackBtnDoms: $("#stop-playerback-modal button"),

    init: function (movie, movie_type, backUrl, movie_url, prevRoute) {
        var keys = this.keys;
        this.prevRoute = prevRoute;
        this.currentMovie = movie;
        initRangeSlider()
        this.currentTime = 0;

        $("#vod-series-player-page").removeClass("hide");
        this.showControl = true;
        this.showControlBar(true);

        $(this.stopPlaybackBtnDoms).removeClass("active");
        $(this.stopPlaybackBtnDoms[1]).addClass("active");
        this.videoControlDoms = $(
            "#vod-series-video-controls-container .video-control-icon i"
        );
        $(this.videoControlDoms).removeClass("active");
        $(this.videoInfoDoms).removeClass("active");
        $(this.videoControlDoms[2]).addClass("active");
        $("#media-pause").removeClass("hide");
        $("#media-play").addClass("hide");

        keys.controlBarSelection = 2;
        keys.focusedPart = "controlBar";
        keys.prevFocus = "controlBar";
        keys.audioTrackConfirmSelection = 0;

        $("#vod-series-video-progress").css({ width: '0%' });
        $("#vod-series-player-page").find(".video-current-time").text("--:--");
        $("#vod-series-player-page").find(".video-total-time").text("--:--");

        clearTimeout(this.resumeTimer);
        var url;
        if (movie_type === "movies" || movie_type === "movie") {
            if (settings.playlist.playlistType === "xc")
                url = getMovieUrl(movie.stream_id, "movie", movie.container_extension);
            else if (settings.playlist.playlistType === "general") url = movie.url;
            $("#vod-series-video-title").html(movie.name);
        } else if (movie_type === "series") {
            if (settings.playlist.playlistType === "xc")
                url = getMovieUrl(movie.id, "series", movie.container_extension);
            else if (settings.playlist.playlistType === "general") url = movie.url;
            $("#vod-series-video-title").html(movie.title);
        }
        this.backUrl = backUrl;
        var that = this;
        closeVideo();
        try {
            mediaPlayer.init("vod-series-player-video", "vod-series-player-page");
        } catch (e) { }
        try {
            mediaPlayer.playAsync(url);
        } catch (e) { }
        this.timeOut = setTimeout(function () {
            that.hideControlBar();
        }, 10000);
        var current_model, movie_key;
        if (movie_type === "movies" || movie_type === "movie") {
            current_model = VodModel;
            movie_key = "stream_id";
        } else {
            current_model = SeriesModel;
            movie_key = "id";
        }
        if (
            movie_type === "movies" ||
            movie_type === "movie" ||
            movie_type === "series"
        ) {
            movie_key = movie[movie_key].toString();
            if (typeof current_model.savedVideoTimes[movie_key] != "undefined") {
                this.resumeTime =
                    current_model.savedVideoTimes[movie_key].resumeTime;
            } else {
                this.resumeTime = 0;
            }
        } else {
            this.resumeTime = 0;
        }
        currentRoute = "vod-series-player-video";
        this.currentTextTrackIndex = -1;
        this.currentAudioTrackIndex = -1;
        this.currentMovieType = movie_type;
        this.initTextTrackSetting()
        keys.stopPlayerbackBtnSelection = 1;
        textTrackDelayTime = 0;
    },

    initTextTrackSetting: function () {
        $(".text-track-container").html("");
        textTracks = [];
        $(".text-track-container").css({ background: 'transparent' });
        this.currentTextTrackIndex = -1;
        this.keys.textTracksSelection = 0
    },

    makeEpisodeDoms: function (backUrl) {
        this.keys.episodeSelection = 0;

        if (backUrl === "episode-page") {
            var episodes = currentSeason.episodes;
            this.episodes = episodes;
            this.hasEpisodes = true;
            var html = "";
            var that = this;
            episodes.map(function (item, index) {
                html +=
                    '<div class="player-season-item" onclick="vodSeriesPlayer.showSelectedEpisode()" onmouseenter="vodSeriesPlayer.hoverEpisode(' +
                    index +
                    ')" style="background-image:url(' +
                    item.info.movie_image +
                    "),url(" +
                    config.episodePlaceholderImg +
                    ');background-size: cover;">' +
                    '<img src ="images/play-icon.png" width="50px" class = "' +
                    (that.currentMovie.id !== item.id ? "hide" : "") +
                    '" />' +
                    '<div class="player-episode-title-container">' +
                    '<div class="player-episode-title max-line-2">' +
                    item.title +
                    "</div>" +
                    "</div>" +
                    "</div>";
            });
            $("#player-seasons-container").html(html);
            this.episodeDoms = $(".player-season-item");
            $("#player-seasons-container").removeClass("expanded");
            $("#player-seasons-container").show();
        } else {
            this.hasEpisodes = false;
            $("#player-seasons-container").html("");
            this.episodeDoms = $(".player-season-item");
            this.episodeDoms = [];
            $("#player-seasons-container").hide();
        }
    },

    showResumeBar: function () {
        var keys = this.keys;
        if (this.resumeTime / 1000 >= config.resumeThredholdTime) {
            var resumeTimeFormat = mediaPlayer.formatTime(this.resumeTime / 1000);
            $("#vod-resume-time").text(resumeTimeFormat);
            $("#video-resume-modal").show();
            this.hideControlBar();
            clearTimeout(this.resumeTimer);
            keys.focusedPart = "resumeModal";
            keys.resumeBtnSelection = 0;
            $(this.resumeBtnDoms).removeClass("active");
            $(this.resumeBtnDoms[0]).addClass("active");
            this.resumeTimer = setTimeout(function () {
                $("#video-resume-modal").hide();
                keys.focusedPart = keys.prevFocus;
            }, 20000);
        }
    },

    Exit: function () {
        this.saveVideoTime();
        currentRoute = this.backUrl;
        closeVideo();
        $("#" + mediaPlayer.parent_id).find(".video-error").hide();
        $("#" + mediaPlayer.parent_id).find(".text-track-container").text("");
        $("#vod-series-player-page").addClass("hide");
        $("#season-episodes-container").removeClass("hide");
    },

    saveVideoTime: function () {
        try {
            var currentTime = mediaPlayer.videoObj.currentTime * 1000;
            var duration = parseInt(mediaPlayer.videoObj.duration) * 1000;
            var movie = this.currentMovie;
            if (duration - currentTime >= 2000) {
                if (
                    this.currentMovieType === "movies" ||
                    this.currentMovieType === "movie"
                )
                    movieHelper.saveVideoTime(
                        "vod",
                        movie.stream_id,
                        currentTime,
                        duration
                    );
                if (this.currentMovieType === "series")
                    movieHelper.saveVideoTime("series", movie.id, currentTime, duration);
            } else {
                if (
                    this.currentMovieType === "movies" ||
                    this.currentMovieType === "movie"
                )
                    movieHelper.removeVideoTime("vod", movie.stream_id);
                if (this.currentMovieType === "series")
                    movieHelper.removeVideoTime("series", movie.id);
            }
        } catch (e) { }
    },

    exitPlayer: function () {
        this.Exit();
        if (this.backUrl === "vod-summary-page") {
            if (this.prevRoute == "entire-search-page") {
                currentRoute = this.prevRoute;
                $(".top-bar").addClass("hide");
                $("#entire-search-page").removeClass("hide");
            } else {
                currentRoute = "vod-series-page";
                $("#entire-search-page").addClass("hide");
                $(".top-bar").removeClass("hide");
                $("#vod-series-page").removeClass("hide");

                var category = vodSeries.categories[vodSeries.keys.selectedCategoryIndex];
                if (category.category_id === 'recent') {
                    vodSeries.movies = category.movies;
                    vodSeries.renderResumeWatchContent();
                }

                moveScrollPosition(
                    $("#vod-series-menus-container"),
                    vodSeries.menuDoms[vodSeries.keys.menuSelection],
                    "vertical",
                    false
                );
            }
        } else if (this.backUrl === "episode-page") {
            if (this.prevRoute == "entire-search-page") {
                currentRoute = this.prevRoute;
                displayCurrentPage(currentRoute)
            } else {
                currentRoute = "series-summary-page";
                $("#entire-search-page").addClass("hide");
                var season_buttons = seriesSummary.episodeDoms;
                moveScrollPosition(
                    $("#series-summary-episode-items-container"),
                    season_buttons[seriesSummary.keys.episodeSelection],
                    "vertical",
                    false
                );
            }
        }
    },

    hoverExitPlaybackMenuItem: function (index) {
        var keys = this.keys;
        keys.focusedPart = "stopPlayerbackModal";
        keys.menuSelection = index;
        $(this.stopPlaybackBtnDoms).removeClass("active");
        $(this.stopPlaybackBtnDoms[index]).addClass("active");
    },

    clickExitPlay: function (index) {
        var keys = this.keys;
        keys.focusedPart = "stopPlayerbackModal";
        $("#stop-playerback-modal").modal("hide");
        if (index == 0) {
            $("#vod-series-video-progress").css("width", "0%");
            this.exitPlayer();
        }
        else keys.focusedPart = "controlBar";
    },

    goBack: function () {
        var keys = this.keys;
        if (this.showControl) {
            this.hideControlBar();
        } else {
            if (
                keys.focusedPart === "controlBar" ||
                keys.focusedPart === "infoBar" ||
                keys.focusedPart === "episodeSelection" ||
                keys.focusedPart === "seekBar"
            ) {
                $("#stop-playerback-modal").modal("show");
                $(this.stopPlaybackBtnDoms).removeClass("active");
                $(this.stopPlaybackBtnDoms[1]).addClass("active");
                keys.focusedPart = "stopPlayerbackModal";
            } else if (keys.focusedPart === 'stopPlayerbackModal') {
                $('#stop-playerback-modal').modal('hide');
                keys.focusedPart = 'controlBar';
            } else if (keys.focusedPart === "textTracksModal" || keys.focusedPart === "textTrackConfirmBtn") {
                keys.focusedPart = "controlBar";
                keys.textTracksSelection = 0;
                $("#text-tracks-modal").modal("hide");
            } else if (keys.focusedPart === "audioTracksModal" || keys.focusedPart === "audioTrackConfirmBtn") {
                keys.focusedPart = "infoBar";
                keys.audioTracksSelection = 0;
                $("#audio-tracks-modal").modal("hide");
            } else if (keys.focusedPart === "vodInfo") {
                $("#vod-video-info-container").hide();
                clearTimeout(this.vodInfoTimer);
                keys.focusedPart = keys.prevFocus;
            } else if (keys.focusedPart === "resumeModal") {
                $("#video-resume-modal").hide();
                keys.focusedPart = keys.prevFocus;
                clearTimeout(this.resumeTimer);
            } else if (keys.focusedPart === "delaySelection") {
                $("#text-tracks-delay-setting-modal").hide();
                keys.focusedPart = keys.prevFocus;
            }
        }
    },

    playPauseVideo: function () {
        this.showControlBar(false);
        if (mediaPlayer.state === mediaPlayer.STATES.PLAYING) {
            try {
                mediaPlayer.pause();
                $("#media-pause").addClass("hide");
                $("#media-play").removeClass("hide");
            } catch (e) { }
        } else if (mediaPlayer.state === mediaPlayer.STATES.PAUSED) {
            try {
                mediaPlayer.play();
                $("#media-pause").removeClass("hide");
                $("#media-play").addClass("hide");
            } catch (e) { }
        }
    },

    pauseVideo: function () {
        try {
            mediaPlayer.pause();
            $("#media-pause").addClass("hide");
            $("#media-play").removeClass("hide");
        } catch (e) { }
    },

    playVideo: function () {
        try {
            mediaPlayer.play();
            $("#media-pause").removeClass("hide");
            $("#media-play").addClass("hide");
        } catch (e) { }
    },

    playPauseVideoFromNetworkIssue: function () {
        this.showControlBar(false);
        try {
            mediaPlayer.playFromNetworkIssue();
            $("#media-pause").removeClass("hide");
            $("#media-play").addClass("hide");
        } catch (e) { }
    },

    seekTo: function (step) {
        if (this.currentTime === 0)
            this.currentTime = mediaPlayer.videoObj.currentTime;
        var duration = mediaPlayer.videoObj.duration;
        var newTime = this.currentTime + step;
        if (newTime < 0) newTime = 0;
        if (newTime >= duration) newTime = duration;
        vodSeriesPlayer.currentTime = newTime;
        mediaPlayer.videoObj.currentTime = newTime;
        if (duration > 0) {
            $("#" + mediaPlayer.parent_id)
                .find(".video-progress-bar-slider")
                .val(newTime)
                .change();
            $("#" + mediaPlayer.parent_id)
                .find(".video-current-time")
                .html(mediaPlayer.formatTime(newTime));
        }
    },

    showSelectedEpisode: function () {
        var episode_keys = seriesSummary.keys;
        var keys = this.keys;
        var episodeItems = seriesSummary.episodeDoms;
        if (episode_keys.episodeSelection != keys.episodeSelection) {
            $(episodeItems).removeClass("active");
            episode_keys.episodeSelection = keys.episodeSelection;
            $(episodeItems[episode_keys.episodeSelection]).addClass("active");
            var episodes = this.episodes;
            var episode = episodes[keys.episodeSelection];
            this.saveVideoTime();
            this.resumeTime = 0;
            closeVideo();
            currentEpisode = episode;
            vodSeriesPlayer.init(
                currentEpisode,
                "series",
                "episode-page",
                "",
                ""
            );
            this.hoverEpisode(keys.episodeSelection);
        }
    },

    showNextVideo: function (increment) {
        this.saveVideoTime();
        this.resumeTime = 0;
        switch (this.backUrl) {
            case "vod-summary-page":
                var menuDoms = vodSeries.menuDoms;
                var keys = vodSeries.keys;
                keys.menuSelection += increment;
                if (keys.menuSelection < 0) {
                    keys.menuSelection = 0;
                    return;
                }
                if (keys.menuSelection >= vodSeries.movies.length) {
                    keys.menuSelection = vodSeries.movies.length - 1;
                    return;
                }
                $(menuDoms).removeClass("active");
                $(menuDoms[keys.menuSelection]).addClass("active");
                currentMovie = vodSeries.movies[keys.menuSelection];
                this.init(currentMovie, "movie", "vod-summary-page", "");
                break;
            case "episode-page":
                var keys = seriesSummary.keys;
                var episodeItems = seriesSummary.episodeDoms;
                $(episodeItems).removeClass("active");
                keys.episodeSelection += increment;
                if (keys.episodeSelection < 0) {
                    keys.episodeSelection = 0;
                } else if (keys.episodeSelection >= episodeItems.length) {
                    keys.episodeSelection = episodeItems.length - 1;
                }
                $(episodeItems[keys.episodeSelection]).addClass("active");
                var episodes = currentSeason.episodes;
                currentEpisode = episodes[keys.episodeSelection];
                vodSeriesPlayer.init(
                    currentEpisode,
                    "series",
                    "episode-page",
                    "",
                    ""
                );
                break;
        }
    },

    showControlBar: function (move_focus) {
        $("#vod-series-video-controls-container").slideDown();
        $("#vod-series-video-title").slideDown();
        this.showControl = true;
        var that = this;
        var keys = this.keys;
        if (move_focus) {
            keys.focusedPart = "controlBar";
            keys.prevFocus = "controlBar";
            keys.controlBarSelection = 2;
            $(this.videoControlDoms).removeClass("active");
            $(this.videoInfoDoms).removeClass("active");
            $("#vod-series-video-progress").removeClass("active");
            $(".rangeslider__fill").removeClass("active");
            $(this.videoControlDoms[2]).addClass("active");
            $(this.episodeDoms).removeClass("active");
            $("#player-seasons-container").removeClass("expanded");
        }
        clearTimeout(this.timeOut);
        this.timeOut = setTimeout(function () {
            that.hideControlBar();
        }, 10000);
    },

    hideControlBar: function () {
        $("#vod-series-video-controls-container").slideUp();
        $("#vod-series-video-title").slideUp();
        this.showControl = false;
    },

    getFullLanguage: function (lang) {
        var isoLangs = {
            "ab": { "name": "Abkhaz", "nativeName": "аҧсуа" },
            "aa": { "name": "Afar", "nativeName": "Afaraf" },
            "af": { "name": "Afrikaans", "nativeName": "Afrikaans" },
            "ak": { "name": "Akan", "nativeName": "Akan" },
            "sq": { "name": "Albanian", "nativeName": "Shqip" },
            "am": { "name": "Amharic", "nativeName": "አማርኛ" },
            "ar": { "name": "Arabic", "nativeName": "العربية" },
            "an": { "name": "Aragonese", "nativeName": "Aragonés" },
            "hy": { "name": "Armenian", "nativeName": "Հայերեն" },
            "as": { "name": "Assamese", "nativeName": "অসমীয়া" },
            "av": { "name": "Avaric", "nativeName": "авар мацӀ, магӀарул мацӀ" },
            "ae": { "name": "Avestan", "nativeName": "avesta" },
            "ay": { "name": "Aymara", "nativeName": "aymar aru" },
            "az": { "name": "Azerbaijani", "nativeName": "azərbaycan dili" },
            "bm": { "name": "Bambara", "nativeName": "bamanankan" },
            "ba": { "name": "Bashkir", "nativeName": "башҡорт теле" },
            "eu": { "name": "Basque", "nativeName": "euskara, euskera" },
            "be": { "name": "Belarusian", "nativeName": "Беларуская" },
            "bn": { "name": "Bengali", "nativeName": "বাংলা" },
            "bh": { "name": "Bihari", "nativeName": "भोजपुरी" },
            "bi": { "name": "Bislama", "nativeName": "Bislama" },
            "bs": { "name": "Bosnian", "nativeName": "bosanski jezik" },
            "br": { "name": "Breton", "nativeName": "brezhoneg" },
            "bg": { "name": "Bulgarian", "nativeName": "български език" },
            "my": { "name": "Burmese", "nativeName": "ဗမာစာ" },
            "ca": { "name": "Catalan; Valencian", "nativeName": "Català" },
            "ch": { "name": "Chamorro", "nativeName": "Chamoru" },
            "ce": { "name": "Chechen", "nativeName": "нохчийн мотт" },
            "ny": {
                "name": "Chichewa; Chewa; Nyanja",
                "nativeName": "chiCheŵa, chinyanja"
            },
            "zh": { "name": "Chinese", "nativeName": "中文 (Zhōngwén), 汉语, 漢語" },
            "cv": { "name": "Chuvash", "nativeName": "чӑваш чӗлхи" },
            "kw": { "name": "Cornish", "nativeName": "Kernewek" },
            "co": { "name": "Corsican", "nativeName": "corsu, lingua corsa" },
            "cr": { "name": "Cree", "nativeName": "ᓀᐦᐃᔭᐍᐏᐣ" },
            "hr": { "name": "Croatian", "nativeName": "hrvatski" },
            "cs": { "name": "Czech", "nativeName": "česky, čeština" },
            "da": { "name": "Danish", "nativeName": "dansk" },
            "dv": { "name": "Divehi; Dhivehi; Maldivian;", "nativeName": "ދިވެހި" },
            "nl": { "name": "Dutch", "nativeName": "Nederlands, Vlaams" },
            "en": { "name": "English", "nativeName": "English" },
            "eo": { "name": "Esperanto", "nativeName": "Esperanto" },
            "et": { "name": "Estonian", "nativeName": "eesti, eesti keel" },
            "ee": { "name": "Ewe", "nativeName": "Eʋegbe" },
            "fo": { "name": "Faroese", "nativeName": "føroyskt" },
            "fj": { "name": "Fijian", "nativeName": "vosa Vakaviti" },
            "fi": { "name": "Finnish", "nativeName": "suomi, suomen kieli" },
            "fr": { "name": "French", "nativeName": "français, langue française" },
            "ff": {
                "name": "Fula; Fulah; Pulaar; Pular",
                "nativeName": "Fulfulde, Pulaar, Pular"
            },
            "gl": { "name": "Galician", "nativeName": "Galego" },
            "ka": { "name": "Georgian", "nativeName": "ქართული" },
            "de": { "name": "German", "nativeName": "Deutsch" },
            "el": { "name": "Greek, Modern", "nativeName": "Ελληνικά" },
            "gn": { "name": "Guaraní", "nativeName": "Avañeẽ" },
            "gu": { "name": "Gujarati", "nativeName": "ગુજરાતી" },
            "ht": { "name": "Haitian; Haitian Creole", "nativeName": "Kreyòl ayisyen" },
            "ha": { "name": "Hausa", "nativeName": "Hausa, هَوُسَ" },
            "he": { "name": "Hebrew (modern)", "nativeName": "עברית" },
            "hz": { "name": "Herero", "nativeName": "Otjiherero" },
            "hi": { "name": "Hindi", "nativeName": "हिन्दी, हिंदी" },
            "ho": { "name": "Hiri Motu", "nativeName": "Hiri Motu" },
            "hu": { "name": "Hungarian", "nativeName": "Magyar" },
            "ia": { "name": "Interlingua", "nativeName": "Interlingua" },
            "id": { "name": "Indonesian", "nativeName": "Bahasa Indonesia" },
            "ie": {
                "name": "Interlingue",
                "nativeName": "Originally called Occidental; then Interlingue after WWII"
            },
            "ga": { "name": "Irish", "nativeName": "Gaeilge" },
            "ig": { "name": "Igbo", "nativeName": "Asụsụ Igbo" },
            "ik": { "name": "Inupiaq", "nativeName": "Iñupiaq, Iñupiatun" },
            "io": { "name": "Ido", "nativeName": "Ido" },
            "is": { "name": "Icelandic", "nativeName": "Íslenska" },
            "it": { "name": "Italian", "nativeName": "Italiano" },
            "iu": { "name": "Inuktitut", "nativeName": "ᐃᓄᒃᑎᑐᑦ" },
            "ja": { "name": "Japanese", "nativeName": "日本語 (にほんご／にっぽんご)" },
            "jv": { "name": "Javanese", "nativeName": "basa Jawa" },
            "kl": {
                "name": "Kalaallisut, Greenlandic",
                "nativeName": "kalaallisut, kalaallit oqaasii"
            },
            "kn": { "name": "Kannada", "nativeName": "ಕನ್ನಡ" },
            "kr": { "name": "Kanuri", "nativeName": "Kanuri" },
            "ks": { "name": "Kashmiri", "nativeName": "कश्मीरी, كشميري‎" },
            "kk": { "name": "Kazakh", "nativeName": "Қазақ тілі" },
            "km": { "name": "Khmer", "nativeName": "ភាសាខ្មែរ" },
            "ki": { "name": "Kikuyu, Gikuyu", "nativeName": "Gĩkũyũ" },
            "rw": { "name": "Kinyarwanda", "nativeName": "Ikinyarwanda" },
            "ky": { "name": "Kirghiz, Kyrgyz", "nativeName": "кыргыз тили" },
            "kv": { "name": "Komi", "nativeName": "коми кыв" },
            "kg": { "name": "Kongo", "nativeName": "KiKongo" },
            "ko": { "name": "Korean", "nativeName": "한국어 (韓國語), 조선말 (朝鮮語)" },
            "ku": { "name": "Kurdish", "nativeName": "Kurdî, كوردی‎" },
            "kj": { "name": "Kwanyama, Kuanyama", "nativeName": "Kuanyama" },
            "la": { "name": "Latin", "nativeName": "latine, lingua latina" },
            "lb": {
                "name": "Luxembourgish, Letzeburgesch",
                "nativeName": "Lëtzebuergesch"
            },
            "lg": { "name": "Luganda", "nativeName": "Luganda" },
            "li": {
                "name": "Limburgish, Limburgan, Limburger",
                "nativeName": "Limburgs"
            },
            "ln": { "name": "Lingala", "nativeName": "Lingála" },
            "lo": { "name": "Lao", "nativeName": "ພາສາລາວ" },
            "lt": { "name": "Lithuanian", "nativeName": "lietuvių kalba" },
            "lu": { "name": "Luba-Katanga", "nativeName": "" },
            "lv": { "name": "Latvian", "nativeName": "latviešu valoda" },
            "gv": { "name": "Manx", "nativeName": "Gaelg, Gailck" },
            "mk": { "name": "Macedonian", "nativeName": "македонски јазик" },
            "mg": { "name": "Malagasy", "nativeName": "Malagasy fiteny" },
            "ms": { "name": "Malay", "nativeName": "bahasa Melayu, بهاس ملايو‎" },
            "ml": { "name": "Malayalam", "nativeName": "മലയാളം" },
            "mt": { "name": "Maltese", "nativeName": "Malti" },
            "mi": { "name": "Māori", "nativeName": "te reo Māori" },
            "mr": { "name": "Marathi (Marāṭhī)", "nativeName": "मराठी" },
            "mh": { "name": "Marshallese", "nativeName": "Kajin M̧ajeļ" },
            "mn": { "name": "Mongolian", "nativeName": "монгол" },
            "na": { "name": "Nauru", "nativeName": "Ekakairũ Naoero" },
            "nv": { "name": "Navajo, Navaho", "nativeName": "Diné bizaad, Dinékʼehǰí" },
            "nb": { "name": "Norwegian Bokmål", "nativeName": "Norsk bokmål" },
            "nd": { "name": "North Ndebele", "nativeName": "isiNdebele" },
            "ne": { "name": "Nepali", "nativeName": "नेपाली" },
            "ng": { "name": "Ndonga", "nativeName": "Owambo" },
            "nn": { "name": "Norwegian Nynorsk", "nativeName": "Norsk nynorsk" },
            "no": { "name": "Norwegian", "nativeName": "Norsk" },
            "ii": { "name": "Nuosu", "nativeName": "ꆈꌠ꒿ Nuosuhxop" },
            "nr": { "name": "South Ndebele", "nativeName": "isiNdebele" },
            "oc": { "name": "Occitan", "nativeName": "Occitan" },
            "oj": { "name": "Ojibwe, Ojibwa", "nativeName": "ᐊᓂᔑᓈᐯᒧᐎᓐ" },
            "cu": {
                "name":
                    "Old Church Slavonic, Church Slavic, Church Slavonic, Old Bulgarian, Old Slavonic",
                "nativeName": "ѩзыкъ словѣньскъ"
            },
            "om": { "name": "Oromo", "nativeName": "Afaan Oromoo" },
            "or": { "name": "Oriya", "nativeName": "ଓଡ଼ିଆ" },
            "os": { "name": "Ossetian, Ossetic", "nativeName": "ирон æвзаг" },
            "pa": { "name": "Panjabi, Punjabi", "nativeName": "ਪੰਜਾਬੀ, پنجابی‎" },
            "pi": { "name": "Pāli", "nativeName": "पाऴि" },
            "fa": { "name": "Persian", "nativeName": "فارسی" },
            "pl": { "name": "Polish", "nativeName": "polski" },
            "ps": { "name": "Pashto, Pushto", "nativeName": "پښتو" },
            "pt": { "name": "Portuguese", "nativeName": "Português" },
            "qu": { "name": "Quechua", "nativeName": "Runa Simi, Kichwa" },
            "rm": { "name": "Romansh", "nativeName": "rumantsch grischun" },
            "rn": { "name": "Kirundi", "nativeName": "kiRundi" },
            "ro": { "name": "Romanian, Moldavian, Moldovan", "nativeName": "română" },
            "ru": { "name": "Russian", "nativeName": "русский язык" },
            "sa": { "name": "Sanskrit (Saṁskṛta)", "nativeName": "संस्कृतम्" },
            "sc": { "name": "Sardinian", "nativeName": "sardu" },
            "sd": { "name": "Sindhi", "nativeName": "सिन्धी, سنڌي، سندھی‎" },
            "se": { "name": "Northern Sami", "nativeName": "Davvisámegiella" },
            "sm": { "name": "Samoan", "nativeName": "gagana faa Samoa" },
            "sg": { "name": "Sango", "nativeName": "yângâ tî sängö" },
            "sr": { "name": "Serbian", "nativeName": "српски језик" },
            "gd": { "name": "Scottish Gaelic; Gaelic", "nativeName": "Gàidhlig" },
            "sn": { "name": "Shona", "nativeName": "chiShona" },
            "si": { "name": "Sinhala, Sinhalese", "nativeName": "සිංහල" },
            "sk": { "name": "Slovak", "nativeName": "slovenčina" },
            "sl": { "name": "Slovene", "nativeName": "slovenščina" },
            "so": { "name": "Somali", "nativeName": "Soomaaliga, af Soomaali" },
            "st": { "name": "Southern Sotho", "nativeName": "Sesotho" },
            "es": { "name": "Spanish; Castilian", "nativeName": "español, castellano" },
            "su": { "name": "Sundanese", "nativeName": "Basa Sunda" },
            "sw": { "name": "Swahili", "nativeName": "Kiswahili" },
            "ss": { "name": "Swati", "nativeName": "SiSwati" },
            "sv": { "name": "Swedish", "nativeName": "svenska" },
            "ta": { "name": "Tamil", "nativeName": "தமிழ்" },
            "te": { "name": "Telugu", "nativeName": "తెలుగు" },
            "tg": { "name": "Tajik", "nativeName": "тоҷикӣ, toğikī, تاجیکی‎" },
            "th": { "name": "Thai", "nativeName": "ไทย" },
            "ti": { "name": "Tigrinya", "nativeName": "ትግርኛ" },
            "bo": {
                "name": "Tibetan Standard, Tibetan, Central",
                "nativeName": "བོད་ཡིག"
            },
            "tk": { "name": "Turkmen", "nativeName": "Türkmen, Түркмен" },
            "tl": { "name": "Tagalog", "nativeName": "Wikang Tagalog, ᜏᜒᜃᜅ᜔ ᜆᜄᜎᜓᜄ᜔" },
            "tn": { "name": "Tswana", "nativeName": "Setswana" },
            "to": { "name": "Tonga (Tonga Islands)", "nativeName": "faka Tonga" },
            "tr": { "name": "Turkish", "nativeName": "Türkçe" },
            "ts": { "name": "Tsonga", "nativeName": "Xitsonga" },
            "tt": { "name": "Tatar", "nativeName": "татарча, tatarça, تاتارچا‎" },
            "tw": { "name": "Twi", "nativeName": "Twi" },
            "ty": { "name": "Tahitian", "nativeName": "Reo Tahiti" },
            "ug": { "name": "Uighur, Uyghur", "nativeName": "Uyƣurqə, ئۇيغۇرچە‎" },
            "uk": { "name": "Ukrainian", "nativeName": "українська" },
            "ur": { "name": "Urdu", "nativeName": "اردو" },
            "uz": { "name": "Uzbek", "nativeName": "zbek, Ўзбек, أۇزبېك‎" },
            "ve": { "name": "Venda", "nativeName": "Tshivenḓa" },
            "vi": { "name": "Vietnamese", "nativeName": "Tiếng Việt" },
            "vo": { "name": "Volapük", "nativeName": "Volapük" },
            "wa": { "name": "Walloon", "nativeName": "Walon" },
            "cy": { "name": "Welsh", "nativeName": "Cymraeg" },
            "wo": { "name": "Wolof", "nativeName": "Wollof" },
            "fy": { "name": "Western Frisian", "nativeName": "Frysk" },
            "xh": { "name": "Xhosa", "nativeName": "isiXhosa" },
            "yi": { "name": "Yiddish", "nativeName": "ייִדיש" },
            "yo": { "name": "Yoruba", "nativeName": "Yorùbá" },
            "za": { "name": "Zhuang, Chuang", "nativeName": "Saɯ cueŋƅ, Saw cuengh" }
        };

        if (isoLangs.hasOwnProperty(lang)) {
            return isoLangs[lang].name;
        } else {
            if (lang == null) {
                return lang
            } else {
                var baseLang = lang.split("-")[0];
                if (isoLangs.hasOwnProperty(baseLang)) {
                    return isoLangs[baseLang].name + (' (' + baseLang + ')');
                } else {
                    return lang;
                }
            }
        }
    },

    renderAudioTracks: function (items) {
        var that = this;
        var htmlContent = "";
        items.map(function (item, index) {
            var fullLanguage = !item[1].language ? 'English' : that.getFullLanguage(item[1].language);
            htmlContent +=
                '<div class="audio-tracks-item"  onmouseenter="vodSeriesPlayer.hoverAudioTracks(' + index + ')" onclick="vodSeriesPlayer.handleMenuClick()">'
                + '<input class="magic-radio" type="radio" name="radio" id="disable-audio-tracks-' + index + '" value="' + index + '">'
                + '<label for="disable-audio-tracks">' + fullLanguage + '</label>'
                + '</div>';
        })
        return htmlContent;
    },

    renderTextTracks: function (items) {
        var filteredItems = items.filter(function (data, index) {
            return data.attributes.language !== null
        })
        var that = this;
        var htmlContent = "",
            hover_index_move = 1;
        htmlContent =
            '<div class="text-tracks-item"\
                    onmouseenter="vodSeriesPlayer.hoverTextTracks(0)" \
                    onclick="vodSeriesPlayer.handleMenuClick()" \
                >\
                   <input class="magic-radio" type="radio" name="radio" id="disable-text-tracks" value="-1">\
                   <label for="disable-text-tracks">Disabled</label>\
                </div>';
        filteredItems.map(function (item, index) {
            htmlContent +=
                '<div class="text-tracks-item"\
                    onmouseenter="vodSeriesPlayer.hoverTextTracks(' +
                (index + hover_index_move) +
                ')" \
                    onclick="vodSeriesPlayer.handleMenuClick()" \
                >\
                    <input class="magic-radio" type="radio" name="radio" id="disable-text-tracks"\
                        value="' +
                item.attributes.files[0].file_id +
                '"\
                    >\
                    <label for="disable-text-tracks">' +
                that.getFullLanguage(item.attributes.language) +
                "</label>\
                </div>";
        });
        return htmlContent;
    },

    showVideoInfo: function () {
        var movie = this.currentMovie;

        this.hideControlBar();

        var vod_desc = "",
            stream_summary = "",
            stream_icon,
            stream_title;
        if (this.currentMovieType == "movies") {
            stream_title = movie.name;
            stream_icon = movie.stream_icon;

            settings.playlistType = "xtreme";
            if (settings.playlistType === "xtreme") {
                $.getJSON(
                    playlistEndpoint +
                    "player_api.php?username=" +
                    userName +
                    "&password=" +
                    password +
                    "&action=get_vod_info&vod_id=" +
                    this.currentMovie.stream_id,
                    function (response) {
                        var info = response.info;

                        if (typeof info.description != "undefined")
                            vod_desc = info.description;

                        if (typeof info.video != "undefined") {
                            if (
                                typeof info.video.width != "undefined" &&
                                typeof info.video.height
                            ) {
                                stream_summary = info.video.width + "*" + info.video.height;
                            }
                            if (typeof info.video.codec_long_name != "undefined") {
                                stream_summary =
                                    stream_summary + ", " + info.video.codec_long_name;
                            }
                        }
                    }
                );
            }
        } else {
            // if series

            stream_title = movie.title;
            if (settings.playlistType === "xtreme") {
                if (typeof movie.info != "undefined") {
                    var info = movie.info;
                    if (typeof info.plot != "undefined") vod_desc = info.plot;
                    stream_icon = info.movie_image;
                    if (typeof info.video != "undefined") {
                        stream_summary = info.video.width + "*" + info.video.height;
                        if (typeof info.video.codec_long_name != "undefined")
                            stream_summary =
                                stream_summary + ", " + info.video.codec_long_name;
                    }
                }
            } else {
                stream_icon = config.placeholderImg;
            }
        }
        setTimeout(function () {
            $("#vod-video-info-title").text(stream_title);
            $("#vod-video-info-img-container img").attr("src", stream_icon);
            $("#vod-video-info-desc").text(vod_desc);
            $("#vod-video-info-subwrapper2").text(stream_summary);
            $("#vod-video-info-container").show();
        }, 1500);

        clearTimeout(this.vodInfoTimer);
        var keys = this.keys;
        keys.focusedPart = "vodInfo";
        this.vodInfoTimer = setTimeout(function () {
            $("#vod-video-info-container").hide();
            keys.focusedPart = keys.prevFocus;
        }, 10000);
    },

    showDelaySettingModal: function () {
        var keys = this.keys;
        this.hideControlBar();
        keys.prevFocus = keys.focusedPart;
        $("#text-track-delay-time").val(textTrackDelayTime);
        $("#text-tracks-delay-setting-modal").show();
        this.hoverDelayInputBox();
    },

    hoverDelayInputBox: function () {
        this.keys.focusedPart = "delaySelection";
        this.keys.delaySelection = 0;
        $("#text-track-delay-time").addClass("active");
        $(".text-track-delay-btn").removeClass("active");
    },

    clickDelayInputBox: function () {
        $("#text-track-delay-time").focus();
    },

    confirmTextTrackDelay: function () {
        textTrackDelayTime = $("#text-track-delay-time").val();
        $("#text-tracks-delay-setting-modal").hide();
        this.keys.focusedPart = this.keys.prevFocus;
    },

    hoverDelayItem: function (index) {
        var keys = this.keys;
        keys.delaySelection = index;
        $(this.delayItemDoms).removeClass('active');
        $(this.delayItemDoms[keys.delaySelection]).addClass('active')
        keys.focusedPart = "delaySelection";
    },

    cancelTextTracksDelay: function () {
        $("#text-tracks-delay-setting-modal").hide();
        this.keys.delaySelection = 0;
        this.keys.focusedPart = this.keys.prevFocus;
    },

    showTextTracksModal: function () {
        var keys = this.keys
        $(this.textTracksDoms).find("input").prop("checked", false);
        $(this.textTracksDoms[keys.textTracksSelection])
            .find("input")
            .prop("checked", true);
        var noSubtitle = currentWords["no_subtitle"];

        var url = "";
        var tmdb_id = "";
        if (this.currentMovieType === "movies") {
            tmdb_id = this.currentMovie.info.tmdb_id;
            url = 'https://api.opensubtitles.com/api/v1/subtitles?tmdb_id=' + tmdb_id + '&type=movie';
        } else {
            var tmdb_id1 = currentSeries.info.tmdb;
            var tmdb_id2 = currentSeries.info.tmdb_id;
            tmdb_id = tmdb_id1 !== undefined ? tmdb_id1 : tmdb_id2;
            url = 'https://api.opensubtitles.com/api/v1/subtitles?tmdb_id=' + tmdb_id + '&episode_number=' + currentEpisode.episode_num + '&season_number=' + currentEpisode.season;
        }

        var that = this;
        this.hideControlBar();
        var apiKey = config.subtitleAPIKey;
        var userAgent = 'Chrome v1.1';
        var xUserAgent = 'MyCApplication v1.1';

        var headers = new Headers({
            'Api-Key': apiKey,
            'User-Agent': userAgent,
            'X-User-Agent': xUserAgent
        });

        fetch(url, {
            method: 'GET',
            headers: headers
        })
            .then(response => response.json())
            .then(data => {
                var textTrackData = data.data
                var uniqueLanguages = {};
                var uniqueData = [];
                for (var i = 0; i < textTrackData.length; i++) {
                    var obj = textTrackData[i];
                    var language = obj.attributes.language;

                    if (!uniqueLanguages[language]) {
                        uniqueLanguages[language] = true;
                        uniqueData.push(obj);
                    }
                }
                if (uniqueData.length > 0) {
                    keys.prevFocus = keys.focusedPart;
                    keys.focusedPart = "textTracksModal";
                    var htmlContent = this.renderTextTracks(uniqueData);
                    $("#text-tracks-selection-container").html(htmlContent);
                    $("#text-tracks-modal").modal("show");
                    var textTracksMenus = $(".text-tracks-item");
                    this.textTracksDoms = textTracksMenus;
                    $(this.textTracksDoms).removeClass("active");
                    $(textTracksMenus[keys.textTracksSelection]).find("input").prop("checked", true);
                    this.hoverTextTracks(keys.textTracksSelection);
                    uniqueData.map(function (item, index) {
                        if (item.attributes.files[0].file_id == that.currentTextTrackIndex) {
                            keys.textTracksSelection = index + 1;
                            $(textTracksMenus).removeClass("active");
                            $(textTracksMenus).find("input").prop("checked", true);
                            $(textTracksMenus[index + 1]).find("input").prop("checked", true);
                            that.hoverTextTracks(index + 1);
                        }
                    });
                    $(this.textTrackConfirmBtnDoms).removeClass("active");
                } else {
                    this.keys.focusedPart = this.keys.prevFocus;
                    showToast(noSubtitle, "");
                }
            })
            .catch(error => {
                this.keys.focusedPart = this.keys.prevFocus;
                showToast(noSubtitle, "");
            });

    },

    showAudioTracksModal: function () {
        var noAudio = currentWords["no_audio"];
        var _this = this;
        try {
            var obj = mediaPlayer.getAudioTracks();
            var result = Object.keys(obj).map(function (key) {
                return [key, obj[key]];
            });
            // var result = [["0", { language: null, enabled: true }], ["1", { language: "es", enabled: true }]];
            audioTracks = result;

            this.keys.focusedPart = "audioTracksModal";
            var htmlContent = this.renderAudioTracks(result);
            this.hideControlBar();
            $("#audio-tracks-selection-container").html(htmlContent);
            $('#audio-tracks-modal').modal('show');
            var audioTracksMenus = $('#audio-tracks-modal').find('.audio-tracks-item');
            this.audioTracksDoms = audioTracksMenus;
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
            this.keys.focusedPart = "infoBar";
            showToast(noAudio, "");
        }
    },

    cancelTextTracks: function () {
        $("#text-tracks-modal").modal("hide");
        this.keys.textTracksSelection = 0;
        this.keys.focusedPart = this.keys.prevFocus;
    },

    cancelAudioTracks: function () {
        $("#audio-tracks-modal").modal("hide");
        this.keys.audioTracksSelection = 0;
        this.keys.focusedPart = this.keys.prevFocus;
    },

    confirmTextTrack: function () {
        $("#text-tracks-modal").modal("hide");
        this.keys.focusedPart = this.keys.prevFocus;

        this.currentTextTrackIndex = $("#text-tracks-modal")
            .find("input[type=radio]:checked")
            .val();
        var filed_id = this.currentTextTrackIndex;
        if (this.currentTextTrackIndex != -1) {
            try {
                var url = 'https://api.opensubtitles.com/api/v1/download';
                var apiKey = config.subtitleAPIKey
                var userAgent = 'Chrome v1.1';
                var xUserAgent = 'MyCApplication v1.1';

                var headers = new Headers({
                    'Api-Key': apiKey,
                    'User-Agent': userAgent,
                    'X-User-Agent': xUserAgent,
                    'Content-Type': 'application/json' // Specify the content type for the request body
                });
                var requestData = {
                    file_id: filed_id,
                    sub_format: 'webvtt'
                };

                fetch(url, {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify(requestData)
                })
                    .then(response => response.json())
                    .then(data => {
                        vodSeriesPlayer.loadTextTracks(data.link)
                        mediaPlayer.videoObj.addEventListener('timeupdate', vodSeriesPlayer.updateTextTracksSettings);
                    })
                    .catch(error => {
                        console.error(error);
                    });
            } catch (e) { console.log(e) }
        } else {
            this.initTextTrackSetting();
        }
    },

    confirmAudioTrack: function () {
        var index = $("#audio-tracks-modal")
            .find("input[type=radio]:checked")
            .val();
        $("#audio-tracks-modal").modal("hide");
        vodSeriesPlayer.currentAudioTrackIndex = index;
        this.keys.focusedPart = this.keys.prevFocus;
        audioTracks[index][1].enabled = true;
    },

    convertToSecond: function (data) {
        var timeParts = data.split(":");
        var hours = parseInt(timeParts[0]);
        var minutes = parseInt(timeParts[1]);
        var secondsParts = timeParts[2].split(".");
        var seconds = parseInt(secondsParts[0]);
        var milliseconds = parseFloat("0." + secondsParts[1]);

        var totalTimeInSeconds = (hours * 3600) + (minutes * 60) + seconds + milliseconds;
        return totalTimeInSeconds

    },

    loadTextTracks: function (vttFileURL) {
        fetch(vttFileURL)
            .then((response) => response.text())
            .then((data) => {
                var cueData = data.split(/\n\n/);
                textTracks = []
                cueData.forEach((cue) => {
                    var cueLines = cue.split('\n');
                    if (cueLines.length >= 2) {
                        var startTime = vodSeriesPlayer.convertToSecond(cueLines[1].split(' --> ')[0]);

                        var text = cueLines.slice(2).join('\n');
                        if (text.includes('an8')) {
                            text = text.replace(/\{\\an8\}/g, "")
                        }
                        textTracks.push({ startTime, text });
                    }
                });
            })
            .catch((error) => {
                console.error('Error loading the textTracks:', error);
            });
    },

    updateTextTracksSettings: function () {
        var currentTime = mediaPlayer.videoObj.currentTime;
        var tempCurrentTime = currentTime + Number(textTrackDelayTime)  //display text 5 seconds ahead 
        var textTracksContainer = document.getElementById('text-track-container');
        var storedTextTraclsColor = getLocalStorageData('textTracksColor') !== null ? getLocalStorageData('textTracksColor') : config.textTracksColor
        var storedTextTracksFontSize = getLocalStorageData('textTracksFontSize') !== null ? getLocalStorageData('textTracksFontSize') : config.textTracksFontSize
        var storedTextTracksBackgroundColor = getLocalStorageData('textTracksBackgroundColor') !== null ? getLocalStorageData('textTracksBackgroundColor') : config.textTracksBackgroundColor
        for (let i = 0; i < textTracks.length; i++) {
            if (textTracks[i].startTime <= tempCurrentTime && textTracks[i + 1] && textTracks[i + 1].startTime > tempCurrentTime) {
                $(".text-track-container").css({ fontSize: storedTextTracksFontSize + 'px' });
                $(".text-track-container").css({ color: storedTextTraclsColor });
                $(".text-track-container").css({ background: storedTextTracksBackgroundColor });
                $("#vod-series-player-page").find(".text-track-container").html("");
                $("#vod-series-player-page").find(".text-track-container").html(textTracks[i].text);
                return;
            }
        }
        textTracksContainer.textContent = '';
    },

    removeAllActiveClass: function () {
        $("#vod-series-video-progress").removeClass("active");
        $(".rangeslider__fill").removeClass("active");
        $(this.videoControlDoms).removeClass("active");
        $(this.videoInfoDoms).removeClass("active");
        $(this.videoControlDoms).removeClass("active");
        $(this.episodeDoms).removeClass("active");
    },

    hoverTextTrackConfirmBtn: function (index) {
        var keys = this.keys;
        keys.textTrackConfirmSelection = index;
        $(this.textTrackConfirmBtnDoms).removeClass('active')
        $(this.textTrackConfirmBtnDoms[keys.textTrackConfirmSelection]).addClass('active')
    },

    hoverAudioTrackConfirmBtn: function (index) {
        var keys = this.keys;
        keys.audioTrackConfirmSelection = index;
        $(this.audioTrackConfirmBtnDoms).removeClass('active');
        $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).addClass('active')
    },

    hoverTextTracks: function (index) {
        var keys = this.keys;
        keys.focusedPart = "textTracksModal";
        $(this.textTracksDoms).removeClass("active");
        $(this.textTrackConfirmBtnDoms).removeClass('active')
        if (index >= 0) {
            keys.textTracksSelection = index;
            moveScrollPosition(
                $("#text-tracks-selection-container"),
                this.textTracksDoms[keys.textTracksSelection],
                "vertical",
                false
            );
        } else
            keys.textTracksSelection =
                this.textTracksDoms.length + index;
        $(this.textTracksDoms[keys.textTracksSelection]).addClass(
            "active"
        );
    },

    hoverAudioTracks: function (index) {
        var keys = this.keys;
        keys.focusedPart = "audioTracksModal";
        $(this.audioTracksDoms).removeClass("active");
        $(this.audioTrackConfirmBtnDoms).removeClass('active')
        if (index >= 0) {
            keys.audioTracksSelection = index;
            moveScrollPosition(
                $("#audio-tracks-selection-container"),
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

    hoverVideoControlIcon: function (index) {
        $("#player-seasons-container").removeClass("expanded");
        this.showControlBar(false);
        this.removeAllActiveClass();
        var keys = this.keys;
        keys.focusedPart = "controlBar";
        keys.controlBarSelection = index;
        $(this.videoControlDoms[index]).addClass("active");
    },

    hoverVideoInfoIcon: function (index) {
        $("#player-seasons-container").removeClass("expanded");
        this.showControlBar(false);
        var keys = this.keys;
        this.removeAllActiveClass();
        keys.focusedPart = "infoBar";
        keys.infoBarSelection = index;
        $(this.videoInfoDoms[index]).addClass("active");
    },

    hoverEpisode: function (index) {
        $("#player-seasons-container").addClass("expanded");
        this.showControlBar(false);
        var keys = this.keys;
        this.removeAllActiveClass();
        keys.focusedPart = "episodeSelection";
        keys.episodeSelection = index;
        $(this.episodeDoms[index]).addClass("active");
        moveScrollPosition(
            $("#player-seasons-container"),
            this.episodeDoms[keys.episodeSelection],
            "horizontal",
            false
        );
    },

    hoverSeekBar: function () {
        var keys = this.keys;
        keys.focusedPart = "seekBar";
        $(this.videoControlDoms).removeClass("active");
        $("#vod-series-video-progress").addClass("active");
        $(".rangeslider__fill").addClass("active");
    },

    hoverResumeBtn: function (index) {
        var keys = this.keys;
        keys.resumeBtnSelection = index;
        keys.focusedPart = "resumeModal";
        $(this.resumeBtnDoms).removeClass("active");
        $(this.resumeBtnDoms[index]).addClass("active");
        clearTimeout(this.resumeTimer);
        this.resumeTimer = setTimeout(function () {
            $("#video-resume-modal").hide();
            keys.focusedPart = keys.prevFocus;
        }, 15000);
    },

    handleMenuClick: function () {
        var keys = this.keys;
        if (keys.focusedPart === "stopPlayerbackModal") {
            $(this.stopPlaybackBtnDoms[keys.stopPlayerbackBtnSelection]).trigger(
                "click"
            );
            return;
        } else if (keys.focusedPart === "controlBar") {
            this.showControlBar(false);
            $(this.videoControlDoms[keys.controlBarSelection]).trigger("click");
            return;
        } else if (keys.focusedPart === "seekBar") {
            this.showControlBar(false);
            return;
        } else if (keys.focusedPart === "infoBar") {
            if (this.showControl) {
                this.showControlBar(false);
                $(this.videoInfoDoms[keys.infoBarSelection]).trigger("click");
            } else {
                this.showControlBar(true);
            }
        } else if (keys.focusedPart === "episodeSelection") {
            if (this.showControl) {
                this.showControlBar(false);
                $(this.episodeDoms[keys.episodeSelection]).trigger("click");
            } else {
                this.showControlBar(true);
            }
        } else if (keys.focusedPart === "textTracksModal") {
            $(this.textTracksDoms).find("input").prop("checked", false);
            $(this.textTracksDoms[keys.textTracksSelection])
                .find("input")
                .prop("checked", true);
        } else if (keys.focusedPart === "textTrackConfirmBtn") {
            $(this.textTrackConfirmBtnDoms[keys.textTrackConfirmSelection]
            ).trigger("click");
        } else if (keys.focusedPart === "audioTracksModal") {
            $(this.audioTracksDoms).find("input").prop("checked", false);
            $(this.audioTracksDoms[keys.audioTracksSelection])
                .find("input")
                .prop("checked", true);
        } else if (keys.focusedPart === "audioTrackConfirmBtn") {
            $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).trigger("click");
            this.confirmAudioTrack();
        } else if (keys.focusedPart === "resumeModal") {
            $("#video-resume-modal").hide();
            keys.focusedPart = keys.prevFocus;
            if (keys.resumeBtnSelection == 0) {
                try {
                    var currentTime = mediaPlayer.videoObj.currentTime;
                    if (currentTime < this.resumeTime) {
                        mediaPlayer.videoObj.currentTime = this.resumeTime / 1000;
                    }
                } catch (e) { }
            }
        } else if (keys.focusedPart === "delaySelection") {
            if (keys.delaySelection === 0)
                this.clickDelayInputBox();
            else if (keys.delaySelection === 1)
                this.confirmTextTrackDelay();
            else
                this.cancelTextTracksDelay();
        }
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        if (this.showControl) {
            this.showControlBar(false);
            if (keys.focusedPart === "controlBar") {
                keys.controlBarSelection += increment;
                if (keys.controlBarSelection < 0) keys.controlBarSelection = 0;
                if (keys.controlBarSelection >= this.videoControlDoms.length)
                    keys.controlBarSelection = this.videoControlDoms.length - 1;
                $(this.videoControlDoms).removeClass("active");
                $(this.videoControlDoms[keys.controlBarSelection]).addClass("active");
            } else if (keys.focusedPart === "seekBar") {
                this.seekTo(20 * increment);
            } else if (keys.focusedPart === "infoBar") {
                keys.infoBarSelection += increment;
                if (keys.infoBarSelection < 0) keys.infoBarSelection = 0;
                if (keys.infoBarSelection >= this.videoInfoDoms.length)
                    keys.infoBarSelection = this.videoInfoDoms.length - 1;
                $(this.videoInfoDoms).removeClass("active");
                $(this.videoInfoDoms[keys.infoBarSelection]).addClass("active");
            } else if (keys.focusedPart === "episodeSelection") {
                $(this.episodeDoms).removeClass("active");
                keys.episodeSelection += increment;
                if (keys.episodeSelection < 0)
                    keys.episodeSelection = this.episodeDoms.length - 1;
                if (keys.episodeSelection >= this.episodeDoms.length)
                    keys.episodeSelection = 0;
                $(this.episodeDoms[keys.episodeSelection]).addClass("active");
                moveScrollPosition(
                    $("#player-seasons-container"),
                    this.episodeDoms[keys.episodeSelection],
                    "horizontal",
                    false
                );
            }
        } else {
            if (keys.focusedPart === "stopPlayerbackModal") {
                keys.stopPlayerbackBtnSelection += increment;
                if (keys.stopPlayerbackBtnSelection < 0) keys.stopPlayerbackBtnSelection = 0;
                if (keys.stopPlayerbackBtnSelection > 1) keys.stopPlayerbackBtnSelection = 1;
                this.hoverExitPlaybackMenuItem(keys.stopPlayerbackBtnSelection);
            } else if (keys.focusedPart === "textTracksModal") {
                keys.focusedPart = "textTrackConfirmBtn";
                $(".text-tracks-item").removeClass("active");
                keys.textTrackConfirmSelection = increment === 1 ? 1 : 0;
                $(this.textTrackConfirmBtnDoms).removeClass('active')
                $(this.textTrackConfirmBtnDoms[keys.textTrackConfirmSelection]).addClass('active')
            } else if (keys.focusedPart === "textTrackConfirmBtn") {
                keys.textTrackConfirmSelection = keys.textTrackConfirmSelection === 1 ? 0 : 1;
                $(this.textTrackConfirmBtnDoms).removeClass('active')
                $(this.textTrackConfirmBtnDoms[keys.textTrackConfirmSelection]).addClass('active')
            } else if (keys.focusedPart === "audioTrackConfirmBtn") {
                keys.audioTrackConfirmSelection = keys.audioTrackConfirmSelection === 1 ? 0 : 1;
                $(this.audioTrackConfirmBtnDoms).removeClass('active')
                $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).addClass('active');
            } else if (keys.focusedPart === "resumeModal") {
                keys.resumeBtnSelection += increment;
                if (keys.resumeBtnSelection < 0) keys.resumeBtnSelection = this.resumeBtnDoms.length - 1;
                if (keys.resumeBtnSelection >= this.resumeBtnDoms.length) keys.resumeBtnSelection = 0;
                $(this.resumeBtnDoms).removeClass("active");
                $(this.resumeBtnDoms[keys.resumeBtnSelection]).addClass("active");
                clearTimeout(this.resumeTimer);
                this.resumeTimer = setTimeout(function () {
                    $("#video-resume-modal").hide();
                    keys.focusedPart = keys.prevFocus;
                }, 15000);
            } else if (keys.focusedPart === "delaySelection") {
                keys.delaySelection += increment;
                if (increment > 0) {
                    if (keys.delaySelection == 1) {
                        $("#text-track-delay-time").blur();
                    }
                    if (keys.delaySelection > 2)
                        keys.delaySelection = 2;
                    this.hoverDelayItem(keys.delaySelection);
                } else {
                    if (keys.delaySelection < 0) {
                        keys.delaySelection = 0;
                        $("#text-track-delay-time").focus();
                    }
                    this.hoverDelayItem(keys.delaySelection);
                }
            }
        }
    },

    handleMenuUpDown: function (increment) {
        var keys = this.keys;
        if (this.showControl) {
            this.showControlBar(false);
            switch (keys.focusedPart) {
                case "controlBar":
                    if (increment > 0) {
                        $(this.videoControlDoms).removeClass("active");
                        $(this.videoInfoDoms).removeClass("active");
                        keys.focusedPart = "infoBar";
                        keys.prevFocus = "infoBar";
                        keys.infoBarSelection = 0;
                        $(this.videoInfoDoms[keys.infoBarSelection]).addClass("active");
                    } else {
                        keys.focusedPart = "seekBar";
                        $(this.videoControlDoms).removeClass("active");
                        $("#vod-series-video-progress").addClass("active");
                        $(".rangeslider__fill").addClass("active");
                    }
                    break;
                case "seekBar":
                    if (increment > 0) {
                        keys.focusedPart = "controlBar";
                        $("#vod-series-video-progress").removeClass("active");
                        $(".rangeslider__fill").removeClass("active");
                        $(this.videoControlDoms).removeClass("active");
                        $(this.videoInfoDoms).removeClass("active");
                        $(this.videoControlDoms[2]).addClass("active");
                    }
                    break;
                case "infoBar":
                    if (increment < 0) {
                        $(this.videoControlDoms).removeClass("active");
                        $(this.videoInfoDoms).removeClass("active");
                        keys.focusedPart = "controlBar";
                        keys.prevFocus = "controlBar";
                        keys.controlBarSelection = 2;
                        $(this.videoControlDoms[2]).addClass("active");
                    }
                    if (this.hasEpisodes && increment > 0) {
                        $(this.videoControlDoms).removeClass("active");
                        $(this.videoInfoDoms).removeClass("active");
                        $("#player-seasons-container").addClass("expanded");
                        keys.focusedPart = "episodeSelection";
                        keys.prevFocus = "episodeSelection";
                        $(this.episodeDoms[keys.episodeSelection]).addClass("active");
                        moveScrollPosition(
                            $("#player-seasons-container"),
                            this.episodeDoms[keys.episodeSelection],
                            "horizontal",
                            false
                        );
                    }
                    break;
                case "episodeSelection":
                    if (increment < 0) {
                        $(this.videoControlDoms).removeClass("active");
                        $(this.videoInfoDoms).removeClass("active");
                        $("#player-seasons-container").removeClass("expanded");
                        keys.focusedPart = "infoBar";
                        $(this.episodeDoms).removeClass("active");
                        $(this.videoInfoDoms[keys.infoBarSelection]).addClass("active");
                    }
                    break;
            }
        } else {
            if (
                (keys.focusedPart === "controlBar" ||
                    keys.focusedPart === "infoBar" ||
                    keys.focusedPart === "seekBar" ||
                    keys.focusedPart === "episodeSelection") &&
                !this.showControl &&
                (keys.focusedPart !== "textTracksModal" ||
                    keys.focusedPart !== "audioTracksModal")
            ) {
                this.showControlBar(true);
            } else if (keys.focusedPart == "textTracksModal") {
                keys.textTracksSelection += increment;
                if (keys.textTracksSelection >= this.textTracksDoms.length) {
                    $(this.textTracksDoms).removeClass("active");
                    keys.textTracksSelection = this.textTracksDoms.length - 1;
                    keys.focusedPart = "textTrackConfirmBtn";
                    $(this.textTrackConfirmBtnDoms).removeClass('active')
                    $(this.textTrackConfirmBtnDoms[keys.textTrackConfirmSelection]).addClass('active')
                    return;
                } else if (keys.textTracksSelection < this.textTracksDoms.length && keys.textTracksSelection >= 0) {
                    this.hoverTextTracks(keys.textTracksSelection);
                    return;
                } else if (keys.textTracksSelection < 0) {
                    keys.textTracksSelection = 0;
                    return;
                }
            } else if (keys.focusedPart === 'textTrackConfirmBtn') {
                if (increment < 0) {
                    keys.focusedPart = "textTracksModal";
                    this.hoverTextTracks(keys.textTracksSelection);
                    $(this.textTrackConfirmBtnDoms).removeClass('active')
                }
            } else if (keys.focusedPart == "audioTracksModal") {
                keys.audioTracksSelection += increment;
                if (keys.audioTracksSelection >= this.audioTracksDoms.length) {
                    $(this.audioTracksDoms).removeClass("active");
                    keys.audioTracksSelection = this.audioTracksDoms.length - 1;
                    keys.focusedPart = "audioTrackConfirmBtn";
                    $(this.audioTrackConfirmBtnDoms).removeClass('active');
                    $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).addClass('active')
                    return;
                } else if (keys.audioTracksSelection < this.audioTracksDoms.length && keys.audioTracksSelection >= 0) {
                    this.hoverAudioTracks(keys.audioTracksSelection);
                    return;
                } else if (keys.audioTracksSelection < 0) {
                    keys.audioTracksSelection = 0;
                    return;
                }
            } else if (keys.focusedPart === 'audioTrackConfirmBtn') {
                if (increment < 0) {
                    keys.focusedPart = "audioTracksModal";
                    this.hoverAudioTracks(keys.audioTracksSelection);
                    $(this.audioTrackConfirmBtnDoms).removeClass('active')
                }
            }
        }
    },

    HandleKey: function (e) {
        console.log('keyCode', e.keyCode)
        switch (e.keyCode) {
            case tvKey.ArrowLeft:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.ArrowRight:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.MediaRewind:
                this.seekTo(-30);
                break;
            case tvKey.ArrowDown:
                this.handleMenuUpDown(1);
                break;
            case tvKey.ArrowUp:
                this.handleMenuUpDown(-1);
                break;
            case tvKey.Enter:
                this.handleMenuClick();
                break;
            case tvKey.MediaFastForward:
                this.seekTo(30);
                break;
            case tvKey.MediaPause:
                this.pauseVideo();
                break;
            case tvKey.MediaPlay:
                this.playVideo();
                break;
            case tvKey.MediaPlayPause:
                this.playPauseVideo();
                break;
            case tvKey.ColorF2Yellow:
                if (
                    this.currentMovieType === "movies" ||
                    this.currentMovieType === "movie"
                ) {
                    if (!currentMovie.isFavorite) {
                        movieHelper.addRecentOrFavoriteMovie(
                            "vod",
                            currentMovie,
                            "favorite"
                        );
                        currentMovie.isFavorite = true;
                    } else {
                        movieHelper.removeRecentOrFavoriteMovie(
                            "vod",
                            currentMovie.stream_id,
                            "favorite"
                        );
                        currentMovie.isFavorite = false;
                    }
                } else {
                    if (!currentSeries.isFavorite) {
                        movieHelper.addRecentOrFavoriteMovie(
                            "series",
                            currentSeries,
                            "favorite"
                        );
                        currentSeries.isFavorite = true;
                    } else {
                        movieHelper.removeRecentOrFavoriteMovie(
                            "series",
                            currentSeries.series_id,
                            "favorite"
                        );
                        currentSeries.isFavorite = false;
                    }
                }
                break;
            case tvKey.Back:
                this.goBack();
                break;
            case tvKey.MediaStop:
                this.goBack();
                break;
        }
    }
};
