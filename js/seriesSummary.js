"use strict";
var seriesSummary = {
  keys: {
    focusedPart: "seriesDetailPage",
    seasonSelection: 0,
    episodeSelection: 0,
    prevFocus: ""
  },
  minBtnIndex: 0,
  seasonDoms: [],
  episodeDoms: [],
  hoverSeasonTimer: null,
  isFavorite: false,
  prevRoute: "",
  actionBtnDoms: $(".series-action-btn"),

  init: function (prevRoute) {
    this.prevRoute = prevRoute;
    showLoader(true);
    var that = this;

    $(".vod-series-background-img").attr("src", "");
    $("#series-summary-image-wrapper img").attr("src", "");

    $("#series-summary-name").text(currentSeries.name);
    $("#series-summary-episode-series-title").text(currentSeries.name);

    $("#season-episodes-container").addClass("hide");
    $(".series-detail-page").removeClass("hide");

    var streamIds = getStreamIds(SeriesModel.favoriteIds, "series");
    this.isFavorite = streamIds.includes(currentSeries.series_id);

    if (this.isFavorite) {
      $("#series-favorite-icon").attr("src", "images/star-yellow.png");
      $($(".series-action-btn")[2]).data("action", "remove");
    } else {
      $("#series-favorite-icon").attr("src", "images/star.png");
      $($(".series-action-btn")[2]).data("action", "add");
    }

    if (settings.playlist.playlistType === "xc") {
      $.getJSON(
        playlistEndpoint + "player_api.php?username=" + userName + "&password=" + password + "&action=get_series_info&series_id=" + currentSeries.series_id,
        function (response) {
          var info = response.info;
          currentSeries.info = response.info;
          $(".series-genre-text-year").text(info.year);
          $(".series-genre-text-content").text(info.genre);
          $(".cast-content").text(info.cast);

          currentSeries.youtubeTrailer = response.info.youtube_trailer;
          var seasons = response.seasons;
          if (seasons.length > 0 || Object.keys(response.episodes).length > 0) {
            var episodes = response.episodes;
            if (seasons.length == 0) {
              seasons = [];
              Object.keys(episodes).map(function (key, index) {
                seasons.push({
                  name: "Season " + (index + 1),
                  cover: config.placeholderImg,
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
            var episodeKeys = Object.keys(episodes);
            if (episodeKeys.length > seasons1.length) {
              for (var i = 0; i < seasons1.length; i++)
                seasons1[i].name = "Season " + (i + 1);
              for (var i = seasons1.length; i < episodeKeys.length; i++) {
                seasons1.push({
                  name: "Season " + (i + 1),
                  episodes: episodes[(i + 1).toString()]
                });
              }
            }
            currentSeries.seasons = seasons1;
            var htmlContent = "";
            currentSeries.seasons.map(function (season, index1) {
              htmlContent +=
                '<div class="season-item-container" onclick="seriesSummary.selectSeason()"' +
                ' onmouseenter="seriesSummary.hoverSeason(' +
                index1 +
                ')"' +
                ">" +
                season.name +
                "</div>";
            });
            $("#season-items-container").html(htmlContent);
          } else {
            showToast("No seasons available", "");
          }
          that.showSeriesInfo();
        }
      );
    } else if (settings.playlist.playlistType === "general") {
      currentSeries.seasons.map(function (item) {
        item.episodes = currentSeries.episodes[item.name];
      });
      var htmlContent = "";
      currentSeries.seasons.map(function (season, index1) {
        htmlContent +=
          '<div class="season-item-container"' +
          '   onmouseenter="seriesSummary.hoverSeason(' +
          index1 +
          ')"' +
          ">" +
          season.name +
          "</div>";
      });
      $("#season-items-container").html(htmlContent);
      showLoader(false);
      that.showSeriesInfo();
    }
    $(".top-menu-titles").removeClass("active");
    $(".series-title").addClass("active");
    showLoader(false);
  },

  showSeason: function () {
    $(".series-detail-page").addClass("hide");
    $("#season-episodes-container").removeClass("hide");
    $("#vod-series-page").addClass("hide");
    hideTopBar();
    this.showEpisodes();
  },

  showSeriesInfo: function () {
    $(".top-bar").addClass("hide");
    this.seasonDoms = $(".season-item-container");
    this.keys.seasonSelection = 0;
    this.keys.focusedPart = "seriesDetailPage";
    $(this.seasonDoms[0]).addClass("selected");
    $("#selected-season-name").text(currentSeries.seasons[0].name);
    try {
      var backdropImg = "images/background.jpg";
      try {
        backdropImg = currentSeries.info.backdrop_path[0];
      } catch (e) { }
      $(".vod-series-background-img").attr("src", backdropImg);
    } catch (e) { }

    $("#series-summary-release-date").text(currentSeries.seasons[0].releaseDate);
    $("#series-summary-release-genre").text(currentSeries.genre);
    $("#series-summary-release-director").text(currentSeries.director);
    $("#series-summary-release-cast").text(currentSeries.cast);
    $("#series-summary-description").text(currentSeries.plot);
    $("#series-summary-image-wrapper img").attr("src", currentSeries.cover ? currentSeries.cover : config.placeholderImg);

    $(this.actionBtnDoms).removeClass("active");
    $(this.actionBtnDoms[0]).addClass("active");

    var rating = 0;
    if (
      typeof currentSeries.rating === "undefined" ||
      currentSeries.rating === ""
    )
      rating = 0;
    else rating = parseFloat(currentSeries.rating);

    if (isNaN(rating)) rating = 0;
    if (rating === 0) {
      $("#series-rating-container")
        .find(".rating-upper")
        .css({ width: "100%" });
      $("#series-rating-container")
        .find(".rating-upper").css({ "filter": "grayscale(100%)" });
    } else {
      $("#series-rating-container")
        .find(".rating-upper")
        .css({ width: rating * 10 + "%" });
      $("#series-rating-container")
        .find(".rating-upper").css({ "filter": "initial" });
    }
    $("#series-rating").text((rating).toFixed(1));

    if (
      typeof currentSeries.youtubeTrailer != "undefined" &&
      currentSeries.youtubeTrailer != null &&
      currentSeries.youtubeTrailer.trim() !== ""
    ) {
      this.minBtnIndex = 0;
      $("#series-watch-trailer-button").show();
    } else {
      this.minBtnIndex = 1;
      $("#series-watch-trailer-button").hide();
    }
    this.keys.index = 0;
    currentRoute = "series-summary-page";
    $("#entire-search-page").addClass("hide");
    $("#vod-series-page").addClass("hide");

    $("#series-summary-page").removeClass("hide");
  },

  toggleFavorite: function (targetElement) {
    var action = $(targetElement).data("action");
    this.isFavorite = !this.isFavorite;
    if (action === "add") {
      movieHelper.addRecentOrFavoriteMovie(
        "series",
        currentSeries,
        "favorite"
      );
      $(targetElement).data("action", "remove");
      $("#series-favorite-icon").attr("src", "images/star-yellow.png");
      $(".favorite-badge-wrapper").addClass("active");
    } else {
      movieHelper.removeRecentOrFavoriteMovie(
        "series",
        currentSeries.series_id,
        "favorite"
      );
      $(targetElement).data("action", "add");
      $("#series-favorite-icon").attr("src", "images/star.png");
    }
  },

  showTrailerVideo: function () {
    trailer.back_url = "vod-summary-page";
    if (
      currentSeries.youtubeTrailer === "" ||
      currentSeries.youtubeTrailer == undefined
    ) {
      var noTrailer = currentWords["no_trailer"];
      showToast(noTrailer, "");
    } else {
      trailer.init(
        currentSeries.youtubeTrailer,
        currentRoute,
        "series"
      );
    }
  },

  renderEpisodes: function (episodes) {
    $("#series-summary-episode-series-title").text(currentSeries.name);
    var htmlContent = "";
    episodes.map(function (episode, index) {
      if (typeof SeriesModel.savedVideoTimes[episode.id] != "undefined") {
        if (
          SeriesModel.savedVideoTimes[episode.id].resumeTime / 1000 >= config.resumeThredholdTime
        ) {
          var width_ =
            SeriesModel.savedVideoTimes[episode.id].resumeTime *
            100 /
            SeriesModel.savedVideoTimes[episode.id].duration;
        } else var width_ = 0;
      } else {
        var width_ = 0;
      }

      htmlContent +=
        '<div class="episode-item-wrapper"' +
        '   onmouseenter="seriesSummary.hoverEpisode(' +
        index +
        ')"' +
        '   onclick="seriesSummary.handleMenuClick()"' +
        ">" +
        '<div class="flex-container">' +
        '<div class = "episode-image-wrapper">' +
        '<img class="channel-icon" id="' +
        (width_ > 0 ? "episode-img-1" : "episode-img-2") +
        '" src="' +
        (episode.info != undefined
          ? episode.info.movie_image
          : config.episodePlaceholderImg) +
        '" onerror="this.src=\'' +
        config.episodePlaceholderImg +
        "'\">" +
        (width_ > 0
          ? '<div style = "background:black;margin-top: -14px;position: relative;"><div class="resume-progress-bar" style = "width:' +
          width_ +
          '%"></div></div>'
          : "") +
        "</div>" +
        '<div class = "episode-content-wrapper">' +
        '<div class="episode-title-wrapper position-relative">' +
        '<p class="episode-title">' +
        (episode.title ? episode.title : "Episode " + (index + 1)) +
        "</p>" +
        "</div>" +
        '<div class="episode-description-wrapper position-relative">' +
        '<p class="episode-description">' +
        (episode.info
          ? episode.info.plot !== undefined ? episode.info.plot : ""
          : "") +
        "</p>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>";
    });
    $("#series-summary-episode-items-container").html(htmlContent);
    $("#series-summary-episode-items-container").scrollTop(0);
  },

  showEpisodes: function () {
    this.keys.focusedPart = "seasonSelection";
    var keys = this.keys;

    currentSeason = currentSeries.seasons[keys.seasonSelection];
    var episodes = currentSeason.episodes;

    if (typeof episodes != "undefined" && episodes.length > 0) {
      this.renderEpisodes(episodes);
    } else {
      showToast("No episodes available", "");
      $("#series-summary-episode-items-container").html("");
    }
    keys.episodeSelection = 0;
    this.episodeDoms = $(".episode-item-wrapper");
    $("#selected-season-name").text(currentSeason.name);
  },

  showEpisodesFromRecentlyViewed: function () {
    showLoader(true);
    // this.keys.focusedPart = "seasonSelection";
    var keys = this.keys;

    $(".vod-series-background-img").attr("src", "");
    $("#series-summary-image-wrapper img").attr("src", "");
    $("#series-summary-name").text(currentSeries.name);
    $("#series-summary-episode-series-title").text(currentSeries.name);
    $(".series-genre-text-year").text(
      currentSeries.year != undefined ? currentSeries.year : ""
    );
    $(".series-genre-text-content").text(
      currentSeries.info != undefined ? currentSeries.info.genre : ""
    );
    $(".cast-content").text(
      currentSeries.info != undefined ? currentSeries.info.cast : ""
    );
    var htmlContent = "";
    currentSeries.seasons.map(function (season, index) {
      htmlContent +=
        '<div class="season-item-container" onclick="seriesSummary.selectSeason()"' +
        ' onmouseenter="seriesSummary.hoverSeason(' +
        index +
        ')"' +
        ">" +
        season.name +
        "</div>";
    });
    $("#season-items-container").html(htmlContent);
    currentRoute = "series-summary-page";
    $(".top-menu-titles").removeClass("active");
    $(".series-title").addClass("active");
    $("#entire-search-page").addClass("hide");
    $("#vod-series-page").addClass("hide");
    $(".top-bar").addClass("hide");
    $("#series-summary-page").removeClass("hide");
    $(".series-detail-page").addClass("hide");
    $("#season-episodes-container").removeClass("hide");

    keys.seasonSelection = currentSeries.seasonSelection;
    currentSeason = currentSeries.seasons[currentSeries.seasonSelection];
    var episodes = currentSeason.episodes;

    if (typeof episodes != "undefined" && episodes.length > 0) {
      this.renderEpisodes(episodes);
      this.hoverEpisode(currentSeries.episodeSelection);
    } else {
      showToast("No episodes available", "");
      $("#series-summary-episode-items-container").html("");
    }
    keys.episodeSelection = currentSeries.episodeSelection;
    this.episodeDoms = $(".episode-item-wrapper");
    $("#selected-season-name").text(currentSeason.name);
    keys.prevFocus = "menuSelection";
    showLoader(false);
  },

  goBack: function () {
    var keys = this.keys;

    switch (keys.focusedPart) {
      case "seasonSelection":
        $("#season-episodes-container").addClass("hide");
        if (keys.prevFocus == "menuSelection") {
          keys.focusedPart = keys.prevFocus;
          $(".top-bar").removeClass("hide");
          $("#vod-series-page").removeClass("hide");
          $("#series-summary-page").addClass("hide");
          $(".series-detail-page").addClass("hide");
          currentRoute = "vod-series-page";
        } else {
          keys.focusedPart = "seriesDetailPage";
          $(".series-detail-page").removeClass("hide");
          $(".top-bar").removeClass("hide");
          $("#vod-series-page").removeClass("hide");
        }
        break;
      case "episodeSelection":
        $("#season-episodes-container").addClass("hide");
        if (keys.prevFocus == "menuSelection") {
          keys.focusedPart = keys.prevFocus;
          $(".top-bar").removeClass("hide");
          $("#vod-series-page").removeClass("hide");
          $(".series-detail-page").addClass("hide");
          currentRoute = "vod-series-page";
        } else {
          keys.focusedPart = "seriesDetailPage";
          $(".series-detail-page").removeClass("hide");
          $(".top-bar").removeClass("hide");
          $("#vod-series-page").removeClass("hide");
        }
        break;
      case "seriesDetailPage":
        if (this.prevRoute == "vod-series-page") {
          currentRoute = "seriesDetailPage";
          var keys = vodSeries.keys;
          var menuDoms = vodSeries.menuDoms;
          if (this.isFavorite) {
            if (
              $(menuDoms[keys.menuSelection]).find(".favorite-badge")
                .length == 0
            ) {
              $($(menuDoms[keys.menuSelection]).find(".vod-series-menu-item")).prepend(
                '<div class="favorite-badge"><i><img src="images/star-yellow.png" /></i></div>'
              );
            }
          } else {
            var category = vodSeries.categories[keys.categorySelection];
            var menuDoms = vodSeries.menuDoms;
            if (category.category_id === "favorite") {
              $(menuDoms[keys.menuSelection]).remove();
              if (category.movies.length > 0) {
                //sortMovies after fav/unfav
                var key = settings[vodSeries.currentSortKey];
                vodSeries.movies = getSortedMovies(category.movies, key, "series");
                menuDoms = $(
                  "#vod-series-menus-container .vod-series-menu-item-container"
                );
                menuDoms.map(function (index, item) {
                  $(item).data("index", index);
                });
                vodSeries.menuDoms = menuDoms;
                if (keys.menuSelection >= vodSeries.menuDoms.length)
                  keys.menuSelection = vodSeries.menuDoms.length - 1;
                $(vodSeries.menuDoms[keys.menuSelection]).addClass(
                  "active"
                );
              } else {
                keys.focusedPart = "categorySelection";
                $(
                  vodSeries.categoryDoms[keys.categorySelection]
                ).addClass("active");
              }
            } else {
              $(
                $(menuDoms[keys.menuSelection]).find(".favorite-badge")
              ).remove();
            }
          }

          $("#series-summary-page").addClass("hide");
          $(".top-bar").removeClass("hide");
          $("#vod-series-page").removeClass("hide");
          currentRoute = "vod-series-page";
          break;
        } else {
          currentRoute = this.prevRoute;
          displayCurrentPage(currentRoute);
        }
    }
  },

  hoverSeason: function (index) {
    var keys = this.keys;
    keys.focusedPart = "seasonSelection";
    keys.seasonSelection = index;
    this.seasonDoms = $(".season-item-container");
    $(this.seasonDoms).removeClass("active");
    $(this.seasonDoms[index]).addClass("active");
    clearTimeout(this.hoverSeasonTimer);
    moveScrollPosition(
      $("#season-items-container"),
      this.seasonDoms[keys.seasonSelection],
      "vertical",
      false
    );
  },

  hoverEpisode: function (index) {
    var keys = this.keys;
    keys.episodeSelection = index;
    keys.focusedPart = "episodeSelection";
    this.episodeDoms = $(
      "#series-summary-episode-items-container .episode-item-wrapper"
    );
    $(this.seasonDoms).removeClass("active");
    $(this.episodeDoms).removeClass("active");
    $(this.episodeDoms[keys.episodeSelection]).addClass("active");

    moveScrollPosition(
      $("#series-summary-episode-items-container"),
      this.episodeDoms[keys.episodeSelection],
      "vertical",
      false
    );
  },

  hoverButton: function (index) {
    var keys = this.keys;
    keys.index = index;
    $(".series-action-btn").removeClass("active");
    $($(".series-action-btn")[keys.index]).addClass("active");
  },

  selectSeason: function () {
    var keys = this.keys;
    this.seasonDoms = $(".season-item-container");
    $(this.seasonDoms).removeClass("selected");
    $(this.seasonDoms[keys.seasonSelection]).addClass("selected");
    var that = this;
    this.hoverSeasonTimer = setTimeout(function () {
      $("#series-summary-episode-items-container").html("");
      that.showEpisodes();
    }, 300);
  },

  handleMenuLeftRight: function (increment) {
    if (this.keys.focusedPart == "seriesDetailPage") {
      var minIndex = this.minBtnIndex;
      var keys = this.keys;
      keys.index += increment;
      if (minIndex == 0) {
        if (keys.index > 2) keys.index = 2;
        else if (keys.index < 0) keys.index = 0;
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
    } else {
      var keys = this.keys;
      switch (keys.focusedPart) {
        case "seasonSelection":
          if (increment > 0 && this.episodeDoms.length > 0)
            this.hoverEpisode(keys.episodeSelection);
          break;
        case "episodeSelection":
          if (increment < 0) this.hoverSeason(keys.seasonSelection);
          break;
      }
    }
  },

  handleMenuUpDown: function (increment) {
    var keys = this.keys;

    switch (keys.focusedPart) {
      case "seasonSelection":
        keys.seasonSelection += increment;
        if (keys.seasonSelection < 0) {
          keys.seasonSelection = 0;
          return;
        }
        if (keys.seasonSelection >= this.seasonDoms.length) {
          keys.seasonSelection = this.seasonDoms.length - 1;
          return;
        }
        this.hoverSeason(keys.seasonSelection);
        break;
      case "episodeSelection":
        keys.episodeSelection += increment;
        if (keys.episodeSelection < 0) {
          keys.episodeSelection = 0;
        }
        if (keys.episodeSelection >= this.episodeDoms.length) {
          keys.episodeSelection = this.episodeDoms.length - 1;
          return;
        }
        this.hoverEpisode(keys.episodeSelection);
        break;
    }
  },

  handleMenuClick: function () {
    var keys = this.keys;

    switch (keys.focusedPart) {
      case "episodeSelection":
        var categories = movieHelper.getCategories("series", false, false);

        currentSeries.seasonSelection = keys.seasonSelection;
        currentSeries.episodeSelection = keys.episodeSelection;

        if (!checkForAdult(currentSeries, "movie", categories))
          movieHelper.addRecentOrFavoriteMovie(
            "series",
            currentSeries,
            "recent"
          );
        currentSeason = currentSeries.seasons[keys.seasonSelection];
        var episodes = currentSeason.episodes;
        currentEpisode = episodes[keys.episodeSelection];
        var prevRoute = this.prevRoute;
        $("#season-episodes-container").addClass("hide");
        vodSeriesPlayer.init(
          currentEpisode,
          "series",
          "episode-page",
          "",
          prevRoute
        );
        vodSeriesPlayer.keys.episodeSelection = keys.episodeSelection;
        vodSeriesPlayer.makeEpisodeDoms("episode-page");
        break;
      case "seriesDetailPage":
        $($(".series-action-btn")[keys.index]).trigger("click");
        break;
      case "seasonSelection":
        this.selectSeason();
        break;
    }
  },

  HandleKey: function (e) {
    switch (e.keyCode) {
      case tvKey.ArrowLeft:
        this.handleMenuLeftRight(-1);
        break;
      case tvKey.ArrowRight:
        this.handleMenuLeftRight(1);
        break;
      case tvKey.ArrowUp:
        this.handleMenuUpDown(-1);
        break;
      case tvKey.ArrowDown:
        this.handleMenuUpDown(1);
        break;
      case tvKey.Enter:
        this.handleMenuClick();
        break;
      case tvKey.ColorF2Yellow:
        var favBtnDom = $("#series-add-favorite-button");
        this.toggleFavorite(favBtnDom);
        break;
      case tvKey.Back:
        this.goBack();
        break;
    }
  }
};
