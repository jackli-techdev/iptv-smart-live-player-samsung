"use strict";
var channel_page = {
  current_channel_id: 0,
  full_screen_video: false,
  full_screen_timer: null,
  show_control: true,
  player: null,
  channelNumTimer: null,
  channelNum: 0,
  movies: [],
  initiated: false,
  categories: [],
  current_category_index: -1,
  category_hover_timer: null,
  category_hover_timeout: 300,
  category_search_key_timer: "",
  channel_hover_timer: null,
  channel_hover_timeout: 1000,
  video_control_doms: [],
  prev_route: "",
  audioTracksDoms: [],
  audioTrackConfirmBtnDoms: $("#channel-audio-tracks-modal .audio-track-btn"),
  currentAudioTrackIndex: -1,
  epg_status: false,
  top_menu_doms: $(".top-menu-titles"),
  video_info_doms: $("#vod-series-video-controls-container .video-info-btn"),
  favButtonDom: $("#live-Favorite-button"),
  favIconDom: $('#live-video-control-fav-icon'),
  currentRenderCount: 0,
  renderCountIncrement: 40,
  keys: {
    focused_part: "category_selection",
    category_selection: 0,
    channel_selection: 0,
    search_back_selection: 0,
    search_selection: -1,
    prev_focus: "",
    video_control: 4,
    catchup_fav_search_selection: 0,
    top_bar_menu_selection: 0,
    info_bar: 0,
    operation_modal: 0,
    subtitle_audio_selection_modal: 0,
    audio_selection_modal: 0,
    audioTracksSelection: 0,
    audioTrackConfirmSelection: 0
  },

  category_doms: [],
  bottom_doms: $(".live-catchup-button-list"),
  channel_doms: [],
  video_control_doms: $(
    "#live-channel-controls-container .live-video-control-icon i"
  ),
  play_icon_index: 1,
  filtered_movies: [],
  next_programme_timer: null,
  programmes: [],
  short_epg_limit_count: 30,
  prev_dom: [],
  init: function () {
    this.prev_dom = [];
    var keys = this.keys;
    this.prev_route = "";
    $(this.video_control_doms).removeClass("active");
    $(this.video_control_doms[4]).addClass("active");
    var currentPageTitle = current_words["live_tv"];
    $(".current-page-title").text(currentPageTitle);
    selectTopBarMenu(1);
    $(".home-page-title-icon").attr("src", 'images/arrow.png');
    $(".live-catchup-button-list").removeClass("active");
    keys.top_bar_menu_selection = 1;
    showTopBar();
    $("#search-by-video-title").innerHTML = "";
    $("#search-by-video-title").html(
      ' <div class="top-menu-search-bar"style="border:none">' +
      '<div id="vod-series-search-bar" onmouseenter="channel_page.hoverSearchItem()">' +
      '<input id="search-value" placeholder="Search" onkeyup="channel_page.searchValueChange()" onchange="channel_page.searchValueChange()" />' +
      '<span id="vod-series-search-icon">' +
      '<img src="images/svg/search-icon.svg" width="28">' +
      "</span>" +
      "</div>" +
      "</div>"
    );
    document.getElementById('search-value').placeholder = current_words['search'];
    $("#live-category-search-value").val("");
    current_route = "channel-page";
    var categories = MovieHelper.getCategories("live", false, true);
    this.categories = categories;
    this.renderCategories(categories);
    var current_category_index = -1;
    this.currentRenderCount = 0;
    this.emptyChannelContainer();
    for (var i = 0; i < categories.length; i++) {
      if (categories[i].movies.length > 0) {
        current_category_index = i;
        break;
      }
    }
    keys.category_selection = current_category_index;
    this.current_category_index = current_category_index;
    this.hoverCategory(current_category_index);
    this.showCategoryChannels(
      categories[current_category_index].category_name,
      current_category_index
    );
    if (categories[current_category_index].movies.length > 0) {
      this.hoverChannel(0);
      if (liveAutoPlay)
        this.showMovie(this.movies[0]);
    }
    this.full_screen_video = false;
    this.current_channel_id = 0;
    $("#channel-page-bottom-container").show();
    displayCurrentPage(current_route);
  },

  emptyChannelContainer: function () {
    $("#channel-page-menu-container").html("");
  },

  renderCategories: function (categories) {
    var html = "";
    categories.map(function (item, index) {
      var translatedCategoryName = "";
      if (item.category_id === "all") {
        translatedCategoryName = current_words['all'];
      } else if (item.category_id === "recent") {
        translatedCategoryName = current_words['recently_viewed'];
      } else if (item.category_id === "favorite") {
        translatedCategoryName = current_words['favorites'];
      } else
        translatedCategoryName = item.category_name;

      html +=
        '<div class="flex-container channel-page-category-item" ' +
        '   onmouseenter="channel_page.hoverCategory(' +
        index +
        ')" ' +
        '   onclick="channel_page.handleMenuClick()"' +
        ">" +
        '<div class = "live-category-name">' +
        translatedCategoryName +
        "</div>" +
        '<div class = "live-category-length' + (item.category_id === "favorite" ? " live-fav-category-length" : item.category_id === "recent" ? " live-recent-category-length" : "") + '">' +
        item.movies.length +
        "</div>" +
        "</div>";
    });
    $("#channel-page-categories-container").html(html);
    this.category_doms = $(".channel-page-category-item");
  },

  selectCategory: function (category_name, category_index) {
    var keys = this.keys;
    $(".channel-page-category-item").removeClass("selected");
    this.category_doms = $(".channel-page-category-item");
    $(this.category_doms[keys.category_selection]).addClass("selected");
    moveScrollPosition(
      $("#channel-page-categories-container"),
      this.category_doms[keys.category_selection],
      "vertical",
      false
    );
  },

  goBack: function () {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "audioTracksModal":
        keys.audioTracksSelection = 0;
        $("#channel-audio-tracks-modal").modal("hide");
        keys.focused_part = "control_bar";
        break;
      case "audioTrackConfirmBtn":
        keys.audioTracksSelection = 0;
        $("#channel-audio-tracks-modal").modal("hide");
        keys.focused_part = "control_bar";
        break;
      case "control_bar":
        if (this.show_control) {
          this.hideControlBar();
        } else {
          this.full_screen_video = false;
          this.zoomInOut();
        }
        break;
      case "categorySearchSelection":
      case "topBarMenu":
      case "category_selection":
      case "channel_selection":
      case "catchup_fav_search_selection":
        this.Exit();
        break;
    }
  },
  Exit: function () {
    closePlayer();
    this.keys.focused_part = "channel_selection";
    this.full_screen_video = false;
    this.zoomInOut();
    $("#channel-page").addClass("hide");
    $(this.bottom_doms).removeClass("active");
    clearTimeout(this.full_screen_timer);
    showLoader(false);
    goToHomePage();
  },

  getCurrentCategorMovies: function () {
    var keys = this.keys;
    var that = this;
    var category = this.categories[that.current_category_index];
    return category.movies;
  },

  showCategoryChannels: function (category_name, category_index) {
    var keys = this.keys;
    var categories = this.categories;
    var category = categories[keys.category_selection];
    this.movies = category.movies;

    if (this.movies.length === 0) {
      var noChannels = current_words['no_channels'];
      return showToast(noChannels, "")
    } else {
      liveStreamSort = getLocalStorageData("liveStreamSort");
      if (liveStreamSort === null)
        liveStreamSort = "default";
      this.movies = getSortedChannels(this.movies, liveStreamSort)
      this.selectCategory(category_name, category_index);
      this.renderChannels();
    }
  },

  renderChannels: function () {
    var _this = this;
    var streamIds = getStreamIds(LiveModel.favorite_ids, 'live');
    var htmlContents = "";
    this.movies
      .slice(
        _this.currentRenderCount,
        _this.currentRenderCount + this.renderCountIncrement
      ).map(function (movie, index) {
        var tempChannelNumber = _this.currentRenderCount + index + 1;
        var epg_icon = '<img src="images/clock.png"  class = "catchup-click-img" />';
        htmlContents +=
          '<div class="channel-menu-item flex-container" data-channel_id="' +
          movie.stream_id +
          '" ' +
          '   data-index="' + tempChannelNumber +
          '" ' +
          '   onmouseenter="channel_page.hoverChannel(' +
          (tempChannelNumber - 1) +
          ')"' +
          '   onclick="channel_page.handleMenuClick()"' +
          ">" +
          '<span class = "flex-container align-center"><span class="channel-number">' +
          tempChannelNumber +
          "</span>" +
          '<img class="channel-icon" src="' +
          movie.stream_icon +
          '" onerror="this.src=\'' +
          default_live_icon +
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
    this.channel_doms = $("#channel-page-menu-container .channel-menu-item");
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
          keys.channel_selection = tempNum - 1;
          that.hoverChannel(keys.channel_selection);
        }
        if (!isMovie) {
          showToast("No channel exist", "");
        }
        $('#keyboard-channel-number').text("");
        that.channelNum = 0;
      }, 2000);
    }
  },
  getStreamIds: function (data) {
    var streamIds = data.map(function (item) {
      return item.stream_id;
    });
    return streamIds
  },
  addOrRemoveFav: function () {
    var keys = this.keys;
    var current_movie = this.movies[keys.channel_selection];
    var action = 'add';
    var streamIds = getStreamIds(LiveModel.favorite_ids, 'live');

    if (streamIds.includes(current_movie.stream_id))
      action = 'remove';
    var elements = $('#live-Favorite-button');
    var elements1 = $('#live-video-control-fav-icon');
    if (action === 'add') {
      MovieHelper.addRecentOrFavoriteMovie('live', current_movie, 'favorite'); // add to favorite movie
      $(this.channel_doms[keys.channel_selection]).append(
        '<i><img src="images/star-yellow.png" class="favorite-icon" /></i>',
      );
      $('#live-video-control-star-img').attr('src', 'images/star-yellow.png');
      var word =
        typeof current_words['remove_favorites'] != 'undefined'
          ? current_words['remove_favorites']
          : 'Remove Favorite';
      $(elements).text(
        typeof current_words['remove_favorites'] != 'undefined'
          ? current_words['remove_favorites']
          : 'Remove Fav',
      );
      $(elements1).text(
        typeof current_words['remove_favorites'] != 'undefined'
          ? current_words['remove_favorites']
          : 'Remove Fav',
      );
      $(elements).data('action', 'remove').trigger('update');
      $(elements1).data('action', 'remove').trigger('update');
    } else {
      var word =
        typeof current_words['add_to_favorite'] != 'undefined'
          ? current_words['add_to_favorite']
          : 'Add Fav';
      $(elements).text(word);
      $(elements1).text(word);
      $(elements).data('action', 'add');
      $(elements1).data('action', 'add');
      MovieHelper.removeRecentOrFavoriteMovie(
        'live',
        current_movie.stream_id,
        'favorite',
      );
      $(this.channel_doms[keys.channel_selection])
        .find('.favorite-icon')
        .remove();
      $('#live-video-control-star-img').attr('src', 'images/star.png');
      var category = this.categories[this.current_category_index];

      if (category.category_id === "favorite") {
        $(this.channel_doms[keys.channel_selection]).remove();
        var channel_doms = $("#channel-page-left-part .channel-menu-item");
        if (channel_doms.length > 0) {
          channel_doms.map(function (index, item) {
            $(item).data("index", index);
          });
          this.channel_doms = channel_doms;
          if (keys.channel_selection >= this.channel_doms.length)
            keys.channel_selection = this.channel_doms.length - 1;
          this.hoverChannel(keys.channel_selection);
        } else this.hoverCategory(keys.category_selection);
      }

    }
  },
  goToMovies: function () {
    closePlayer();
    this.full_screen_video = false;
    $("#channel-page .player-container").removeClass("expanded");
    $(".live-catchup-button-wrapper").removeClass("hide");

    this.keys.focused_part = "channel_selection";
    $("#live-channel-controls-container").slideUp();
    home_page.clickMainMenu(1);
  },
  hoverGoToMovies: function () {
    this.full_screen_video = false;
    $("#channel-page .player-container").removeClass("expanded");
    $(".live-catchup-button-wrapper").removeClass("hide");

    this.keys.focused_part = "channel_selection";
    $("#live-channel-controls-container").slideUp();
  },

  goToSeries: function () {
    closePlayer();

    this.full_screen_video = false;
    $("#channel-page .player-container").removeClass("expanded");
    $(".live-catchup-button-wrapper").removeClass("hide");

    this.keys.focused_part = "channel_selection";
    $("#live-channel-controls-container").slideUp();
    home_page.clickMainMenu(2);
  },

  goToEntireSearch: function () {
    closePlayer();
    this.full_screen_video = false;
    $("#channel-page .player-container").removeClass("expanded");
    $(".live-catchup-button-wrapper").removeClass("hide");

    this.keys.focused_part = "channel_selection";
    $("#live-channel-controls-container").slideUp();
    entire_search_page.entireSearch("channel-page");
    showLoader(false);
  },

  goToCatchUpPage: function () {
    var keys = this.keys;

    this.channel_doms = $("#channel-page-menu-container .channel-menu-item");
    this.hover_channel_id = $(this.channel_doms[keys.channel_selection]).data(
      "channel_id"
    );
    var movie = getCurrentMovieFromId(
      this.hover_channel_id,
      this.movies,
      "stream_id"
    );
    if (settings.playlist.playlist_type === "xc")
      channel_page.get_all_programmes(this.hover_channel_id, movie, 'channel-page');
    else {
      var no_epg_avaliable = current_words["no_epg_avaliable"];
      showToast(no_epg_avaliable, "");
    }
  },
  hoverGoToCatchUpPage: function (index) {
    var keys = this.keys;
    keys.focused_part = "catchup_fav_search_selection";
    keys.catchup_fav_search_selection = index;
    $(this.prev_dom).removeClass("active");
    this.prev_dom = this.bottom_doms[index];
    $(this.bottom_doms[index]).addClass("active");
  },
  hoverVideoControlIcon: function (index) {
    var keys = this.keys;
    keys.video_control = index;
    if (keys.video_control < 0) keys.video_control = 0;
    if (keys.video_control >= this.video_control_doms.length)
      keys.video_control = this.video_control_doms.length - 1;
    $(this.video_control_doms).removeClass("active");
    $(this.video_control_doms[keys.video_control]).addClass("active");
    this.showControlBar(false);
  },
  get_all_programmes: function (stream_id, movie, prev_route) {
    $.ajax({
      method: "get",
      url:
        api_host_url +
        "/player_api.php?username=" +
        user_name +
        "&password=" +
        password +
        "&action=get_simple_data_table&stream_id=" +
        stream_id,
      success: function (data) {
        settings.saveSettings("movieProgrammes", data.epg_listings, "");
        var temp_epgData = [];

        if (time_format == 12) {
          var formatText = "YYYY-MM-DD hh:mm a";
        } else var formatText = "YYYY-MM-DD HH:mm";

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
            has_archive: item.has_archive
          });
        });

        if (temp_epgData.length > 0) {
          var programmes = temp_epgData;
          closePlayer();
          $("#channel-page").addClass("hide");

          catchup_variables.init(movie, programmes, prev_route);
        } else {
          var no_epg_avaliable = current_words["no_epg_avaliable"];
          showToast(no_epg_avaliable, "");
          $(".toast").toast({ animation: true, delay: 4000 });
          $("#toast").toast("show");
        }
      },
      error: function (e) {
        console.log(e);
      }
    });
  },

  showNextProgrammes: function () {
    var id = "next-program-container";
    var movie = this.movies[this.keys.channel_selection];
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
    var that = this;
    this.showNextProgrammes();

    clearInterval(this.next_programme_timer);

    that.next_programme_timer = setInterval(function () {
      that.showNextProgrammes();
    }, 60000);
  },
  getEpgProgrammes: function () {
    var keys = this.keys;
    var that = this;
    var programmes = [];
    this.programmes = [];
    that.showNextProgrammes();
    var movie = this.movies[this.keys.channel_selection];
    if (settings.playlist.playlist_type === "xc") {

      if (time_format == 12) {
        var formatText = "YYYY-MM-DD hh:mm a";
      } else var formatText = "YYYY-MM-DD HH:mm";

      var playlist = settings.playlist;
      $.ajax({
        method: "get",
        url:
          playlist.url +
          "/player_api.php?username=" +
          playlist.username +
          "&password=" +
          playlist.password +
          "&action=get_simple_data_table&stream_id=" +
          movie.stream_id,
        success: function (data) {
          var epgList = data.epg_listings || [];
          if (epgList) {
            epgList.map(function (item) {
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
                has_archive: item.has_archive
              });
            });
          }

          that.programmes = programmes;
          that.updateNextProgrammes();
        }
      });
    }
  },

  zoomInOut: function () {
    if (!this.full_screen_video) {

      $("#channel-page .player-container").removeClass("expanded");
      $(".live-catchup-button-wrapper").removeClass("hide");

      this.keys.focused_part = "channel_selection";

      $("#live-channel-controls-container").slideUp();
    } else {
      $(".live-catchup-button-wrapper").addClass("hide");
      $("#channel-page .player-container").addClass("expanded");

      this.showControlBar(true);
    }
  },
  showMovie: function (current_channel) {
    current_movie = current_channel;
    var url,
      movie_id = current_movie.stream_id;
    if (settings.playlist.playlist_type === "xc") {
      var extension = getLocalStorageData('liveStreamFormat');
      if (extension === null || extension === 'default')
        extension = 'ts';
      url = getMovieUrl(movie_id, "live", extension);
    } else if (settings.playlist.playlist_type === "general")
      url = current_movie.url;
    closePlayer();
    media_player.live_init(
      "channel-page-video",
      "channel-page"
    );
    try {
      media_player.playAsync(url);
    } catch (e) { }
    this.current_channel_id = movie_id;

    $(".full-screen-channel-name").text(
      current_movie.num + " " + current_movie.name
    );
    if (!checkForAdult(current_movie, "movie", LiveModel.categories))
      MovieHelper.addRecentOrFavoriteMovie("live", current_movie, "recent"); // add to recent live channels
    this.checkAddFavStatus(current_movie);
  },
  checkAddFavStatus: function (current_movie) {
    var elements = $("#live-Favorite-button");
    var streamIds = getStreamIds(LiveModel.favorite_ids, 'live');
    var isFavorite = streamIds.includes(current_movie.stream_id);
    if (isFavorite) {
      $(this.channel_doms[this.keys.channel_selection]).append('<i><img src="images/star-yellow.png" class="favorite-icon" /></i>');
      $('.fav-img').attr('src', 'images/star-yellow.png');
      $('#live-video-control-star-img').attr('src', 'images/star-yellow.png');
    } else {
      $(this.channel_doms[this.keys.channel_selection]).find('.favorite-icon').remove();
      $('.fav-img').attr('src', 'images/star.png');
      $('#live-video-control-star-img').attr('src', 'images/star.png');
    }

    var word = isFavorite ? (current_words['remove_favorites'] || 'Remove from Favorites') : (current_words['add_to_favorite'] || 'Add to Favorite');

    $(this.favButtonDom).text(word).data('action', isFavorite ? 'remove' : 'add').trigger('update');
    $(this.favIconDom).text(word).data('action', isFavorite ? 'remove' : 'add').trigger('update');
  },

  showMovieFromNextChannel: function (current_movie) {
    var url,
      movie_id = current_movie.stream_id;
    if (settings.playlist.playlist_type === "xc") {
      var extension = getLocalStorageData('liveStreamFormat');
      if (extension === null || extension === 'default')
        extension = 'ts';
      url = getMovieUrl(movie_id, "live", extension);
    } else if (settings.playlist.playlist_type === "general")
      url = current_movie.url;
    closePlayer();
    media_player.live_init(
      "channel-page-video",
      "channel-page"
    );
    try {
      this.showControlBar();
      media_player.playAsync(url);
    } catch (e) { }
    this.current_channel_id = movie_id;

    $(".full-screen-channel-name").text(
      current_movie.num + " " + current_movie.name
    );
    if (!checkForAdult(current_movie, "movie", LiveModel.categories))
      MovieHelper.addRecentOrFavoriteMovie("live", current_movie, "recent"); // add to recent live channels
    this.checkAddFavStatus(current_movie);
  },

  showNextChannel: function (increment) {
    var keys = this.keys;
    var prev_focus = keys.focused_part;
    keys.channel_selection += increment;
    if (keys.channel_selection < 0) keys.channel_selection = 0;
    if (keys.channel_selection >= this.channel_doms.length)
      keys.channel_selection = this.channel_doms.length - 1;
    var that = this;
    setTimeout(function () {
      var movie = that.movies[keys.channel_selection];
      that.current_channel_id = movie.stream_id;
      that.showMovieFromNextChannel(that.movies[keys.channel_selection]);
    }, 400);
    this.hoverChannel(keys.channel_selection);
    if (prev_focus === "control_bar") keys.focused_part = "control_bar";

  },
  playOrPause: function () {
    if (media_player.state == media_player.STATES.PLAYING) {
      try {
        media_player.pause();
      } catch (e) { }
    } else {
      try {
        media_player.play();
      } catch (e) { }
    }
  },

  searchValueChange: function () {
    var search_value = $("#search-value").val();
    var currentCategoryMovies = this.getCurrentCategorMovies();

    var filtered_movies = [];
    if (search_value == "") {
      filtered_movies = currentCategoryMovies;
    } else {
      search_value = search_value.toLowerCase();
      filtered_movies = currentCategoryMovies.filter(function (movie) {
        return movie.name.toLowerCase().includes(search_value);
      });
    }

    this.keys.channel_selection = 0;
    this.currentRenderCount = 0;
    this.emptyChannelContainer();
    this.movies = filtered_movies;
    this.filtered_movies = filtered_movies;
    this.renderChannels();
  },

  hideControlBar: function () {
    $("#live-channel-controls-container").slideUp();
    $("#live-channel-title").slideUp();
    this.show_control = false;
  },
  showControlBar: function (move_focus) {
    this.show_control = true;
    $("#live-channel-controls-container").slideDown();
    var that = this;
    var keys = this.keys;
    if (move_focus) {
      keys.focused_part = "control_bar";
      keys.prev_focus = "control_bar";
      keys.video_control = 4;
      $(this.video_control_doms).removeClass("active");
      $(this.video_info_doms).removeClass("active");
      $(this.video_control_doms[4]).addClass("active");
      $("#live-channle-player-seasons-container").removeClass("expanded");
    }
    clearTimeout(this.timeOut);
    this.timeOut = setTimeout(function () {
      that.hideControlBar();
    }, 4000);
  },

  hoverCategory: function (index) {
    this.keys.focused_part = "category_selection";
    this.keys.category_selection = index;
    $(this.prev_dom).removeClass("active");
    $(this.category_doms[index]).addClass("active");
    this.prev_dom = this.category_doms[index];
    moveScrollPosition(
      $("#channel-page-categories-container"),
      this.category_doms[index],
      "vertical",
      false
    );
  },
  hoverbottom: function (index) {
    var keys = this.keys;
    keys.focused_part = "catchup_fav_search_selection";
    keys.catchup_fav_search_selection = index;
    $(this.prev_dom).removeClass("active");
    $(this.bottom_doms[index]).addClass("active");
    this.prev_dom = this.bottom_doms[index];
  },
  hoverChannel: function (index) {
    var keys = this.keys;
    keys.focused_part = "channel_selection";
    keys.channel_selection = index;
    $(this.prev_dom).removeClass("active");
    $(this.channel_doms[index]).addClass("active");
    this.prev_dom = this.channel_doms[index];
    clearTimeout(this.channel_hover_timer);
    var that = this;
    moveScrollPosition(
      $("#channel-page-menu-container"),
      this.channel_doms[keys.channel_selection],
      "vertical",
      false
    );

    this.channel_hover_timer = setTimeout(function () {
      that.getEpgProgrammes();
    }, this.channel_hover_timeout);
    this.checkAddFavStatus(this.movies[keys.channel_selection]);

    if (keys.channel_selection >= this.currentRenderCount - 5)
      this.showCategoryChannels(
        this.categories[this.current_category_index].category_name,
        this.current_category_index
      );
    moveScrollPosition(
      $("#channel-page-menu-container"),
      this.channel_doms[keys.channel_selection],
      "vertical",
      false
    );

  },
  hoverSearchItem: function () {
    var keys = this.keys;
    keys.focused_part = "topBarMenu";
    keys.top_bar_menu_selection = 1;
    $(this.prev_dom).removeClass("active");
    $(".top-menu-search-bar").addClass("active");
    $("#vod-series-search-bar").addClass("active");
    this.prev_dom = $("#vod-series-search-bar");
    this.unFocusCategorySearchBar();
  },

  hoverTopBarMenu: function (index) {
    var keys = this.keys;
    keys.focused_part = "topBarMenu";
    keys.top_bar_menu_selection = index;
    $("#sort-button-container").removeClass("active");
    $("#vod-series-search-bar").removeClass("active");
    $("#vod-series-category-search").removeClass("active");
    $(".vod-series-menu-item-container").removeClass("active");
    $(this.top_menu_doms).removeClass("active");
    $(this.prev_dom).removeClass("active");
    this.prev_dom = this.top_menu_doms[index];
    $(this.top_menu_doms[index]).addClass("active");
  },

  selectChannel: function () {
    var keys = this.keys;
    $(".channel-menu-item").removeClass("selected");
    this.channel_doms = $("#channel-page-menu-container .channel-menu-item");
    $(this.channel_doms[keys.channel_selection]).addClass("selected");
    moveScrollPosition(
      $("#channel-page-menu-container"),
      this.channel_doms[keys.channel_selection],
      "vertical",
      false
    );
  },

  handleMenuClick: function () {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "category_selection":
        if (keys.category_selection > -1) {
          var category = this.categories[keys.category_selection];

          if ((category.category_id !== 'favorite' && category.category_id !== 'recent') && keys.category_selection === this.current_category_index) return;
          $("#search-value").val("");
          this.currentRenderCount = 0;
          keys.channel_selection = 0;
          this.current_category_index = keys.category_selection;

          var is_adult = checkForAdult(category, "category", []);
          if (is_adult) {
            parent_confirm_page.init(current_route, '', '');
            return;
          }

          this.emptyChannelContainer();
          this.showCategoryChannels(
            category.category_name,
            keys.category_selection
          );
        } else {
          console.log('search')
        }
        break;
      case "control_bar":
        if (this.show_control) {
          switch (keys.video_control) {
            case 0:
              this.goToCatchUpPage();
              break;
            case 1:
              showLoader(false);
              this.goToMovies();
              break;
            case 2:
              showLoader(false);
              this.goToSeries();
              break;
            case 3:
              this.showNextChannel(-1);
              break;
            case 4:
              this.replay();
              break;
            case 5:
              this.showNextChannel(1);
              break;
            case 6:
              showLoader(false);
              this.goToEntireSearch();
              break;
            case 7:
              this.addOrRemoveFav();
              break;
            case 8:
              this.showAudioTracksModal();
              break;
          }
        } else {
          this.showControlBar(true);
        }
        break;
      case "channel_selection":
        var selectedCategoryID = this.categories[keys.category_selection].category_id;
        var stream_id = this.movies[keys.channel_selection].stream_id;
        if (this.current_channel_id == stream_id) {
          this.full_screen_video = true;
          this.zoomInOut();
        } else {
          this.selectChannel();
          if (selectedCategoryID === 'all') {
            var is_adult = checkForAdultByVideo(this.movies[keys.channel_selection].category_id, this.categories);
            if (is_adult)
              parent_confirm_page.init(current_route, 'all', 'live');
            else
              this.showMovie(this.movies[keys.channel_selection]);
          } else
            this.showMovie(this.movies[keys.channel_selection]);
        }
        break;
      case "catchup_fav_search_selection":
        var catchup_fav_search_element = $(".live-catchup-button-list")[
          keys.catchup_fav_search_selection
        ];
        $(catchup_fav_search_element).trigger("click");
        break;
      case "topBarMenu":
        var topbarMenu = $(".top-menu-titles");
        if (keys.top_bar_menu_selection === 1) {
          $("#search-value").focus();
          setSelectionRange($("#search-value"));
        } else {
          current_route = "home-page";
          $("#channel-page").addClass("hide");
          $(topbarMenu[keys.top_bar_menu_selection]).trigger("click");
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
      case "categorySearchSelection":
        $("#live-category-search-value").focus();
        setSelectionRange($("#live-category-search-value"));
        break;
    }
  },

  hoverTopMenuBar: function () {
    var keys = this.keys;
    keys.focused_part = "topBarMenu";
    $(".channel-page-category-item").removeClass("active");
    $(".channel-menu-item ").removeClass("active");
    activeTopBarMenu(keys.top_bar_menu_selection);
  },

  hoverCategorySearchBar: function () {
    this.keys.focused_part = "categorySearchSelection";
    $(this.prev_dom).removeClass("active");
    $(".channel-page-category-search-wrapper").addClass("active");
    this.prev_dom = $('.channel-page-category-search-wrapper');
    this.unFocusChannelSearchBar();

  },

  unFocusCategorySearchBar: function () {
    $(".channel-page-category-search-wrapper").removeClass("active");
    $(".channel-page-category-search-wrapper").removeClass("selected");
  },

  unFocusChannelSearchBar: function () {
    $("#search-value").blur();
  },

  replay: function () {
    try {
      media_player.videoObj.currentTime = 0;
    } catch (e) { }
  },

  handleMenusUpDown: function (increment) {
    var keys = this.keys;
    var menus = this.channel_doms;
    switch (keys.focused_part) {
      case "category_selection":
        keys.category_selection += increment;
        if (keys.category_selection < 0) {
          this.hoverCategorySearchBar();
          return;
        }
        if (keys.category_selection >= this.category_doms.length) {
          keys.category_selection = this.category_doms.length - 1;
          this.hoverCategory(keys.category_selection);
        } else {
          this.hoverCategory(keys.category_selection);
        }
        break;
      case "categorySearchSelection":
        $("#live-category-search-value").blur();
        this.unFocusCategorySearchBar();
        if (increment > 0) {
          keys.focused_part = "category_selection";
          keys.category_selection = 0;
          this.hoverCategory(keys.category_selection);
        } else {
          if (keys.top_bar_menu_selection === 4)
            this.hoverSearchItem()
          else {
            keys.top_bar_menu_selection = 0;
            this.hoverTopMenuBar();
          }
        }
        break;
      case "channel_selection":
        $("#search-value").blur();
        keys.channel_selection += increment;
        if (keys.channel_selection >= menus.length) {
          keys.channel_selection = menus.length - 1;
          return;
        }
        else if (keys.channel_selection < 0) {
          keys.channel_selection = 0;
          this.hoverSearchItem();
          return;
        } else if (keys.channel_selection >= this.currentRenderCount - 5) {
          this.showCategoryChannels(
            this.categories[this.current_category_index].category_name,
            this.current_category_index
          );
        }
        this.hoverChannel(keys.channel_selection);
        break;
      case "topBarMenu":
        if (increment > 0) {
          var topbarMenu = $(".top-menu-titles");
          $(topbarMenu).removeClass("active");
          $("#search-value").blur();
          this.hoverCategory(keys.category_selection);
        }
        break;
      case "control_bar":
        if (increment > 0)
          this.showNextChannel(-1);
        else
          this.showNextChannel(1);
        break;
      case "audioTracksModal":
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
        break;
      case "audioTrackConfirmBtn":
        if (increment < 0) {
          keys.focused_part = "audioTracksModal";
          this.hoverAudioTracks(keys.audioTracksSelection);
          $(this.audioTrackConfirmBtnDoms).removeClass('active')
        }
        break;
    }
  },
  moveChannelGroup: function (increment) {
    var keys = this.keys;
    var menus = this.channel_doms;

    keys.channel_selection += increment * 14;

    if (keys.channel_selection >= menus.length) {
      keys.channel_selection = menus.length - 1;
      return;
    }
    if (keys.channel_selection < 0) {
      keys.channel_selection = 0;
      this.hoverTopMenuBar();
      return;
    }
    this.hoverChannel(keys.channel_selection);
    return;
  },

  hoverAudioTracks: function (index) {
    var keys = this.keys;
    keys.focused_part = "audioTracksModal";
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
      var fullLanguage = !item[1].language ? 'English' : vod_series_player_page.getFullLanguage(item[1].language);
      htmlContent +=
        '<div class="audio-tracks-item"  onmouseenter="channel_page.hoverAudioTracks(' + index + ')" onclick="channel_page.handleMenuClick()">'
        + '<input class="magic-radio" type="radio" name="radio" id="channel-disable-audio-tracks-' + index + '" value="' + index + '">'
        + '<label for="channel-disable-audio-tracks">' + fullLanguage + '</label>'
        + '</div>';
    })
    return htmlContent;
  },

  showTextTracksModal: function () {
    var noSubtitle = current_words["no_subtitle"];
    showToast(noSubtitle, "");
  },

  showAudioTracksModal: function () {
    var noAudio = current_words["no_audio"];
    showToast(noAudio, "");
  },

  confirmAudioTrack: function () {
    var index = $("#channel-audio-tracks-modal")
      .find("input[type=radio]:checked")
      .val();
    $("#channel-audio-tracks-modal").modal("hide");
    channel_page.currentAudioTrackIndex = index;
    this.keys.focused_part = "control_bar";
    channelAudioTracks[index][1].enabled = true;
  },

  cancelAudioTracks: function () {
    $("#channel-audio-tracks-modal").modal("hide");
    this.keys.audioTracksSelection = 0;
    this.keys.focused_part = "control_bar";
  },

  categorySearchValueChange: function () {
    clearTimeout(this.category_search_key_timer);
    var that = this;
    var categories = MovieHelper.getCategories("live", false, true);
    this.category_search_key_timer = setTimeout(function () {
      var search_value = $("#live-category-search-value").val();
      if (that.prev_keyword === search_value) return;
      if (search_value !== "") {
        var filteredCategories = categories.filter(function (category) {
          return category.category_name.toLowerCase().includes(search_value);
        })
        that.categories = filteredCategories;
        that.renderCategories(filteredCategories)
      } else {
        that.categories = categories;
        that.renderCategories(categories);
      }

      that.prev_keyword = search_value;
    }, this.category_search_key_timer);
  },

  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "category_selection":
        if (increment > 0 && this.movies.length > 0) {
          keys.focused_part = "channel_selection";
          this.hoverChannel(keys.channel_selection);
        } else {
          keys.top_bar_menu_selection = 0;
          this.hoverTopMenuBar();
        }
        break;
      case "categorySearchSelection":
        if (increment > 0 && this.movies.length > 0) {
          keys.focused_part = "channel_selection";
          $("#live-category-search-value").blur();
          this.hoverChannel(keys.channel_selection);
        }
        break;
      case "channel_selection":
        if (increment < 0) {
          keys.focused_part = "category_selection";
          this.hoverCategory(keys.category_selection);
        }
        else {
          keys.focused_part = "catchup_fav_search_selection";
          keys.catchup_fav_search_selection = 0;
          this.hoverbottom(keys.catchup_fav_search_selection);
        }
        break;
      case "catchup_fav_search_selection":
        keys.catchup_fav_search_selection += increment;
        if (keys.catchup_fav_search_selection < 0) {
          this.hoverChannel(keys.channel_selection);
        } else if (keys.catchup_fav_search_selection > 1) {
          keys.catchup_fav_search_selection = 1;
          this.hoverbottom(keys.catchup_fav_search_selection);
        } else
          this.hoverbottom(keys.catchup_fav_search_selection);
        break;
      case "topBarMenu":
        if (!isKeyboard) {
          keys.top_bar_menu_selection += increment;
          if (keys.top_bar_menu_selection < 0) {
            keys.top_bar_menu_selection = 0;
          } else if (keys.top_bar_menu_selection > 5) {
            keys.top_bar_menu_selection = 5;
          } else {
            if (keys.top_bar_menu_selection === 1)
              this.hoverSearchItem();
            else
              this.hoverTopBarMenu(keys.top_bar_menu_selection);
          }
        }
        break;
      case "control_bar":
        if (this.show_control) {
          keys.video_control += increment;
          this.hoverVideoControlIcon(keys.video_control);
        } else {
          this.showControlBar(true);
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
      case tvKey.CH_UP:
        if (keys.focused_part === "control_bar") this.showNextChannel(1);
        break;
      case tvKey.CH_DOWN:
        if (keys.focused_part === "control_bar") this.showNextChannel(-1);
        break;
      case tvKey.RETURN:
        this.goBack();
        break;
      case tvKey.YELLOW:
        this.addOrRemoveFav();
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
        try {
          media_player.pause();
        } catch (e) { }
        break;
      case tvKey.MediaPlay:
        try {
          media_player.play();
        } catch (e) { };
        break;
      case tvKey.MediaPlayPause:
        this.playOrPause();
        break;
      case tvKey.MediaStop:
        this.Exit();
        break;
      case tvKey.BLUE:
        break;
      case tvKey.GREEN:
        if (this.full_screen_video)
          this.goToSeries();
        break;
      case tvKey.RED:
        if (this.full_screen_video)
          this.goToMovies();
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
