"use strict";
var mac_address,
  user_name,
  password,
  server_info,
  user_info,
  api_host_url,
  device_key,
  is_trial,
  panel_url = "https://api.kodiiptvplayer.com/",
  time_difference_with_server = 0; // time difference between user time and server time, measured by mins
var expire_date,
  app_loading = false;
var isKeyboard = false;
var time_format = 12;
var resumeThredholdTime = 30;
var current_route = "login";
var default_movie_icon = "images/default_icon.png";
var default_live_icon = "images/default_live.png";
var current_movie,
  current_movie_type_,
  current_season,
  current_episode,
  current_series;
var parent_account_password = "0000";
var device_id = "";
var subtitleAPIKey = "elTMMQhCQhUOLL1m5Y713lobS7o1cOGt";
var tmdbAPIKey = "af86e77267f54f6401e2f470a760f5dc";
var TMDB_ENDPOINT = "https://api.themoviedb.org/3/movie/"
var TMDB_IMAGE_PREF = "https://image.tmdb.org/t/p/w500";
var mac_valid = true;
var playlist_urls = [];
var current_words = [];
var client_offset = moment(new Date()).utcOffset();
var entireMovies = {},
  entireSeries = {},
  entireLives = {},
  favLives = [],
  favMovies = [],
  favSeries = [],
  recentLives = [],
  recentMovies = [],
  recentSeries = [];

var storage_id = "comiptvsmartersproPCSZ!_";
var totalVodNumber = 0;
var totalSeriesNumber = 0;
var catchupCategoryColumNum = 2;
var catchupChannelColumNum = 3;
var textTracksFontSize = 30;
var textTracksColors = ['#ffffff', '#000000', '#808080', '#0000FF', '#0096ff', '#49F436', '#008000', '#FFEB3B', '#5C4033', '#8B0000', '#FF0000', '#A52A2A', '#8B8000', '#C4A484'];
var subtitleBackgroundColors = ['none', 'rgba(196, 164, 132, 0.9)', 'rgba(92, 64, 51, 0.9)', 'rgba(165, 42, 42, 0.9)', 'rgba(255, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.9)', 'rgba(139, 0, 0, 0.9)', 'rgba(139, 128, 0, 0.9)', 'rgba(255, 235, 59, 0.9)', 'rgba(0, 128, 0, 0.9)', 'rgba(73, 244, 54, 0.9)', 'rgba(0, 150, 255, 0.9)', 'rgba(0, 0, 255, 0.9)', 'rgba(128, 128, 128, 0.9)', 'rgba(255, 255, 255, 0.9)'];
var textTracksColor = '#ffffff';
var subtitleBackgroundColor = 'none';
var liveStreamFormat = 'ts';
var liveStreamSort = 'default';
var liveAutoPlay = false;
var visibleArchiveIcon = false;
var useragentFlag = false;
var readNotiIDs = [];
var textTracks = [];
var audioTracks = [];
var catchupAudioTracks = [];
var channelAudioTracks = [];
var userAgent = "XCIPTV Smart Player";
var platform = "Samsung";
var appVersion = "1.0.0";
var samsungVersion = "1.0.0";
var LGVersion = "1.0.0";
var ratios = [
  // { ratio: "16:9", state: false },
  // { ratio: "4:3", state: false },
  { ratio: "Full screen", state: true },
  { ratio: "Fit", state: false }
];
var subtitles = [];
var episode_doms = $(
  "#series-summary-episode-items-container .episode-item-wrapper"
);

function showLoader(flag) {
  console.log(flag)
  if (flag) $("#loader").show();
  else $("#loader").hide();
}

function showPlayerLoader(flag) {
  if (flag) $("#player-loader").show();
  else $("#player-loader").hide();
}

function saveData(key, data) {
  window[key] = data;
}
function getMovieUrl(stream_id, stream_type, extension) {
  return (
    api_host_url +
    "/" +
    stream_type +
    "/" +
    user_name +
    "/" +
    password +
    "/" +
    stream_id +
    "." +
    extension
  );
}
function getCurrentMovieFromId(value, movies, key) {
  var current_movie = null;
  for (var i = 0; i < movies.length; i++) {
    if (movies[i][key] == value) {
      current_movie = movies[i];
      break;
    }
  }
  return current_movie;
}
function moveScrollPosition(parent_element, element, direction, to_top) {
  // move the scroll bar according to element position

  if (direction === "vertical") {
    var padding_top = parseInt(
      $(parent_element).css("padding-top").replace("px", "")
    );
    var padding_bottom = parseInt(
      $(parent_element).css("padding-bottom").replace("px", "")
    );
    var parent_height = parseInt(
      $(parent_element).css("height").replace("px", "")
    );
    var child_position = $(element).position();
    var element_height = parseInt($(element).css("height").replace("px", ""));
    var move_amount = 0;
    if (!to_top) {
      if (
        child_position.top + element_height >=
        parent_height - padding_bottom
      ) {
        move_amount =
          child_position.top + element_height - parent_height + padding_bottom;
      }
      if (child_position.top - padding_top < 0)
        move_amount = child_position.top - padding_top;
      $(parent_element).animate({ scrollTop: "+=" + move_amount }, 10);
    } else {
      // if element should on top position
      $(parent_element).animate({ scrollTop: child_position.top }, 10);
    }
    return move_amount;
  } else {
    var padding_left = parseInt(
      $(parent_element).css("padding-top").replace("px", "")
    );
    var child_position = $(element).position();
    var parent_width = parseInt(
      $(parent_element).css("width").replace("px", "")
    );
    var element_width = parseInt($(element).css("width").replace("px", ""));

    var scroll_amount = 0;
    if (child_position.left + element_width >= parent_width)
      scroll_amount = child_position.left + element_width - parent_width;
    if (child_position.left - padding_left < 0)
      scroll_amount = child_position.left - padding_left;
    $(parent_element).animate({ scrollLeft: "+=" + scroll_amount }, 10);
    return scroll_amount;
  }
}
function showToast(title, text) {
  $("#toast-body").html("<div>" + title + "<br>" + text + "</div>");
  $(".toast").toast({ animation: true, delay: 4000 });
  $("#toast").toast("show");
}
function getMinute(time_string) {
  var date = new Date(time_string);
  return parseInt(date.getTime() / 60 / 1000);
}

function parseM3uResponse(type, text_response) {
  var num = 0;
  if (type === "general") {
    var live_categories = [];
    var lives = [];
    var vods = [];
    var vod_categories = [];
    var series_categories = [];
    var series = [];
    text_response = text_response.replace(/['"]+/g, "");
    var temp_arr2 = text_response.split(/#EXTINF:-{0,1}[0-9]{1,} {0,},{0,}/gm);
    temp_arr2.splice(0, 1); // remove the first row
    var temp_arr1 = [];
    var start_time1 = new Date().getTime() / 1000;
    if (text_response.includes("tvg-")) {
      var live_category_map = {},
        vod_category_map = {},
        series_category_map = {};
      for (var i = 0; i < temp_arr2.length; i++) {
        try {
          temp_arr1 = temp_arr2[i].split("\n");
          num++;
          var url = temp_arr1[1].length > 1 ? temp_arr1[1] : "";

          if (
            url.includes("http:") ||
            url.includes("https:") ||
            url.includes("/live/")
          )
            var type = "live";
          if (
            url.includes("/movie/") ||
            url.includes("/movies/") ||
            url.includes("vod") ||
            url.includes("=movie") ||
            url.includes("==movie==")
          )
            type = "vod";
          if (url.includes("/series/")) type = "series";

          var temp_arr3 = temp_arr1[0].trim().split(",");
          var name = temp_arr3.length > 1 ? temp_arr3[1] : ""; // get the name of channel
          var temp_arr4 = splitStrings(temp_arr3[0], [
            "tvg-",
            "channel-",
            "group-"
          ]);
          var result_item = {
            stream_id: "",
            name: name,
            stream_icon: "",
            title: ""
          };
          var category_name = "All";
          temp_arr4.map(function (sub_item) {
            var sub_item_arr = sub_item.split("=");
            var key = sub_item_arr[0];
            var value = sub_item_arr[1];
            switch (key) {
              case "id":
                result_item.stream_id = value;
                break;
              case "name":
                result_item.name = value.trim() != "" ? value : name;
                break;
              case "logo":
                result_item.stream_icon = value;
                break;
              case "title":
                category_name = value.split(",")[0];
                if (category_name == "") category_name = "Uncategorized";
                break;
            }
          });
          if (result_item.stream_id.trim() === "")
            result_item.stream_id = result_item.name;
          result_item.url = url;
          result_item.num = num;

          if (type === "live") {
            if (typeof live_category_map[category_name] == "undefined") {
              live_category_map[category_name] = category_name;
              var category_item = {
                category_id: category_name,
                category_name: category_name
              };
              live_categories.push(category_item);
            }

            result_item.category_id = category_name;
            lives.push(result_item);
          }

          if (type === "vod") {
            if (typeof vod_category_map[category_name] == "undefined") {
              vod_category_map[category_name] = category_name;
              var category_item = {
                category_id: category_name,
                category_name: category_name
              };
              vod_categories.push(category_item);
            }
            result_item.category_id = category_name;
            vods.push(result_item);
          }

          if (type === "series") {
            if (typeof series_category_map[category_name] == "undefined") {
              series_category_map[category_name] = category_name;
              var category_item = {
                category_id: category_name,
                category_name: category_name
              };
              series_categories.push(category_item);
            }
            result_item.category_id = category_name;
            series.push(result_item);
          }
        } catch (e) {
          console.log(e);
        }
      }
    } else {
      live_categories = [
        {
          category_id: "all",
          category_name: "All"
        }
      ];
      vod_categories = [
        {
          category_id: "all",
          category_name: "All"
        }
      ];
      series_categories = [
        {
          category_id: "all",
          category_name: "All"
        }
      ];
      for (var i = 0; i < temp_arr2.length; i++) {
        temp_arr1 = temp_arr2[i].split("\n");
        try {
          var name = temp_arr1[0];
          var url = temp_arr1[1];

          var type = "live";
          if (url.includes("/movie/")) type = "movie";
          if (url.includes("/series/")) type = "series";
          var result_item = {};
          name = name.trim();
          result_item.stream_id = name;
          result_item.name = name;
          result_item.stream_icon = "";
          result_item.num = i + 1;
          result_item.category_id = "all";
          result_item.url = url;
          if (type === "live") lives.push(result_item);
          if (type === "series") series.push(result_item);
          if (type === "movie") vods.push(result_item);
        } catch (e) {
          console.log(e);
        }
      }
    }

    if (live_categories.length > 1) {
      live_categories.map(function (item) {
        if (item.category_id === "All") item.category_name = "Uncategorized";
      });
    }
    if (vod_categories.length > 1) {
      vod_categories.map(function (item) {
        if (item.category_id === "All") item.category_name = "Uncategorized";
      });
    }
    if (series_categories.length > 1) {
      series_categories.map(function (item) {
        if (item.category_id === "All") item.category_name = "Uncategorized";
      });
    }

    MovieHelper.setCategories("live", live_categories);
    MovieHelper.setMovies("live", lives);
    MovieHelper.insertMoviesToCategories("live");
    MovieHelper.setEntireMovies("live", lives);

    MovieHelper.setCategories("vod", vod_categories);
    MovieHelper.setMovies("vod", vods);
    MovieHelper.insertMoviesToCategories("vod");
    MovieHelper.setEntireMovies("vod", vods);

    MovieHelper.setCategories("series", series_categories);
    var parsed_series = parseSeries(series);
    MovieHelper.setMovies("series", parsed_series);
    MovieHelper.insertMoviesToCategories("series");
    MovieHelper.setEntireMovies("series", parsed_series);
  }
}

function extractSeriesAndEpisode(data) {
  // Find the index of "S" and "E"
  var indexS = data.indexOf("S");
  var indexE = data.indexOf("E");

  // Extract series name
  var seasonName = data.substring(indexS + 1, indexE);

  // Extract episode name
  var episodeName = data.substring(indexE + 1);

  // Extract category name
  var seriesName = data.substring(0, indexS);
  return {
    series_name: seriesName,
    season_name: seasonName,
    episode_name: episodeName
  };
}

function parseSeries(data) {
  var series = [];
  var series_map = {};
  var season_map = {},
    episodes = {};
  data.map(function (item) {
    try {
      var temp_arr1 = item.name.split(/ S[0-9]{2}/);

      if (temp_arr1[1] !== undefined) {
        var series_name = temp_arr1[0].trim();
        var season_name = item.name.match(/S[0-9]{2}/)[0];
        season_name = season_name.trim().replace("S", "");
        var episode_name = temp_arr1[1].trim().replace("E", "");
      } else {
        var extractedData = extractSeriesAndEpisode(temp_arr1[0].trim());
        var series_name = extractedData.series_name;
        var season_name = extractedData.season_name;
        var episode_name = extractedData.episode_name;
      }
      season_name = "Season " + season_name;
      episode_name = "Episode " + episode_name;

      if (typeof series_map[series_name] == "undefined") {
        (season_map = {}), (episodes = {}); // Initialize for every other series
        episodes[season_name] = [
          {
            name: episode_name,
            url: item.url,
            id: episode_name,
            info: {},
            title: episode_name
          }
        ];
        season_map[season_name] = {
          name: season_name,
          cover: "images/default_bg.png"
        };
        series_map[series_name] = {
          series_id: series_name,
          name: series_name,
          cover: item.stream_icon,
          youtube_trailer: "",
          category_id: item.category_id,
          rating: "",
          rating_5based: "",
          genre: "",
          director: "",
          cast: "",
          plot: "",
          season_map: season_map,
          episodes: episodes
        };
      } else {
        if (typeof season_map[season_name] == "undefined") {
          episodes[season_name] = [
            {
              name: episode_name,
              url: item.url,
              id: episode_name,
              info: {},
              title: episode_name
            }
          ];
          season_map[season_name] = {
            name: season_name,
            cover: "images/default_bg.png"
          };
          series_map[series_name].season_map = season_map;
        } else {
          episodes[season_name].push({
            name: season_name,
            url: item.url,
            id: season_name,
            info: {},
            title: episode_name
          });
        }
        series_map[series_name].episodes = episodes;
      }
    } catch (e) {
      console.log(e);
    }
  });

  var series_num = 0;
  Object.keys(series_map).map(function (key) {
    series_num++;
    var item = series_map[key];
    var seasons = [];
    try {
      Object.keys(item.season_map).map(function (key1) {
        seasons.push(item.season_map[key1]);
      });
    } catch (e) { }
    delete item["season_map"];
    item.num = series_num;
    item.seasons = seasons;
    series.push(item);
  });
  return series;
}

function splitStrings(string, keys) {
  var result_array = [];
  for (var i = 0; i < keys.length; i++) {
    var temp_arr = string.split(keys[i]);
    if (i == keys.length - 1) {
      for (var j = 0; j < temp_arr.length; j++) {
        if (temp_arr[j].trim() != "") result_array.push(temp_arr[j]);
      }
      return result_array;
    } else {
      for (var j = 0; j < temp_arr.length; j++) {
        if (temp_arr[j].trim() != "") {
          var temp_arr2 = splitStrings(temp_arr[j], keys.slice(i + 1));
          temp_arr2.map(function (item) {
            if (item.trim() !== "") result_array.push(item);
          });
        }
      }
      return result_array;
    }
  }
}
function getAtob(text) {
  var result = text;
  try {
    return decodeURIComponent(
      atob(text)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
  } catch (e) { }
  return result;
}

function hasWord(categoryName) {
  if (categoryName.toLowerCase().includes("xxx") || categoryName.toLowerCase().includes("sex") || categoryName.toLowerCase().includes("adult") || categoryName.toLowerCase().includes("porn"))
    return true;
  else
    return false;
}

function checkForAdult(item, item_type, categories) {
  var is_adult = false;
  var category;
  if (item_type === "movie") {
    for (var i = 0; i < categories.length; i++) {
      if (item.category_id == categories[i].category_id) {
        category = categories[i];
        break;
      }
    }
  } else category = item;
  var category_name = category.category_name.toLowerCase();
  if (hasWord(category_name))
    is_adult = true;
  return is_adult;
}

function checkForAdultByVideo(category_id, categories) {
  var is_adult = false;
  var categoryName = categories.filter(function (category) {
    return category.category_id == category_id
  })[0].category_name.toLowerCase()
  if (hasWord(categoryName))
    is_adult = true;
  return is_adult;
}

function getCurrentModel(stream_type) {
  var current_model;
  switch (stream_type) {
    case "vod":
      current_model = VodModel;
      break;
    case "series":
      current_model = SeriesModel;
      break;
    case "live":
      current_model = LiveModel;
  }
  return current_model;
}

function getSortedMoviesByName(movies1, sortKeyName, direction) {
  var movies = JSON.parse(JSON.stringify(movies1));
  var new_movies = [];
  switch (sortKeyName) {
    case "added":
      if (sortKeyName == "added") {
        if (vod_series_page.current_movie_type == "vod") sortKeyName = "added";
        if (vod_series_page.current_movie_type == "series") sortKeyName = "last_modified";
      }
      new_movies = movies.sort(function (a, b) {
        var a_new_key = parseFloat(a[sortKeyName]);

        if (isNaN(a_new_key)) a_new_key = 0;
        var b_new_key = parseFloat(b[sortKeyName]);

        if (isNaN(b_new_key)) b_new_key = 0;
        if (direction === 1)
          return a_new_key < b_new_key ? 1 : a_new_key > b_new_key ? -1 : 0;
        else
          return a_new_key > b_new_key ? 1 : a_new_key < b_new_key ? -1 : 0;
      });
      break;
    case "number":
      new_movies = movies.sort(function (a, b) {
        var a_new_key = parseFloat(a['num']);
        if (isNaN(a_new_key)) a_new_key = 0;
        var b_new_key = parseFloat(b['num']);
        if (isNaN(b_new_key)) b_new_key = 0;
        if (direction === 1)
          return a_new_key < b_new_key ? 1 : a_new_key > b_new_key ? -1 : 0;
        else
          return a_new_key > b_new_key ? 1 : a_new_key < b_new_key ? -1 : 0;
      });
      break;
    case "rating":
      new_movies = movies.sort(function (a, b) {
        var a_new_key = parseFloat(a[sortKeyName]);
        if (isNaN(a_new_key)) a_new_key = 0;
        var b_new_key = parseFloat(b[sortKeyName]);
        if (isNaN(b_new_key)) b_new_key = 0;
        if (direction === 1)
          return a_new_key < b_new_key ? 1 : a_new_key > b_new_key ? -1 : 0;
        else
          return a_new_key > b_new_key ? 1 : a_new_key < b_new_key ? -1 : 0;
      });
      break;
    case "name":
      new_movies = movies.sort(function (a, b) {
        return -1 * direction * a['name'].localeCompare(b['name']);
      });
      break;
  }
  var new_moviesData = new_movies.filter(function (movie) {
    if (!movie.name) return false;
    return (!hasWord(movie.name));
  });
  return new_moviesData;
}

function getSortedMovies(movies1, key, current_movie_type) {
  var movies = JSON.parse(JSON.stringify(movies1));

  var new_movies = [];
  var new_key = key;

  if (key === "number") new_key = "num";
  if (key == "added") {
    if (current_movie_type == "vod") new_key = "added";
    if (current_movie_type == "series") new_key = "last_modified";
  }

  if (typeof movies[0][new_key] == "undefined") {
    return movies;
  }

  var movies = JSON.parse(JSON.stringify(movies1));
  switch (key) {
    case "rating":
      new_movies = movies.sort(function (a, b) {
        var a_new_key = parseFloat(a[new_key]);
        if (isNaN(a_new_key)) a_new_key = 0;
        var b_new_key = parseFloat(b[new_key]);
        if (isNaN(b_new_key)) b_new_key = 0;
        return a_new_key < b_new_key ? 1 : a_new_key > b_new_key ? -1 : 0;
      });
      break;
    case "number":
      new_movies = movies.sort(function (a, b) {
        var a_new_key = parseFloat(a[new_key]);
        if (isNaN(a_new_key)) a_new_key = 0;
        var b_new_key = parseFloat(b[new_key]);
        if (isNaN(b_new_key)) b_new_key = 0;
        return a_new_key < b_new_key ? 1 : a_new_key > b_new_key ? -1 : 0;
      });
      break;
    case "added":
      new_movies = movies.sort(function (a, b) {
        var a_new_key = parseFloat(a[new_key]);

        if (isNaN(a_new_key)) a_new_key = 0;
        var b_new_key = parseFloat(b[new_key]);

        if (isNaN(b_new_key)) b_new_key = 0;
        return a_new_key < b_new_key ? 1 : a_new_key > b_new_key ? -1 : 0;
      });
      break;
    case "name":
      new_movies = movies.sort(function (a, b) {
        return a[new_key].localeCompare(b[new_key]);
      });
      break;
    case "default":
      return movies;
  }

  var new_moviesData = new_movies.filter(function (movie) {
    if (!movie.name) return false;
    return (!hasWord(movie.name));
  });

  return new_moviesData;
}

function initRangeSider() {
  var sliderElement = $(".video-progress-bar-slider")[0];
  $(".video-current-time").text("00:00");
  $(".video-total-time").text("00:00");
  $(sliderElement).attr({
    min: 0,
    max: 100
  });
  $(sliderElement).rangeslider({
    polyfill: false,
    rangeClass: "rangeslider",
    onSlideEnd: function (position, value) {
      sliderPositionChanged(value);
    }
  });
  $(sliderElement).val(0).change();
  $(sliderElement).attr("disabled", true);
  $(sliderElement).rangeslider("update");
}

function sliderPositionChanged(newTime) {
  setCurrentTime(newTime);
  $("#" + media_player.parent_id)
    .find(".video-progress-bar-slider")
    .val(newTime)
    .change();
  $("#" + media_player.parent_id)
    .find(".video-current-time")
    .html(media_player.formatTime(newTime));
}

function setCurrentTime(time) {
  media_player.videoObj.currentTime = time
}

function showTopBar() {
  $(".top-bar").removeClass("hide");
  $('.top-bar-logo').removeClass('hide')
}

function hideTopBar() {
  $(".top-bar").addClass("hide");
  $('.top-bar-logo').addClass('hide')
}

function showLoadImage() {
  $("#login-container").addClass("hide");
  $("#loading-page").removeClass("hide");
}

function hideLoadImage() {
  $("#loading-page").addClass("hide");
  $("#login-container").removeClass("hide");
}

function closePlayer() {
  try {
    media_player.close();
  } catch (e) {
    console.log(e);
  }
}

function goToHomePage() {
  hideTopBar();
  $("#home-page").removeClass("hide");
  current_route = "home-page";
}

function hideEntireSearchPage() {
  $("#entire-search-page").addClass("hide");
}

function hideVodSeriesPage() {
  $("#vod-series-page").addClass("hide");
}

function showSeriesDetailsPage() {
  $(".series-detail-page").removeClass("hide");
}

function activeTopBarMenu(index) {
  var topBarMenuDoms = $('.top-menu-titles');
  $(topBarMenuDoms).removeClass('active');
  $(topBarMenuDoms[index]).addClass('active');
}

function selectTopBarMenu(index) {
  var topBarMenuDoms = $('.top-menu-titles');
  $(topBarMenuDoms).removeClass('selected');
  $(topBarMenuDoms[index]).addClass('selected');
  $(topBarMenuDoms).removeClass('active');
}

function getStreamIds(data, type) {
  if (data === null) {
    return [];
  } else {

    var streamIds = data.map(function (item) {
      if (type === 'series') {
        if (typeof data[0] == 'object')
          return item.series_id;
        else
          return item;
      }
      else
        if (typeof data[0] == 'object')
          return item.stream_id;
        else
          return item;

    });
    return streamIds
  }
}

function saveToLocalStorage(key, data) {
  localStorage.setItem(storage_id + key, JSON.stringify(data));
}

function getLocalStorageData(key) {
  return JSON.parse(localStorage.getItem(storage_id + key));
}

function formatTimestampToDate(timestamp) {
  var date = new Date(timestamp);
  var options = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function isTimestampOrDateFormat(end) {
  if (typeof end === 'number') {
    return 'timestamp';
  }

  if (typeof end === 'string') {
    return 'dateFormat';
  }

  return 'unknown format';
}

function getSortedChannels(movies1, key) {

  var movies = JSON.parse(JSON.stringify(movies1));


  var new_movies = [];
  var new_key = key;
  if (key === "a-z" || key === "z-a") new_key = "name";


  if (typeof movies[0][new_key] == "undefined") {
    return movies;
  }
  var direction = 1;
  switch (key) {
    case "a-z":
    case "z-a":
      direction = key === "a-z" ? 1 : -1;
      new_movies = movies.sort(function (a, b) {
        return direction * a[new_key].localeCompare(b[new_key]);
      });
      break;
    case "default":
      return movies;
  }

  var new_moviesData = new_movies.filter(function (movie) {
    return (!hasWord(movie.name));
  });
  return new_moviesData;
}

function displayCurrentPage(current_route) {
  $("#home-page").addClass("hide");
  $("#channel-page").addClass("hide");
  $("#vod-series-page").addClass("hide");
  $("#vod-summary-page").addClass("hide");
  $("#catchup-page").addClass("hide");
  $("#series-summary-page").addClass("hide");
  $("#vod-series-player-page").addClass("hide");
  $("#entire-search-page").addClass("hide");
  $("#setting-page").addClass("hide");
  $(".top-bar").addClass("hide");
  $("#" + current_route).removeClass("hide");
  if (current_route === "channel-page" || current_route === "vod-series-page")
    $(".top-bar").removeClass("hide");
}

function initPlayerVariables() {
  if (media_player.videoObj !== null)
    media_player.videoObj.currentTime = 0;

  $("#vod-series-video-progress").css({ width: '0%' });
  $(".rangeslider__fill").css({ width: '0%' });
  $(".rangeslider__handle").css({ left: '0px' });
  $("#vod-series-video-current-time").text("--:--");
  $("#vod-series-video-duration").text("--:--");
}

function checkM3U(url) {
  if (url.match(/\.m3u8?$/)) {
    return true;
  } else {
    return false;
  }
}

function fullScreenLoader() {
  $(".load-container").css({ "left": "50%", "top": "50%" })
  $(".load-container img").css({ "width": "156px", "height": "156px" });
  $("#loader").css({ "left": "0", "top": "0", "width": "100vw", "height": "100vh" });
}

function exitApp() {
  if (platform === 'Samsung')
    tizen.application.getCurrentApplication().exit();
  else
    window.close();
}

function formatDateByLanguage(date) {
  var language = getLocalStorageData("language");
  if (language === null)
    language = 'en';
  var options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
  return new Intl.DateTimeFormat(language, options).format(date);
}

function setSelectionRange(element) {
  setTimeout(function () {
    var tmp = $(element).val();
    $(element)[0].setSelectionRange(tmp.length, tmp.length);
  }, 200)
}