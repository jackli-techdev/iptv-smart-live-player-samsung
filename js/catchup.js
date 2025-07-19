"use strict";
var catchup = {
    player: null,
    videoControlDoms: $("#catchup-controls-wrapper .video-control-icon i"),
    keys: {
        focusedPart: "programSelection",
        dateSelection: 0,
        programSelection: 0,
        videoControl: 2,
        audioTracksSelection: 0,
        audioTrackConfirmSelection: 0
    },
    fullScreenTimer: null,
    progressbarTimer: null,
    movie: {},
    dates: [],
    audioTracksDoms: [],
    audioTrackConfirmBtnDoms: $("#catchup-audio-tracks-modal .audio-track-btn"),
    currentDateIndex: 0,
    programmes: {},
    startTime: "",
    duration: 0,
    channelId: "",
    currentAudioTrackIndex: -1,

    init: function (movie, programmes) {
        currentRoute = "catchup-page";
        var keys = this.keys;
        this.dates = [];
        this.programmes = {};
        catchup.currentAudioTrackIndex = -1;
        this.channelId = movie.stream_id;
        $(this.videoControlDoms).removeClass("active");
        $(this.videoControlDoms[2]).addClass("active");
        $("#live-media-play").addClass("hide");
        this.makeDateSortedProgramms(movie, programmes);
        $("#channel-image-container").find("img").attr("src", movie.stream_icon).on("error", function () {
            $(this).attr("src", config.liveIcon);
        });
        $("#channel-name").text(movie.name);

        keys.audioTrackConfirmSelection = 0;
        var dateIndex = -1;
        var htmlContent = "";
        var currentDate = moment(new Date()).format("Y-MM-DD");
        this.dates.map(function (date, index) {
            htmlContent +=
                '<div class="program-date-wrapper" onmouseenter = "catchup.hoverDate(' +
                index +
                ')" onClick = "catchup.clickDateSelection(' +
                index +
                ')" date-date="' +
                date +
                '">' +
                "<div>" +
                '<span class ="program-date-wrapper-date">' +
                getDay(date)[0] +
                "</span>" +
                "<p class = 'program-date'>" +
                getDay(date)[1] +
                "</p>" +
                "</div>" +
                "</div>";
            if (date == currentDate) dateIndex = index;
        });
        if (dateIndex == -1) dateIndex = 0;
        $("#program-date-container").html(htmlContent);
        $($(".program-date-wrapper")[dateIndex]).addClass("active");
        this.keys.dateSelection = dateIndex;
        this.currentDateIndex = dateIndex;
        this.changePrograms(currentDate);

        catchLoading = true;
        if (catchLoading === true) {
            $("#catchup-loading-page").hide();
        }

        displayCurrentPage(currentRoute);

        $($(".program-menu-item")[this.keys.programSelection]).addClass("active");
        var program_menus = $(".program-menu-item");
        $(
            $(program_menus[this.keys.programSelection]).find(
                ".chachup-program-description"
            )[0]
        ).show();
        this.changeChannelDateScrollPosition(
            $(".program-date-wrapper")[catchup.keys.dateSelection]
        );
        this.changeProgrammeScrollPosition(
            $(".program-menu-item")[catchup.keys.programSelection]
        );
        var menus = $(".program-date-wrapper");
        moveScrollPosition(
            $("#program-date-container"),
            menus[keys.dateSelection],
            "vertical",
            false
        );
        moveScrollPosition(
            $("#program-menu-container"),
            program_menus[keys.programSelection],
            "vertical",
            false
        );
        this.keys.focusedPart = "programSelection";
    },

    hoverDate: function (index) {
        var keys = this.keys;
        keys.focusedPart = "dateSelection";
        keys.dateSelection = index;
        var menus = $(".program-date-wrapper");
        if (keys.dateSelection >= menus.length) {
            keys.dateSelection = menus.length - 1;
        }
        if (keys.dateSelection < 0) {
            keys.dateSelection = 0;
        }
        $(menus).removeClass("pre-active");
        $(menus[keys.dateSelection]).addClass("pre-active");
        moveScrollPosition(
            $("#program-date-container"),
            menus[keys.dateSelection],
            "vertical",
            false
        );
    },

    showNextVideo: function (increment) {
        var keys = this.keys;
        keys.programSelection += increment;
        this.hoverProgramSelection(keys.programSelection);
        this.showMovie();
        this.showControlBar();
    },

    seekTo: function (step) {
        clearTimeout(this.seek_timer);
        var current_time = mediaPlayer.videoObj.currentTime;
        var duration = parseInt(mediaPlayer.videoObj.duration);
        this.current_time = current_time;
        var newTime = this.current_time + step;
        if (newTime < 0) newTime = 0;
        if (newTime >= duration) newTime = duration;
        this.current_time = newTime;
        try {
            mediaPlayer.pause();
        } catch (e) { }

        if (duration > 0) {
            $("#catchup")
                .find(".video-current-time")
                .html(mediaPlayer.formatTime(newTime));

            $("#catchup")
                .find(".progress-amount")
                .css({ width: newTime / duration * 100 + "%" });
        }
        this.seek_timer = setTimeout(function () {
            mediaPlayer.videoObj.currentTime = newTime;
            setTimeout(function () {
                try {
                    mediaPlayer.play();
                } catch (e) { }
            }, 200);
        }, 500);
    },

    playPauseVideo: function () {
        if (mediaPlayer.state === mediaPlayer.STATES.PLAYING) {
            try {
                mediaPlayer.pause();
                $("#live-media-play").removeClass("hide");
                $("#live-media-pause").addClass("hide");
            } catch (e) { }
        } else if (mediaPlayer.state === mediaPlayer.STATES.PAUSED) {
            try {
                mediaPlayer.play();
                $("#live-media-play").addClass("hide");
                $("#live-media-pause").removeClass("hide");
            } catch (e) { }
        }
    },

    playPauseVideoFromNetworkIssue: function () {
        try {
            mediaPlayer.playFromNetworkIssue();
            $("#live-media-play").addClass("hide");
            $("#live-media-pause").removeClass("hide");
        } catch (e) { }
    },

    getDuration: function () {
        var date = this.dates[this.currentDateIndex];
        var program = this.programmes[date];
        this.duration = parseInt(
            (program.stop_timestamp - program.start_timestamp) / 60
        );
    },

    makeDateSortedProgramms: function (movie, programmes) {
        this.movie = movie;
        var that = this;
        var exist_index = 0;
        programmes.map(function (program) {
            var exist = false;
            for (var i = 0; i < that.dates.length; i++) {
                if (program.start.includes(that.dates[i])) {
                    exist = true;
                    exist_index = i;
                    break;
                }
            }
            if (exist) that.programmes[that.dates[exist_index]].push(program);
            else {
                var new_date = program.start.slice(0, 10);
                that.dates.push(new_date);
                that.programmes[new_date] = [program];
            }
        });
        this.dates.sort();
    },

    changePrograms: function (date) {
        var htmlContent = "";
        var currentProgrammes = this.programmes[date];
        var formatText = "Y-MM-DD HH:mm";
        var currentDate = getTodayDate(formatText);
        var tempPros = [];
        currentProgrammes.filter(function (program) {
            if (program.stop > currentDate && currentDate >= program.start) {
                tempPros.push(program.start);
            }
        });

        var timestamps = tempPros.map(function (dateStr) {
            return Date.parse(dateStr);
        });

        var maxTimestamp = Math.max.apply(null, timestamps);
        var convertedDate = getConvertedDate(maxTimestamp);

        if (timeFormat == 24 && convertedDate.includes("PM")) {
            var convertedDate = convertedDate;
        }

        var epg_icon = '<img src="images/settings/clock.png" class = "catchup-click-img"/>';
        var keys = this.keys;
        currentProgrammes.map(function (program, index) {
            if (convertedDate == program.start) {
                keys.programSelection = index;
            }
            htmlContent +=
                '<div class="program-menu-item" onClick = "catchup.clickProgramSelection(' +
                index +
                ')" onmouseenter = "catchup.hoverProgramSelection(' +
                index +
                ')" data-type="live-tv">' +
                "<div>" +
                convertTime(program.start) +
                " " +
                (program.has_archive == 0 ? "" : epg_icon) +
                " " +
                (convertedDate == program.start
                    ? '<span class = "current-programming">live</span>'
                    : '<span style = "padding: 0px 8px 0px 8px;"></span>') +
                program.title +
                "</div>" +
                '<div class ="chachup-program-description">' +
                program.description +
                "</div>" +
                "</div>";
        });
        $("#program-menu-container").html(htmlContent);
        $("#program-menu-container").animate({ scrollTop: 0 }, 10);
    },

    changeCurrentProgram: function (dateIndex, program_index) {
        var date = this.dates[dateIndex];
        var programme = this.programmes[date][program_index];
        $("#current-program-name").text(getAtob(programme.title));

        var current_program_time =
            moment(programme.start).format("MMM. DD HH:mm") +
            " - " +
            moment(programme.stop).format("HH:mm");
        $("#current-program-time").text(current_program_time);
        $("#catchup-program-title").text(
            programme.title != "" ? getAtob(programme.title) : "No Information"
        );
        $("#catchup-program-description").text(
            programme.description != ""
                ? getAtob(programme.description)
                : "No Information"
        );

        var programme_elements = $(".program-menu-item");
        $(".program-menu-item").removeClass("active");
        $(programme_elements[program_index]).addClass("active");
    },

    hoverVideoControlIcon: function (index) {
        var keys = this.keys;
        keys.videoControl = index;
        keys.focusedPart = "fullScreen";

        if (keys.videoControl < 0) keys.videoControl = 0;
        if (keys.videoControl >= this.videoControlDoms.length)
            keys.videoControl = this.videoControlDoms.length - 1;
        $(this.videoControlDoms).removeClass("active");
        $(this.videoControlDoms[keys.videoControl]).addClass("active");
        this.showControlBar();
    },

    clickProgramSelection: function (index) {
        var keys = this.keys;
        keys.programSelection = index;
        this.currentDateIndex = keys.dateSelection;
        this.changeCurrentProgram(keys.dateSelection, keys.programSelection);
        var currentDate = this.dates[this.currentDateIndex];
        var current_program = this.programmes[currentDate];
        this.startTime = moment(current_program.start_time).format(
            "Y-MM-DD:HH-mm"
        );

        closeVideo();

        var date = this.dates[this.currentDateIndex];
        var programme = this.programmes[date][keys.programSelection];
        if (programme.has_archive) {
            keys.focusedPart = "fullScreen";
            $("#catchup-video-title").text(programme.title);
            var temp = LiveModel.getProgrammeVideoUrl(this.channelId, programme);

            $("#catchup").find(".video-current-time").text("--:--");
            $("#catchup").find(".video-total-time").text("--:--");
            $("#catchup").find(".progress-amount").css({ width: "0%" });
            $("#live-media-pause").removeClass("hide");
            $("#live-media-play").addClass("hide");

            mediaPlayer.init("catchup-page-video", "catchup");
            mediaPlayer.playAsync(temp.url);

            this.fullScreenTimer = setTimeout(function () {
                $("#catchup-player-controller").slideUp();
                $("#catchup-video-title").slideUp();
            }, 10000);
            $("#catchup-player-controller").slideDown();
            $("#catchup-video-title").slideDown();
            $("#catchup").find(".catch-up-player-container").css({
                position: "fixed",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                height: "100vh",
                background: "#222"
            });
            $("#catchup-page-left-part").addClass("hide");
            $("#catchup-page-right-part").addClass("hide");
            $("#catchup").removeClass("hide");
        } else {
            showNoEPGToast();
        }
    },

    showMovie: function () {
        var keys = this.keys;
        $("#catchup-page-left-part").addClass("hide");
        $("#catchup-page-right-part").addClass("hide");
        closeVideo();
        var date = this.dates[this.currentDateIndex];
        var programme = this.programmes[date][keys.programSelection];
        $("#catchup-video-title").text(programme.title);
        var temp = LiveModel.getProgrammeVideoUrl(this.channelId, programme);
        mediaPlayer.init("catchup-page-video", "catchup");
        mediaPlayer.playAsync(temp.url);
        $("#catchup").find(".video-current-time").text("--:--");
        $("#catchup").find(".video-total-time").text("--:--");
        $("#catchup").find(".progress-amount").css({ width: "0%" });
        $("#catch-up-player-container").removeClass("hide");
    },

    changeChannelDateScrollPosition: function (element) {
        var padding_left = parseInt(
            $("#program-date-container").css("padding-left").replace("px", "")
        );
        var parent_width = parseInt(
            $("#program-date-container").css("width").replace("px", "")
        );
        var child_position = $(element).position();
        var element_width = parseInt($(element).css("width").replace("px", ""));
        if (child_position.left + element_width >= parent_width) {
            $("#program-date-container").animate(
                {
                    scrollLeft:
                        "+=" + (child_position.left + element_width - parent_width)
                },
                10
            );
        }
        if (child_position.left - padding_left < 0) {
            $("#program-date-container").animate(
                { scrollLeft: "+=" + (child_position.left - padding_left) },
                10
            );
        }
    },

    changeProgrammeScrollPosition: function (element) {
        var parent_element = $("#program-menu-container");
        var padding_top = parseInt(
            $(parent_element).css("padding-top").replace("px", "")
        );
        var parent_height = parseInt(
            $(parent_element).css("height").replace("px", "")
        );
        var child_position = $(element).position();
        var element_height = parseInt($(element).css("height").replace("px", ""));
        if (child_position.top + element_height >= parent_height) {
            $(parent_element).animate(
                {
                    scrollTop:
                        "+=" + (child_position.top + element_height - parent_height)
                },
                10
            );
        }
        if (child_position.top - padding_top < 0) {
            $(parent_element).animate(
                { scrollTop: "+=" + (child_position.top - padding_top) },
                10
            );
        }
    },

    hideControlBar: function () {
        $("#catchup-player-controller").slideUp();
        $("#catchup-video-title").slideUp();
    },

    showControlBar: function () {
        $("#catchup-player-controller").slideDown();
        $("#catchup-video-title").slideDown();
        clearTimeout(this.timeOut);
        var that = this;
        this.timeOut = setTimeout(function () {
            that.hideControlBar();
        }, 10000);
    },

    clickDateSelection: function (index) {
        var keys = this.keys;
        keys.dateSelection = index;
        var currentDate = this.dates[keys.dateSelection];
        this.changePrograms(currentDate);
        var menus = $(".program-date-wrapper");
        $(menus).removeClass("pre-active");
        $(menus).removeClass("active");
        keys.programSelection = 0;
        $(menus[keys.dateSelection]).addClass("active");
    },

    menuClickEvent: function () {
        var keys = this.keys;

        if (keys.focusedPart === "programSelection") {
            this.clickProgramSelection(keys.programSelection);
        } else if (keys.focusedPart === "fullScreen") {
            $(this.videoControlDoms[keys.videoControl]).trigger("click");
        } else if (keys.focusedPart === "dateSelection") {
            var currentDate = this.dates[keys.dateSelection];
            this.changePrograms(currentDate);
            var menus = $(".program-date-wrapper");
            $(menus).removeClass("pre-active");
            $(menus).removeClass("active");
            keys.programSelection = 0;
            $(menus[keys.dateSelection]).addClass("active");
        } else if (keys.focusedPart === "audioTracksModal") {
            $(this.audioTracksDoms).find("input").prop("checked", false);
            $(this.audioTracksDoms[keys.audioTracksSelection])
                .find("input")
                .prop("checked", true);
        } else if (keys.focusedPart === "audioTrackConfirmBtn") {
            $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).trigger("click");
            this.confirmAudioTrack();
        }
    },

    hoverProgramSelection: function (index) {
        var keys = this.keys;
        keys.programSelection = index;
        keys.focusedPart = "programSelection";
        var program_menus = $(".program-menu-item");
        if (keys.programSelection >= program_menus.length) {
            keys.programSelection = program_menus.length - 1;
        }
        if (keys.programSelection < 0) {
            keys.programSelection = 0;
        }
        $(".program-menu-item").removeClass("active");
        $(program_menus[keys.programSelection]).addClass("active");
        $(".chachup-program-description").hide();
        $(
            $(program_menus[keys.programSelection]).find(
                ".chachup-program-description"
            )[0]
        ).show();
        moveScrollPosition(
            $("#program-menu-container"),
            program_menus[keys.programSelection],
            "vertical",
            false
        );
    },

    renderAudioTracks: function (items) {
        var htmlContent = "";
        items.map(function (item, index) {
            var fullLanguage = !item[1].language ? 'English' : vodSeriesPlayer.getFullLanguage(item[1].language);
            htmlContent +=
                '<div class="audio-tracks-item"  onmouseenter="catchup.hoverAudioTracks(' + index + ')" onclick="catchup.handleMenuClick()">'
                + '<input class="magic-radio" type="radio" name="radio" id="catchup-disable-audio-tracks-' + index + '" value="' + index + '">'
                + '<label for="catchup-disable-audio-tracks">' + fullLanguage + '</label>'
                + '</div>';
        })
        return htmlContent;
    },

    showTextTracksModal: function () {

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
            catchupAudioTracks = result;
            this.keys.focusedPart = "audioTracksModal";
            var htmlContent = this.renderAudioTracks(result);
            this.hideControlBar();
            $("#catchup-audio-tracks-selection-container").html(htmlContent);
            $('#catchup-audio-tracks-modal').modal('show');
            var audioTracksMenus = $('#catchup-audio-tracks-modal').find('.audio-tracks-item');
            catchup.audioTracksDoms = audioTracksMenus;
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
            this.keys.focusedPart = "fullScreen";
            showToast(noAudio, "");
        }
    },

    confirmAudioTrack: function () {
        var index = $("#catchup-audio-tracks-modal")
            .find("input[type=radio]:checked")
            .val();
        $("#catchup-audio-tracks-modal").modal("hide");
        catchup.currentAudioTrackIndex = index;
        this.keys.focusedPart = "fullScreen";
        catchupAudioTracks[index][1].enabled = true;
    },

    hoverAudioTracks: function (index) {
        var keys = this.keys;
        keys.focusedPart = "audioTracksModal";
        $(this.audioTracksDoms).removeClass("active");
        $(this.audioTrackConfirmBtnDoms).removeClass('active')
        if (index >= 0) {
            keys.audioTracksSelection = index;
            moveScrollPosition(
                $("#catchup-audio-tracks-selection-container"),
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

    cancelAudioTracks: function () {
        $("#catchup-audio-tracks-modal").modal("hide");
        this.keys.audioTracksSelection = 0;
        this.keys.focusedPart = "fullScreen";
    },

    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        if (keys.focusedPart === "programSelection") {
            keys.programSelection += increment;
            this.hoverProgramSelection(keys.programSelection);
        } else if (keys.focusedPart == "dateSelection") {
            keys.dateSelection += increment;
            this.hoverDate(keys.dateSelection);
        } else if (keys.focusedPart == "fullScreen") {
            this.showControlBar();
        } else if (keys.focusedPart == "audioTracksModal") {
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
        } else if (keys.focusedPart === 'audioTrackConfirmBtn') {
            if (increment < 0) {
                keys.focusedPart = "audioTracksModal";
                this.hoverAudioTracks(keys.audioTracksSelection);
                $(this.audioTrackConfirmBtnDoms).removeClass('active')
            }
        }
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        if (keys.focusedPart === "dateSelection") {
            var program_menus = $(".program-menu-item");
            if (increment > 0) {
                keys.focusedPart = "programSelection";
                var menus = $(".program-date-wrapper");
                $(menus).removeClass("pre-active");
                $(".chachup-program-description").hide();
                $(
                    $(program_menus[keys.programSelection]).find(
                        ".chachup-program-description"
                    )[0]
                ).show();
                $(program_menus[keys.programSelection]).addClass("active");
                moveScrollPosition(
                    $("#program-menu-container"),
                    program_menus[keys.programSelection],
                    "vertical",
                    false
                );
                return;
            }
        } else if (keys.focusedPart === "programSelection") {
            if (increment < 0) {
                keys.focusedPart = "dateSelection";
                var program_menus = $(".program-menu-item");
                $(program_menus).removeClass("active");
                var menus = $(".program-date-wrapper");
                $(menus).removeClass("pre-active");
                $(".chachup-program-description").hide();
                $(menus[keys.dateSelection]).addClass("pre-active");
                return;
            }
        } else if (keys.focusedPart == "fullScreen") {
            keys.videoControl += increment;
            this.hoverVideoControlIcon(keys.videoControl);
        }
        else if (keys.focusedPart === "audioTrackConfirmBtn") {
            keys.audioTrackConfirmSelection = keys.audioTrackConfirmSelection === 1 ? 0 : 1;
            $(this.audioTrackConfirmBtnDoms).removeClass('active')
            $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).addClass('active');
        }
    },

    goBack: function () {
        if (this.keys.focusedPart === "programSelection" || this.keys.focusedPart === "dateSelection") {
            $("#catchup-page").addClass("hide");
            $("#channel-page-bottom-container").removeClass("hide");
            closeVideo();
            $("#channel-page").removeClass("hide");
            $(".top-bar").removeClass("hide");
            currentRoute = "channel-page";
            $("#channel-page .player-container").removeClass("expanded");
            channel.keys.focusedPart = "bottomSelection";
            channel.hoverbottom(0);
        } else if (this.keys.focusedPart === "fullScreen") {
            closeVideo();
            this.keys.focusedPart = "programSelection";
            $("#catchup-page-left-part").removeClass("hide");
            $("#catchup-page-right-part").removeClass("hide");
            $("#catchup").addClass("hide");
        } else if (this.keys.focusedPart === "audioTracksModal" || this.keys.focusedPart === "audioTrackConfirmBtn") {
            this.keys.focusedPart = "fullScreen";
            this.keys.audioTracksSelection = 0;
            $("#catchup-audio-tracks-modal").modal("hide");
        }
    },

    HandleKey: function (e) {
        switch (e.keyCode) {
            case tvKey.ArrowRight:
                catchup.handleMenuLeftRight(1);
                break;
            case tvKey.ArrowLeft:
                catchup.handleMenuLeftRight(-1);
                break;
            case tvKey.ArrowDown:
                catchup.handleMenusUpDown(1);
                break;
            case tvKey.ArrowUp:
                catchup.handleMenusUpDown(-1);
                break;
            case tvKey.Enter:
                catchup.menuClickEvent();
                break;
            case tvKey.Back:
                catchup.goBack();
                break;
        }
    }
};
