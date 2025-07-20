"use strict";
var series_summary_page = {
  keys: {
    focused_part: "actionButtoinSelection",
    season_selection: 0,
    episode_selection: 0,
    prev_focused_part: "",
    index: 0
  },
  min_btn_index: 0,
  season_doms: [],
  current_season_index: -1,
  hover_season_timer: null,
  is_favorite: false,
  prev_route: "",
  episode_doms: $("#series-summary-episode-items-container .episode-item-wrapper"),
  action_btns: $(".series-action-btn"),
  prevSeasonIndex: 0,
  prevEpisodeIndex: 0,
  init: function (prevRoute) {
    var that = this;
    var keys = this.keys;
    this.prev_route = prevRoute;
    showLoader(true);
    this.initVariables();
    this.emptySeriesDetailsImg();
    this.addRemoveFavIcon();
    showSeriesDetailsPage();

    if (settings.playlist.playlist_type === "xc") {
      $.getJSON(
        api_host_url +
        "/player_api.php?username=" +
        user_name +
        "&password=" +
        password +
        "&action=get_series_info&series_id=" +
        current_series.series_id).
        done(function (response) {
          var info = response.info;
          current_series.info = response.info;
          $(".series-genre-text-year").text(info.year);
          $(".series-genre-text-content").text(info.genre);
          $(".cast-content").text(info.cast);

          current_series.youtube_trailer = response.info.youtube_trailer;
          var seasons = response.seasons;
          if (seasons.length > 0 || Object.keys(response.episodes).length > 0) {
            var episodes = response.episodes;
            if (seasons.length == 0) {
              seasons = [];
              Object.keys(episodes).map(function (key, index) {
                seasons.push({
                  name: "Season " + (index + 1),
                  cover: "images/default_bg.png",
                  episodes: episodes[key]
                });
              });
            } else {
              if (episodes["0"] == undefined) {
                seasons.map(function (item) {
                  item.episodes = episodes[item.season_number.toString()];
                });
              } else {
                seasons.map(function (item) {
                  item.episodes = episodes[item.season_number - 1];
                });
              }
            }
            var seasons1 = seasons.filter(function (item) {
              return item.episodes && item.episodes.length > 0;
            });
            var episode_keys = Object.keys(episodes);
            if (episode_keys.length > seasons1.length) {
              for (var i = 0; i < seasons1.length; i++)
                seasons1[i].name = "Season " + (i + 1);
              for (var i = seasons1.length; i < episode_keys.length; i++) {
                seasons1.push({
                  name: "Season " + (i + 1),
                  episodes: episodes[(i + 1).toString()]
                });
              }
            }
            current_series.seasons = seasons1;
            that.makeSeasonsDom();
            that.showSeriesInfo();
            that.updatePlayButtonDom();
            that.showEpisodes(true, false);
            showSeriesDetailsPage();
          } else {
            showToast("No seasons available", "");
          }
        }).fail(function () {
          showToast("No seasons available", "");
        });
    } else if (settings.playlist.playlist_type === "general") {
      current_series.seasons.map(function (item) {
        item.episodes = current_series.episodes[item.name];
      });
      var htmlContent = "";
      current_series.seasons.map(function (season, index1) {
        htmlContent +=
          '<div class="season-item-container"' +
          '   onmouseenter="series_summary_page.hoverSeason(' +
          index1 +
          ')"' +
          ">" +
          season.name +
          "</div>";
      });
      $("#season-items-container").html(htmlContent);
      that.showSeriesInfo();
      that.updatePlayButtonDom();
      this.showEpisodes(true, false);
      showSeriesDetailsPage();
    }
    this.hoverButton(keys.index);
    setTimeout(function () {
      showLoader(false);
    }, 500);
  },

  addRemoveFavIcon: function () {
    var streamIds = getStreamIds(SeriesModel.favorite_ids, 'series');
    this.is_favorite = streamIds.includes(current_series.series_id);

    if (this.is_favorite) {
      $("#series-favorite-icon").attr("src", "images/star-yellow.png");
      $($(".series-action-btn")[2]).data("action", "remove");
    } else {
      $("#series-favorite-icon").attr("src", "images/star.png");
      $($(".series-action-btn")[2]).data("action", "add");
    }
  },

  initVariables: function () {
    this.keys.focused_part = 'actionButtoinSelection';
    this.keys.season_selection = 0;
    this.keys.season_selection = 0;
    this.keys.episode_selection = 0;
  },

  showSeasonsModal: function () {
    var keys = this.keys;
    keys.focused_part = 'season_selection';
    this.makeSeasonsDom();
    this.hoverSeason(keys.season_selection);
    $('#seasons-modal').modal('show');
  },

  showSeriesRating: function () {
    var rating = 0;
    if (
      typeof current_series.rating === "undefined" ||
      current_series.rating === ""
    )
      rating = 0;
    else rating = parseFloat(current_series.rating);

    if (isNaN(rating)) rating = 0;

    $("#series-rating-container")
      .find(".rating-upper")
      .css({ width: rating * 10 + "%" });
    $("#series-rating-mark").text((rating / 2).toFixed(1));
  },

  showSeriesDetailsText() {
    var rDate = current_series.releaseDate !== this.unfocusActionbtn ? current_series.releaseDate : current_series.seasons[0].releaseDate;
    $("#series-summary-name").text(current_series.name);
    $("#series-summary-release-date").text(rDate);
    $("#series-summary-release-genre").text(current_series.genre);
    $("#series-summary-release-length").text(current_series.duration);
    $("#series-summary-release-director").text(current_series.director);
    $("#series-summary-release-cast").text(current_series.cast);
    $("#series-summary-description").text(current_series.plot);
    $('.episode-count').text('Episodes (' + current_series.seasons[0].episodes !== undefined ? current_series.seasons[0].episodes.length : 0 + ')');
  },

  hideShowTrailerButton: function () {
    if (
      typeof current_series.youtube_trailer != "undefined" &&
      current_series.youtube_trailer != null &&
      current_series.youtube_trailer.trim() !== ""
    ) {
      this.min_btn_index = 0;
      $("#series-watch-trailer-button").show();
    } else {
      this.min_btn_index = 1;
      $("#series-watch-trailer-button").hide();
    }
  },

  showSeriesInfo: function () {
    this.season_doms = $(".season-item-container");
    this.keys.season_selection = 0;
    this.keys.focused_part = "actionButtoinSelection";
    $(this.season_doms[0]).addClass("selected");

    this.showSeriesBackgoundImg();
    this.showSeriesImg();
    this.showSeriesDetailsText();
    this.showSeriesRating();

    $(this.action_btns).removeClass("active");
    $(this.action_btns[0]).addClass("active");
    this.hideShowTrailerButton();

    this.keys.index = 0;
    current_route = "series-summary-page";
    hideEntireSearchPage();
    hideVodSeriesPage();
    $("#series-summary-page").removeClass("hide");
    hideTopBar();
  },

  toggleFavorite: function (targetElement) {
    var action = $(targetElement).data("action");
    this.is_favorite = !this.is_favorite;
    if (action === "add") {
      MovieHelper.addRecentOrFavoriteMovie(
        "series",
        current_series,
        "favorite"
      );
      $(targetElement).data("action", "remove");
      $("#series-favorite-icon").attr("src", "images/star-yellow.png");
      $(".favorite-badge-wrapper").addClass("active");
    } else {
      MovieHelper.addRecentOrFavoriteMovie(
        "series",
        current_series,
        "favorite"
      );
      $(targetElement).data("action", "add");
      $("#series-favorite-icon").attr("src", "images/star.png");
    }
  },

  showTrailerVideo: function () {
    trailer_page.back_url = "vod-summary-page";
    if (
      current_series.youtube_trailer === "" ||
      current_series.youtube_trailer == undefined
    ) {
      var no_trailer = current_words["no_trailer"];
      showToast(no_trailer, "");
      $(".toast").toast({ animation: true, delay: 4000 });
      $("#toast").toast("show");
    } else {
      trailer_page.init(
        current_series.youtube_trailer,
        current_route,
        "series"
      );
    }
  },
  showEpisodes: function (status, isHover) {
    var keys = this.keys;
    var default_movie_icon = "images/episode_bk.png";
    var episode_play_icon = "images/episode_play.png";

    current_season = current_series.seasons[keys.season_selection];
    var episodes = current_season.episodes;

    if (typeof episodes != "undefined" && episodes.length > 0) {
      $('.episode-count').text('Episodes (' + episodes.length + ')')

      var htmlContent = "";
      episodes.map(function (episode, index) {
        if (typeof SeriesModel.saved_video_times[episode.id] != "undefined") {
          if (
            SeriesModel.saved_video_times[episode.id].resume_time / 1000 >=
            resumeThredholdTime
          ) {
            var width_ =
              SeriesModel.saved_video_times[episode.id].resume_time *
              100 /
              SeriesModel.saved_video_times[episode.id].duration;
          } else var width_ = 0;
        } else {
          var width_ = 0;
        }

        var episodeDuration = episode.info !== undefined ? episode.info.duration : '00:00:00';
        var episodeRating = episode.info !== undefined ? episode.info.rating : 0;

        $(".episode-rating-upper").css({ width: episodeRating * 10 + "%" });

        htmlContent +=
          '<div class="episode-item-wrapper"' +
          '   onmouseenter="series_summary_page.hoverEpisode(' + index + ')"' +
          '   onclick="series_summary_page.handleMenuClick()"' +
          ">" +
          '<div>' +
          '<div class="episode-image-wrapper">' +
          '<div class="episode-img-wrapper" style="background-image:url(' + (episode.info !== undefined ? (episode.info.movie_image !== null ? episode.info.movie_image : default_movie_icon) : default_movie_icon) + ')" onerror="this.src=\'images/episode_bk.png\'">' +
          '<div class="episode-duration">' + episodeDuration + '</div>' +
          '<img class="channel-icon" id="episode-img" src="' + episode_play_icon + '">' +
          (width_ > 0
            ? '<div class="series-resume-progressbar-wrapper"><div class="resume-progress-bar" style="width:' +
            width_ +
            '%"></div></div>'
            : "") +
          "</div>" +
          "</div>" +
          '<div class="episode-content-wrapper">' +
          '<div class="episode-title-wrapper position-relative">' +
          '<p class="episode-title">' +
          (episode.title ? episode.title : "Episode " + (index + 1)) +
          "</p>" +
          "</div>" +
          "</div>" +
          "</div>" +
          "</div>";

      });
      $("#series-summary-episode-items-container").html(htmlContent);

      if (isHover)
        this.hoverEpisode(series_summary_page.keys.episode_selection);

      // if (status)

      //   this.updatePlayButtonDom();
    } else {
      showToast("No episodes available", "");
      $("#series-summary-episode-items-container").html("");
    }
  },

  updatePlayButtonDom: function () {
    var keys = this.keys;
    var savedVideoTimes = getLocalStorageData(settings.playlist.id + "_saved_series_times");
    if (savedVideoTimes === null) {
      var playText = current_words['play'];
      $(".episode-watch").text(playText);
      $(".episode-resume-progressbar-wrapper").addClass("hide");
    } else {
      var targetSeriesID = current_series.series_id;
      var maxOrderElement = null;
      var maxOrder = -Infinity;

      for (var key in savedVideoTimes) {
        if (savedVideoTimes.hasOwnProperty(key)) {
          var element = savedVideoTimes[key];
          if (element.seriesID === targetSeriesID && element.order > maxOrder) {
            maxOrder = element.order;
            maxOrderElement = element;
          }
        }
      }

      if (maxOrderElement === null) {
        var playText = current_words['play'];
        $(".episode-watch").text(playText)
        $(".episode-resume-progressbar-wrapper").addClass("hide");
      } else {
        this.prevEpisodeIndex = maxOrderElement.episodeIndex;
        this.prevSeasonIndex = maxOrderElement.seasonIndex;

        var episodeIndex = maxOrderElement.episodeIndex + 1;
        var seasonIndex = maxOrderElement.seasonIndex + 1;

        var duration = maxOrderElement.duration;
        var resumeTime = maxOrderElement.resume_time;
        var width = resumeTime / duration * 100 + "%";
        $(".episode-resume-progress-bar").css({ "width": width });
        episodeIndex = episodeIndex < 10 ? '0' + episodeIndex : episodeIndex;
        seasonIndex = seasonIndex < 10 ? '0' + seasonIndex : seasonIndex;

        var playText = 'Resume - ' + 'S' + seasonIndex + 'E' + episodeIndex;
        keys.season_selection = maxOrderElement.seasonIndex;
        keys.episode_selection = maxOrderElement.episodeIndex;

        current_series.season_selection = maxOrderElement.seasonIndex;
        current_series.episode_selection = maxOrderElement.episodeIndex;

        $(".episode-watch").text(playText)
        $(".episode-resume-progressbar-wrapper").removeClass("hide");
      }
    }
    $('.season-number').text(this.keys.season_selection + 1);
  },

  emptySeriesDetailsImg: function () {
    $(".vod-series-background-img").attr("src", "");
    $("#series-summary-image-wrapper img").attr("src", "");
  },

  showSeriesBackgoundImg: function () {
    var backdrop_image = "images/background.jpg";
    try {
      backdrop_image = current_series.info.backdrop_path[0];
    } catch (e) { }
    $(".vod-series-background-img").attr("src", backdrop_image);
  },

  showSeriesImg: function () {
    $("#series-summary-image-wrapper img").attr(
      "src",
      current_series.cover ? current_series.cover : "images/default_bg.png"
    );
  },

  makeSeasonsDom: function () {
    var htmlContent = "";
    current_series.seasons.map(function (season, index) {
      htmlContent +=
        '<div class="season-item-container" onclick="series_summary_page.selectSeason(false)"' +
        ' onmouseenter="series_summary_page.hoverSeason(' +
        index +
        ')"' +
        ">" +
        season.name +
        "</div>";
    });
    $("#season-items-container").html(htmlContent);
  },

  goBack: function () {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "season_selection":
        $('#seasons-modal').modal('hide');
        this.keys.focused_part = 'actionButtoinSelection';
        break;
      case "episode_selection":
      case "actionButtoinSelection":
        if (this.prev_route !== "entire-search-page") {
          current_route = "actionButtoinSelection";
          var keys = vod_series_page.keys;
          var menu_doms = vod_series_page.menu_doms;
          if (this.is_favorite) {
            if (
              $(menu_doms[keys.menu_selection]).find(".favorite-badge")
                .length == 0
            ) {
              MovieHelper.addRecentOrFavoriteMovie(
                "series",
                current_series,
                "favorite"
              );
              $(
                $(menu_doms[keys.menu_selection]).find(".vod-series-menu-item")
              ).prepend(
                '<div class="favorite-badge"><i><img src="images/star-yellow.png" /></i></div>'
              );
            }
          } else {
            MovieHelper.removeRecentOrFavoriteMovie(
              "vod",
              current_series.series_id,
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
                $(
                  vod_series_page.category_doms[keys.category_selection]
                ).addClass("active");
              }
            } else {
              $(
                $(menu_doms[keys.menu_selection]).find(".favorite-badge")
              ).remove();
            }
          }

          $("#series-summary-page").addClass("hide");
          showTopBar();
          $("#vod-series-page").removeClass("hide");
          current_route = "vod-series-page";
          break;
        } else {
          $(".series-detail-page").addClass("hide");
          hideTopBar();
          $("#entire-search-page").removeClass("hide");
          current_route = this.prev_route;
        }
    }
  },
  hoverSeason: function (index) {
    var keys = this.keys;
    keys.focused_part = "season_selection";
    keys.season_selection = index;
    this.season_doms = $(".season-item-container");
    $(this.season_doms).removeClass("active");
    $(this.season_doms[index]).addClass("active");
    clearTimeout(this.hover_season_timer);
    moveScrollPosition(
      $("#season-items-container"),
      this.season_doms[keys.season_selection],
      "vertical",
      false
    );
  },

  unfocusEposides: function () {
    this.episode_doms = $(
      "#series-summary-episode-items-container .episode-item-wrapper"
    );
    $(this.episode_doms).removeClass("active");
  },

  hoverEpisode: function (index) {
    var keys = this.keys;
    keys.episode_selection = index;
    keys.focused_part = "episode_selection";
    this.episode_doms = $(
      "#series-summary-episode-items-container .episode-item-wrapper"
    );
    this.unfocusActionbtn();
    if (keys.episode_selection > 0) {
      $("#series-summary-content-container").css("margin-top", "-537px");
    }

    this.unfocusEposides();
    $(this.episode_doms[keys.episode_selection]).addClass("active");

    moveScrollPosition(
      $("#series-summary-episode-items-container"),
      this.episode_doms[keys.episode_selection],
      "horizontal",
      false
    );
  },

  unfocusActionbtn: function () {
    $(".series-action-btn").removeClass("active");
  },

  hoverButton: function (index) {
    var keys = this.keys;
    keys.index = index;
    keys.focused_part = 'actionButtoinSelection';
    this.unfocusActionbtn();
    this.unfocusEposides();
    $($(".series-action-btn")[keys.index]).addClass("active");
  },

  selectSeason: function (status) {
    var keys = this.keys;
    this.season_doms = $(".season-item-container");
    $(this.season_doms).removeClass("selected");
    $(this.season_doms[keys.season_selection]).addClass("selected");
    var that = this;
    this.hover_season_timer = setTimeout(function () {
      $("#series-summary-episode-items-container").html("");
      that.showEpisodes(status, false);
    }, 300);
    $('.season-number').text(keys.season_selection + 1);
    keys.focused_part = "actionButtoinSelection";
    $('#seasons-modal').modal('hide');
  },

  watchEpisode: function (status) {
    var keys = this.keys;
    var categories = MovieHelper.getCategories("series", false, false);
    if (status === "play") {
      if (current_series.season_selection === undefined && current_series.episode_selection === undefined) {
        current_series.season_selection = keys.season_selection;
        current_series.episode_selection = keys.episode_selection;
        current_season = current_series.seasons[keys.season_selection];
        current_episode = current_season.episodes[keys.episode_selection];
      } else {
        keys.season_selection = this.prevSeasonIndex;
        keys.episode_selection = this.prevEpisodeIndex;
        current_season = current_series.seasons[current_series.season_selection];
        current_episode = current_season.episodes[current_series.episode_selection];
      }
    } else {
      current_series.season_selection = keys.season_selection;
      current_series.episode_selection = keys.episode_selection;

      if (!checkForAdult(current_series, "movie", categories))
        MovieHelper.addRecentOrFavoriteMovie(
          "series",
          current_series,
          "recent"
        );
      current_season = current_series.seasons[keys.season_selection];
      var episodes = current_season.episodes;
      current_episode = episodes[keys.episode_selection];
    }

    var prev_route = this.prev_route;
    vod_series_player_page.init(
      current_episode,
      "series",
      "episode-page",
      "",
      prev_route
    );
    vod_series_player_page.keys.episode_selection = keys.episode_selection;
    vod_series_player_page.makeEpisodeDoms("episode-page");
  },

  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    if (keys.focused_part == "actionButtoinSelection") {

      keys.index += increment;

      if (this.min_btn_index === 0) {
        keys.index = Math.min(Math.max(keys.index, 0), 3);
      } else {
        if (keys.index === 2) {
          keys.index = increment === 1 ? 3 : 1;
        } else if (keys.index < 0) {
        } else
          keys.index = Math.min(keys.index, 3);
      }

      this.hoverButton(keys.index);
    } else if (keys.focused_part === "episode_selection") {
      keys.episode_selection += increment;
      if (keys.episode_selection < 0) {
        keys.episode_selection = 0;
      } else if (keys.episode_selection >= this.episode_doms.length) {
        keys.episode_selection = this.episode_doms.length - 1;
        return;
      }
      this.hoverEpisode(keys.episode_selection);
    }
  },
  handleMenuUpDown: function (increment) {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "actionButtoinSelection":
        if (increment > 0) {
          keys.focused_part = 'episode_selection';
          keys.episode_selection = 0;
          this.hoverEpisode(keys.episode_selection);
        }
        break;
      case "season_selection":
        keys.season_selection += increment;
        if (keys.season_selection < 0) {
          keys.season_selection = 0;
          return;
        }
        if (keys.season_selection >= this.season_doms.length) {
          keys.season_selection = this.season_doms.length - 1;
          return;
        }
        this.hoverSeason(keys.season_selection);
        break;
      case "episode_selection":
        if (increment < 0) {
          keys.focused_part = 'actionButtoinSelection';
          this.unfocusEposides();
          this.hoverButton(keys.index);
          return;
        }
        break;
    }
  },
  handleMenuClick: function () {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "episode_selection":
        this.watchEpisode("");
        break;
      case "actionButtoinSelection":
        $($(".series-action-btn")[keys.index]).trigger("click");
        break;
      case "season_selection":
        this.selectSeason(false);
        break;
    }
  },
  HandleKey: function (e) {
    switch (e.keyCode) {
      case tvKey.RETURN:
        this.goBack();
        break;
      case tvKey.LEFT:
        this.handleMenuLeftRight(-1);
        break;
      case tvKey.RIGHT:
        this.handleMenuLeftRight(1);
        break;
      case tvKey.UP:
        this.handleMenuUpDown(-1);
        break;
      case tvKey.DOWN:
        this.handleMenuUpDown(1);
        break;
      case tvKey.ENTER:
        this.handleMenuClick();
        break;
      case tvKey.RED:
        // home_page.init();
        break;
      case tvKey.YELLOW:
        var favBtnDom = $("#series-add-favorite-button");
        this.toggleFavorite(favBtnDom);
        break;
    }
  }
};
