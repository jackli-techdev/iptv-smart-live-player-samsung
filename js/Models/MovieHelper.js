"use strict";
var MovieHelper = {
  favorite_insert_position: "after",
  recent_insert_position: "before",
  init: function (stream_type) {
    var current_model = getCurrentModel(stream_type);
    current_model.movies = [];
    current_model.categories = [];
    if (stream_type === "live") {
      current_model.programmes = {};
      current_model.programme_saved = false;
    }
  },
  setCategories: function (stream_type, categories) {
    var current_model = getCurrentModel(stream_type);
    var temps = getLocalStorageData(settings.playlist.id + "_saved_" + stream_type + "_times");
    if (temps) current_model.saved_video_times = temps;
    var hidden_categories = getLocalStorageData(settings.playlist.id + stream_type + "_hiddens");
    hidden_categories =
      hidden_categories == null ? [] : hidden_categories;
    categories.map(function (category) {
      category.is_hide = hidden_categories.includes(category.category_id);
    });
    current_model.categories = categories;
  },
  saveVideoTime: function (stream_type, stream_id, time, duration) {
    var current_model = getCurrentModel(stream_type);
    var saved_video_times = current_model.saved_video_times;

    if (stream_type === "vod") {
      saved_video_times[stream_id.toString()] = {
        resume_time: time,
        duration: duration
      };
      if (time / 1000 > resumeThredholdTime) {
        $($("#vod-series-menus-container .resume-progress-bar")[vod_series_page.keys.menu_selection]).css({ "width": time / duration * 100 + "%" });
        $($("#vod-series-menus-container .resume-progressbar-wrapper")[vod_series_page.keys.menu_selection]).removeClass("no-bk");
      } else {
        $($("#vod-series-menus-container .resume-progress-bar")[vod_series_page.keys.menu_selection]).css({ "width": 0 });
        $($("#vod-series-menus-container .resume-progressbar-wrapper")[vod_series_page.keys.menu_selection]).addClass("no-bk");
        $($("#vod-series-menus-container .resume-progressbar-wrapper")[vod_series_page.keys.menu_selection]).css({ "background": "transparent" });
      }
    } else {
      var savedOrder = Date.now();
      saved_video_times[stream_id.toString()] = {
        resume_time: time,
        duration: duration,
        order: savedOrder,
        seriesID: current_series.series_id,
        seasonIndex: series_summary_page.keys.season_selection,
        episodeIndex: series_summary_page.keys.episode_selection,
      };
    }

    current_model.saved_video_times = saved_video_times;

    saveToLocalStorage(settings.playlist.id + "_saved_" + stream_type + "_times", saved_video_times);
    if (stream_type == "vod") {
      if (time / 1000 >= resumeThredholdTime) {
        var categories = MovieHelper.getCategories("vod", false, false);
        if (!checkForAdult(current_movie, "movie", categories))
          MovieHelper.addRecentOrFavoriteMovie("vod", current_movie, "recent"); // Add To Recent Movies
      }
    }
  },
  removeVideoTime: function (stream_type, stream_id) {
    var current_model = getCurrentModel(stream_type);
    var saved_video_times = current_model.saved_video_times;
    delete saved_video_times[stream_id.toString()];
    current_model.saved_video_times = saved_video_times;
    saveToLocalStorage(settings.playlist.id + "_saved_" + stream_type + "_times", saved_video_times);
  },
  saveHiddenCategories: function (stream_type, index, is_hide) {
    var categories = this.getCategories(stream_type, true, false);
    categories[index].is_hide = is_hide;
    var category_id = categories[index].category_id;
    var hidden_category_ids = getLocalStorageData(settings.playlist.id + stream_type + "_hiddens");
    if (hidden_category_ids == null) hidden_category_ids = [];
    if (is_hide && !hidden_category_ids.includes(category_id))
      hidden_category_ids.push(category_id);
    else {
      if (hidden_category_ids.includes(category_id)) {
        for (var i = 0; i < hidden_category_ids.length; i++) {
          if (hidden_category_ids[i] == category_id) {
            hidden_category_ids.splice(i, 1);
            break;
          }
        }
      }
    }
    saveToLocalStorage(settings.playlist.id + stream_type + "_hiddens", hidden_category_ids);
  },

  savePlayerRatio: function (index, state) {
    var categories = this.getCategories(stream_type, true, false);

    categories[index].is_hide = is_hide;
    var category_id = categories[index].category_id;

    if (hidden_category_ids == null) hidden_category_ids = [];
    if (!is_hide && !hidden_category_ids.includes(category_id))
      // if hide category,
      hidden_category_ids.push(category_id);
    else {
      // if show category
      if (ratios.includes(category_id)) {
        for (var i = 0; i < hidden_category_ids.length; i++) {
          if (hidden_category_ids[i] == category_id) {
            hidden_category_ids.splice(i, 1);
            break;
          }
        }
      }
    }
  },

  saveClearHistoryMovies: function (stream_type, clearHistorySeriesIds) {
    var recent_movies_ids = getLocalStorageData(settings.playlist.id + stream_type + "_recent");
    if (stream_type === "vod") {
      var filtered = recent_movies_ids.filter(function (element) {
        return clearHistorySeriesIds.indexOf(element.stream_id) === -1;
      });
    }
    else {
      var filtered = recent_movies_ids.filter(function (element) {
        return clearHistorySeriesIds.indexOf(element.series_id) === -1;
      });
    }

    for (var i = 0; i < clearHistorySeriesIds.length; i++) {
      MovieHelper.removeRecentOrFavoriteMovie(
        stream_type,
        clearHistorySeriesIds[i],
        "recent"
      );
    }

    saveToLocalStorage(settings.playlist.id + stream_type + "_recent", filtered);
  },

  saveTimeFormat: function (format) {
    var current_model = getCurrentModel(stream_type);
    var categories = this.getCategories(stream_type, true, false);
    categories[index].is_hide = is_hide;
    var category_id = categories[index].category_id;
    var hidden_category_ids = getLocalStorageData(settings.playlist.id + stream_type + "_hiddens");
    if (hidden_category_ids == null) hidden_category_ids = [];
    if (!is_hide && !hidden_category_ids.includes(category_id))
      // if hide category,
      hidden_category_ids.push(category_id);
    else {
      // if show category
      if (hidden_category_ids.includes(category_id)) {
        for (var i = 0; i < hidden_category_ids.length; i++) {
          if (hidden_category_ids[i] == category_id) {
            hidden_category_ids.splice(i, 1);
            break;
          }
        }
      }
    }
    time_format = format;
  },
  getCategories: function (
    stream_type,
    include_hide_category,
    include_favorite_recent
  ) {
    var current_model = getCurrentModel(stream_type);
    var categories = current_model.categories.filter(function (category) {
      if (include_favorite_recent) {
        if (!include_hide_category) return !category.is_hide;
        else return true;
      } else {
        if (!include_hide_category)
          return (
            !category.is_hide &&
            category.category_id !== "favorite" &&
            category.category_id !== "recent"
          );
        else
          return (
            category.category_id !== "favorite" &&
            category.category_id !== "recent"
          );
      }
    });
    return categories;
  },

  setMovies: function (stream_type, movies) {
    var current_model = getCurrentModel(stream_type);
    current_model.movies = movies;
  },

  setEntireMovies: function (stream_type, movies) {
    if (stream_type === "live") {
      entireLives = movies;
      recentLives = entireLives.slice(0, 10);
    } else if (stream_type == "vod") {
      entireMovies = movies;
      recentMovies = entireMovies.slice(0, 10);
    } else if (stream_type == "series") {
      entireSeries = movies;
      recentSeries = entireSeries.slice(0, 10);
    }
  },

  insertMoviesToCategories: function (stream_type) {
    var current_model = getCurrentModel(stream_type);
    var movies = current_model.movies;
    var categories = current_model.categories;

    var hiddenCategoryIds = getLocalStorageData(settings.playlist.id + stream_type + "_hiddens");
    var allIsHide = (hiddenCategoryIds && hiddenCategoryIds.includes('all')) || (!hiddenCategoryIds);

    var recent_category = {
      category_id: "recent",
      category_name: "Recently Viewed",
      parent_id: 0,
      movies: [],
      catchups: [],
      is_hide: false
    };
    var favorite_category = {
      category_id: "favorite",
      category_name: "Favorites",
      parent_id: 0,
      movies: [],
      is_hide: false
    };
    var all_category = {
      category_id: "all",
      category_name: "All",
      parent_id: 0,
      movies: movies,
      catchups: stream_type === 'live' ? LiveModel.catchup : [],
      is_hide: allIsHide
    };
    var undefined_category = {
      category_id: "undefined",
      category_name: "Uncategorized",
      parent_id: 0,
      movies: [],
      is_hide: false
    };
    categories.push(undefined_category);
    var movie_id_key = current_model.movie_key;
    var recent_movie_ids = getLocalStorageData(settings.playlist.id + stream_type + "_recent");
    var favorite_movie_ids = getLocalStorageData(settings.playlist.id + stream_type + "_favorite");
    recent_movie_ids = recent_movie_ids == null ? [] : recent_movie_ids;
    favorite_movie_ids = favorite_movie_ids == null ? [] : favorite_movie_ids;
    current_model.favorite_ids = favorite_movie_ids;

    var recent_movies = [],
      favorite_movies = [];
    var that = this;
    var movies_map = {};
    var favorite_movie_ids_tmp = [];
    if (stream_type === "series") {
      favorite_movie_ids.map(function (fav_movie, index) {
        favorite_movie_ids_tmp[index] = fav_movie.series_id;
      });
    } else {
      favorite_movie_ids.map(function (fav_movie, index) {
        favorite_movie_ids_tmp[index] = fav_movie.stream_id;
      });
    }

    movies.map(function (movie) {
      if (
        typeof movie.category_id == "undefined" ||
        movie.category_id == "null" ||
        movie.category_id == null
      )
        movie.category_id = "undefined";
      var category_id = movie.category_id.toString();
      if (typeof movies_map[category_id] == "undefined") {
        movies_map[category_id] = [movie];
      } else {
        movies_map[category_id].push(movie);
      }
      movie.is_recent = false;
      if (recent_movie_ids.includes(movie[movie_id_key])) {
        if (that.recent_insert_position === "before")
          recent_movies.unshift(movie);
        else recent_movies.push(movie);
        movie.is_recent = true;
      }
      if (favorite_movie_ids_tmp.includes(movie[movie_id_key])) {
        if (that.favorite_insert_position === "before")
          favorite_movies.unshift(movie);
        else favorite_movies.push(movie);
      }
    });
    for (var i = 0; i < categories.length; i++) {
      var category_id = categories[i].category_id.toString();
      categories[i].movies =
        typeof movies_map[category_id] == "undefined"
          ? []
          : movies_map[category_id];
    }
    //get epg contained channels
    if (stream_type === 'live') {
      var catchupData = LiveModel.catchup;
      if (catchupData !== undefined) {
        catchupData.forEach(function (catchup) {
          var category = categories.find(function (category) {
            return category.category_id === catchup.category_id;
          });

          if (category) {
            if (!category.catchups) {
              category.catchups = [];
            }
            category.catchups.push(catchup);
          }
        });
      }

    }
    recent_category.movies = recent_movie_ids;
    favorite_category.movies = favorite_movies;
    categories.unshift(favorite_category);
    if (stream_type == "live") {
      categories.unshift(all_category);
      categories.unshift(recent_category);
    } else if (stream_type == "vod") {
      recent_category.category_name = "Resume to watch";
      categories.unshift(all_category);
      categories.unshift(recent_category); //resume all
    } else {
      recent_category.category_name = "Recently Viewed";
      categories.unshift(all_category);
      categories.unshift(recent_category); //recently viewed
    }

    for (var i = 0; i < categories.length; i++) {
      if (categories[i].category_id === "undefined") {
        if (categories[i].movies.length == 0) {
          categories.splice(i, 1);
        }
        break;
      }
    }
    current_model.categories = categories;
    current_model.movies = [];
  },

  getRecentOrFavoriteCategoryPosition: function (kind) {
    return kind === "favorite" ? 2 : 0;
  },

  getRecentOrFavoriteCategory: function (stream_type, kind) {
    var current_model = getCurrentModel(stream_type);
    var category_index = this.getRecentOrFavoriteCategoryPosition(kind);

    return current_model.categories[category_index];
  },
  setRecentOrFavoriteMovies: function (stream_type, movies, kind) {
    var current_model = getCurrentModel(stream_type);
    var category_index = this.getRecentOrFavoriteCategoryPosition(kind);
    current_model.categories[category_index].movies = movies;
    var movie_id_key = current_model.movie_key;
    var movie_ids = movies.map(function (item) {
      return item[movie_id_key];
    });

    if (kind === "favorite") {
      current_model.favorite_ids = movie_ids;
      if (stream_type === "live")
        $(".live-fav-category-length").text(movie_ids.length)
      else
        $(".fav-category-length").text(movie_ids.length);
    } else {
      if (stream_type === "live")
        $(".live-recent-category-length").text(movies.length)
      else
        $(".recent-category-length").text(movies.length)
    }
    saveToLocalStorage(settings.playlist.id + stream_type + "_" + kind, movies);
  },
  addRecentOrFavoriteMovie: function (stream_type, movie, kind) {
    var current_model = getCurrentModel(stream_type);
    var category = this.getRecentOrFavoriteCategory(stream_type, kind);

    var movies = category.movies;

    var exist = false;
    var movie_id_key = current_model.movie_key;

    var is_added = false; // if added, it will be true
    for (var i = 0; i < movies.length; i++) {
      if (movies[i][movie_id_key] == movie[movie_id_key]) {
        exist = true;
        break;
      }
    }

    if (!exist) {
      var insert_position = this[kind + "_insert_position"];
      if (insert_position === "before") movies.unshift(movie);
      else movies.push(movie);
      var max_count = current_model[kind + "_movie_count"];
      movies = movies.splice(0, max_count);
      this.setRecentOrFavoriteMovies(stream_type, movies, kind);
      is_added = true;
    }
    return is_added;
  },
  removeRecentOrFavoriteMovie: function (stream_type, movie_id, kind) {
    var current_model = getCurrentModel(stream_type);
    var movies = this.getRecentOrFavoriteCategory(stream_type, kind).movies;
    var movie_id_key = current_model.movie_key;
    var is_removed = false;
    for (var i = 0; i < movies.length; i++) {
      if (movies[i][movie_id_key] == movie_id) {
        movies.splice(i, 1);
        is_removed = true;
        break;
      }
    }
    this.setRecentOrFavoriteMovies(stream_type, movies, kind);
    return is_removed;
  }
};
