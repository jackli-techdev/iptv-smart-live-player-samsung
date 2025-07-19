"use strict";
var entireSearch = {
  movies: [],
  lives: [],
  series: [],
  prevRoute: "",
  keys: {
    focusedPart: "entireSearchBar",
    sliderSelection: -1,
    liveSliderIndex: 0,
    vodSliderIndex: 0,
    seriesSliderIndex: 0
  },
  searchKeyTimer: "",
  searchKeyTimout: 400,
  liveCurrentRenderCount: 0,
  liveRenderCountIncrement: 40,
  vodCurrentRenderCount: 0,
  vodRenderCountIncrement: 40,
  seriesCurrentRenderCount: 0,
  seriesRenderCountIncrement: 40,
  prevKeyword: "",
  filteredLives: {},
  filteredMovies: {},
  filteredSeries: {},

  init: function (prevRoute) {
    this.prevRoute = prevRoute;
    currentRoute = "entire-search-page";
    displayCurrentPage(currentRoute);
    this.focusSearchBar();
  },

  makeSliderMovieItemElement: function (movie, movieType, index) {
    var extension = "ts";
    if (movieType === "live") {
      extension = getLocalStorageData('liveStreamFormat');
      if (extension === null)
        extension = 'ts';

      var htmlContent =
        '<div class="entire-live-item-container movie-item-container"  onclick="entireSearch.handleMenuClick()" onmouseenter = "entireSearch.hoverEntireVideo(\'live\', ' +
        index +
        ', 0)" data-channel_id="' +
        movie.stream_id +
        '">' +
        '<div class="movie-item-wrapper live-movie-item" data-movie_type="live" data-stream_id = "' +
        movie.stream_id +
        '">' +
        '<img class="movie-item-thumbernail position-relative  live-item-wrapper-image" src="' +
        movie.stream_icon +
        '" onerror="this.src=\'images/live-placeholder.png\'">' +
        '<div class="movie-grid-item-title-wrapper position-relative">' +
        '<p class="movie-thumbernail-title position-absolute">' +
        movie.name +
        "</p>" +
        "</div>" +
        "</div>" +
        "</div>";
    } else if (movieType === "movie") {
      extension = movie.container_extension;
      var htmlContent =
        '<div class="entire-movie-item-container movie-item-container" onclick="entireSearch.showPreviewVideo()" onmouseenter = "entireSearch.hoverEntireVideo(\'vod\', ' +
        index +
        ', 1)">' +
        '<div class="entire-movie-item-wrapper movie-item-wrapper" data-movie_type="' +
        movieType +
        '" data-stream_id="' +
        movie.stream_id +
        '" data-extension="' +
        extension +
        '">' +
        '<div class="entire-movie-item-thumbernail position-relative" style="background-image:url(' +
        movie.stream_icon +
        "),url(" +
        config.placeholderImg +
        ')">' +
        '<p class="movie-thumbernail-title position-absolute">' +
        movie.name +
        "</p>" +
        "</div>" +
        "</div>" +
        "</div>";
    } else {
      var htmlContent =
        '<div class="entire-series-item-container movie-item-container" onclick="entireSearch.showPreviewVideo()" onmouseenter = "entireSearch.hoverEntireVideo(\'series\', ' +
        index +
        ', 2)" data-channel_id="' +
        movie.series_id +
        '">' +
        '<div class="entire-series-item-wrapper movie-item-wrapper" data-movie_type="series" data-series_id = "' +
        movie.series_id +
        '">' +
        '<img class="movie-item-thumbernail position-relative" style = "background:#465A65" src="' +
        movie.cover +
        '" onerror="this.src=\'images/placeholder.png\'">' +
        '<div class="movie-grid-item-title-wrapper position-relative">' +
        '<p class="movie-thumbernail-title position-absolute">' +
        movie.name +
        "</p>" +
        "</div>" +
        "</div>" +
        "</div>";
    }

    return htmlContent;
  },

  entireSearch: function (prevRoute) {
    var keys = this.keys;
    this.init(prevRoute);
    $(".search-button").removeClass("active");
    $("#entire-search-value").val("");
    $("#entire-search-value").blur();
    $("#entire-search-value").focus();
    keys.focusedPart = "entireSearchBar";
    this.initContents();

  },

  initContents: function () {
    $("#entire-live-wrapper").html("");
    $("#entire-movies-wrapper").html("");
    $("#entire-series-wrapper").html("");
    $("#entire-live-title").addClass("hide");
    $("#entire-movies-title").addClass("hide");
    $("#entire-series-title").addClass("hide");
  },

  initRenderCount: function () {
    this.liveCurrentRenderCount = 0;
    this.liveRenderCountIncrement = 40;
    this.vodCurrentRenderCount = 0;
    this.vodRenderCountIncrement = 40;
    this.seriesCurrentRenderCount = 0;
    this.seriesRenderCountIncrement = 40;
  },

  goBack: function () {
    var prevRoute = this.prevRoute;
    currentRoute = prevRoute;
    this.prevKeyword = "";
    entireSearch.initRenderCount();
    this.initContents();
    $("#entire-search-value").val("");
    hideEntireSearchPage();

    $("#" + prevRoute).removeClass("hide");
    if (prevRoute == "channel-page") {
      channel.init();
    } else if (prevRoute == "vod-series-page") {
      vodSeries.init(vodSeries.currentVideoType);
    }
  },

  showCategoryContent: function () { },
  renderCategoryContent: function () { },
  addOrRemoveFav: function () { },
  searchBackMove: function () { },
  showSortKeyModal: function () { },
  changeSortKey: function (key, index) { },

  searchValueChange: function () {
    clearTimeout(this.searchKeyTimer);
    var that = this;
    this.searchKeyTimer = setTimeout(function () {
      var searchValue = $("#entire-search-value").val();

      if (that.prevKeyword === searchValue) return;
      if (searchValue !== "") {
        entireSearch.filterEntireLives(searchValue);
        entireSearch.filterEntireMovies(searchValue);
        entireSearch.filterEntireSeries(searchValue);
      } else {
        that.initContents();
      }
      entireSearch.initRenderCount();
      that.prevKeyword = searchValue;
    }, this.searchKeyTimout);
  },

  filterEntireLives: function (searchValue) {
    var that = this;
    if (that.prevKeyword === searchValue) return;
    var current_lives = entireLives;
    current_lives.sort(function (a, b) {
      if (!a.name || !b.name) return false;
      return a.name.localeCompare(b.name);
    });
    var filteredLives = [];

    searchValue = searchValue.toLowerCase();
    filteredLives = current_lives.filter(function (live) {
      if (!live.name) return false;

      var lowerCaseName = live.name.toLowerCase();
      return isAdultPattern(lowerCaseName, searchValue);
    });


    that.lives = filteredLives;
    if (filteredLives.length == 0) {
      $("#live-entire-search").addClass("hide");
      $("#entire-live-title").addClass("hide");
    } else {
      $("#live-entire-search").removeClass("hide");
      $("#entire-live-title").removeClass("hide");
    }
    this.filteredLives = filteredLives;
    this.renderLiveChannelContent();
  },

  renderLiveChannelContent: function () {
    var filteredLives = this.filteredLives;
    var htmlContents = "";
    var liveCurrentRenderCount_ = this.liveCurrentRenderCount;
    filteredLives
      .slice(
        this.liveCurrentRenderCount,
        this.liveCurrentRenderCount + this.liveRenderCountIncrement
      )
      .map(function (movie, index) {
        htmlContents += entireSearch.makeSliderMovieItemElement(
          movie,
          "live",
          liveCurrentRenderCount_ + index
        );
      });
    this.liveCurrentRenderCount += this.liveRenderCountIncrement;
    $("#entire-live-wrapper").html(htmlContents);
  },

  filterEntireMovies: function (searchValue) {
    var that = this;
    if (that.prevKeyword === searchValue) return;
    var currentMovies = entireMovies;
    currentMovies.sort(function (a, b) {
      if (!a.name || !b.name) return false;
      return a.name.localeCompare(b.name);
    });

    var filteredMovies = [];
    if (searchValue === "") {
      filteredMovies = currentMovies;
    } else {
      searchValue = searchValue.toLowerCase();
      filteredMovies = currentMovies.filter(function (movie) {
        if (!movie.name) return false;
        var lowerCaseName = movie.name.toLowerCase();
        return isAdultPattern(lowerCaseName, searchValue);
      });
    }
    that.movies = filteredMovies;
    this.filteredMovies = filteredMovies;
    if (filteredMovies.length == 0) {
      $("#movie-entire-search").addClass("hide");
      $("#entire-movies-title").addClass("hide");
    } else {
      $("#movie-entire-search").removeClass("hide");
      $("#entire-movies-title").removeClass("hide");
    }

    this.renderVodContent();
  },

  renderVodContent: function () {
    var filteredMovies = this.filteredMovies;
    var htmlContents = "";
    var vodCurrentRenderCount_ = this.vodCurrentRenderCount;
    filteredMovies
      .slice(
        this.vodCurrentRenderCount,
        this.vodCurrentRenderCount + this.vodRenderCountIncrement
      )
      .map(function (movie, index) {
        htmlContents += entireSearch.makeSliderMovieItemElement(
          movie,
          "movie",
          vodCurrentRenderCount_ + index
        );
      });
    this.vodCurrentRenderCount += this.vodRenderCountIncrement;
    $("#entire-movies-wrapper").html(htmlContents);
  },

  filterEntireSeries: function (searchValue) {
    var that = this;
    if (that.prevKeyword === searchValue) return;

    var currentSeries = entireSeries;
    currentSeries.sort(function (a, b) {
      if (!a.name || !b.name) return false;
      return a.name.localeCompare(b.name);
    });

    var filteredSeries = [];
    if (searchValue === "") {
      filteredSeries = currentSeries;
    } else {
      searchValue = searchValue.toLowerCase();
      filteredSeries = currentSeries.filter(function (series) {
        if (!series.name) return false;
        var lowerCaseName = series.name.toLowerCase();
        return isAdultPattern(lowerCaseName, searchValue);
      });
    }
    that.series = filteredSeries;

    if (filteredSeries.length == 0) {
      $("#series-entire-search").addClass("hide");
      $("#entire-series-title").addClass("hide");
    } else {
      $("#series-entire-search").removeClass("hide");
      $("#entire-series-title").removeClass("hide");
    }

    this.filteredSeries = filteredSeries;
    this.renderSeriesContent();
  },

  renderSeriesContent: function () {
    var htmlContents = "";
    var filteredSeries = this.filteredSeries;
    var seriesCurrentRenderCount_ = this.seriesCurrentRenderCount;
    filteredSeries
      .slice(
        this.seriesCurrentRenderCount,
        this.seriesCurrentRenderCount + this.seriesRenderCountIncrement
      )
      .map(function (series, index) {
        htmlContents += entireSearch.makeSliderMovieItemElement(
          series,
          "series",
          seriesCurrentRenderCount_ + index
        );
      });
    this.seriesCurrentRenderCount += this.seriesRenderCountIncrement;
    $("#entire-series-wrapper").html(htmlContents);
  },

  hoverEntireVideo: function (move_type, index, sliderSelection) {
    var keys = this.keys;
    keys.sliderSelection = sliderSelection;
    this.unFocusSearchBar();
    $(".movie-item-wrapper").removeClass("active");
    var movie_containers = $(".movie-slider-wrapper");
    var movie_items = $(movie_containers[keys.sliderSelection]).find(
      ".movie-item-wrapper"
    );
    if (move_type == "live") {
      keys.liveSliderIndex = index;
      keys.focusedPart = "liveSelection";
      if (keys.liveSliderIndex >= this.liveCurrentRenderCount - 2) {
        entireSearch.renderLiveChannelContent();
        var movie_items = $(movie_containers[keys.sliderSelection]).find(
          ".movie-item-wrapper"
        );
        var movie_item_container = $(
          movie_items[keys.liveSliderIndex]
        ).closest(".movie-item-container");
        this.changeMovieScrollPosition(
          $(movie_containers[keys.sliderSelection]),
          movie_item_container
        );
      } else {
        if (keys.liveSliderIndex >= movie_items.length)
          keys.liveSliderIndex = movie_items.length - 1;

        var movie_item_container = $(
          movie_items[keys.liveSliderIndex]
        ).closest(".movie-item-container");
        $(movie_items[keys.liveSliderIndex]).addClass("active");
        this.changeMovieScrollPosition(
          $(movie_containers[keys.sliderSelection]),
          movie_item_container
        );
      }
    } else if (move_type == "vod") {
      keys.vodSliderIndex = index;
      keys.focusedPart = "moviesSelection";
      if (keys.vodSliderIndex >= this.vodCurrentRenderCount - 2) {
        entireSearch.renderVodContent();
      } else {
        if (keys.vodSliderIndex >= movie_items.length)
          keys.vodSliderIndex = movie_items.length - 1;
        var movie_item_container = $(
          movie_items[keys.vodSliderIndex]
        ).closest(".movie-item-container");
        $(movie_items[keys.vodSliderIndex]).addClass("active");
        this.changeMovieScrollPosition(
          $(movie_containers[keys.sliderSelection]),
          movie_item_container
        );
      }
    } else {
      keys.seriesSliderIndex = index;
      keys.focusedPart = "seriesSelection";

      if (
        keys.seriesSliderIndex >=
        this.seriesCurrentRenderCount - 2
      ) {
        entireSearch.renderSeriesContent();
      } else {
        if (keys.seriesSliderIndex >= movie_items.length)
          keys.seriesSliderIndex = movie_items.length - 1;
        var movie_item_container = $(
          movie_items[keys.seriesSliderIndex]
        ).closest(".movie-item-container");
        $(movie_items[keys.seriesSliderIndex]).addClass("active");
        this.changeMovieScrollPosition(
          $(movie_containers[keys.sliderSelection]),
          movie_item_container
        );
      }
    }
  },

  handleMenuClick: function () {
    var keys = this.keys;
    if (keys.focusedPart != "entireSearchBar") {
      this.showPreviewVideo();
    }
  },

  handleMenusUpDown: function (increment) {
    var keys = this.keys;
    this.keys.sliderSelection += increment;
    if (keys.sliderSelection > 2) {
      keys.sliderSelection = 2;
    }
    if (keys.sliderSelection < -1) {
      keys.sliderSelection = -1;
    }

    $("#entire-search-value").blur();
    var movie_containers1 = $(".movie-slider-wrapper");
    switch (keys.focusedPart) {
      case "entireSearchBar":
        if (increment > 0) {
          keys.focusedPart = "liveSelection";
          var movie_items1 = $(movie_containers1[0]).find(
            ".movie-item-wrapper"
          );
          this.unFocusSearchBar();
          $($(movie_items1)[keys.liveSliderIndex]).addClass("active");
        }
        break;
      case "liveSelection":
        if (increment > 0) {
          keys.focusedPart = "moviesSelection";
          var movie_items1 = $(movie_containers1[0]).find(
            ".movie-item-wrapper"
          );
          $($(movie_items1)[keys.liveSliderIndex]).removeClass("active");
          var movie_items2 = $(movie_containers1[1]).find(
            ".movie-item-wrapper"
          );
          $($(movie_items2)[keys.vodSliderIndex]).addClass("active");
        } else {
          keys.focusedPart = "entireSearchBar";
          var movie_items1 = $(movie_containers1[0]).find(
            ".movie-item-wrapper"
          );
          $($(movie_items1)[keys.liveSliderIndex]).removeClass("active");
          this.focusSearchBar();
        }
        break;

      case "moviesSelection":
        if (increment > 0) {
          keys.focusedPart = "seriesSelection";
          var movie_items2 = $(movie_containers1[1]).find(
            ".movie-item-wrapper"
          );
          $($(movie_items2)[keys.vodSliderIndex]).removeClass("active");
          var movie_items3 = $(movie_containers1[2]).find(
            ".movie-item-wrapper"
          );
          $($(movie_items3)[keys.seriesSliderIndex]).addClass("active");
        } else {
          keys.focusedPart = "liveSelection";

          var movie_items2 = $(movie_containers1[1]).find(
            ".movie-item-wrapper"
          );
          $($(movie_items2)[keys.vodSliderIndex]).removeClass("active");
          var movie_items1 = $(movie_containers1[0]).find(
            ".movie-item-wrapper"
          );
          $($(movie_items1)[keys.liveSliderIndex]).addClass("active");
        }
        break;
      case "seriesSelection":
        if (increment < 0) {
          keys.focusedPart = "moviesSelection";
          var movie_items3 = $(movie_containers1[2]).find(
            ".movie-item-wrapper"
          );
          $($(movie_items3)[keys.seriesSliderIndex]).removeClass(
            "active"
          );
          var movie_items2 = $(movie_containers1[1]).find(
            ".movie-item-wrapper"
          );
          $($(movie_items2)[keys.vodSliderIndex]).addClass("active");
        }
        break;
    }
  },

  focusSearchBar: function () {
    var keys = this.keys;
    keys.focusedPart = "entireSearchBar";
    $("#entire-search-bar").addClass("active");
    $("#entire-search-value").focus();
    $(".search-icon").attr("src", "images/search-yellow.png");
  },

  unFocusSearchBar: function () {
    $("#entire-search-bar").removeClass("active");
    $(".search-icon").attr("src", "images/search.png");
  },

  Exit: function () {
    $("#home-page").css({ height: 0 });
    $("#home-page").hide();
    try {
      media_player.close();
    } catch (e) { }
  },

  showPreviewVideo: function () {
    var keys = this.keys;
    var that = this;
    var movie_containers = $(".movie-slider-wrapper");
    var movie_items = $(movie_containers[keys.sliderSelection]).find(
      ".movie-item-wrapper"
    );
    if (keys.focusedPart == "liveSelection") {
      var currentMovieItem = $(movie_items[keys.liveSliderIndex]);
    } else if (keys.focusedPart == "moviesSelection") {
      var currentMovieItem = $(movie_items[keys.vodSliderIndex]);
    } else {
      var currentMovieItem = $(movie_items[keys.seriesSliderIndex]);
    }

    var movieType = $(currentMovieItem).data("movie_type");
    var seriesId = $(currentMovieItem).data("series_id");
    var streamId = $(currentMovieItem).data("stream_id");

    if (movieType == "live") {
      entireLives.map(function (item, index) {
        if (item.stream_id == streamId) {
          currentMovie = item;

          hideEntireSearchPage();
          channel.showEntireSearchLiveMovie(
            item,
            "entire-search-page"
          );
        }
      });
    } else if (movieType == "movie") {
      var streamId = $(currentMovieItem).data("stream_id");

      entireMovies.map(function (movie, index) {
        if (movie.stream_id == streamId) {
          currentMovie = movie;
          vodSummary.init("entire-search-page");
        }
      });
    } else if (movieType == "series") {
      entireSeries.map(function (series, index) {
        if (series.series_id == seriesId) {
          currentSeries = series;
          seriesSummary.init("entire-search-page");
        }
      });
    }
  },

  MoveKeyOnMovies: function (increment) {
    var keys = this.keys;
    $(".movie-item-wrapper").removeClass("active");
    if (
      keys.liveSliderIndex > -1 ||
      keys.vodSliderIndex > -1 ||
      keys.seriesSliderIndex > -1
    ) {
      if (keys.focusedPart == "liveSelection") {
        keys.liveSliderIndex += increment;
        if (keys.liveSliderIndex < 0) keys.liveSliderIndex = 0;
        if (keys.liveSliderIndex >= this.liveCurrentRenderCount - 2) {
          entireSearch.renderLiveChannelContent();
        } else this.renderLoadedContents("live");
      } else if (keys.focusedPart == "moviesSelection") {
        keys.vodSliderIndex += increment;
        if (keys.vodSliderIndex < 0) keys.vodSliderIndex = 0;
        if (keys.vodSliderIndex >= this.vodCurrentRenderCount - 2) {
          entireSearch.renderVodContent();
        } else this.renderLoadedContents("vod");
      } else if (keys.focusedPart == "seriesSelection") {
        keys.seriesSliderIndex += increment;
        if (keys.seriesSliderIndex < 0)
          keys.seriesSliderIndex = 0;
        if (
          keys.seriesSliderIndex >=
          this.seriesCurrentRenderCount - 2
        ) {
          entireSearch.renderSeriesContent();
        } else this.renderLoadedContents("series");
      }
    }
  },

  renderLoadedContents: function (move_type) {
    var keys = this.keys;
    var movie_containers = $(".movie-slider-wrapper");
    var movie_items = $(movie_containers[keys.sliderSelection]).find(
      ".movie-item-wrapper"
    );

    if (move_type == "live") {
      if (keys.liveSliderIndex >= movie_items.length)
        keys.liveSliderIndex = movie_items.length - 1;
      var movie_item_container = $(
        movie_items[keys.liveSliderIndex]
      ).closest(".movie-item-container");
      $(movie_items[keys.liveSliderIndex]).addClass("active");
    } else if (move_type == "vod") {
      if (keys.vodSliderIndex >= movie_items.length)
        keys.vodSliderIndex = movie_items.length - 1;
      var movie_item_container = $(
        movie_items[keys.vodSliderIndex]
      ).closest(".movie-item-container");
      $(movie_items[keys.vodSliderIndex]).addClass("active");
    } else {
      if (keys.seriesSliderIndex >= movie_items.length)
        keys.seriesSliderIndex = movie_items.length - 1;
      var movie_item_container = $(
        movie_items[keys.seriesSliderIndex]
      ).closest(".movie-item-container");
      $(movie_items[keys.seriesSliderIndex]).addClass("active");
    }

    this.changeMovieScrollPosition(
      $(movie_containers[keys.sliderSelection]),
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

  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    switch (keys.focusedPart) {
      case "liveSelection":
        this.MoveKeyOnMovies(increment);
        break;
      case "moviesSelection":
        this.MoveKeyOnMovies(increment);
        break;
      case "seriesSelection":
        this.MoveKeyOnMovies(increment);
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
      default:
        console.log("No matching");
    }
  }
};
