"use strict";

var movieHelper = {
  favorite_insert_position: "after",
  recent_insert_position: "before",

  init: function (stream_type) {
    var currentModel = getCurrentModel(stream_type);
    currentModel.movies = [];
    currentModel.categories = [];
    if (stream_type === "live") {
      currentModel.programmes = {};
      currentModel.programme_saved = false;
    }
  },

  setCategories: function (stream_type, categories) {
    var currentModel = getCurrentModel(stream_type);
    var temps = getLocalStorageData(settings.playlist.id + "_saved_" + stream_type + "_times");
    if (temps) currentModel.savedVideoTimes = temps;
    var hidden_categories = getLocalStorageData(settings.playlist.id + stream_type + "_hiddens");
    hidden_categories =
      hidden_categories == null ? [] : hidden_categories;
    categories.map(function (category) {
      category.is_hide = hidden_categories.includes(category.category_id);
    });
    currentModel.categories = categories;
  },

  saveVideoTime: function (stream_type, stream_id, time, duration) {
    var currentModel = getCurrentModel(stream_type);
    var savedVideoTimes = currentModel.savedVideoTimes;
    if (stream_type == "vod") {
      if (time / 1000 >= config.resumeThredholdTime) {
        savedVideoTimes[stream_id.toString()] = {
          resumeTime: time,
          duration: duration
        };
        if (time / 1000 > config.resumeThredholdTime) {
          $($("#vod-series-menus-container .resume-progress-bar")[vodSeries.keys.menuSelection]).css({ "width": time / duration * 100 + "%" });
          $($("#vod-series-menus-container .resume-progressbar-wrapper")[vodSeries.keys.menuSelection]).removeClass("no-bk");
        } else {
          $($("#vod-series-menus-container .resume-progress-bar")[vodSeries.keys.menuSelection]).css({ "width": 0 });
          $($("#vod-series-menus-container .resume-progressbar-wrapper")[vodSeries.keys.menuSelection]).addClass("no-bk");
          $($("#vod-series-menus-container .resume-progressbar-wrapper")[vodSeries.keys.menuSelection]).css({ "background": "transparent" });
        }
        var categories = this.getCategories("vod", false, false);
        if (!checkForAdult(currentMovie, "movie", categories))
          this.addRecentOrFavoriteMovie("vod", currentMovie, "recent"); // Add To Recent Movies
      } else {
        this.removeRecentOrFavoriteMovie(
          stream_type,
          stream_id,
          "recent"
        );
        this.removeVideoTime(stream_type, stream_id);
      }
    } else {
      savedVideoTimes[stream_id.toString()] = {
        resumeTime: time,
        duration: duration,
        seriesID: currentSeries.series_id
      };
    }
    currentModel.savedVideoTimes = savedVideoTimes;
    saveToLocalStorage(settings.playlist.id + "_saved_" + stream_type + "_times", savedVideoTimes);
  },

  removeVideoTime: function (stream_type, stream_id) {
    if (stream_type == "series") {
      var savedVideoTimes = getLocalStorageData(settings.playlist.id + "_saved_series_times");
      for (var key in savedVideoTimes) {
        if (savedVideoTimes[key].seriesID == stream_id) {
          delete savedVideoTimes[key];
        }
      }
      var currentModel = getCurrentModel(stream_type);
      currentModel.savedVideoTimes = savedVideoTimes;
    } else {
      var currentModel = getCurrentModel(stream_type);
      var savedVideoTimes = currentModel.savedVideoTimes;
      delete savedVideoTimes[stream_id.toString()];
      currentModel.savedVideoTimes = savedVideoTimes;
    }
    saveToLocalStorage(settings.playlist.id + "_saved_" + stream_type + "_times", savedVideoTimes);
  },

  saveHiddenCategories: function (stream_type, index, is_hide) {
    var categories = this.getCategories(stream_type, true, false);
    categories[index].is_hide = is_hide;
    var category_id = categories[index].category_id;
    var hiddenCategoryIds = getLocalStorageData(settings.playlist.id + stream_type + "_hiddens");
    if (hiddenCategoryIds == null) hiddenCategoryIds = [];
    if (is_hide && !hiddenCategoryIds.includes(category_id))
      hiddenCategoryIds.push(category_id);
    else {
      if (hiddenCategoryIds.includes(category_id)) {
        for (var i = 0; i < hiddenCategoryIds.length; i++) {
          if (hiddenCategoryIds[i] == category_id) {
            hiddenCategoryIds.splice(i, 1);
            break;
          }
        }
      }
    }
    saveToLocalStorage(settings.playlist.id + stream_type + "_hiddens", hiddenCategoryIds);
  },

  saveClearHistoryMovies: function (stream_type, clearHistoryIds) {
    var recent_movies_ids = getLocalStorageData(settings.playlist.id + stream_type + "_recent");
    var idKey = (stream_type === "vod" || stream_type === "live") ? 'stream_id' : 'series_id';
    var filtered = recent_movies_ids.filter(function (element) {
      return clearHistoryIds.indexOf(String(element[idKey])) === -1;
    });
    for (var i = 0; i < clearHistoryIds.length; i++) {
      this.removeRecentOrFavoriteMovie(
        stream_type,
        clearHistoryIds[i],
        "recent"
      );

      if (stream_type !== "live")
        movieHelper.removeVideoTime(stream_type, clearHistoryIds[i]);
    }
    saveToLocalStorage(settings.playlist.id + stream_type + "_recent", filtered);
  },

  getCategories: function (
    stream_type,
    include_hide_category,
    include_favorite_recent
  ) {
    var currentModel = getCurrentModel(stream_type);
    var categories = currentModel.categories.filter(function (category) {
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
    var currentModel = getCurrentModel(stream_type);
    currentModel.movies = movies;

    if (stream_type === "live") {
      entireLives = movies;
    } else if (stream_type == "vod") {
      entireMovies = movies;
    } else if (stream_type == "series")
      entireSeries = movies;

  },

  insertMoviesToCategories: function (stream_type) {
    var currentModel = getCurrentModel(stream_type);
    var movies = currentModel.movies;
    var categories = currentModel.categories;

    var hiddenCategoryIds = getLocalStorageData(settings.playlist.id + stream_type + "_hiddens");
    var allIsHide = true;
    if (hiddenCategoryIds !== null && hiddenCategoryIds.includes('all')) {
      allIsHide = true;
    } else {
      allIsHide = false;
    }

    if (stream_type === 'live' && hiddenCategoryIds === null) {
      allIsHide = true;
    }

    var recent_category = {
      category_id: "recent",
      category_name: "Recently Viewed",
      parent_id: 0,
      movies: [],
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
    var movie_id_key = currentModel.movieKey;
    var recent_movie_ids = getLocalStorageData(settings.playlist.id + stream_type + "_recent");
    var favorite_movie_ids = getLocalStorageData(settings.playlist.id + stream_type + "_favorite");
    recent_movie_ids = recent_movie_ids == null ? [] : recent_movie_ids;
    favorite_movie_ids = favorite_movie_ids == null ? [] : favorite_movie_ids;
    currentModel.favoriteIds = favorite_movie_ids;

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
        // if movie id is in recently viewed movie ids
        if (that.recent_insert_position === "before")
          recent_movies.unshift(movie);
        else recent_movies.push(movie);
        movie.is_recent = true;
      }
      if (favorite_movie_ids_tmp.includes(movie[movie_id_key])) {
        // if movie id is in recently viewed movie ids
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
    currentModel.categories = categories;
    currentModel.movies = [];
  },

  getRecentOrFavoriteCategoryPosition: function (stream_type, kind) {
    if (stream_type == "live") {
      if (kind === "favorite") {
        return 2;
      } else return 0;
    } else {
      if (kind === "recent") return 0;
      else if (kind === "favorite") return 2;
      else return 0;
    }
  },

  getRecentOrFavoriteCategory: function (stream_type, kind) {
    var currentModel = getCurrentModel(stream_type);
    var category_index = this.getRecentOrFavoriteCategoryPosition(
      stream_type,
      kind
    );

    return currentModel.categories[category_index];
  },

  setRecentOrFavoriteMovies: function (stream_type, movies, kind) {
    var currentModel = getCurrentModel(stream_type);
    var category_index = this.getRecentOrFavoriteCategoryPosition(
      stream_type,
      kind
    );
    currentModel.categories[category_index].movies = movies;
    var movie_id_key = currentModel.movieKey;
    var movie_ids = movies.map(function (item) {
      return item[movie_id_key];
    });

    if (kind === "favorite") currentModel.favoriteIds = movie_ids;
    if (kind === "recent" && stream_type === "live") $(".live-recent-category-length").text(movies.length)
    saveToLocalStorage(settings.playlist.id + stream_type + "_" + kind, movies);

  },

  addRecentOrFavoriteMovie: function (stream_type, movie, kind) {
    var currentModel = getCurrentModel(stream_type);
    var category = this.getRecentOrFavoriteCategory(stream_type, kind);
    var movies = category.movies;
    var exist = false;
    var movie_id_key = currentModel.movieKey;

    var isAdded = false;
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
      var maxCount = currentModel[kind + "MovieCount"];
      movies = movies.splice(0, maxCount);
      this.setRecentOrFavoriteMovies(stream_type, movies, kind);
      isAdded = true;
    }
    return isAdded;
  },

  removeRecentOrFavoriteMovie: function (stream_type, movie_id, kind) {
    var currentModel = getCurrentModel(stream_type);
    var movies = this.getRecentOrFavoriteCategory(stream_type, kind).movies;
    var movie_id_key = currentModel.movieKey;
    var isRemoved = false;
    for (var i = 0; i < movies.length; i++) {
      if (movies[i][movie_id_key] == movie_id) {
        movies.splice(i, 1);
        isRemoved = true;
        break;
      }
    }
    this.setRecentOrFavoriteMovies(stream_type, movies, kind);
    return isRemoved;
  }
};
