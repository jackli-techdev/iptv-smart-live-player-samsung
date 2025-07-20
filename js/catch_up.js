"use strict";
var catchup_variables = {
  player: null,
  video_control_doms: [],
  keys: {
    focused_part: "date_program_selection",
    date_selection: 0,
    program_selection: 0,
    video_control: 2,
    audioTracksSelection: 0,
    audioTrackConfirmSelection: 0
  },
  full_screen_timer: null,
  progressbar_timer: null,
  movie: {},
  dates: [],
  audioTracksDoms: [],
  audioTrackConfirmBtnDoms: $("#catchup-audio-tracks-modal .audio-track-btn"),
  current_date_index: 0,
  current_program_index: 0,
  programmes: {},
  full_screen_video: false,
  start_time: "",
  duration: 0,
  channel_id: "",
  current_programming_index: "",
  prev_route: "",
  currentAudioTrackIndex: -1,

  init: function (movie, programmes, prev_route) {
    var keys = this.keys;
    this.dates = [];
    this.programmes = {};
    this.channel_id = movie.stream_id;
    this.prev_route = prev_route;
    showLoader(false);
    this.video_control_doms = $(
      "#catchup-controls-wrapper .video-control-icon i"
    );
    $(this.video_control_doms).removeClass("active");
    $(this.video_control_doms[2]).addClass("active");
    $("#live-media-play").addClass("hide");
    this.makeDateSortedProgramms(movie, programmes);
    $("#channel-image-container").find("img").attr("src", movie.stream_icon);
    $("#channel-name").text(movie.name);
    var dates = this.dates;
    var htmlContent = "";
    var current_date = moment(new Date()).format("Y-MM-DD");
    var date_index = -1;
    dates.map(function (date, index) {
      htmlContent +=
        '<div class="program-date-wrapper" onmouseenter = "catchup_variables.hoverDate(' +
        index +
        ')" onClick = "catchup_variables.clickDateSelection(' +
        index +
        ')" date-date="' +
        date +
        '">' +
        "<div>" +
        '<span class ="program-date-wrapper-date">' +
        catchup_variables.getDay(date)[0] +
        "</span>" +
        "<p class = 'program-date'>" +
        catchup_variables.getDay(date)[1] +
        "</p>" +
        "</div>" +
        "</div>";
      if (date == current_date) date_index = index;
    });
    if (date_index == -1) date_index = 0;
    $("#program-date-container").html(htmlContent);
    $($(".program-date-wrapper")[date_index]).addClass("active");
    this.keys.date_selection = date_index;
    this.current_date_index = date_index;
    this.changePrograms(current_date);
    current_route = "catch-up";
    $("#home-page").addClass("hide");
    hideTopBar();

    $("#catchup-page").show();

    $($(".program-menu-item")[this.keys.program_selection]).addClass("active");
    var program_menus = $(".program-menu-item");
    $(
      $(program_menus[this.keys.program_selection]).find(
        ".chachup-program-description"
      )[0]
    ).show();
    this.changeChannelDateScrollPosition(
      $(".program-date-wrapper")[catchup_variables.keys.date_selection]
    );
    this.changeProgrammeScrollPosition(
      $(".program-menu-item")[catchup_variables.keys.program_selection]
    );
    var menus = $(".program-date-wrapper");
    moveScrollPosition(
      $("#program-date-container"),
      menus[keys.date_selection],
      "vertical",
      false
    );
    moveScrollPosition(
      $("#program-menu-container"),
      program_menus[keys.program_selection],
      "vertical",
      false
    );
  },

  hoverDate: function (index) {
    var keys = this.keys;
    keys.focused_part = "date_selection";
    keys.date_selection = index;
    var menus = $(".program-date-wrapper");
    if (keys.date_selection >= menus.length) {
      keys.date_selection = menus.length - 1;
    }
    if (keys.date_selection < 0) {
      keys.date_selection = 0;
    }
    $(menus).removeClass("pre-active");
    $(menus[keys.date_selection]).addClass("pre-active");
    moveScrollPosition(
      $("#program-date-container"),
      menus[keys.date_selection],
      "vertical",
      false
    );
  },

  showNextVideo: function (increment) {
    var keys = this.keys;
    keys.program_selection += increment;
    this.hoverProgramSelection(keys.program_selection);
    this.showMovie();
    this.showControlBar();
  },

  seekTo: function (step) {
    clearTimeout(this.seek_timer);
    var current_time = media_player.videoObj.currentTime;
    var duration = parseInt(media_player.videoObj.duration);
    this.current_time = current_time;
    var newTime = this.current_time + step;
    if (newTime < 0) newTime = 0;
    if (newTime >= duration) newTime = duration;
    this.current_time = newTime;
    try {
      media_player.pause();
    } catch (e) { }

    if (duration > 0) {
      $("#catchup")
        .find(".video-current-time")
        .html(media_player.formatTime(newTime));

      $("#catchup")
        .find(".progress-amount")
        .css({ width: newTime / duration * 100 + "%" });
    }
    this.seek_timer = setTimeout(function () {
      media_player.videoObj.currentTime = newTime;
      setTimeout(function () {
        try {
          media_player.play();
        } catch (e) { }
      }, 200);
    }, 500);
  },

  playPauseVideo: function () {
    if (media_player.state === media_player.STATES.PLAYING) {
      try {
        media_player.pause();
        $("#live-media-play").removeClass("hide");
        $("#live-media-pause").addClass("hide");
      } catch (e) { }
    } else if (media_player.state === media_player.STATES.PAUSED) {
      try {
        media_player.play();
        $("#live-media-play").addClass("hide");
        $("#live-media-pause").removeClass("hide");
      } catch (e) { }
    }
  },
  getDuration: function () {
    var date = this.dates[this.current_date_index];
    var program = this.programmes[date];
    this.duration = parseInt(
      (program.stop_timestamp - program.start_timestamp) / 60
    );
  },
  makeDateSortedProgramms: function (movie, programmes) {
    this.movie = movie;
    var that = this;
    var keys = this.keys;
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

  getConvertedDate: function (maxTimestamp) {
    var date = new Date(maxTimestamp);
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    var dateString =
      year + "-" + month + "-" + day + " " + hours + ":" + minutes;
    return dateString;
  },
  changePrograms: function (date) {
    var htmlContent = "";
    var current_programmes = this.programmes[date];
    if (current_programmes == undefined) {
      var currentKey = Object.keys(this.programmes)[this.current_date_index];
      current_programmes = this.programmes[currentKey];
    }

    var formatText = "Y-MM-DD HH:mm";

    var currentDate = getTodayDate(formatText);

    var tempPros = [];
    current_programmes.filter(function (program) {
      if (program.stop > currentDate && currentDate >= program.start) {
        tempPros.push(program.start);
      }
    });

    var timestamps = tempPros.map(function (dateStr) {
      return Date.parse(dateStr);
    });

    var maxTimestamp = Math.max.apply(null, timestamps);

    var cDate = catchup_variables.getConvertedDate(maxTimestamp);

    if (time_format == 24 && cDate.includes("PM")) {
      var cDate = cDate;
    }

    var epg_icon = '<img src="images/clock.png" class = "catchup-click-img"/>';
    var keys = this.keys;
    current_programmes.map(function (program, index) {
      if (cDate == program.start) {
        keys.program_selection = index;
        keys.current_programming_index = index;
      }
      htmlContent +=
        '<div class="program-menu-item" onClick = "catchup_variables.clickProgramSelection(' +
        index +
        ')" onmouseenter = "catchup_variables.hoverProgramSelection(' +
        index +
        ')" data-type="live-tv">' +
        "<div>" +
        catchup_variables.convertTime(program.start) +
        " " +
        ((program.has_archive == 1 && visibleArchiveIcon) ? epg_icon : "") +
        " " +
        (cDate == program.start
          ? '<span class = "current-programming">live</span>'
          : "") +
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

  convertTime: function (start) {
    var date = new Date(start);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (time_format == 24) {
      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      var formattedTime = hours + ":" + minutes;
    } else {
      var AmPm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? (hours < 10 ? "0" + hours : hours) : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? "0" + minutes : minutes;
      minutes = minutes == "0" ? "00" : minutes;
      var formattedTime = hours + ":" + minutes + " " + AmPm;
    }
    return formattedTime;
  },

  getDay: function (dd) {
    var date = new Date(dd);
    var daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    var dayOfWeek = daysOfWeek[date.getDay()];
    var month = date.toLocaleString("default", { month: "short" });
    var day = date.getDate();
    return [dayOfWeek, month + " " + day];
  },

  changeCurrentProgram: function (date_index, program_index) {
    var keys = this.keys;
    var date = this.dates[date_index];
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
    keys.video_control = index;
    keys.focused_part = "full_screen";

    if (keys.video_control < 0) keys.video_control = 0;
    if (keys.video_control >= this.video_control_doms.length)
      keys.video_control = this.video_control_doms.length - 1;
    $(this.video_control_doms).removeClass("active");
    $(this.video_control_doms[keys.video_control]).addClass("active");
    this.showControlBar();
  },
  clickProgramSelection: function (index) {
    var keys = this.keys;
    keys.program_selection = index;
    this.current_date_index = keys.date_selection;
    keys.focused_part = "full_screen";
    this.changeCurrentProgram(keys.date_selection, keys.program_selection);
    var current_date = this.dates[this.current_date_index];
    var current_program = this.programmes[current_date];
    this.start_time = moment(current_program.start_time).format(
      "Y-MM-DD:HH-mm"
    );

    closePlayer();

    var date = this.dates[this.current_date_index];
    var programme = this.programmes[date][keys.program_selection];
    $("#catchup-video-title").text(programme.title);
    var temp = LiveModel.getProgrammeVideoUrl(this.channel_id, programme);

    $("#catchup").find(".video-current-time").text("--:--");
    $("#catchup").find(".video-total-time").text("--:--");
    $("#catchup").find(".progress-amount").css({ width: "0%" });
    $("#live-media-pause").removeClass("hide");
    $("#live-media-play").addClass("hide");

    media_player.init("catchup-page-video", "catchup");
    fullScreenLoader()
    media_player.playAsync(temp.url);

    this.full_screen_timer = setTimeout(function () {
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
  },
  zoomInOut: function () {
    $("#catchup").find(".catch-up-player-container").css({
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      height: "100vh",
      background: "#222"
    });
    media_player.setDisplayArea();
    catchup_variables.full_screen_video = true;
    var date = this.dates[this.current_date_index];
    $("#catchup-full-screen-channel-name").html(
      '<span class="channel-number">' +
      this.movie.num +
      " " +
      this.movie.name +
      ":</span>" +
      '<span class="full-screen-channel-time">' +
      date +
      "</span>"
    );
    var programmes = this.programmes[date];
    var next_program = "No Information";
    var program_description = "No Information";
    if (typeof programmes[keys.program_selection] != "undefined")
      next_program = decodeURIComponent(
        atob(programmes[this.program_selection + 1].title)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

    var current_program = decodeURIComponent(
      atob(programmes[this.program_selection].title)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    if (programmes[this.program_selection].description !== "")
      program_description = decodeURIComponent(
        atob(programmes[this.program_selection].description)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

    $("#catchup-full-screen-current-program").text(current_program);
    $("#catchup-full-screen-next-program").text(next_program);
    $("#catchup-full-screen-program-name").text(current_program);
    $("#catchup-full-screen-program-description").text(program_description);
    $("#catchup").find(".channel-information-container").hide();
    $("#channel-page-bottom-container").hide();
    $("#catchup").find(".video-skin").hide();
    clearTimeout(catchup_variables.full_screen_timer);
    $("#catchup-full-screen-information").slideDown();
    this.full_screen_timer = setTimeout(function () {
      $("#catchup-full-screen-information").slideUp();
    }, 5000);
    this.keys.focused_part = "full_screen";
  },
  showMovie: function () {
    var keys = this.keys;
    $("#catchup-page-left-part").addClass("hide");
    $("#catchup-page-right-part").addClass("hide");

    closePlayer();

    var date = this.dates[this.current_date_index];
    var programme = this.programmes[date][keys.program_selection];
    $("#catchup-video-title").text(programme.title);
    var temp = LiveModel.getProgrammeVideoUrl(this.channel_id, programme);
    media_player.init("catchup-page-video", "catchup");
    fullScreenLoader()
    media_player.playAsync(temp.url);
    $("#catchup").find(".video-current-time").text("--:--");
    $("#catchup").find(".video-total-time").text("--:--");
    $("#catchup").find(".progress-amount").css({ width: "0%" });
    $("#catch-up-player-container").removeClass("hide");
  },

  renderAudioTracks: function (items) {
    var htmlContent = "";
    items.map(function (item, index) {
      var fullLanguage = !item[1].language ? 'English' : vodSeriesPlayer.getFullLanguage(item[1].language);
      htmlContent +=
        '<div class="audio-tracks-item"  onmouseenter="catchup_variables.hoverAudioTracks(' + index + ')" onclick="catchup_variables.handleMenuClick()">'
        + '<input class="magic-radio" type="radio" name="radio" id="catchup-disable-audio-tracks-' + index + '" value="' + index + '">'
        + '<label for="catchup-disable-audio-tracks">' + fullLanguage + '</label>'
        + '</div>';
    })
    return htmlContent;
  },

  showTextTracksModal: function () {

  },

  showAudioTracksModal: function () {
    var noAudio = current_words["no_audio"];
    var _this = this;
    try {
      var obj = media_player.getAudioTracks();
      var result = Object.keys(obj).map(function (key) {
        return [key, obj[key]];
      });
      // var result = [["0", { language: "es", enabled: true }], ["1", { language: "es", enabled: false }], ["2", { language: "en", enabled: false }]];
      catchupAudioTracks = result;
      this.keys.focused_part = "audioTracksModal";
      var htmlContent = this.renderAudioTracks(result);
      this.hideControlBar();
      $("#catchup-audio-tracks-selection-container").html(htmlContent);
      $('#catchup-audio-tracks-modal').modal('show');
      var audioTracksMenus = $('#catchup-audio-tracks-modal').find('.audio-tracks-item');
      catchup_variables.audioTracksDoms = audioTracksMenus;
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
      this.keys.focused_part = "full_screen";
      showToast(noAudio, "");
    }
  },

  confirmAudioTrack: function () {
    var index = $("#catchup-audio-tracks-modal")
      .find("input[type=radio]:checked")
      .val();
    $("#catchup-audio-tracks-modal").modal("hide");
    catchup_variables.currentAudioTrackIndex = index;
    this.keys.focused_part = "full_screen";
    catchupAudioTracks[index][1].enabled = true;
  },

  hoverAudioTracks: function (index) {
    var keys = this.keys;
    keys.focused_part = "audioTracksModal";
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
    this.keys.focused_part = "full_screen";
  },

  changeProgressBar: function () {
    var movie_id = catchup_variables.catchup_variables;
    var elements = [
      $("#full-screen-information-progress").find("span")[0],
      $("#channel-page-right-part").find(".progress-amount")[0]
    ];
    clearInterval(catchup_variables.progressbar_timer);
    catchup_variables.progressbar_timer = setInterval(function () {
      var movie = getCurrentMovieFromId(movie_id, "", "stream_id");
      var temp = catchup_variables.getNextProgrammes(movie);
      var current_program_exist = temp["current_program_exist"];
      if (current_program_exist) {
        var programmes = temp["programmes"];
        var current_program = programmes[0];
        var time_length =
          new Date(current_program.stop).getTime() -
          new Date(current_program.start).getTime();
        var current_time = new Date().getTime();
        var percentage =
          (current_time - time_length) *
          100 /
          (current_time - new Date(current_program.start).getTime());
        elements.map(function (index, item) {
          $(item).css("width", +percentage + "%");
        });
        var next_program = "No Information";
        $("#full-screen-current-program").text(programmes[0].title);
        if (typeof programmes[1] != "undefined")
          next_program = programmes[1].title;
        $("#full-screen-next-program").text(next_program);
        $("#catchup").find(".channel-information-container").hide();
      } else {
        $("#full-screen-current-program").text("   ");
        elements.map(function (index, item) {
          $(item).css(width, 0);
        });
      }
      catchup_variables.showNextProgrammes("next-program-container");
    }, 60000);
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
    this.show_control = false;
  },
  showControlBar: function () {
    $("#catchup-player-controller").slideDown();
    $("#catchup-video-title").slideDown();
    this.show_control = true;
    clearTimeout(this.timeOut);
    var that = this;
    this.timeOut = setTimeout(function () {
      that.hideControlBar();
    }, 10000);
  },

  clickDateSelection: function (index) {
    var keys = this.keys;
    keys.date_selection = index;
    var current_date = this.dates[keys.date_selection];
    this.changePrograms(current_date);
    var menus = $(".program-date-wrapper");
    $(menus).removeClass("pre-active");
    $(menus).removeClass("active");
    keys.program_selection = 0;
    $(menus[keys.date_selection]).addClass("active");
  },

  menuClickEvent: function () {
    var keys = this.keys;

    if (keys.focused_part === "date_program_selection") {
      this.clickProgramSelection(keys.program_selection);
    } else if (keys.focused_part === "full_screen") {
      $(this.video_control_doms[keys.video_control]).trigger("click");
    } else if (keys.focused_part === "date_selection") {
      var current_date = this.dates[keys.date_selection];
      this.changePrograms(current_date);
      var menus = $(".program-date-wrapper");
      $(menus).removeClass("pre-active");
      $(menus).removeClass("active");
      keys.program_selection = 0;
      $(menus[keys.date_selection]).addClass("active");
    } else if (keys.focused_part === "audioTracksModal") {
      $(this.audioTracksDoms).find("input").prop("checked", false);
      $(this.audioTracksDoms[keys.audioTracksSelection])
        .find("input")
        .prop("checked", true);
    } else if (keys.focused_part === "audioTrackConfirmBtn") {
      $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).trigger("click");
      this.confirmAudioTrack();
    }
  },

  hoverProgramSelection: function (index) {
    var keys = this.keys;
    keys.program_selection = index;
    keys.focused_part = "date_program_selection";
    var program_menus = $(".program-menu-item");
    if (keys.program_selection >= program_menus.length) {
      keys.program_selection = program_menus.length - 1;
    }
    if (keys.program_selection < 0) {
      keys.program_selection = 0;
    }
    $(".program-menu-item").removeClass("active");
    $(program_menus[keys.program_selection]).addClass("active");
    $(".chachup-program-description").hide();
    $(
      $(program_menus[keys.program_selection]).find(
        ".chachup-program-description"
      )[0]
    ).show();
    moveScrollPosition(
      $("#program-menu-container"),
      program_menus[keys.program_selection],
      "vertical",
      false
    );
  },

  playPauseVideoFromNetworkIssue: function () {
    try {
      media_player.playFromNetworkIssue();
      $("#live-media-play").addClass("hide");
      $("#live-media-pause").removeClass("hide");
    } catch (e) { }
  },


  handleMenusUpDown: function (increment) {
    var keys = this.keys;
    if (keys.focused_part === "date_program_selection") {
      keys.program_selection += increment;
      this.hoverProgramSelection(keys.program_selection);
    } else if (keys.focused_part == "date_selection") {
      keys.date_selection += increment;
      this.hoverDate(keys.date_selection);
    } else if ((keys.focused_part == "full_screen")) {
      this.showControlBar();
    } else if (keys.focused_part == "audioTracksModal") {
      keys.audioTracksSelection += increment;
      if (keys.audioTracksSelection >= this.audioTracksDoms.length) {
        $(this.audioTracksDoms).removeClass("active");
        keys.audioTracksSelection = this.audioTracksDoms.length - 1;
        keys.focused_part = "audioTrackConfirmBtn";
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
    } else if (keys.focused_part === 'audioTrackConfirmBtn') {
      if (increment < 0) {
        keys.focused_part = "audioTracksModal";
        this.hoverAudioTracks(keys.audioTracksSelection);
        $(this.audioTrackConfirmBtnDoms).removeClass('active')
      }
    }
  },
  handleMenuLeftRight: function (increment) {
    var keys = this.keys;

    if (keys.focused_part === "date_selection") {
      var program_menus = $(".program-menu-item");
      if (increment > 0) {
        keys.focused_part = "date_program_selection";
        var menus = $(".program-date-wrapper");
        $(menus).removeClass("pre-active");
        $(".chachup-program-description").hide();

        $(
          $(program_menus[keys.program_selection]).find(
            ".chachup-program-description"
          )[0]
        ).show();
        $(program_menus[keys.program_selection]).addClass("active");
        moveScrollPosition(
          $("#program-menu-container"),
          program_menus[keys.program_selection],
          "vertical",
          false
        );
        return;
      }
    } else if (keys.focused_part === "date_program_selection") {
      if (increment < 0) {
        keys.focused_part = "date_selection";
        var program_menus = $(".program-menu-item");
        $(program_menus).removeClass("active");
        var menus = $(".program-date-wrapper");
        $(menus).removeClass("pre-active");
        $(".chachup-program-description").hide();
        $(menus[keys.date_selection]).addClass("pre-active");
        return;
      }
    } else if (keys.focused_part == "full_screen") {
      keys.video_control += increment;
      this.hoverVideoControlIcon(keys.video_control);
    } else if (keys.focused_part === "audioTrackConfirmBtn") {
      keys.audioTrackConfirmSelection = keys.audioTrackConfirmSelection === 1 ? 0 : 1;
      $(this.audioTrackConfirmBtnDoms).removeClass('active')
      $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).addClass('active');
    }
  },
  HandleKey: function (e) {
    var focused_part = this.keys.focused_part;
    switch (e.keyCode) {
      case tvKey.RIGHT:
        catchup_variables.handleMenuLeftRight(1);
        break;
      case tvKey.LEFT:
        catchup_variables.handleMenuLeftRight(-1);
        break;
      case tvKey.DOWN:
        catchup_variables.handleMenusUpDown(1);
        break;
      case tvKey.UP:
        catchup_variables.handleMenusUpDown(-1);
        break;
      case tvKey.ENTER:
        catchup_variables.menuClickEvent();
        break;
      case tvKey.RED:
        // home_page.init();
        break;
      case tvKey.RETURN:
        showLoader(false);
        if (focused_part === "date_program_selection" || focused_part === "date_selection") {
          $("#catchup-page").hide();
          closePlayer();
          current_route = this.prev_route;

          if (this.prev_route === 'channel-page') {
            $("#channel-page-bottom-container").show();
            $("#channel-page").removeClass("hide");
            showTopBar()
            channel_page.keys.focused_part = "catchup_fav_search_selection";
          } else {
            $("#catchup-list-page").removeClass("hide");
          }
        } else if (focused_part === "full_screen") {
          closePlayer();
          this.keys.focused_part = "date_program_selection";
          $("#catchup-page-left-part").removeClass("hide");
          $("#catchup-page-right-part").removeClass("hide");
          $("#catchup").addClass("hide");
        } else if (this.keys.focused_part === "audioTracksModal" || this.keys.focused_part === "audioTrackConfirmBtn") {
          this.keys.focused_part = "full_screen";
          this.keys.audioTracksSelection = 0;
          $("#catchup-audio-tracks-modal").modal("hide");
        }
        break;
    }
  }
};
