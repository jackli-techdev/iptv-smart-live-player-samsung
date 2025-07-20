"use strict";
var entire_search_page = {
  player: null,
  channel_number_timer: null,
  channel_num: 0,
  movies: [],
  lives: [],
  series: [],
  initiated: false,
  categories: [],
  category_hover_timer: null,
  category_hover_timeout: 300,
  sort_selection: 0,
  prev_route: "",
  sort_selection_doms: $(".sort-modal-item"),
  keys: {
    focused_part: "entire_search_part",
    category_selection: 0,
    menu_selection: 0,
    search_part_selection: 0,
    search_selection: -1,
    video_control: 0,
    search_back_selection: 0,
    slider_selection: -1,
    live_slider_item_index: 0,
    vod_slider_item_index: 0,
    series_slider_item_index: 0
  },
  category_doms: [],
  menu_doms: [],
  search_input_dom: $("#vod-series-search-bar"),
  current_movie_type: "movie",
  current_model: {},
  sort_key: "vod_sort",
  search_key_timer: "",
  search_key_timout: 400,
  live_current_render_count: 0,
  live_render_count_increment: 40,
  vod_current_render_count: 0,
  vod_render_count_increment: 40,
  series_current_render_count: 0,
  series_render_count_increment: 40,
  prev_keyword: "",
  prev_dom: null,
  filtered_lives: [],
  filtered_movies: [],
  filtered_series: [],
  init: function (prev_route) {
    this.prev_route = prev_route;
    var keys = this.keys;
    current_route = "entire-search-page";
    $("#entire-search-page").removeClass("hide");
    $("#entire-search-bar").addClass("active");
    keys.focused_part = "entire_search_part";
    this.activeSearchBar();
    this.hidePrevPages();

    $("#entire-search-input").val("");
    $("#entire-search-input").blur();

    $("#live-entire-search").removeClass("hide");
    $("#movie-entire-search").removeClass("hide");
    $("#series-entire-search").removeClass("hide");

    entire_search_page.filterEntireLives('', 'init');
    entire_search_page.filterEntireMovies('', 'init');
    entire_search_page.filterEntireSeries('', 'init');
  },

  activeSearchBar: function () {
    $("#entire-search-bar").addClass("active");
    $("#entire-search-input").val("");
    $("#entire-search-input").blur();
  },

  hidePrevPages: function () {
    $("#channel-page").addClass("hide");
    $("#home-page").addClass("hide");
    hideTopBar();
  },

  makeSliderMovieItemElement: function (movie, movie_type, index) {
    var extension = "ts";
    if (movie_type === "live") {
      var fall_back_image = "images/icon_live.png";
      extension = movie.container_extension;
      var htmlContent =
        '<div class="entire-live-item-container movie-item-container"  onclick="entire_search_page.handleMenuClick()" onmouseenter = "entire_search_page.hoverEntireVideo(\'live\', ' +
        index +
        ', 0)" data-channel_id="' +
        movie.stream_id +
        '">' +
        '<div class="movie-item-wrapper live-movie-item" data-movie_type="live" data-stream_id = "' +
        movie.stream_id +
        '">' +
        '<img class="movie-item-thumbernail position-relative  live-item-wrapper-image" src="' +
        movie.stream_icon +
        '" onerror="this.src=\'images/icon_live.png\'">' +
        '<div class="movie-grid-item-title-wrapper position-relative">' +
        '<p class="movie-thumbernail-title position-absolute">' +
        movie.name +
        "</p>" +
        "</div>" +
        "</div>" +
        "</div>";
    } else if (movie_type === "movie") {
      var fall_back_image = "images/default_bg.png";
      extension = movie.container_extension;
      var htmlContent =
        '<div class="entire-movie-item-container movie-item-container" onclick="entire_search_page.showPreviewVideo()" onmouseenter = "entire_search_page.hoverEntireVideo(\'vod\', ' +
        index +
        ', 1)">' +
        '<div class="entire-movie-item-wrapper movie-item-wrapper" data-movie_type="' +
        movie_type +
        '" data-stream_id="' +
        movie.stream_id +
        '" data-extension="' +
        extension +
        '">' +
        '<div class="entire-movie-item-thumbernail position-relative" style="background-image:url(' +
        movie.stream_icon +
        "),url(" +
        fall_back_image +
        ')">' +
        "</div>" +
        '<p class="movie-thumbernail-title e-movie-item" >' +
        movie.name +
        "</p>" +
        "</div>" +
        "</div>";
    } else {
      var fall_back_image = "images/default_bg.png";
      var htmlContent =
        '<div class="entire-series-item-container movie-item-container" onclick="entire_search_page.showPreviewVideo()" onmouseenter = "entire_search_page.hoverEntireVideo(\'series\', ' +
        index +
        ', 2)" data-channel_id="' +
        movie.series_id +
        '">' +
        '<div class="entire-series-item-wrapper movie-item-wrapper" data-movie_type="series" data-series_id = "' +
        movie.series_id +
        '">' +
        '<img class="movie-item-thumbernail position-relative" src="' +
        movie.cover +
        '" onerror="this.src=\'images/default_bg.png\'">' +
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

  entireSearch: function (prev_route) {
    var keys = this.keys;
    this.init(prev_route);
    current_route = "entire-search-page";
    $(".search-button").removeClass("active");

    $("#channel-page").addClass("hide");
    hideTopBar();
    $("#home-page").addClass("hide");
    $("#entire-search-input").val("");
    $("#entire-search-input").blur();
    keys.focused_part = "entire_search_part";
  },

  initRenderCount: function () {
    this.live_current_render_count = 0;
    this.live_render_count_increment = 40;
    this.vod_current_render_count = 0;
    this.vod_render_count_increment = 40;
    this.series_current_render_count = 0;
    this.series_render_count_increment = 40;
  },
  goBack: function () {
    var prev_route = this.prev_route;
    current_route = prev_route;
    this.prev_keyword = "";
    entire_search_page.initRenderCount();

    $("#entire-search-input").val("");
    hideEntireSearchPage();

    $("#" + prev_route).removeClass("hide");
    if (prev_route == "channel-page") {
      channel_page.init();
    } else if (prev_route == "vod-series-page") {
      vod_series_page.init(current_movie_type_);
    } else if (prev_route === "home-page") {
      $("#home-page").removeClass("hide");
    }
  },

  searchValueChange: function () {
    clearTimeout(this.search_key_timer);
    var that = this;
    this.search_key_timer = setTimeout(function () {
      var search_value = $("#entire-search-input").val();
      if (that.prev_keyword === search_value) return;
      if (search_value !== "") {
        that.filterEntireLives(search_value, '');
        that.filterEntireMovies(search_value, '');
        that.filterEntireSeries(search_value, '');
      } else {
        that.filterEntireLives('', 'init');
        that.filterEntireMovies('', 'init');
        that.filterEntireSeries('', 'init');
      }
      that.initRenderCount();
      that.prev_keyword = search_value;
    }, this.search_key_timout);
  },

  filterEntireLives: function (search_value, state) {
    var that = this;
    if (state === 'init' || search_value === '') {
      this.filtered_lives = recentLives;
      this.renderLiveChannelContent();
    } else {
      if (that.prev_keyword === search_value) return;
      search_value = search_value.toLowerCase();
      this.filtered_lives = entireLives.filter(function (live) {
        if (!live.name) return false;
        var lowerCaseName = live.name.toLowerCase();
        return !(hasWord(lowerCaseName)) && lowerCaseName.includes(search_value);
      });

      if (this.filtered_lives.length > 0) {
        this.renderLiveChannelContent();
        $("#live-entire-search").removeClass("hide");
      } else {
        $("#live-entire-search").addClass("hide");
      }
    }
  },

  renderLiveChannelContent: function () {
    var htmlContents = "";
    var live_current_render_count_ = this.live_current_render_count;
    this.filtered_lives
      .slice(
        this.live_current_render_count,
        this.live_current_render_count + this.live_render_count_increment
      )
      .map(function (movie, index) {
        htmlContents += entire_search_page.makeSliderMovieItemElement(
          movie,
          "live",
          live_current_render_count_ + index
        );
      });
    this.live_current_render_count += this.live_render_count_increment;
    $("#entire-live-wrapper").html(htmlContents);
  },

  filterEntireMovies: function (search_value, state) {
    var that = this;
    if (state === 'init' || search_value === '') {
      this.filtered_movies = recentMovies;
      this.renderVodContent();
    } else {
      if (that.prev_keyword === search_value) return;
      search_value = search_value.toLowerCase();
      this.filtered_movies = entireMovies.filter(function (movie) {
        if (!movie.name) return false;
        var lowerCaseName = movie.name.toLowerCase();
        return (!hasWord(lowerCaseName) && lowerCaseName.includes(search_value)
        );
      });
      if (this.filtered_movies.length > 0) {
        this.renderVodContent();
        $("#movie-entire-search").removeClass("hide");
      } else {
        $("#movie-entire-search").addClass("hide");
      }
    }
  },

  renderVodContent: function () {
    var htmlContents = "";
    var vod_current_render_count_ = this.vod_current_render_count;
    this.filtered_movies
      .slice(
        this.vod_current_render_count,
        this.vod_current_render_count + this.vod_render_count_increment
      )
      .map(function (movie, index) {
        htmlContents += entire_search_page.makeSliderMovieItemElement(
          movie,
          "movie",
          vod_current_render_count_ + index
        );
      });
    this.vod_current_render_count += this.vod_render_count_increment;
    $("#entire-movies-wrapper").html(htmlContents);
  },

  filterEntireSeries: function (search_value, state) {
    if (state === 'init' || search_value === '') {
      this.filtered_series = recentSeries;
      this.renderSeriesContent();
    } else {
      if (this.prev_keyword === search_value) return; search_value = search_value.toLowerCase();
      this.filtered_series = entireSeries.filter(function (series) {
        if (!series.name) return false;
        var lowerCaseName = series.name.toLowerCase();
        return (!hasWord(lowerCaseName) && lowerCaseName.includes(search_value));
      });
      if (this.filtered_series.length > 0) {
        this.renderSeriesContent();
        $("#series-entire-search").removeClass("hide");
      } else {
        $("#series-entire-search").addClass("hide");
      }
    }
  },

  renderSeriesContent: function () {
    var htmlContents = "";
    var series_current_render_count_ = this.series_current_render_count;
    this.filtered_series
      .slice(
        this.series_current_render_count,
        this.series_current_render_count + this.series_render_count_increment
      )
      .map(function (series, index) {
        htmlContents += entire_search_page.makeSliderMovieItemElement(
          series,
          "series",
          series_current_render_count_ + index
        );
      });
    this.series_current_render_count += this.series_render_count_increment;
    $("#entire-series-wrapper").html(htmlContents);
  },

  hoverSearchItem: function () {
    var keys = this.keys;
    keys.focused_part = "entire_search_part";
    // $("#entire-search-input").focus();
    $(".movie-item-wrapper").removeClass("active");
    $("#entire-search-bar").addClass("active");
  },

  hoverEntireVideo: function (move_type, index, slider_selection) {
    var keys = this.keys;
    keys.slider_selection = slider_selection;
    $("#entire-search-bar").removeClass("active");
    $(".movie-item-wrapper").removeClass("active");
    var movie_containers = $(".movie-slider-wrapper");
    var movie_items = $(movie_containers[keys.slider_selection]).find(
      ".movie-item-wrapper"
    );
    if (move_type == "live") {
      keys.live_slider_item_index = index;
      keys.focused_part = "entire_live_selection";
      if (keys.live_slider_item_index >= this.live_current_render_count - 2) {
        entire_search_page.renderLiveChannelContent();
      } else {
        if (keys.live_slider_item_index >= movie_items.length)
          keys.live_slider_item_index = movie_items.length - 1;
        var movie_item_container = $(
          movie_items[keys.live_slider_item_index]
        ).closest(".movie-item-container");
        $(movie_items[keys.live_slider_item_index]).addClass("active");
      }
    } else if (move_type == "vod") {
      keys.vod_slider_item_index = index;
      keys.focused_part = "entire_movies_selection";
      if (keys.vod_slider_item_index >= this.vod_current_render_count - 2) {
        entire_search_page.renderVodContent();
      } else {
        if (keys.vod_slider_item_index >= movie_items.length)
          keys.vod_slider_item_index = movie_items.length - 1;
        var movie_item_container = $(
          movie_items[keys.vod_slider_item_index]
        ).closest(".movie-item-container");
        $(movie_items[keys.vod_slider_item_index]).addClass("active");
      }
    } else {
      keys.series_slider_item_index = index;
      keys.focused_part = "entire_series_selection";

      if (
        keys.series_slider_item_index >=
        this.series_current_render_count - 2
      ) {
        entire_search_page.renderSeriesContent();
      } else {
        if (keys.series_slider_item_index >= movie_items.length)
          keys.series_slider_item_index = movie_items.length - 1;
        var movie_item_container = $(
          movie_items[keys.series_slider_item_index]
        ).closest(".movie-item-container");
        $(movie_items[keys.series_slider_item_index]).addClass("active");
      }
    }

    this.changeMovieScrollPosition(
      $(movie_containers[keys.slider_selection]),
      movie_item_container
    );
  },

  goToSearchBar: function () {
    var keys = this.keys;
    keys.focused_part = "entire_search_part";
    var movie_containers1 = $(".movie-slider-wrapper");

    var movie_items0 = $(movie_containers1[0]).find(".movie-item-wrapper");
    var movie_items1 = $(movie_containers1[1]).find(".movie-item-wrapper");
    var movie_items2 = $(movie_containers1[2]).find(".movie-item-wrapper");

    $($(movie_items0)[keys.live_slider_item_index]).removeClass("active");
    $($(movie_items1)[keys.live_slider_item_index]).removeClass("active");
    $($(movie_items2)[keys.live_slider_item_index]).removeClass("active");

    $("#entire-search-bar").addClass("active");
    // $("#entire-search-input").focus();
  },

  handleMenuClick: function () {
    if (this.keys.focused_part === "entire_search_part") {
      $("#entire-search-input").focus();
    } else {
      this.showPreviewVideo();
    }
  },

  handleMenusUpDown: function (increment) {
    var keys = this.keys;
    this.keys.slider_selection += increment;
    if (keys.slider_selection > 2) {
      keys.slider_selection = 2;
    }
    if (keys.slider_selection < -1) {
      keys.slider_selection = -1;
    }

    $("#entire-search-input").blur();
    var movie_containers1 = $(".movie-slider-wrapper");
    switch (keys.focused_part) {
      case "entire_search_part":
        if (increment > 0) {
          if (this.filtered_lives.length > 0) {
            keys.focused_part = "entire_live_selection";
            $("#entire-search-bar").removeClass("active");
            var movie_items1 = $(movie_containers1[0]).find(".movie-item-wrapper");
            $($(movie_items1)[keys.live_slider_item_index]).addClass("active");
          } else if (this.filtered_lives.length === 0 && this.filtered_movies.length > 0) {
            keys.focused_part = "entire_movies_selection";
            $("#entire-search-bar").removeClass("active");
            var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
            $($(movie_items2)[keys.vod_slider_item_index]).addClass("active");
          } else if (this.filtered_lives.length === 0 && this.filtered_movies.length === 0 && this.filtered_series.length > 0) {
            keys.focused_part = "entire_series_selection";
            var movie_items3 = $(movie_containers1[2]).find(".movie-item-wrapper");
            $($(movie_items3)[keys.series_slider_item_index]).addClass("active");
          }
        }
        break;
      case "entire_live_selection":
        if (increment > 0) {
          var movie_items1 = $(movie_containers1[0]).find(".movie-item-wrapper");
          if (this.filtered_movies.length > 0) {
            keys.focused_part = "entire_movies_selection";
            $($(movie_items1)[keys.live_slider_item_index]).removeClass("active");
            var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
            $($(movie_items2)[keys.vod_slider_item_index]).addClass("active");
          } else if (this.filtered_movies.length === 0 && this.filtered_series.length > 0) {
            keys.focused_part = "entire_series_selection";
            $($(movie_items1)[keys.live_slider_item_index]).removeClass("active");
            var movie_items3 = $(movie_containers1[2]).find(".movie-item-wrapper");
            $($(movie_items3)[keys.series_slider_item_index]).addClass("active");
          }
        } else {
          this.goToSearchBar();
        }
        break;
      case "entire_movies_selection":
        if (increment > 0) {
          if (this.filtered_series.length > 0) {
            keys.focused_part = "entire_series_selection";
            var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
            $($(movie_items2)[keys.vod_slider_item_index]).removeClass("active");
            var movie_items3 = $(movie_containers1[2]).find(".movie-item-wrapper");
            $($(movie_items3)[keys.series_slider_item_index]).addClass("active");
          }
        } else {
          if (this.filtered_lives.length > 0) {
            keys.focused_part = "entire_live_selection";
            var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
            $($(movie_items2)[keys.vod_slider_item_index]).removeClass("active");
            var movie_items1 = $(movie_containers1[0]).find(".movie-item-wrapper");
            $($(movie_items1)[keys.live_slider_item_index]).addClass("active");
          } else if (this.filtered_lives.length === 0) {
            this.goToSearchBar();
          }
        }
        break;
      case "entire_series_selection":
        if (increment < 0) {
          if (this.filtered_movies.length > 0) {
            keys.focused_part = "entire_movies_selection";
            var movie_items3 = $(movie_containers1[2]).find(".movie-item-wrapper");
            $($(movie_items3)[keys.series_slider_item_index]).removeClass("active");
            var movie_items2 = $(movie_containers1[1]).find(".movie-item-wrapper");
            $($(movie_items2)[keys.vod_slider_item_index]).addClass("active");
          } else if (this.filtered_movies.length === 0 && this.filtered_lives.length > 0) {
            keys.focused_part = "entire_live_selection";
            var movie_items2 = $(movie_containers1[2]).find(".movie-item-wrapper");
            $($(movie_items2)[keys.vod_slider_item_index]).removeClass("active");
            var movie_items1 = $(movie_containers1[0]).find(".movie-item-wrapper");
            $($(movie_items1)[keys.live_slider_item_index]).addClass("active");
          } else if (this.filtered_movies.length === 0 && this.filtered_lives.length < 0) {
            this.goToSearchBar();
          }
        }
        break;
    }
  },
  Exit: function () {
    $("#home-page").css({ height: 0 });
    $("#home-page").hide();
    closePlayer();
  },
  showPreviewVideo: function () {
    var keys = this.keys;
    var movie_containers = $(".movie-slider-wrapper");

    if (keys.focused_part == "entire_live_selection") {
      var movie_items = $(movie_containers[0]).find(".movie-item-wrapper");
      var current_movie_item = $(movie_items[keys.live_slider_item_index]);
    } else if (keys.focused_part == "entire_movies_selection") {
      var movie_items = $(movie_containers[1]).find(".movie-item-wrapper");
      var current_movie_item = $(movie_items[keys.vod_slider_item_index]);
    } else {
      var movie_items = $(movie_containers[2]).find(".movie-item-wrapper");
      var current_movie_item = $(movie_items[keys.series_slider_item_index]);
    }

    var movie_type = $(current_movie_item).data("movie_type");
    var series_id = $(current_movie_item).data("series_id");
    var stream_id = $(current_movie_item).data("stream_id");

    if (movie_type == "live") {
      entireLives.map(function (live, index) {
        if (live.stream_id == stream_id) {
          current_movie = live;

          hideEntireSearchPage();
          channel_page.showEntireSearchLiveMovie(
            current_movie,
            "entire-search-page"
          );
        }
      });
    } else if (movie_type == "movie") {
      var stream_id = $(current_movie_item).data("stream_id");

      entireMovies.map(function (movie, index) {
        if (movie.stream_id == stream_id) {
          current_movie = movie;
          vod_summary_variables.init("entire-search-page");
        }
      });
    } else if (movie_type == "series") {
      entireSeries.map(function (series, index) {
        if (series.series_id == series_id) {
          current_series = series;
          series_summary_page.init("entire-search-page");
        }
      });
    }
  },

  MoveKeyOnMovies: function (increment) {
    var keys = this.keys;
    $(".movie-item-wrapper").removeClass("active");
    if (
      keys.live_slider_item_index > -1 ||
      keys.vod_slider_item_index > -1 ||
      keys.series_slider_item_index > -1
    ) {
      if (keys.focused_part == "entire_live_selection") {
        keys.live_slider_item_index += increment;
        if (keys.live_slider_item_index < 0) keys.live_slider_item_index = 0;
        if (keys.live_slider_item_index >= this.live_current_render_count - 2 && keys.live_slider_item_index > 37) {
          entire_search_page.renderLiveChannelContent();
        } else this.renderLoadedContents("live");
      } else if (keys.focused_part == "entire_movies_selection") {
        keys.vod_slider_item_index += increment;
        if (keys.vod_slider_item_index < 0) keys.vod_slider_item_index = 0;
        if (keys.vod_slider_item_index >= this.vod_current_render_count - 2 && keys.vod_slider_item_index > 37) {
          entire_search_page.renderVodContent();
        } else this.renderLoadedContents("vod");
      } else if (keys.focused_part == "entire_series_selection") {
        keys.series_slider_item_index += increment;
        if (keys.series_slider_item_index < 0)
          keys.series_slider_item_index = 0;
        if (keys.series_slider_item_index >= this.series_current_render_count - 2 && keys.series_slider_item_index > 12) {
          entire_search_page.renderSeriesContent();
        } else this.renderLoadedContents("series");
      }
    }
  },

  renderLoadedContents: function (move_type) {
    var keys = this.keys;
    var movie_containers = $(".movie-slider-wrapper");
    var movie_items = $(movie_containers[keys.slider_selection]).find(
      ".movie-item-wrapper"
    );

    if (move_type == "live") {
      if (keys.live_slider_item_index >= movie_items.length)
        keys.live_slider_item_index = movie_items.length - 1;
      var movie_item_container = $(
        movie_items[keys.live_slider_item_index]
      ).closest(".movie-item-container");
      $(movie_items[keys.live_slider_item_index]).addClass("active");
    } else if (move_type == "vod") {
      if (keys.vod_slider_item_index >= movie_items.length)
        keys.vod_slider_item_index = movie_items.length - 1;
      var movie_item_container = $(
        movie_items[keys.vod_slider_item_index]
      ).closest(".movie-item-container");
      $(movie_items[keys.vod_slider_item_index]).addClass("active");
    } else {
      if (keys.series_slider_item_index >= movie_items.length)
        keys.series_slider_item_index = movie_items.length - 1;
      var movie_item_container = $(
        movie_items[keys.series_slider_item_index]
      ).closest(".movie-item-container");
      $(movie_items[keys.series_slider_item_index]).addClass("active");
    }

    this.changeMovieScrollPosition(
      $(movie_containers[keys.slider_selection]),
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
    switch (keys.focused_part) {
      case "entire_live_selection":
        this.MoveKeyOnMovies(increment);
        break;
      case "entire_movies_selection":
        this.MoveKeyOnMovies(increment);
        break;
      case "entire_series_selection":
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
      case tvKey.RETURN:
        this.goBack();
        break;
      case tvKey.RED:
        // home_page.init();
        break;
      default:
        console.log("No matching");
    }
  }
};
