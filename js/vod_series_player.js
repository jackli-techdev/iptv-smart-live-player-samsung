"use strict";
var vod_series_player_page = {
  player: null,
  back_url: "vod-summary-page",
  show_control: false,
  timeOut: null,
  has_episodes: false,
  playbackURL: '',
  keys: {
    focused_part: "control_bar", //operation_modal
    control_bar: 0,
    info_bar: 0,
    operation_modal: 0,
    textTracksSelection: 0,
    audioTracksSelection: 0,
    textTrackConfirmSelection: 0,
    audioTrackConfirmSelection: 0,
    prev_focus: "",
    resume_bar: 0,
    episode_selection: 0,
    player_ratio_modal: 0,
    stop_playerback_modal: 1
  },
  current_subtitle_index: -1,
  current_audio_track_index: -1,
  textTracksDoms: [],
  audioTracksDoms: [],
  textTrackConfirmBtnDoms: $(".text-track-btn"),
  audioTrackConfirmBtnDoms: $("#audio-tracks-modal .audio-track-btn"),
  subtitle_audio_menus: [],
  subtitle_confirm_dom: $("#subtitle-selection-container .subtitle-btn"),
  forwardTimer: null,
  current_time: 0,
  show_subtitle: false,
  show_audio_track: false,
  video_control_doms: [],
  video_info_doms: $("#vod-series-video-controls-container .video-info-btn"),
  vod_info_timer: null,
  current_movie: {},
  resume_time: 0,
  resume_timer: null,
  episode_doms: [],
  resume_bar_doms: $("#video-resume-modal .resume-action-btn"),
  seek_timer: null,
  seek_interval_timer: null,
  current_movie_type: "",
  video_duration: 0,
  last_key_time: 0,
  p_route: "",
  stop_playback_modal_btn_doms: $("#stop-playerback-modal button"),

  init: function (movie, movie_type, back_url, movie_url, prev_route) {
    var keys = this.keys;
    this.p_route = prev_route;
    this.current_movie = movie;
    initRangeSider()
    this.current_time = 0;

    this.video_duration = 0;
    $("#vod-series-player-page").removeClass("hide");
    this.show_control = true;
    this.showControlBar(true);


    $(this.stop_playback_modal_btn_doms).removeClass("active");
    $(this.stop_playback_modal_btn_doms[1]).addClass("active");
    this.video_control_doms = $(
      "#vod-series-video-controls-container .video-control-icon i"
    );
    $(this.video_control_doms).removeClass("active");
    $(this.video_info_doms).removeClass("active");
    $(this.video_control_doms[2]).addClass("active");
    $("#media-pause").removeClass("hide");
    $("#media-play").addClass("hide");

    keys.control_bar = 2;
    keys.focused_part = "control_bar";
    keys.prev_focus = "control_bar";

    closePlayer();
    initPlayerVariables();
    clearTimeout(this.resume_timer);

    var url;
    if (movie_type === "movies" || movie_type === "movie") {
      if (settings.playlist.playlist_type === "xc")
        url = getMovieUrl(movie.stream_id, "movie", movie.container_extension);
      else if (settings.playlist.playlist_type === "general") url = movie.url;
      $("#vod-series-video-title").html(movie.name);
    } else if (movie_type === "series") {
      if (settings.playlist.playlist_type === "xc")
        url = getMovieUrl(movie.id, "series", movie.container_extension);
      else if (settings.playlist.playlist_type === "general") url = movie.url;
      $("#vod-series-video-title").html(movie.title);
    } else if (movie_type === "epg") {
      url = movie_url;
      var programme =
        epg_page.sorted_programmes[epg_page.keys.date_selection].programmes[
        epg_page.keys.programme_selection
        ];
      var title =
        programme.title +
        "  <span class='player-epg-title-time'>" +
        programme.start.substr(11) +
        "~" +
        programme.stop.substr(11) +
        "</span>";
      $("#vod-series-video-title").html(title);
    }
    this.back_url = back_url;
    var that = this;

    try {
      media_player.init("vod-series-player-video", "vod-series-player-page");
    } catch (e) { }
    try {
      vod_series_player_page.playbackURL = url;
      media_player.playAsync(url);
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
      if (typeof current_model.saved_video_times[movie_key] != "undefined") {
        this.resume_time =
          current_model.saved_video_times[movie_key].resume_time;
      } else {
        this.resume_time = 0;
      }
    } else {
      this.resume_time = 0;
    }
    current_route = "vod-series-player-video";
    this.current_subtitle_index = -1;
    this.current_audio_track_index = -1;
    this.show_subtitle = false;
    this.current_movie_type = movie_type;
    this.initTextTrackSetting();
    keys.stop_playerback_modal = 1;
  },

  makeEpisodeDoms: function (back_url) {
    this.keys.episode_selection = series_summary_page.keys.episode_selection === 0 ? 0 : series_summary_page.keys.episode_selection;

    if (back_url === "episode-page") {
      var episodes = current_season.episodes;
      this.episodes = episodes;
      this.has_episodes = true;
      var fall_back_image = "images/episode_bk.png";
      var html = "";
      var that = this;
      episodes.map(function (item, index) {
        html +=
          '<div class="player-season-item" onclick="vod_series_player_page.showSelectedEpisode()" onmouseenter="vod_series_player_page.hoverEpisode(' +
          index +
          ')" style="background-image:url(' + item.info.movie_image + ');background-size: cover;">' +
          '<img src ="images/play-icon.png" width="50px" class = "' +
          (that.current_movie.id !== item.id ? "hide" : "") +
          '" />' +
          '<div class="player-episode-title-container">' +
          '<div class="player-episode-title max-line-2">' +
          item.title +
          "</div>" +
          "</div>" +
          "</div>";
      });
      $("#player-seasons-container").html(html);
      this.episode_doms = $(".player-season-item");
      $(this.episode_doms).addClass(series_summary_page.keys.episode_selection)
      $("#player-seasons-container").removeClass("expanded");
      $("#player-seasons-container").show();

      moveScrollPosition(
        $("#player-seasons-container"),
        this.episode_doms[series_summary_page.keys.episode_selection],
        "horizontal",
        false
      );
    } else {
      this.has_episodes = false;
      $("#player-seasons-container").html("");
      this.episode_doms = $(".player-season-item");
      this.episode_doms = [];
      $("#player-seasons-container").hide();
    }
  },

  showResumeBar: function () {
    var keys = this.keys;

    if (this.resume_time / 1000 >= resumeThredholdTime) {
      var resume_time_format = media_player.formatTime(this.resume_time / 1000);
      $("#vod-resume-time").text(resume_time_format);
      $("#video-resume-modal").show();
      this.hideControlBar();
      clearTimeout(this.resume_timer);
      keys.focused_part = "resume_bar";
      keys.resume_bar = 0;
      $(this.resume_bar_doms).removeClass("active");
      $(this.resume_bar_doms[0]).addClass("active");
      this.resume_timer = setTimeout(function () {
        $("#video-resume-modal").hide();
        keys.focused_part = keys.prev_focus;
      }, 15000);
    }
  },

  hoverPlayerRatio: function (index) {
    var keys = this.keys;
    keys.player_ratio_modal = index;
    keys.focused_part = "player_ratio_modal";
    if (keys.player_ratio_modal < 0) keys.player_ratio_modal = 0;
    if (keys.player_ratio_modal >= 2) {
      keys.player_ratio_modal = this.player_ratio_modal_doms.length - 1;
    }

    $(this.player_ratio_modal_doms).removeClass("active");
    $(this.player_ratio_modal_doms[keys.player_ratio_modal]).addClass("active");
  },

  Exit: function () {
    this.saveVideoTime();
    current_route = this.back_url;
    closePlayer();
    $("#" + media_player.parent_id).find(".video-error").hide();
    $("#" + media_player.parent_id).find(".text-track-container").text("");
    $("#vod-series-player-page").addClass("hide");
  },
  saveVideoTime: function () {
    try {
      var current_time = media_player.videoObj.currentTime * 1000;
      var duration = parseInt(media_player.videoObj.duration) * 1000;
      var movie = this.current_movie;
      if (duration - current_time >= 2000) {
        if (
          this.current_movie_type === "movies" ||
          this.current_movie_type === "movie"
        )
          MovieHelper.saveVideoTime("vod", movie.stream_id, current_time, duration);
        if (this.current_movie_type === "series")
          MovieHelper.saveVideoTime("series", movie.id, current_time, duration);
      } else {
        if (
          this.current_movie_type === "movies" ||
          this.current_movie_type === "movie"
        )
          MovieHelper.removeVideoTime("vod", movie.stream_id);
        if (this.current_movie_type === "series")
          MovieHelper.removeVideoTime("series", movie.id);
      }
    } catch (e) { }
  },

  exitPlayer: function () {
    this.Exit();
    if (this.back_url === "vod-summary-page") {
      if (this.p_route == "entire-search-page") {
        current_route = this.p_route;
        hideTopBar();
        $("#entire-search-page").removeClass("hide");
      } else if (this.p_route == "fav-page") {
        current_route = this.p_route;
        hideTopBar();
        $("#fav-page").removeClass("hide");
      } else {
        current_route = "vod-series-page";
        hideEntireSearchPage();
        showTopBar();
        $("#vod-series-page").removeClass("hide");
        moveScrollPosition(
          $("#vod-series-menus-container"),
          vod_series_page.menu_doms[vod_series_page.keys.menu_selection],
          "vertical",
          false
        );
      }
    } else if (this.back_url === "episode-page") {
      if (this.p_route == "entire-search-page") {
        current_route = this.p_route;
        hideTopBar();
        $("#entire-search-page").removeClass("hide");
      } else {
        current_route = "series-summary-page";
        hideEntireSearchPage();
        series_summary_page.showEpisodes(true, true);
        series_summary_page.updatePlayButtonDom();
      }
    }
  },
  hoverExitPlaybackMenuItem: function (index) {
    var keys = this.keys;
    keys.focused_part = "stop_playerback_modal";
    keys.menu_selection = index;
    $(this.stop_playback_modal_btn_doms).removeClass("active");
    $(this.stop_playback_modal_btn_doms[index]).addClass("active");
  },
  clickExitPlay: function (index) {
    var keys = this.keys;
    keys.focused_part = "stop_playerback_modal";
    $("#stop-playerback-modal").modal("hide");
    if (index == 0) {
      $("#vod-series-video-progress").css("width", "0%");
      this.exitPlayer();
    }
    else keys.focused_part = "control_bar";
  },
  goBack: function () {
    showLoader(false);
    var keys = this.keys;
    if (this.show_control) {
      this.hideControlBar();
    } else {
      if (
        keys.focused_part === "control_bar" ||
        keys.focused_part === "info_bar" ||
        keys.focused_part === "episode_selection" ||
        keys.focused_part === "seek_bar"
      ) {
        $("#stop-playerback-modal").modal("show");
        $(this.stop_playback_modal_btn_doms).removeClass("active");
        $(this.stop_playback_modal_btn_doms[1]).addClass("active");
        keys.focused_part = "stop_playerback_modal";
      }
      else if (keys.focused_part === 'stop_playerback_modal') {
        $('#stop-playerback-modal').modal('hide');
        keys.focused_part = 'control_bar';
      } else if (keys.focused_part === "textTracksModal" || keys.focused_part === "textTrackConfirmBtn") {
        keys.focused_part = "info_bar";
        keys.textTracksSelection = 0;
        $("#text-tracks-modal").modal("hide");
      } else if (keys.focused_part === "audioTracksModal" || keys.focused_part === "audioTrackConfirmBtn") {
        keys.focused_part = "info_bar";
        keys.audioTracksSelection = 0;
        $("#audio-tracks-modal").modal("hide");
      } else if (keys.focused_part === "player_ratio_modal") {
        keys.focused_part = "control_bar";
        $("#player-ratio-modal").modal("hide");
        $(this.video_info_doms).removeClass("active");
        $(this.video_control_doms[2]).addClass("active");
      } else if (keys.focused_part === "vod_info") {
        $("#vod-video-info-container").hide();
        clearTimeout(this.vod_info_timer);
        keys.focused_part = keys.prev_focus;
      } else if (keys.focused_part === "resume_bar") {
        $("#video-resume-modal").hide();
        keys.focused_part = keys.prev_focus;
        clearTimeout(this.resume_timer);
      }
    }
  },

  playPauseVideo: function () {
    this.showControlBar(false);
    if (media_player.state === media_player.STATES.PLAYING) {
      try {
        media_player.pause();
        $("#media-pause").addClass("hide");
        $("#media-play").removeClass("hide");
      } catch (e) { }
    } else if (media_player.state === media_player.STATES.PAUSED) {
      try {
        media_player.play();
        $("#media-pause").removeClass("hide");
        $("#media-play").addClass("hide");
      } catch (e) { }
    }
  },

  playPauseVideoFromNetworkIssue: function () {
    this.showControlBar(false);
    try {
      media_player.playFromNetworkIssue();
      $("#media-pause").removeClass("hide");
      $("#media-play").addClass("hide");
    } catch (e) { }
  },

  seekTo: function (step) {
    if (this.current_time === 0)
      this.current_time = media_player.videoObj.currentTime;
    var duration = media_player.videoObj.duration;
    var newTime = this.current_time + step;
    if (newTime < 0) newTime = 0;
    if (newTime >= duration) newTime = duration;
    this.current_time = newTime;
    media_player.videoObj.currentTime = newTime;
    if (duration > 0) {
      $("#" + media_player.parent_id)
        .find(".video-progress-bar-slider")
        .val(newTime)
        .change();
      $("#" + media_player.parent_id)
        .find(".video-current-time")
        .html(media_player.formatTime(newTime));
    }
  },
  showSelectedEpisode: function () {
    var episode_keys = series_summary_page.keys;
    var keys = this.keys;
    var episode_items = series_summary_page.episode_doms;
    if (episode_keys.episode_selection != keys.episode_selection) {
      $(episode_items).removeClass("active");
      episode_keys.episode_selection = keys.episode_selection;
      $(episode_items[episode_keys.episode_selection]).addClass("active");
      var episodes = this.episodes;
      var episode = episodes[keys.episode_selection];
      this.saveVideoTime();
      this.resume_time = 0;
      closePlayer();
      current_episode = episode;
      vod_series_player_page.init(
        current_episode,
        "series",
        "episode-page",
        "",
        ""
      );
      this.hoverEpisode(keys.episode_selection);
    }
  },
  showNextVideo: function (increment) {
    this.saveVideoTime();
    this.resume_time = 0;
    switch (this.back_url) {
      case "vod-summary-page":
        var menu_doms = vod_series_page.menu_doms;
        var keys = vod_series_page.keys;
        keys.menu_selection += increment;
        if (keys.menu_selection < 0) {
          keys.menu_selection = 0;
          return;
        }
        if (keys.menu_selection >= vod_series_page.movies.length) {
          keys.menu_selection = vod_series_page.movies.length - 1;
          return;
        }
        $(menu_doms).removeClass("active");
        $(menu_doms[keys.menu_selection]).addClass("active");
        current_movie = vod_series_page.movies[keys.menu_selection];
        this.init(current_movie, "movie", "vod-summary-page", "");
        break;
      case "episode-page":
        var keys = series_summary_page.keys;
        var episode_items = series_summary_page.episode_doms;
        $(episode_items).removeClass("active");
        keys.episode_selection += increment;
        if (keys.episode_selection < 0) {
          keys.episode_selection = 0;
          return;
        }
        if (keys.episode_selection >= episode_items.length) {
          keys.episode_selection = episode_items.length - 1;
          return;
        }
        $(episode_items[keys.episode_selection]).addClass("active");
        var episodes = current_season.episodes;
        current_episode = episodes[keys.episode_selection];
        vod_series_player_page.init(
          current_episode,
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
    this.show_control = true;
    var that = this;
    var keys = this.keys;
    if (move_focus) {
      keys.focused_part = "control_bar";
      keys.prev_focus = "control_bar";
      keys.control_bar = 2;
      $(this.video_control_doms).removeClass("active");
      $(this.video_info_doms).removeClass("active");
      $("#vod-series-video-progress").removeClass("active");
      $("#vod-series-video-progressbar-container").removeClass("active");
      $(".rangeslider__fill").removeClass("active");
      $(this.video_control_doms[2]).addClass("active");
      $(this.episode_doms).removeClass("active");
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
    this.show_control = false;
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
        return lang;
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

  showVideoInfo: function () {
    var movie = this.current_movie;

    this.hideControlBar();

    var vod_desc = "",
      stream_summary = "",
      stream_icon,
      stream_title;
    if (this.current_movie_type == "movies") {
      stream_title = movie.name;
      stream_icon = movie.stream_icon;

      settings.playlist_type = "xtreme";
      if (settings.playlist_type === "xtreme") {
        $.getJSON(
          api_host_url +
          "/player_api.php?username=" +
          user_name +
          "&password=" +
          password +
          "&action=get_vod_info&vod_id=" +
          this.current_movie.stream_id,
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
      if (settings.playlist_type === "xtreme") {
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
        stream_icon = "images/default_bg.png";
      }
    }
    setTimeout(function () {
      $("#vod-video-info-title").text(stream_title);
      $("#vod-video-info-img-container img").attr("src", stream_icon);
      $("#vod-video-info-desc").text(vod_desc);
      $("#vod-video-info-subwrapper2").text(stream_summary);
      $("#vod-video-info-container").show();
    }, 1500);

    clearTimeout(this.vod_info_timer);
    var keys = this.keys;
    keys.focused_part = "vod_info";
    this.vod_info_timer = setTimeout(function () {
      $("#vod-video-info-container").hide();
      keys.focused_part = keys.prev_focus;
    }, 10000);
  },

  showTextTracksModal: function () {
    var keys = this.keys
    $(this.textTracksDoms).find("input").prop("checked", false);
    $(this.textTracksDoms[keys.textTracksSelection])
      .find("input")
      .prop("checked", true);
    var noSubtitle = current_words["no_subtitle"];
    var url = "";
    var tmdb_id = "";
    if (this.current_movie_type === "movies") {
      tmdb_id = this.current_movie.info.tmdb_id;
      url = 'https://api.opensubtitles.com/api/v1/subtitles?tmdb_id=' + tmdb_id + '&type=movie';
    } else {
      var tmdb_id1 = current_series.info.tmdb;
      var tmdb_id2 = current_series.info.tmdb_id;
      tmdb_id = tmdb_id1 !== undefined ? tmdb_id1 : tmdb_id2;
      url = 'https://api.opensubtitles.com/api/v1/subtitles?tmdb_id=' + tmdb_id + '&episode_number=' + current_episode.episode_num + '&season_number=' + current_episode.season;
    }

    var that = this;
    this.hideControlBar();
    var apiKey = subtitleAPIKey;
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
      .then(function (response) {
        return response.json();
      })
      .then(function (data) {
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
          keys.prev_focus = keys.focused_part;
          var htmlContent = that.renderTextTracks(uniqueData);
          $("#text-tracks-selection-container").html(htmlContent);
          $("#text-tracks-modal").modal("show");
          var textTracksMenus = $(".text-tracks-item");
          that.textTracksDoms = textTracksMenus;
          $(that.textTracksDoms).removeClass("active");
          $(textTracksMenus[keys.textTracksSelection]).find("input").prop("checked", true);
          that.hoverTextTracks(keys.textTracksSelection);
          uniqueData.map(function (item, index) {
            if (item.attributes.files[0].file_id == that.currentTextTrackIndex) {
              keys.textTracksSelection = index + 1;
              $(textTracksMenus).removeClass("active");
              $(textTracksMenus).find("input").prop("checked", true);
              $(textTracksMenus[index + 1]).find("input").prop("checked", true);
              that.hoverTextTracks(index + 1);
            }
          });
          $(that.textTrackConfirmBtnDoms).removeClass("active");
          keys.focused_part = "textTracksModal";
        } else {
          that.keys.focused_part = that.keys.prev_focus;
          showToast(noSubtitle, "");
        }
      })
      .catch(function (error) {
        console.log('error', error)
        that.keys.focused_part = that.keys.prev_focus;
        showToast(noSubtitle, "");
      });

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
                    onmouseenter="vod_series_player_page.hoverTextTracks(0)" \
                    onclick="vod_series_player_page.handleMenuClick()" \
                >\
                   <input class="magic-radio" type="radio" name="radio" id="disable-text-tracks" value="-1">\
                   <label for="disable-text-tracks">Disabled</label>\
                </div>';
    filteredItems.map(function (item, index) {
      htmlContent +=
        '<div class="text-tracks-item"\
                    onmouseenter="vod_series_player_page.hoverTextTracks(' +
        (index + hover_index_move) +
        ')" \
                    onclick="vod_series_player_page.handleMenuClick()" \
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
    keys.focused_part = "textTracksModal";
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
    keys.focused_part = "audioTracksModal";
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

  cancelTextTracks: function () {
    $("#text-tracks-modal").modal("hide");
    this.keys.textTracksSelection = 0;
    this.keys.focused_part = this.keys.prev_focus;
  },

  cancelAudioTracks: function () {
    $("#audio-tracks-modal").modal("hide");
    this.keys.audioTracksSelection = 0;
    this.keys.focused_part = this.keys.prev_focus;
  },

  confirmTextTrack: function () {
    $("#text-tracks-modal").modal("hide");
    this.keys.focused_part = this.keys.prev_focus;

    this.currentTextTrackIndex = $("#text-tracks-modal")
      .find("input[type=radio]:checked")
      .val();
    var filed_id = this.currentTextTrackIndex;
    if (this.currentTextTrackIndex != -1) {
      try {
        var url = 'https://api.opensubtitles.com/api/v1/download';
        var apiKey = subtitleAPIKey
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
          .then(function (response) {
            return response.json();
          })
          .then(function (data) {
            vod_series_player_page.loadTextTracks(data.link)
            media_player.videoObj.addEventListener('timeupdate', vod_series_player_page.updateTextTracksSettings);
          })
          .catch(function (error) {
            console.error(error);
          });
      } catch (e) { console.log(e) }
    } else {
      this.initTextTrackSetting();
    }
  },

  initTextTrackSetting: function () {
    $(".text-track-container").html("");
    textTracks = [];
    $(".text-track-container").css({ background: 'transparent' });
    this.currentTextTrackIndex = -1;
    this.keys.textTracksSelection = 0
  },

  loadTextTracks: function (vttFileURL) {
    fetch(vttFileURL)
      .then(function (response) {
        return response.text();
      })
      .then(function (data) {
        var cueData = data.split(/\n\n/);
        textTracks = []
        cueData.forEach(function (cue) {
          var cueLines = cue.split('\n');
          if (cueLines.length >= 2) {
            var startTime = vod_series_player_page.convertToSecond(cueLines[1].split(' --> ')[0]);

            var text = cueLines.slice(2).join('\n');
            if (text.includes('an8')) {
              text = text.replace(/\{\\an8\}/g, "")
            }
            textTracks.push({ startTime, text });
          }
        });
      })
      .catch(function (error) {
        console.error('Error loading the textTracks:', error);
      });
  },

  updateTextTracksSettings: function () {
    var currentTime = media_player.videoObj.currentTime;
    var textTracksContainer = document.getElementById('text-track-container');
    var storedTextTraclsColor = getLocalStorageData('textTracksColor') !== null ? getLocalStorageData('textTracksColor') : textTracksColor
    var storedTextTracksFontSize = getLocalStorageData('textTracksFontSize') !== null ? getLocalStorageData('textTracksFontSize') : textTracksFontSize
    var storedTextTracksBackgroundColor = getLocalStorageData('subtitleBackgroundColor') !== null ? getLocalStorageData('subtitleBackgroundColor') : subtitleBackgroundColor
    for (var i = 0; i < textTracks.length; i++) {
      if (textTracks[i].startTime <= currentTime && textTracks[i + 1] && textTracks[i + 1].startTime > currentTime) {
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

  confirmAudioTrack: function () {
    var index = $("#audio-tracks-modal")
      .find("input[type=radio]:checked")
      .val();
    $("#audio-tracks-modal").modal("hide");
    vod_series_player_page.currentAudioTrackIndex = index;
    this.keys.focused_part = this.keys.prev_focus;
    audioTracks[index][1].enabled = true;
  },


  cancelSubtitle: function () {
    $("#subtitle-selection-modal").modal("hide");
    this.keys.subtitle_audio_selection_modal = 0;
    this.keys.focused_part = this.keys.prev_focus;
  },
  confirmSubtitle: function () {
    $("#subtitle-selection-modal").modal("hide");
    this.keys.focused_part = this.keys.prev_focus;
    var modal_title = $("#subtitle-modal-title").text();
    if (modal_title.toLowerCase().includes("subtitle")) {
      this.current_subtitle_index = $("#subtitle-selection-modal")
        .find("input[type=radio]:checked")
        .val();
      var filed_id = this.current_subtitle_index
      if (this.current_subtitle_index != -1) {
        try {
          this.show_subtitle = true;
          var url = 'https://api.opensubtitles.com/api/v1/download';
          var apiKey = subtitleAPIKey
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
              vod_series_player_page.loadSubtitles(data.link)
              media_player.videoObj.addEventListener('timeupdate', vod_series_player_page.updateSubtitles);
            })
            .catch(error => {
              console.error(error);
            });
        } catch (e) { console.log(e) }
      } else {
        this.initTextTrackSetting();
      }
    } else {
      this.current_audio_track_index = $("#subtitle-selection-modal")
        .find("input[type=radio]:checked")
        .val();
    }
  },

  replay: function () {
    try {
      media_player.videoObj.currentTime = 0;
    } catch (e) { }
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

  loadSubtitles: function (vttFileURL) {
    fetch(vttFileURL)
      .then((response) => response.text())
      .then((data) => {
        var cueData = data.split(/\n\n/);
        subtitles = []
        cueData.forEach((cue) => {
          var cueLines = cue.split('\n');
          if (cueLines.length >= 2) {
            var startTime = vod_series_player_page.convertToSecond(cueLines[1].split(' --> ')[0]);

            var text = cueLines.slice(2).join('\n');
            if (text.includes('an8')) {
              text = text.replace(/\{\\an8\}/g, "")
            }
            subtitles.push({ startTime, text });
          }
        });
      })
      .catch((error) => {
        console.error('Error loading the subtitles:', error);
      });
  },

  updateSubtitles: function () {
    var currentTime = media_player.videoObj.currentTime;
    var subtitleContainer = $('#subtitleContainer');
    var storedSubtitleColor = getLocalStorageData('subtitleColor') !== null ? getLocalStorageData('subtitleColor') : textTracksColor
    var storedtextTrackFontSize = getLocalStorageData('textTracksFontSize') !== null ? getLocalStorageData('textTracksFontSize') : textTracksFontSize
    var storedSubtitleBackgroundColor = getLocalStorageData('subtitleBackgroundColor') !== null ? getLocalStorageData('subtitleBackgroundColor') : subtitleBackgroundColor
    for (var i = 0; i < subtitles.length; i++) {
      if (subtitles[i].startTime <= currentTime && subtitles[i + 1] && subtitles[i + 1].startTime > currentTime) {
        $(".subtitle-container").css({ fontSize: storedtextTrackFontSize + 'px' });
        $(".subtitle-container").css({ color: storedSubtitleColor });
        $(".subtitle-container").css({ background: storedSubtitleBackgroundColor });
        $("#vod-series-player-page").find(".subtitle-container").html("");
        $("#vod-series-player-page").find(".subtitle-container").html(subtitles[i].text);
        return;
      }
    }
    subtitleContainer.textContent = '';
  },

  removeAllActiveClass: function () {
    $("#vod-series-video-progress").removeClass("active");
    $("#vod-series-video-progressbar-container").removeClass("active");
    $(".rangeslider__fill").removeClass("active");
    $(this.video_control_doms).removeClass("active");
    $(this.video_info_doms).removeClass("active");
    $(this.video_control_doms).removeClass("active");
    $(this.episode_doms).removeClass("active");
  },

  hoverSubtitleConfirmBtn: function (index) {
    var keys = this.keys;
    keys.subtitle_confirm_dom_selection = index;
    var subtitle_confirm_dom = $(".subtitle-btn");
    $(subtitle_confirm_dom).removeClass('active')
    $(subtitle_confirm_dom[keys.subtitle_confirm_dom_selection]).addClass('active')
  },

  hoverSubtitle: function (index) {
    var keys = this.keys;
    keys.focused_part = "subtitle_audio_selection_modal";
    $(this.subtitle_audio_menus).removeClass("active");
    var subtitle_confirm_dom = $(".subtitle-btn");
    $(subtitle_confirm_dom).removeClass('active')
    if (index >= 0) {
      keys.subtitle_audio_selection_modal = index;
      moveScrollPosition(
        $("#subtitle-selection-container"),
        this.subtitle_audio_menus[keys.subtitle_audio_selection_modal],
        "vertical",
        false
      );
    } else
      keys.subtitle_audio_selection_modal =
        this.subtitle_audio_menus.length + index;
    $(this.subtitle_audio_menus[keys.subtitle_audio_selection_modal]).addClass(
      "active"
    );
  },
  hoverVideoControlIcon: function (index) {
    $("#player-seasons-container").removeClass("expanded");
    this.showControlBar(false);
    this.removeAllActiveClass();
    var keys = this.keys;
    keys.focused_part = "control_bar";
    keys.control_bar = index;
    $(this.video_control_doms[index]).addClass("active");
  },
  hoverVideoInfoIcon: function (index) {
    $("#player-seasons-container").removeClass("expanded");
    this.showControlBar(false);
    var keys = this.keys;
    this.removeAllActiveClass();
    keys.focused_part = "info_bar";
    keys.info_bar = index;
    $(this.video_info_doms[index]).addClass("active");
  },
  hoverEpisode: function (index) {
    console.log('index', index)
    $("#player-seasons-container").addClass("expanded");
    this.showControlBar(false);
    var keys = this.keys;
    this.removeAllActiveClass();
    keys.focused_part = "episode_selection";
    keys.episode_selection = index;
    $(this.episode_doms[index]).addClass("active");
    moveScrollPosition(
      $("#player-seasons-container"),
      this.episode_doms[keys.episode_selection],
      "horizontal",
      false
    );
  },
  hoverSeekBar: function () {
    var keys = this.keys;
    keys.focused_part = "seek_bar";
    $(this.video_control_doms).removeClass("active");
    $("#vod-series-video-progress").addClass("active");
    $("#vod-series-video-progressbar-container").addClass("active");
    $(".rangeslider__fill").addClass("active");
  },
  hoverResumeBtn: function (index) {
    var keys = this.keys;
    keys.resume_bar = index;
    keys.focused_part = "resume_bar";
    $(this.resume_bar_doms).removeClass("active");
    $(this.resume_bar_doms[index]).addClass("active");
    clearTimeout(this.resume_timer);
    this.resume_timer = setTimeout(function () {
      $("#video-resume-modal").hide();
      keys.focused_part = keys.prev_focus;
    }, 15000);
  },

  showAudioTracksModal: function () {
    var noAudio = current_words["no_audio"];
    var _this = this;
    try {
      var obj = media_player.getAudioTracks();
      var result = Object.keys(obj).map(function (key) {
        return [key, obj[key]];
      });
      audioTracks = result;
      this.keys.focused_part = "audioTracksModal";
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
      this.keys.focused_part = "info_bar";
      showToast(noAudio, "");
    }
  },

  renderAudioTracks: function (items) {
    var that = this;
    var htmlContent = "";
    items.map(function (item, index) {
      var fullLanguage = !item[1].language ? 'English' : that.getFullLanguage(item[1].language);
      htmlContent +=
        '<div class="audio-tracks-item"  onmouseenter="vod_series_player_page.hoverAudioTracks(' + index + ')" onclick="vod_series_player_page.handleMenuClick()">'
        + '<input class="magic-radio" type="radio" name="radio" id="disable-audio-tracks-' + index + '" value="' + index + '">'
        + '<label for="disable-audio-tracks">' + fullLanguage + '</label>'
        + '</div>';
    })
    return htmlContent;
  },

  handleMenuClick: function () {
    var keys = this.keys;
    console.log('show_control', this.show_control)
    console.log('keys.focused_part', keys.focused_part)
    if (keys.focused_part === "stop_playerback_modal") {
      $(this.stop_playback_modal_btn_doms[keys.stop_playerback_modal]).trigger("click");
      return;
    } else if (keys.focused_part === "seek_bar") {
      if (!this.show_control) {
        this.showControlBar(true);
      } else {
        this.showControlBar(false);
        $(this.video_control_doms[keys.control_bar]).trigger("click");
      }
      return;
    } else if (keys.focused_part === "control_bar") {
      if (!this.show_control) {
        this.showControlBar(true);
      } else {
        this.showControlBar(false);
        $(this.video_control_doms[keys.control_bar]).trigger("click");
      }
      return;
    } else if (keys.focused_part === "info_bar") {
      if (this.show_control) {
        this.showControlBar(false);
        $(this.video_info_doms[keys.info_bar])
          .find(".video-info-icon")
          .trigger("click");
      } else {
        this.showControlBar(true);
      }
    } else if (keys.focused_part === "episode_selection") {
      if (this.show_control) {
        this.showControlBar(false);
        $(this.episode_doms[keys.episode_selection]).trigger("click");
      } else {
        this.showControlBar(true);
      }
    } else if (keys.focused_part === "textTracksModal") {
      $(this.textTracksDoms).find("input").prop("checked", false);
      $(this.textTracksDoms[keys.textTracksSelection])
        .find("input")
        .prop("checked", true);
    } else if (keys.focused_part === "textTrackConfirmBtn") {
      $(this.textTrackConfirmBtnDoms[keys.textTrackConfirmSelection]
      ).trigger("click");
    } else if (keys.focused_part === "audioTracksModal") {
      $(this.audioTracksDoms).find("input").prop("checked", false);
      $(this.audioTracksDoms[keys.audioTracksSelection])
        .find("input")
        .prop("checked", true);
    } else if (keys.focused_part === "audioTrackConfirmBtn") {
      $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).trigger("click");
      this.confirmAudioTrack();
    }
    else if (keys.focused_part === "resume_bar") {
      $("#video-resume-modal").hide();
      keys.focused_part = keys.prev_focus;
      if (keys.resume_bar == 0) {
        try {
          var current_time = media_player.videoObj.currentTime;
          if (current_time < this.resume_time) {
            media_player.videoObj.currentTime = this.resume_time / 1000;
          }
        } catch (e) { }
      }
    } else if (keys.focused_part === "player_ratio_modal") {
      $(this.player_ratio_modal_doms[keys.player_ratio_modal]).trigger("click");
    }
  },
  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    if (keys.focused_part === "resume_bar") {
      var resume_bar_doms = this.resume_bar_doms;
      keys.resume_bar += increment;
      if (keys.resume_bar < 0) keys.resume_bar = resume_bar_doms.length - 1;
      if (keys.resume_bar >= resume_bar_doms.length) keys.resume_bar = 0;
      $(resume_bar_doms).removeClass("active");
      $(resume_bar_doms[keys.resume_bar]).addClass("active");
      clearTimeout(this.resume_timer);
      this.resume_timer = setTimeout(function () {
        $("#video-resume-modal").hide();
        keys.focused_part = keys.prev_focus;
      }, 15000);
    }
    if (this.show_control) {
      this.showControlBar(false);
      if (keys.focused_part === "control_bar") {
        keys.control_bar += increment;
        if (keys.control_bar < 0) keys.control_bar = 0;
        if (keys.control_bar >= this.video_control_doms.length)
          keys.control_bar = this.video_control_doms.length - 1;
        $(this.video_control_doms).removeClass("active");
        $(this.video_control_doms[keys.control_bar]).addClass("active");
      }
      if (keys.focused_part === "seek_bar") {
        if (increment > 0) {
          this.seekTo(30);
        } else {
          this.seekTo(-30);
        }
      }
      if (keys.focused_part === "info_bar") {
        keys.info_bar += increment;
        if (keys.info_bar < 0) keys.info_bar = 0;
        if (keys.info_bar >= this.video_info_doms.length)
          keys.info_bar = this.video_info_doms.length - 1;
        $(this.video_info_doms).removeClass("active");
        $(this.video_info_doms[keys.info_bar]).addClass("active");
      }
      if (keys.focused_part === "episode_selection") {
        $(this.episode_doms).removeClass("active");
        keys.episode_selection += increment;
        if (keys.episode_selection < 0)
          keys.episode_selection = this.episode_doms.length - 1;
        if (keys.episode_selection >= this.episode_doms.length)
          keys.episode_selection = 0;
        $(this.episode_doms[keys.episode_selection]).addClass("active");
        moveScrollPosition(
          $("#player-seasons-container"),
          this.episode_doms[keys.episode_selection],
          "horizontal",
          false
        );
      }
    } else {
      if (
        keys.focused_part === "control_bar" ||
        keys.focused_part === "info_bar"
      ) {
        this.showControlBar(false);
        $(this.video_control_doms).removeClass("active");
        $(this.video_info_doms).removeClass("active");
        keys.focused_part = "seek_bar";
        keys.prev_focus = "seek_bar";
        $("#vod-series-progress-container .rangeslider").addClass("active");
        this.seekTo(increment * 30);
      } else if (keys.focused_part === "stop_playerback_modal") {
        keys.stop_playerback_modal += increment;
        if (keys.stop_playerback_modal < 0) keys.stop_playerback_modal = 0;
        if (keys.stop_playerback_modal > 1) keys.stop_playerback_modal = 1;
        this.hoverExitPlaybackMenuItem(keys.stop_playerback_modal);
      } else if (keys.focused_part === "textTrackConfirmBtn") {
        keys.textTrackConfirmSelection = keys.textTrackConfirmSelection === 1 ? 0 : 1;
        $(this.textTrackConfirmBtnDoms).removeClass('active')
        $(this.textTrackConfirmBtnDoms[keys.textTrackConfirmSelection]).addClass('active')
      } else if (keys.focused_part === "textTracksModal") {
        keys.focused_part = "textTrackConfirmBtn";
        $(".text-tracks-item").removeClass("active");
        keys.textTrackConfirmSelection = keys.textTrackConfirmSelection === 1 ? 0 : 1;
        $(this.textTrackConfirmBtnDoms).removeClass('active')
        $(this.textTrackConfirmBtnDoms[keys.textTrackConfirmSelection]).addClass('active')
      } else if (keys.focused_part === "audioTrackConfirmBtn") {
        keys.audioTrackConfirmSelection = keys.audioTrackConfirmSelection === 1 ? 0 : 1;
        $(this.audioTrackConfirmBtnDoms).removeClass('active')
        $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).addClass('active');
      } else if (keys.focused_part === "audioTracksModal") {
        keys.focused_part = "audioTrackConfirmBtn";
        keys.audioTrackConfirmSelection = keys.audioTrackConfirmSelection === 1 ? 0 : 1;
        $(this.audioTrackConfirmBtnDoms).removeClass('active')
        $(this.audioTrackConfirmBtnDoms[keys.audioTrackConfirmSelection]).addClass('active');
      }
    }
  },

  handleMenuUpDown: function (increment) {
    var keys = this.keys;
    if (this.show_control) {
      this.showControlBar(false);
      switch (keys.focused_part) {
        case "control_bar":
          if (increment < 0) {
            keys.focused_part = "seek_bar";
            $(this.video_control_doms).removeClass("active");
            $("#vod-series-video-progress").addClass("active");
            $("#vod-series-video-progressbar-container").addClass("active");
            $(".rangeslider__fill").addClass("active");
          }
          if (this.has_episodes && increment > 0) {
            $(this.video_control_doms).removeClass("active");
            $(this.video_info_doms).removeClass("active");
            $("#player-seasons-container").addClass("expanded");
            keys.focused_part = "episode_selection";
            keys.prev_focus = "episode_selection";
            $(this.episode_doms[keys.episode_selection]).addClass("active");
            moveScrollPosition(
              $("#player-seasons-container"),
              this.episode_doms[keys.episode_selection],
              "horizontal",
              false
            );
          }
          break;
        case "seek_bar":
          if (increment > 0) {
            keys.focused_part = "control_bar";
            $("#vod-series-video-progress").removeClass("active");
            $("#vod-series-video-progressbar-container").removeClass("active");
            $(".rangeslider__fill").removeClass("active");
            $(this.video_control_doms).removeClass("active");
            $(this.video_info_doms).removeClass("active");
            $(this.video_control_doms[2]).addClass("active");
          } else {
            $("#vod-series-video-progress").removeClass("active");
            $("#vod-series-video-progressbar-container").removeClass("active");
            $(".rangeslider__fill").removeClass("active");
            $(this.video_control_doms).removeClass("active");
            $(this.video_info_doms).removeClass("active");
            keys.focused_part = "info_bar";
            keys.prev_focus = "info_bar";
            keys.info_bar = 0;
            $(this.video_info_doms[keys.info_bar]).addClass("active");
          }
          break;
        case "info_bar":
          if (increment > 0) {
            keys.focused_part = "seek_bar";
            $(this.video_control_doms).removeClass("active");
            $(this.video_info_doms).removeClass("active");
            $("#vod-series-video-progress").addClass("active");
            $("#vod-series-video-progressbar-container").addClass("active");
            $(".rangeslider__fill").addClass("active");
          }
          break;
        case "episode_selection":
          if (increment < 0) {
            $(this.video_control_doms).removeClass("active");
            $(this.video_info_doms).removeClass("active");
            $("#player-seasons-container").removeClass("expanded");
            keys.focused_part = "info_bar";
            $(this.episode_doms).removeClass("active");
            $(this.video_info_doms[keys.info_bar]).addClass("active");
          }
          break;
        case "player_ratio_modal":
          keys.player_ratio_modal += increment;
          this.hoverPlayerRatio(keys.player_ratio_modal);
          break;
      }
    } else {
      if (keys.focused_part == "textTracksModal") {
        keys.textTracksSelection += increment;
        if (keys.textTracksSelection >= this.textTracksDoms.length) {
          $(this.textTracksDoms).removeClass("active");
          keys.textTracksSelection = this.textTracksDoms.length - 1;
          keys.focused_part = "textTrackConfirmBtn";
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
      } else if (keys.focused_part === 'textTrackConfirmBtn') {
        if (increment < 0) {
          keys.focused_part = "textTracksModal";
          this.hoverTextTracks(keys.textTracksSelection);
          $(this.textTrackConfirmBtnDoms).removeClass('active')
        }
      } else if (keys.focused_part == "audioTracksModal") {
        keys.audioTracksSelection += increment;
        if (keys.audioTracksSelection >= this.audioTracksDoms.length) {
          $(this.audioTracksDoms).removeClass("active");
          keys.audioTracksSelection = this.audioTracksDoms.length - 1;
          keys.focused_part = "audioTrackConfirmBtn";
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
      } else if (keys.focused_part === 'audioTrackConfirmBtn') {
        if (increment < 0) {
          keys.focused_part = "audioTracksModal";
          this.hoverAudioTracks(keys.audioTracksSelection);
          $(this.audioTrackConfirmBtnDoms).removeClass('active')
        }
      }
    }
  },

  HandleKey: function (e) {
    console.log(e.keyCode)
    switch (e.keyCode) {
      case tvKey.MediaFastForward:
        this.seekTo(300);
        break;
      case tvKey.RIGHT:
        this.handleMenuLeftRight(1);
        break;
      case tvKey.MediaRewind:
        this.seekTo(-300);
        break;
      case tvKey.LEFT:
        this.handleMenuLeftRight(-1);
        break;
      case tvKey.DOWN:
        this.handleMenuUpDown(1);
        break;
      case tvKey.UP:
        this.handleMenuUpDown(-1);
        break;
      case tvKey.MediaPause:
        try {
          media_player.pause();
          $("#media-pause").addClass("hide");
          $("#media-play").removeClass("hide");
        } catch (e) { }
        break;
      case tvKey.MediaPlay:
        try {
          media_player.play();
          $("#media-pause").removeClass("hide");
          $("#media-play").addClass("hide");
        } catch (e) { };
        break;
      case tvKey.MediaPlayPause:
        this.playPauseVideo();
        break;
      case tvKey.ENTER:
        this.handleMenuClick();
        break;
      case tvKey.RETURN:
        this.goBack();
        break;
      case tvKey.MediaStop:
        this.goBack();
        break;
      case tvKey.RED:
        break;
      case tvKey.YELLOW:
        if (
          this.current_movie_type === "movies" ||
          this.current_movie_type === "movie"
        ) {
          if (!current_movie.is_favorite) {
            MovieHelper.addRecentOrFavoriteMovie(
              "vod",
              current_movie,
              "favorite"
            );
            current_movie.is_favorite = true;
          } else {
            MovieHelper.removeRecentOrFavoriteMovie(
              "vod",
              current_movie.stream_id,
              "favorite"
            );
            current_movie.is_favorite = false;
          }
        } else {
          if (!current_series.is_favorite) {
            MovieHelper.addRecentOrFavoriteMovie(
              "series",
              current_series,
              "favorite"
            );
            current_series.is_favorite = true;
          } else {
            MovieHelper.removeRecentOrFavoriteMovie(
              "series",
              current_series.series_id,
              "favorite"
            );
            current_series.is_favorite = false;
          }
        }
        break;
    }
  }
};
