"use strict";
var vod_summary_variables = {
  keys: {
    index: 0,
    focused_part: 'actionBtnSelection',
    slider_selection: 0
  },
  min_btn_index: 0,
  action_btns: $(".vod-action-btn"),
  is_favorite: false,
  prev_route: "",
  init: function (prev_route) {
    // showLoader(true);
    this.prev_route = prev_route;
    this.keys.focused_part = "actionBtnSelection";
    var that = this;
    $("#vod-summary-image-wrapper img").attr("src", "");
    $("#vod-summary-name").text(current_movie.name);

    $(".vod-series-background-img").attr("src", "");
    $("#vod-summary-image-wrapper img").attr(
      "src",
      current_movie.stream_icon
        ? current_movie.stream_icon
        : "images/default_bg.png"
    );

    var streamIds = getStreamIds(VodModel.favorite_ids, 'vod');
    this.is_favorite = streamIds.includes(current_movie.stream_id);

    if (this.is_favorite) {
      $("#vod-favorite-icon").attr("src", "images/star-yellow.png");
      $($(".vod-action-btn")[2]).data("action", "remove");
    } else {
      $("#vod-favorite-icon").attr("src", "images/star.png");
      $($(".vod-action-btn")[2]).data("action", "add");
    }

    if (api_host_url.endsWith("/")) {
      api_host_url = api_host_url.slice(0, -1);
    }

    if (settings.playlist.playlist_type === "xc") {
      $.getJSON(
        api_host_url +
        "/player_api.php?username=" +
        user_name +
        "&password=" +
        password +
        "&action=get_vod_info&vod_id=" +
        current_movie.stream_id,
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
          current_movie.info = info;

          $(that.action_btns).removeClass("active");
          $(that.action_btns[0]).addClass("active");
          var rating = 0;
          if (
            typeof current_movie.rating === "undefined" ||
            current_movie.rating === ""
          )
            rating = 0;
          else rating = parseFloat(current_movie.rating);

          if (isNaN(rating)) rating = 0;
          $("#vod-rating-container")
            .find(".rating-upper")
            .css({ width: rating * 10 + "%" });
          $("#vod-rating-mark").text((rating / 2).toFixed(1));
          var backdrop_image = "images/background.jpg";
          try {
            backdrop_image = info.backdrop_path[0];
          } catch (e) { }
          $(".vod-series-background-img").attr("src", backdrop_image);
          that.keys.index = 0;
          current_movie.youtube_trailer = response.info.youtube_trailer;
          if (
            typeof info.youtube_trailer != "undefined" &&
            info.youtube_trailer != null &&
            info.youtube_trailer.trim() !== ""
          ) {
            that.min_btn_index = 0;
            $("#vod-watch-trailer-button").show();
          } else {
            that.min_btn_index = 1;
            $("#vod-watch-trailer-button").hide();
          }
          current_route = "vod-summary-page";
          hideEntireSearchPage();
          hideVodSeriesPage();
          hideTopBar();
          $("#vod-summary-page").removeClass("hide");
          // showLoader(false);

        }
      );
    } else {
      $('#casts-container').html("");
      $(".cast-title").addClass("hide");
      this.min_btn_index = 0;
      current_movie.info = {};

      $("#vod-watch-trailer-button").hide();
      $("#vod-summary-release-date").text("");
      $("#vod-summary-release-length").text("");
      $("#vod-summary-release-cast").text("");
      $("#vod-summary-description").text("");
      $(that.action_btns).removeClass("active");
      $(that.action_btns[0]).addClass("active");

      var streamIds = getStreamIds(VodModel.favorite_ids, 'vod');
      if (streamIds.includes(current_movie.stream_id)) {
        $($(".vod-action-btn")[2]).data("action", "remove");
        $(".favorite-badge-wrapper").addClass("active");
      } else {
        $($(".vod-action-btn")[2]).data("action", "add");

        $(".favorite-badge-wrapper").removeClass("active");
      }
      var rating = 0;
      if (
        typeof current_movie.rating === "undefined" ||
        current_movie.rating === ""
      )
        rating = 0;
      else rating = parseFloat(current_movie.rating);
      if (isNaN(rating)) rating = 0;
      $("#vod-rating-container")
        .find(".rating-upper")
        .css({ width: rating * 10 + "%" });
      $("#vod-rating-mark").text(rating.toFixed(1));
      that.keys.index = 0;
      current_movie.youtube_trailer = "";
      current_route = "vod-summary-page";
      hideVodSeriesPage();
      // showLoader(false);
      $("#vod-summary-page").removeClass("hide");
    }
    current_route = "vod-summary-page";
  },

  getCasts: function (tmdb_id) {
    var _this = this;
    $('#casts-container').html("");
    $.ajax({
      method: "get",
      url: TMDB_ENDPOINT + tmdb_id + '/credits?api_key=' + tmdbAPIKey,
      success: function (response) {
        $(".cast-title").removeClass("hide");
        var cast = response.cast;
        var htmlContents = '';
        cast.map(function (item, index) {
          htmlContents += _this.makeCastSlider(item, index);
        });
        $('#casts-container').html(htmlContents);
      }
    }).catch(function (e) {
      $(".cast-title").addClass("hide");
      console.log(e);
    });
  },

  makeCastSlider: function (item, index) {
    var htmlContent =
      '<div class="cast-item-container"  onclick="vod_summary_variables.handleMenuClick()" onmouseenter = "vod_summary_variables.hoverCast(' + index + ')" data-channel_id="' +
      index +
      '">' +
      '<div class="cast-item-wrapper cast-item" data-stream_id = "' +
      index +
      '">' +
      '<img class="movie-item-thumbernail position-relative" src="' + TMDB_IMAGE_PREF + item.profile_path + '" onerror="this.src=\'images/cast-default.jpg\'">' +
      "</div>" +
      '<div class="movie-grid-item-title-wrapper position-relative">' +
      '<p class="movie-thumbernail-title position-absolute">' +
      item.original_name +
      "</p>" +
      "</div>" +
      "</div>";
    return htmlContent;
  },

  goBack: function () {
    if (this.prev_route == "vod-series-page") {
      $("#vod-summary-page").addClass("hide");
      $("#vod-series-page").removeClass("hide");
      showTopBar();
      current_route = this.prev_route;
      var keys = vod_series_page.keys;
      var menu_doms = vod_series_page.menu_doms;

      if (this.is_favorite) {
        if (
          $(menu_doms[keys.menu_selection]).find(".favorite-badge").length == 0
        ) {
          MovieHelper.addRecentOrFavoriteMovie(
            "vod",
            current_movie,
            "favorite"
          );
          $(
            $(menu_doms[keys.menu_selection]).find(".vod-series-menu-item")
          ).prepend(
            '<div class="favorite-badge"><i><img src="images/star-yellow.png" width="32" height="32" /></i></div>'
          );
        }
      } else {
        MovieHelper.removeRecentOrFavoriteMovie(
          "vod",
          current_movie.stream_id,
          "favorite"
        );
        var category = vod_series_page.categories[keys.category_selection];
        var menu_doms = vod_series_page.menu_doms;
        if (category.category_id === "favorite") {
          $(menu_doms[keys.menu_selection]).remove();
          if (menu_doms.length > 0) {
            menu_doms.map(function (index, item) {
              $(item).data("index", index);
            });
            menu_doms = $(
              "#vod-series-menus-container .vod-series-menu-item-container"
            );
            vod_series_page.menu_doms = menu_doms;
            if (keys.menu_selection >= vod_series_page.menu_doms.length)
              keys.menu_selection = vod_series_page.menu_doms.length - 1;
            $(vod_series_page.menu_doms[keys.menu_selection]).addClass(
              "active"
            );
          } else {
            keys.focused_part = "category_selection";
            $(vod_series_page.category_doms[keys.category_selection]).addClass(
              "active"
            );
          }
        } else {
          $($(menu_doms[keys.menu_selection]).find(".favorite-badge")).remove();
        }
      }
    } else {
      $(".series-detail-page").addClass("hide");
      hideTopBar();
      $("#vod-summary-page").addClass("hide");
      $("#entire-search-page").removeClass("hide");
      current_route = this.prev_route;
    }
  },
  showTrailerVideo: function () {
    trailer_page.back_url = "vod-summary-page";
    if (
      current_movie.youtube_trailer === "" ||
      current_movie.youtube_trailer == undefined
    ) {
      var no_trailer = current_words["no_trailer"];
      showToast(no_trailer, "");
      $(".toast").toast({ animation: true, delay: 4000 });
      $("#toast").toast("show");
    } else {
      trailer_page.init(current_movie.youtube_trailer, current_route, "movies");
    }
  },
  showMovie: function () {
    $("#vod-summary-page").addClass("hide");
    vod_series_player_page.makeEpisodeDoms("vod-summary-page");
    var prev_route = this.prev_route;
    vod_series_player_page.init(
      current_movie,
      "movies",
      "vod-summary-page",
      "",
      prev_route
    );
  },
  toggleFavorite: function (targetElement) {
    this.is_favorite = !this.is_favorite;
    var action = $(targetElement).data("action");
    if (action === "add") {
      MovieHelper.addRecentOrFavoriteMovie("vod", current_movie, "favorite");
      $(targetElement).data("action", "remove");
      $("#vod-favorite-icon").attr("src", "images/star-yellow.png");
    } else {
      MovieHelper.addRecentOrFavoriteMovie("vod", current_movie, "favorite");
      $(targetElement).data("action", "add");
      $("#vod-favorite-icon").attr("src", "images/star.png");
    }
  },

  hoverButton: function (index) {
    var keys = this.keys;
    this.unFocusCast();
    this.unfocusActinBtn();
    if (settings.playlist.playlist_type !== 'xc' && index === 1) {
      keys.index = 2;
    } else {
      keys.index = index;
    }
    $($(".vod-action-btn")[keys.index]).addClass("active");
  },

  moveCastSliders: function (increment) {
    var keys = this.keys;
    keys.slider_selection += increment;
    var movie_containers = $("#casts-container");
    var movie_items = $(movie_containers[0]).find(
      ".cast-item-wrapper"
    );
    this.unFocusCast();

    if (keys.slider_selection < 0)
      keys.slider_selection = 0;
    if (keys.slider_selection >= movie_items.length)
      keys.slider_selection = movie_items.length - 1;
    var movie_item_container = $(
      movie_items[keys.slider_selection]
    ).closest(".cast-item-container");
    $(movie_items[keys.slider_selection]).addClass("active");

    this.changeMovieScrollPosition(
      $(movie_containers[0]),
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

  keyMove: function (increment) {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "actionBtnSelection":
        var min_index = this.min_btn_index;
        var keys = this.keys;
        keys.index += increment;
        var threadVal = settings.playlist.playlist_type === 'xc' ? 2 : 1;
        if (min_index == 0) {
          if (keys.index > threadVal && increment > 0) {
            keys.index = threadVal
          } else if (keys.index == threadVal && increment < 0) {
            keys.index = threadVal - 1
          } else if (keys.index < 0) keys.index = 0;
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
    if (keys.focused_part === "actionBtnSelection") {
      var buttons = $(".vod-action-btn");
      var current_button = buttons[keys.index];
      $(current_button).trigger("click");
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
    keys.slider_selection = index;
    var movie_containers = $("#casts-container");
    var movie_items = $(movie_containers[0]).find(
      ".cast-item-wrapper"
    );
    this.unFocusCast();
    this.unfocusActinBtn();
    $(movie_items[keys.slider_selection]).addClass("active");
  },

  handleUpDown: function (increment) {
    var keys = this.keys;
    switch (increment) {
      case 1:
        if (keys.focused_part === 'actionBtnSelection') {
          keys.focused_part = 'castSelection';
          keys.castSelection = 0;
          if (settings.playlist.playlist_type === "xc") {
            this.unfocusActinBtn();
            this.hoverCast(0);
          }
        }
        break;
      case -1:
        if (keys.focused_part === 'castSelection') {
          keys.focused_part = 'actionBtnSelection';
          this.hoverButton(keys.index);
        }
        break;
    }
  },
  HandleKey: function (e) {
    switch (e.keyCode) {
      case tvKey.RETURN:
        this.goBack();
        break;
      case tvKey.LEFT:
        this.keyMove(-1);
        break;
      case tvKey.RIGHT:
        this.keyMove(1);
        break;
      case tvKey.DOWN:
        this.handleUpDown(1);
        break;
      case tvKey.UP:
        this.handleUpDown(-1);
        break;
      case tvKey.ENTER:
        this.keyClick();
        break;
      case tvKey.RED:
        // home_page.init();
        break;
      case tvKey.YELLOW:
        var favBtnDom = $("#vod-add-favorite-button");
        this.toggleFavorite(favBtnDom);
        break;
    }
  }
};
