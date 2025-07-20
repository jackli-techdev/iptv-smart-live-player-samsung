"use strict";
var vod_series_page = {
  movies: [],
  categories: [],
  sort_selection: 0,
  sort_selection_doms: $(".sort-modal-item"),
  topMenuDoms: $(".top-menu-titles"),
  keys: {
    focused_part: "category_selection",
    category_selection: 0,
    menu_selection: 0,
    top_bar_menu_selection: 0,
    selected_category_index: 0
  },
  category_doms: [],
  menu_doms: [],
  search_input_dom: $("#vod-series-search-bar"),
  current_movie_type: "vod",
  current_model: {},
  sort_key: "vod_sort",
  search_key_timer: "",
  search_key_timout: 400,
  current_render_count: 0,
  render_count_increment: 40,
  prev_keyword: "",
  prev_dom: [],
  init: function (movie_type) {
    var keys = this.keys;
    this.prev_dom = [];

    this.setSortKey();

    $("#vod-series-page").removeClass("hide");
    $("#search-by-video-title").innerHTML = "";
    $("#search-by-video-title").html(
      ' <div class="top-menu-search-bar"style="border:none">' +
      '<div id="vod-series-search-bar"  onmouseenter="vod_series_page.hoverSearchItem()">' +
      '<input id="vod-series-search-input" placeholder="Search" onkeyup="vod_series_page.searchValueChange()" onchange="vod_series_page.searchValueChange()" />' +
      '<span id="vod-series-search-icon">' +
      '<img src="images/svg/search-icon.svg" width="28">' +
      "</span>" +
      "</div>" +
      "</div>"
    );

    $("#vod-series-category-search-value").val("");
    document.getElementById('vod-series-search-input').placeholder = current_words['search'];
    current_route = "vod-series-page";
    this.current_movie_type = movie_type;

    if (movie_type === "vod") {
      this.current_model = VodModel;
      this.sort_key = "vod_sort";
      $(".movie_series_img").attr("src", "images/movie_icon.png");
      selectTopBarMenu(2);
      keys.top_bar_menu_selection = 2;
      var currentPageTitle = current_words["movies"];
      $(".current-page-title").text(currentPageTitle);
    } else {
      this.current_model = SeriesModel;
      this.sort_key = "series_sort";
      $(".movie_series_img").attr("src", "images/default_icon.png");
      selectTopBarMenu(3);
      var currentPageTitle = current_words["series"];
      $(".current-page-title").text(currentPageTitle);
      keys.top_bar_menu_selection = 3;
    }
    this.categories = MovieHelper.getCategories(movie_type, false, true);
    keys.focused_part = "category_selection";
    this.renderCategories();
    keys.category_selection = 0;
    this.current_render_count = 0;
    $("#vod-series-menus-container").html("");
    this.current_category_index = -1;

    for (var i = 0; i < this.categories.length; i++) {
      if (this.categories[i].movies.length > 0) {
        keys.category_selection = i;
        keys.selected_category_index = i;
        break;
      }
    }
    this.showCategoryContent();
    displayCurrentPage(current_route);
    this.initSortByNameIcons();
    this.initSortKey();
  },

  initSortKey: function () {
    var currentSortKey = this.current_movie_type == "vod" ? "vod_sort" : "series_sort";
    var index = 0;

    if (settings[currentSortKey] == "added") {
      index = 0;
    } else if (settings[currentSortKey] == "number") {
      index = 1;
    } else if (settings[currentSortKey] == "rating") {
      index = 2;
    } else if (settings[currentSortKey] == "name") {
      index = 3;
    }
    this.keys.sort_selection = index;
    this.focusSortItem(index);

    $("#sort-button").text($(this.sort_selection_doms[index]).text());
  },

  focusSortItem(index) {
    $(this.sort_selection_doms).removeClass("active");
    $(this.sort_selection_doms[index]).addClass("active");
  },

  initSortByNameIcons: function () {
    var vodSortKey = getLocalStorageData("vodSortKeyByName");
    var seriesSortKey = getLocalStorageData("SeriesSortKeyByName");
    if (vodSortKey === null)
      vodSortKey = 1;
    if (seriesSortKey === null)
      seriesSortKey = 1;

    var currentSortKey = this.current_movie_type === "vod" ? vodSortKey : seriesSortKey;

    if (currentSortKey === 1) {
      $(".sort-direction-icon").attr("src", "images/svg/sort_dsc.svg");
    } else
      $(".sort-direction-icon").attr("src", "images/svg/sort_asc.svg");
  },

  goBack: function () {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "sort_selection":
        keys.focused_part = "menu_selection";
        $("#sort-modal-container").hide();
        var sort_selection_doms = this.sort_selection_doms;
        $(sort_selection_doms).removeClass("active");
        break;
      case "sort_button":
        $("#sort-modal-container").hide();
        keys.focused_part = "sort_selection";
        $("#sort-button-container").addClass("active");
        break;
      case "menu_selection":
      case "topBarMenu":
      case "category_selection":
      case "categorySearchSelection":
      case "sortByNameSelection":
        hideVodSeriesPage();
        goToHomePage();
        break;
    }
  },
  selectCategory: function () {
    var keys = this.keys;
    $(".vod-series-category-item").removeClass("selected");
    this.category_doms = $(".vod-series-category-item");
    $(this.category_doms[keys.category_selection]).addClass("selected");
    moveScrollPosition(
      $("#vod-series-categories-container"),
      this.category_doms[keys.category_selection],
      "vertical",
      false
    );
  },

  setSortKey: function () {
    var index = 0;

    var current_sort_key =
      this.current_movie_type == "vod" ? "vod_sort" : "series_sort";
    if (settings[current_sort_key] == "added") {
      index = 0;
    } else if (settings[current_sort_key] == "number") {
      index = 1;
    } else if (settings[current_sort_key] == "rating") {
      index = 2;
    } else if (settings[current_sort_key] == "name") {
      index = 3;
    }
    this.keys.sort_selection = index;
  },

  showCategoryContent: function () {
    var keys = this.keys;
    if (this.current_category_index === keys.category_selection) return;

    var category = this.categories[keys.category_selection];
    this.selectCategory();
    this.movies = category.movies;
    if (this.movies.length === 0) {
      var noMovies = this.current_movie_type == "vod" ? current_words['no_movies'] : current_words["no_series"];
      showToast(noMovies, "");
      return;
    } else {
      this.current_render_count = 0;
      this.prev_keyword = "";
      var category_name = category.category_name;
      $("#vod-series-menus-container").html("");
      $("#vod-series-search-input").val("");


      var translatedCategoryName = "";
      if (category.category_id === "all") {
        translatedCategoryName = current_words['all'];
      } else if (category.category_id === "recent") {
        translatedCategoryName = current_words['resume_to_watch'];
      } else if (category.category_id === "favorite") {
        translatedCategoryName = current_words['favorites'];
      } else
        translatedCategoryName = category.category_name;

      $("#all-vod-counter").innerHTML = "";
      var allVod = "" + translatedCategoryName + " (" + this.movies.length + ")";
      $("#all-vod-counter").html(allVod);

      this.renderCategoryContent('init');
      $("#vod-series-menus-container").scrollTop(0);

      keys.menu_selection = 0;
      this.current_category_index = keys.category_selection;
      $("#vod-series-current-category").text(category.category_name);
    }
  },

  sortMovies: function () {
    var that = this;
    var keys = this.keys;
    var current_sort_key =
      this.current_movie_type == "vod" ? "vod_sort" : "series_sort";
    if (that.movies.length) {
      this.movies = getSortedMovies(that.movies, settings[current_sort_key], that.current_movie_type);
      var vodSortKey = getLocalStorageData("vodSortKeyByName");

      var seriesSortKey = getLocalStorageData("SeriesSortKeyByName");
      if (this.current_movie_type === "vod") {
        if (vodSortKey === null) {
          vodSortKey = 1;
        }
      } else {
        if (seriesSortKey === null) {
          seriesSortKey = 1;
        }
      }

      $("#sort-button").text($(this.sort_selection_doms[keys.sort_selection]).text());

      var currentSortKeyByName = this.current_movie_type == "vod" ? vodSortKey : seriesSortKey;
      this.movies = getSortedMoviesByName(this.movies, settings[current_sort_key], currentSortKeyByName);
      return this.movies;
    }
  },

  renderCategoryContentByName: function () {
    var that = this;
    var htmlContents = "";
    var default_icon = "images/default_bg.png";
    var movie_key = "stream_icon";
    var movie__type = this.current_movie_type;
    if (this.current_movie_type !== "vod") movie_key = "cover";

    vod_series_page.current_render_count = 0;
    vod_series_page.render_count_increment = 40;

    if (this.current_render_count < this.movies.length) {
      showLoader(true);
      var that = this;
      var streamIds = getStreamIds(this.current_model.favorite_ids, this.current_movie_type);

      this.movies
        .slice(
          this.current_render_count,
          this.current_render_count + this.render_count_increment
        )
        .map(function (movie, index) {
          var is_favorite = streamIds.includes(
            movie[that.current_model.movie_key]
          );

          if (
            typeof that.current_model.saved_video_times[movie.stream_id] !=
            "undefined"
          ) {
            if (that.current_model.saved_video_times[movie.stream_id].resume_time / 1000 >= resumeThredholdTime) {
              var width_ = that.current_model.saved_video_times[movie.stream_id].resume_time / that.current_model.saved_video_times[movie.stream_id].duration * 100;
            } else {
              var width_ = 0;
            }
          } else {
            var width_ = 0;
          }

          var rating = movie.rating_5based !== undefined ? movie.rating_5based : 0;

          htmlContents +=
            '<div class="vod-series-menu-item-container" data-stream_id="' +
            (movie__type == "vod" ? movie.stream_id : movie.series_id) +
            '" ' +
            'data-index="' +
            (that.current_render_count + index) +
            '" ' +
            'onmouseenter="vod_series_page.hoverMovieItem(this)" ' +
            'onclick="vod_series_page.handleMenuClick()">' +
            '<div class="vod-series-menu-item">' +
            '<div class="rating-badge">' + rating + '</div>' +
            (is_favorite
              ? '<div class="favorite-badge"><i><img src="images/star-yellow.png" width="32" height="32" /></i></div>'
              : "") +
            '<img class="vod-series-icon" src="' +
            movie[movie_key] +
            '" onerror="this.src=\'' +
            default_icon +
            '\'" />' +
            '<div class="vod-series-menu-item-title-wrapper">' +
            '<div class="resume-progressbar-wrapper ' + (width_ === 0 ? " no-bk" : "") + '">' +
            '<div class="resume-progress-bar" style="width:' + width_ + '%"></div></div>' +
            '<div class="vod-series-menu-item-title max-line-2">' +
            movie.name +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        });
      this.current_render_count += this.render_count_increment;
      $("#vod-series-menus-container").append(htmlContents);

      this.menu_doms = $(
        "#vod-series-menus-container .vod-series-menu-item-container"
      );
      this.keys.menu_selection = 0
      this.hoverMovieItem(this.menu_doms[this.keys.menu_selection]);
      setTimeout(function () {
        showLoader(false);
      }, 1000);

    }
  },

  renderCategoryContent: function (status) {
    var that = this;
    var keys = this.keys;
    var htmlContents = "";
    var default_icon = "images/default_bg.png";
    var movie_key = "stream_icon";
    var movie__type = this.current_movie_type;
    if (this.current_movie_type !== "vod") movie_key = "cover";

    this.movies = this.sortMovies();

    this.movies = this.movies.filter(function (movie) {
      if (!movie.name) return false;

      var lowerCaseName = movie.name.toLowerCase();
      return (!hasWord(lowerCaseName));
    });

    if (this.current_render_count < this.movies.length) {
      showLoader(true);
      var that = this;
      var streamIds = getStreamIds(this.current_model.favorite_ids, this.current_movie_type);

      this.movies
        .slice(
          this.current_render_count,
          this.current_render_count + this.render_count_increment
        )
        .map(function (movie, index) {
          var is_favorite = streamIds.includes(
            movie[that.current_model.movie_key]
          );

          if (
            typeof that.current_model.saved_video_times[movie.stream_id] !=
            "undefined"
          ) {
            if (that.current_model.saved_video_times[movie.stream_id].resume_time / 1000 >= resumeThredholdTime) {
              var width_ = that.current_model.saved_video_times[movie.stream_id].resume_time / that.current_model.saved_video_times[movie.stream_id].duration * 100;
            } else {
              var width_ = 0;
            }
          } else {
            var width_ = 0;
          }

          var rating = movie.rating_5based !== undefined ? movie.rating_5based : 0;

          htmlContents +=
            '<div class="vod-series-menu-item-container" data-stream_id="' +
            (movie__type == "vod" ? movie.stream_id : movie.series_id) +
            '" ' +
            'data-index="' +
            (that.current_render_count + index) +
            '" ' +
            'onmouseenter="vod_series_page.hoverMovieItem(this)" ' +
            'onclick="vod_series_page.handleMenuClick()">' +
            '<div class="vod-series-menu-item">' +
            '<div class="rating-badge">' + rating + '</div>' +
            (is_favorite
              ? '<div class="favorite-badge"><i><img src="images/star-yellow.png" width="32" height="32" /></i></div>'
              : "") +
            '<img class="vod-series-icon" src="' +
            movie[movie_key] +
            '" onerror="this.src=\'' +
            default_icon +
            '\'" />' +
            '<div class="vod-series-menu-item-title-wrapper">' +
            '<div class="resume-progressbar-wrapper ' + (width_ === 0 ? " no-bk" : "") + '">' +
            '<div class="resume-progress-bar" style="width:' + width_ + '%"></div></div>' +
            '<div class="vod-series-menu-item-title max-line-2">' +
            movie.name +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>';

        });
      this.current_render_count += this.render_count_increment;
      $("#vod-series-menus-container").append(htmlContents);
      if (status === 'init') {
        this.menu_doms = $(
          "#vod-series-menus-container .vod-series-menu-item-container"
        );
        keys.menu_selection = 0
        this.hoverMovieItem(this.menu_doms[keys.menu_selection]);
        $(".vod-series-category-item").removeClass("active");
      }

      setTimeout(function () {
        showLoader(false);
      }, 1000);

    }
  },
  addOrRemoveFav: function () {
    var keys = this.keys;
    if (keys.focused_part !== "menu_selection") return;
    var menu_doms = this.menu_doms;
    var movies = this.movies;
    var movie_id_key = this.current_model.movie_key;
    var streamIds = getStreamIds(this.current_model.favorite_ids, this.current_movie_type);

    if (!streamIds.includes(movies[keys.menu_selection][movie_id_key])) {
      $(
        $(menu_doms[keys.menu_selection]).find(".vod-series-menu-item")
      ).prepend(
        '<div class="favorite-badge"><i><img src="images/star-yellow.png" width="32" height="32" /></i></div>'
      );
      MovieHelper.addRecentOrFavoriteMovie(
        this.current_movie_type,
        movies[keys.menu_selection],
        "favorite"
      );
    } else {
      $($(menu_doms[keys.menu_selection]).find(".favorite-badge")).remove();
      MovieHelper.removeRecentOrFavoriteMovie(
        this.current_movie_type,
        movies[keys.menu_selection][movie_id_key],
        "favorite"
      );
      var category = this.categories[this.current_category_index];
      if (category.category_id === "favorite") {
        $(menu_doms[keys.menu_selection]).remove();
        var menu_doms = $(
          "#vod-series-menus-container .vod-series-menu-item-container"
        );
        if (menu_doms.length > 0) {
          menu_doms.map(function (index, item) {
            $(item).data("index", index);
          });
          this.menu_doms = menu_doms;
          if (keys.menu_selection >= this.menu_doms.length)
            keys.menu_selection = this.menu_doms.length - 1;
          this.hoverMovieItem(this.menu_doms[keys.menu_selection]);
        } else this.hoverCategory(this.category_doms[keys.category_selection]);
      }
    }
  },

  hoverCategorySearchBar: function () {
    this.keys.focused_part = "categorySearchSelection";
    $(".vod-series-category-item").removeClass("active");
    $(this.prev_dom).removeClass("active");
    $(".vod-series-page-category-search-wrapper").addClass("active");
    this.prev_dom = $('.vod-series-page-category-search-wrapper');
    this.unfocusVodSeriesSearchBar();
    $('#vod-series-search-bar').removeClass('active');
  },

  unFocusCategorySearchBar: function () {
    $(".vod-series-page-category-search-wrapper").removeClass("active");
    $(".vod-series-page-category-search-wrapper").removeClass("selected");
    $("#vod-series-category-search-value").blur();
  },

  unfocusVodSeriesSearchBar: function () {
    // $('#vod-series-search-bar').removeClass('active');
    $("#vod-series-search-input").blur();
  },

  showSortKeyModal: function () {
    var keys = this.keys;
    var sort_selection_doms = this.sort_selection_doms;
    $(sort_selection_doms).removeClass("active");
    $(sort_selection_doms[keys.sort_selection]).addClass("active");
    $("#sort-modal-container").show();
  },

  nameSort: function () {
    var keys = this.keys;
    var vodSortKey = getLocalStorageData("vodSortKeyByName");
    var seriesSortKey = getLocalStorageData("SeriesSortKeyByName");
    if (this.current_movie_type === "vod") {
      if (vodSortKey === null) {
        vodSortKey = 1;
      }
      var newVodSortKey = vodSortKey === 1 ? -1 : 1;
      saveToLocalStorage("vodSortKeyByName", newVodSortKey);
    } else {
      if (seriesSortKey === null) {
        seriesSortKey = 1;
      }
      var newSeriesSortKey = seriesSortKey === 1 ? -1 : 1;
      saveToLocalStorage("SeriesSortKeyByName", newSeriesSortKey);
    }

    var currentSortKey = this.current_movie_type === "vod" ? newVodSortKey : newSeriesSortKey;

    if (currentSortKey === 1) {
      $(".sort-direction-icon").attr("src", "images/svg/sort_dsc.svg");
    } else
      $(".sort-direction-icon").attr("src", "images/svg/sort_asc.svg");

    var sortKeyName = "added";
    if (keys.sort_selection === 0)
      sortKeyName = "added";
    else if (keys.sort_selection === 1)
      sortKeyName = "number";
    else if (keys.sort_selection === 2)
      sortKeyName = "rating";
    else if (keys.sort_selection === 3)
      sortKeyName = "name";
    this.changeSortKey(sortKeyName, keys.sort_selection);

    var currentSortKeyByName =
      this.current_movie_type == "vod" ? newVodSortKey : newSeriesSortKey;

    this.movies = getSortedMoviesByName(this.movies, sortKeyName, currentSortKeyByName);
    $("#vod-series-menus-container").html("");
    this.renderCategoryContentByName();
  },

  changeSortKey: function (key, index) {
    this.current_render_count = 0;

    var keys = this.keys;
    var current_sort_key =
      this.current_movie_type == "vod" ? "vod_sort" : "series_sort";
    $("#sort-modal-container").hide();
    if (settings[current_sort_key] != key) {
      keys.sort_selection = index;
      $(this.sort_selection_doms).removeClass("active");
      $(this.sort_selection_doms[index]).addClass("active");
      settings.saveSettings(current_sort_key, key, "");
      var movie_type = this.current_movie_type;
      this.movies = getSortedMovies(this.movies, key, movie_type);

      var vodSortKey = getLocalStorageData("vodSortKeyByName");
      var seriesSortKey = getLocalStorageData("SeriesSortKeyByName");
      if (this.current_movie_type === "vod") {
        if (vodSortKey === null) {
          vodSortKey = 1;
        }
      } else {
        if (seriesSortKey === null) {
          seriesSortKey = 1;
        }
      }
      var currentSortKeyByName =
        this.current_movie_type == "vod" ? vodSortKey : seriesSortKey;
      var sortKeyName = "added";
      if (keys.sort_selection === 0)
        sortKeyName = "added";
      else if (keys.sort_selection === 1)
        sortKeyName = "number";
      else if (keys.sort_selection === 2)
        sortKeyName = "rating";
      else if (keys.sort_selection === 3)
        sortKeyName = "name";

      this.movies = getSortedMoviesByName(this.movies, sortKeyName, currentSortKeyByName);

      $("#vod-series-menus-container").html("");
      this.renderCategoryContent("");

      if (this.movies.length > 0) {
        keys.focused_part = "menu_selection";
        keys.menu_selection = 0;
        $("#sort-button-container").removeClass("active");
        this.hoverMovieItemSort();
      }
      $("#sort-button").text($(this.sort_selection_doms[index]).text());
      $("#vod-series-menus-container").scrollTop(0);
    } else {
      keys.focused_part = "menu_selection";
      keys.menu_selection = 0;
      $("#sort-button-container").removeClass("active");
      this.hoverMovieItemSort();
    }
  },

  hoverSortKeyModal: function () {
    var keys = this.keys;
    keys.focused_part = "sort_selection";
    $(this.prev_dom).removeClass("active");
    this.unFocusTopMenuBar();
    $('#vod-series-search-bar').removeClass('active');
    // this.unfocusVodSeriesSearchBar();
    $("#sort-button-container").addClass("active");
    this.prev_dom = $("#sort-button-container");
  },
  hoverChangeSortKey: function (index) {
    var keys = this.keys;
    keys.focused_part = "sort_button";
    keys.sort_selection = index;
    $(this.prev_dom).removeClass("active");
    var sort_selection_doms = this.sort_selection_doms;
    $(sort_selection_doms).removeClass("active");
    $(sort_selection_doms[keys.sort_selection]).addClass("active");
    this.prev_dom = $(sort_selection_doms[keys.sort_selection]);
  },
  searchValueChange: function () {
    clearTimeout(this.search_key_timer);
    var that = this;
    this.search_key_timer = setTimeout(function () {
      var search_value = $("#vod-series-search-input").val();
      if (that.prev_keyword === search_value) return;
      var category = that.categories[that.current_category_index];
      var current_movies = JSON.parse(JSON.stringify(category.movies));
      current_movies.sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
      var filtered_movies = [];
      if (search_value === "") {
        filtered_movies = current_movies;
      } else {
        search_value = search_value.toLowerCase();
        filtered_movies = current_movies.filter(function (movie) {
          return movie.name.toLowerCase().includes(search_value);
        });
      }
      that.movies = filtered_movies;

      $("#vod-series-menus-container").html("");
      that.current_render_count = 0;
      that.movies = getSortedMovies(that.movies, that.keys.sort_selection, that.current_movie_type);
      that.renderCategoryContent("");
      that.prev_keyword = search_value;
    }, this.search_key_timout);
  },

  hoverCategory: function (targetElement) {
    var keys = this.keys;
    var index = $(targetElement).data("index");
    keys.focused_part = "category_selection";
    keys.category_selection = index;
    // this.unFocusCategorySearchBar();
    $(".vod-series-menu-item-container").removeClass("active");
    $(".vod-series-category-item").removeClass("active");
    $("#sort-button-container").removeClass("active");
    this.unFocusTopMenuBar();
    $(this.prev_dom).removeClass("active");
    $(this.category_doms[index]).addClass("active");
    this.prev_dom = this.category_doms[index];
    moveScrollPosition(
      $("#vod-series-categories-container"),
      this.category_doms[index],
      "vertical",
      false
    );
  },
  hoverMovieItemSort: function () {
    var keys = this.keys;
    keys.focused_part = "menu_selection";
    keys.menu_selection = 0;
    $(this.prev_dom).removeClass("active");
    // this.unFocusCategorySearchBar();
    this.menu_doms = $(
      "#vod-series-menus-container .vod-series-menu-item-container"
    );
    $(this.menu_doms[0]).addClass("active");
    this.prev_dom = this.menu_doms[0];
    clearTimeout(this.channel_hover_timer);

    moveScrollPosition(
      $("#vod-series-menus-container"),
      this.menu_doms[0],
      "vertical",
      false
    );
  },

  unfocusSortBar: function () {
    $("#sort-button-container").removeClass("active");
  },

  unFocusTopMenuBar: function () {
    $(".top-menu-titles").removeClass('active');
  },

  hoverMovieItem: function (targetElement) {
    var index = $(targetElement).data("index");
    var keys = this.keys;
    keys.focused_part = "menu_selection";
    keys.menu_selection = index;
    $('#vod-series-search-bar').removeClass('active');
    // this.unfocusVodSeriesSearchBar();
    this.unfocusSortBar();
    // this.unFocusCategorySearchBar();
    this.unFocusTopMenuBar();
    this.menu_doms = $("#vod-series-menus-container .vod-series-menu-item-container");
    $("#name-sort-container").removeClass("active");
    $(".vod-series-category-item").removeClass("active");
    $(this.menu_doms).removeClass("active");
    $(this.menu_doms[index]).addClass("active");
    this.prev_dom = this.menu_doms[index];
    clearTimeout(this.channel_hover_timer);
    moveScrollPosition(
      $("#vod-series-menus-container"),
      this.menu_doms[keys.menu_selection],
      "vertical",
      false
    );
    if (keys.menu_selection >= this.current_render_count - 5)
      this.renderCategoryContent("");
  },
  hoverSearchItem: function () {
    var keys = this.keys;
    keys.top_bar_menu_selection = 1;
    keys.focused_part = "topBarMenu";
    this.unFocusTopMenuBar();
    this.unFocusCategorySearchBar();
    $(this.prev_dom).removeClass("active");
    $("#vod-series-search-bar").addClass("active");
    this.prev_dom = this.search_input_dom;
  },

  categorySearchValueChange: function () {
    clearTimeout(this.category_search_key_timer);
    var that = this;
    var categories = MovieHelper.getCategories(that.current_movie_type, false, true);
    this.category_search_key_timer = setTimeout(function () {
      var search_value = $("#vod-series-category-search-value").val();
      if (that.prev_keyword === search_value) return;
      if (search_value !== "") {
        var filteredCategories = categories.filter(function (category) {
          return category.category_name.toLowerCase().includes(search_value);
        })
        that.categories = filteredCategories;
        that.renderCategories()
      } else {
        that.categories = categories;
        that.renderCategories();
      }

      that.prev_keyword = search_value;
    }, this.category_search_key_timer);
  },

  renderCategories: function () {
    var htmlContent = "";
    this.categories.map(function (item, index) {
      var translatedCategoryName = "";
      if (item.category_id === "all") {
        translatedCategoryName = current_words['all'];
      } else if (item.category_id === "recent") {
        translatedCategoryName = current_words['resume_to_watch'];
      } else if (item.category_id === "favorite") {
        translatedCategoryName = current_words['favorites'];
      } else
        translatedCategoryName = item.category_name;

      htmlContent +=
        '<div class="vod-series-category-item" data-index="' +
        index +
        '"' +
        '   onmouseenter="vod_series_page.hoverCategory(this)" ' +
        '   onclick="vod_series_page.handleMenuClick()"' +
        "> " +
        '<div class = "vod-series-category-name">' +
        translatedCategoryName +
        "</div>" +
        '<div class = "vod-series-category-length' + (item.category_id === "favorite" ? " fav-category-length" : item.category_id === "recent" ? " recent-category-length" : "") + '">' +
        item.movies.length +
        "</div>" +
        "</div>";
    });
    $("#vod-series-categories-container").html(htmlContent);
    this.category_doms = $(".vod-series-category-item");
  },

  handleMenuClick: function () {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
        var selectedCategoryID = this.categories[keys.category_selection].category_id;

        if (this.current_movie_type === "vod") {
          current_movie = this.movies[keys.menu_selection];
          if (keys.selected_category_index == 0) {
            vod_summary_variables.showMovie();
          } else {
            if (selectedCategoryID === "all") {
              var is_adult = checkForAdultByVideo(current_movie.category_id, this.categories)
              if (is_adult)
                parent_confirm_page.init(current_route, 'all', 'vod');
              else
                vod_summary_variables.init("vod-series-page");
            } else
              vod_summary_variables.init("vod-series-page");
          }
        } else {
          current_series = this.movies[keys.menu_selection];

          if (selectedCategoryID === "all") {
            var is_adult = checkForAdultByVideo(current_series.category_id, this.categories)
            if (is_adult)
              parent_confirm_page.init(current_route, 'all', 'series');
            else
              series_summary_page.init("vod-series-page");
          } else
            series_summary_page.init("vod-series-page");
        }
        break;
      case "category_selection":
        var category = this.categories[keys.category_selection];
        if (this.current_category_index == keys.category_selection) return;
        var is_adult = checkForAdult(category, "category", []);
        if (is_adult) {
          parent_confirm_page.init(current_route, '', '');
          return;
        }
        keys.selected_category_index = keys.category_selection;
        this.showCategoryContent();
        break;
      case "sort_selection":
        $("#sort-button-container").trigger("click");
        keys.focused_part = "sort_button";
        break;
      case "sort_button":
        var sort_selection_doms = this.sort_selection_doms;
        $(sort_selection_doms[keys.sort_selection]).trigger("click");
        break;
      case "topBarMenu":
        if (keys.top_bar_menu_selection === 1) {
          $("#vod-series-search-input").focus();
          setSelectionRange($("#vod-series-search-input"));
          $("#vod-series-category-search").addClass("selected");
        } else {
          current_route = "home-page";
          $(this.topMenuDoms[keys.top_bar_menu_selection]).trigger("click");
        }
        break;
      case "sortByNameSelection":
        this.nameSort();
        break;
      case "categorySearchSelection":
        $("#vod-series-category-search-value").focus();
        setSelectionRange($("#vod-series-category-search-value"));
        $(".vod-series-page-category-search-wrapper").addClass("selected");
        break;
    }
  },
  hoverTopMenuBar: function () {
    var keys = this.keys;
    keys.focused_part = "topBarMenu";
    $(".channel-page-category-item").removeClass("active");
    $(".channel-menu-item ").removeClass("active");
    $("#name-sort-container").removeClass("active");
    activeTopBarMenu(keys.top_bar_menu_selection);
  },

  removeCategoryFucus: function () {
    $('.vod-series-category-item').removeClass('active');
  },

  hoverNameSort: function () {
    this.keys.focused_part = "sortByNameSelection";
    $(this.prev_dom).removeClass("active");
    $("#name-sort-container").addClass("active");
    this.prev_dom = $("#name-sort-container");
  },

  hoverTopBarMenu: function (index) {
    var keys = this.keys;
    $('#vod-series-search-bar').removeClass('active');
    // this.unFocusCategorySearchBar();
    // this.unfocusVodSeriesSearchBar();
    keys.focused_part = "topBarMenu";
    keys.top_bar_menu_selection = index;
    $("#sort-button-container").removeClass("active");
    $("#vod-series-search-bar").removeClass("active");
    $(this.topMenuDoms).removeClass("active");
    $(this.prev_dom).removeClass("active");
    this.prev_dom = this.topMenuDoms[index];
    $(this.topMenuDoms[index]).addClass("active");
  },

  handleMenusUpDown: function (increment) {
    var keys = this.keys;
    var menus = this.menu_doms;
    switch (keys.focused_part) {
      case "category_selection":
        keys.category_selection += increment;
        if (keys.category_selection < 0) {
          keys.category_selection = 0;
          this.current_category_index = -1;
          $(".vod-series-category-item").removeClass("active");
          this.hoverCategorySearchBar();
          return;
        }
        if (keys.category_selection >= this.category_doms.length) {
          keys.category_selection = this.category_doms.length - 1;
          return;
        }
        this.hoverCategory(this.category_doms[keys.category_selection]);
        break;
      case "menu_selection":
        if (keys.menu_selection > -1 && keys.menu_selection < 5) {
          if (increment < 0) {
            keys.focused_part = "sort_selection";
            $("#sort-button-container").addClass("active");
            $(".vod-series-menu-item-container").removeClass("active");
            return;
          } else {
            keys.menu_selection += 5 * increment;
            if (keys.menu_selection >= menus.length)
              keys.menu_selection = menus.length - 1;
            if (keys.menu_selection >= this.current_render_count - 5)
              this.renderCategoryContent("");
            this.hoverMovieItem(this.menu_doms[keys.menu_selection]);
          }
        } else {
          keys.menu_selection += 5 * increment;
          if (keys.menu_selection >= menus.length)
            keys.menu_selection = menus.length - 1;
          if (keys.menu_selection >= this.current_render_count - 5)
            this.renderCategoryContent("");
          this.hoverMovieItem(this.menu_doms[keys.menu_selection]);
        }
        break;
      case "categorySearchSelection":
        if (increment > 0) {
          keys.focused_part = "category_selection";
          keys.category_selection = 0;
          this.hoverCategory(this.category_doms[keys.category_selection]);
        } else {
          keys.focused_part = "topBarMenu";
          this.unFocusCategorySearchBar();
          keys.top_bar_menu_selection = 0;
          this.hoverTopMenuBar();
        }
        break;
      case "sort_button":
        $("#sort-button-container").addClass("active");
        $(".vod-series-menu-item-container").removeClass("active");
        keys.sort_selection += increment;
        if (keys.sort_selection < 0 || keys.sort_selection > this.sort_selection_doms.length - 1) {
          keys.sort_selection = 0;
        }
        this.hoverChangeSortKey(keys.sort_selection);
        break;
      case "sort_selection":
      case "sortByNameSelection":
        $("#sort-button-container").removeClass("active");
        $("#name-sort-container").removeClass("active");
        if (increment < 0) {
          keys.focused_part = "topBarMenu";
          // this.unFocusCategorySearchBar();
          keys.top_bar_menu_selection = 0;
          this.hoverTopMenuBar();
          // keys.top_bar_menu_selection = 3;
          // this.hoverTopMenuBar();
          // return;
        } else {
          this.keys.focused_part = "menu_selection";
          $(".vod-series-menu-item-container").removeClass("active");
          $(this.menu_doms[keys.menu_selection]).addClass("active");
          return;
        }
        break;
      case "topBarMenu":
        if (increment > 0) {
          $("#vod-series-search-input").blur();
          $("#vod-series-search-bar").removeClass("active");
          keys.focused_part = "sort_selection";
          $("#sort-button-container").addClass("active");
          $(".vod-series-menu-item-container").removeClass("active");
        }
        break;
    }
  },

  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "category_selection":
        if (increment > 0) {
          if (this.movies.length > 0)
            this.hoverMovieItem(this.menu_doms[keys.menu_selection]);
        } else {
          keys.focused_part = "topBarMenu";
          $(".vod-series-category-item").removeClass("active");
          // this.unFocusCategorySearchBar();
          keys.top_bar_menu_selection = 0;
          this.hoverTopMenuBar();
        }
        break;
      case "menu_selection":
        if (keys.menu_selection % 5 == 0 && increment < 0) {
          this.hoverCategory(this.category_doms[keys.category_selection]);
          return;
        }
        keys.menu_selection += increment;
        if (keys.menu_selection < 0) {
          keys.menu_selection = 0;
          this.hoverCategory(this.category_doms[keys.category_selection]);
          return;
        }
        if (keys.menu_selection >= this.menu_doms.length)
          keys.menu_selection = this.menu_doms.length - 1;

        this.hoverMovieItem(this.menu_doms[keys.menu_selection]);
        if (
          increment > 0 &&
          keys.menu_selection >= this.current_render_count - 5
        )
          this.renderCategoryContent("");
        break;
      case "categorySearchSelection":
        if (increment > 0) {
          if (this.movies.length > 0)
            this.hoverMovieItem(this.menu_doms[keys.menu_selection]);
        } else {
          keys.focused_part = "topBarMenu";
          $(".vod-series-category-item").removeClass("active");
          // this.unFocusCategorySearchBar();
          keys.top_bar_menu_selection = 0;
          this.hoverTopMenuBar();
        }
        break;
      case "topBarMenu":
        if (!isKeyboard) {
          keys.top_bar_menu_selection += increment;
          if (keys.top_bar_menu_selection === -1) {
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
      case "sort_selection":
        if (increment < 0) {
          $("#sort-button-container").removeClass("active");
          keys.focused_part = "category_selection";
          keys.category_selection = 0;
          $(".back-button").removeClass("active");
          $(".search-button").removeClass("active");
          this.hoverCategory(this.category_doms[keys.category_selection]);
          return;
        } else {
          $("#sort-button-container").removeClass("active");
          keys.focused_part = "sortByNameSelection";
          this.hoverNameSort();
        }
        break;
      case "sortByNameSelection":
        if (increment < 0) {
          keys.focused_part = "sort_selection";
          $("#sort-button-container").addClass("active");
          $(".vod-series-menu-item-container").removeClass("active");
          $("#name-sort-container").removeClass("active");
        }
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
      case tvKey.CH_UP:
        this.showNextChannel(1);
        break;
      case tvKey.CH_DOWN:
        this.showNextChannel(-1);
        break;
      case tvKey.RETURN:
        this.goBack();
        break;
      case tvKey.YELLOW:
        this.addOrRemoveFav();
        break;
      case tvKey.BLUE:
        break;
      case tvKey.PAUSE:
        break;
      case tvKey.RED:
        // home_page.init();
        break;
      default:
        console.log("No matching");
    }
  }
};
