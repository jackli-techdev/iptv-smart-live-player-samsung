"use strict";

var macAddress,
    deviceKey,
    userName,
    password,
    playlistEndpoint,
    isTrial,
    modelName,
    firmwareVersion,
    isUHD,
    sdkVersion,
    timeDifferenceWithServer = 0,
    expireDate,
    appLoading = false,
    isKeyboard = false,
    timeFormat = 12,
    liveStreamFormat = 'ts',
    currentRoute = "login",
    currentMovie,
    currentSeason,
    currentEpisode,
    currentSeries,
    isMacValid = true,
    playlistURLs = [],
    themes = [],
    currentWords = [],
    notification = {},
    entireMovies = {},
    entireSeries = {},
    entireLives = {},
    storageID = "comIbPlayerProappZ!811_",
    catchLoading = true,
    textTracks = [],
    audioTracks = [],
    catchupAudioTracks = [],
    channelAudioTracks = [],
    serverInfo = {},
    userInfo = {},
    settingsColumNum = 4,
    parentPassword = "0000",
    parentControlDisable = false,
    textTrackDelayTime = 0;

function saveData(key, data) {
    window[key] = data;
};

function saveToLocalStorage(key, data) {
    localStorage.setItem(storageID + key, JSON.stringify(data));
}

function getLocalStorageData(key) {
    return JSON.parse(localStorage.getItem(storageID + key));
}

function initLanguages() {
    var languageData = getLocalStorageData('languageData');

    if (languageData) {
        saveData("languages", languageData);
    }
    setting.languageDoms = $(".language-item");
    settings.translatedDoms = $("*").filter(function () {
        return $(this).data("word_code") !== undefined;
    });
    settings.changeDomsLanguage();
};

function showToast(title, text) {
    $(".toast-contents").html("<div>" + title + "<br>" + text + "</div>");
    $(".toast").toast({ animation: true, delay: 4000 });
    $(".toast").toast("show");
}

function checkM3U(url) {
    if (url.match(/\.m3u8?$/)) {
        return true;
    } else {
        return false;
    }
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

        movieHelper.setCategories("live", live_categories);
        movieHelper.setMovies("live", lives);
        movieHelper.insertMoviesToCategories("live");

        movieHelper.setCategories("vod", vod_categories);
        movieHelper.setMovies("vod", vods);
        movieHelper.insertMoviesToCategories("vod");

        movieHelper.setCategories("series", series_categories);
        var parsed_series = parseSeries(series);
        movieHelper.setMovies("series", parsed_series);
        movieHelper.insertMoviesToCategories("series");
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

function clearCache() {
    var prefix = storageID;
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
        }
    }
}

function getCurrentModel(streamType) {
    var currentModel;
    switch (streamType) {
        case "vod":
            currentModel = VodModel;
            break;
        case "series":
            currentModel = SeriesModel;
            break;
        case "live":
            currentModel = LiveModel;
    }
    return currentModel;
}

function showLoadImage() {
    $("#login-container").addClass("hide");
    $("#loading-page").removeClass("hide");
}

function displayCurrentPage(currentRoute) {
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
    $("#" + currentRoute).removeClass("hide");
    if (currentRoute === "channel-page" || currentRoute === "vod-series-page")
        $(".top-bar").removeClass("hide");
}

function moveScrollPosition(parent_element, element, direction, to_top) {
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
    var category = categories.filter(function (category) {
        return category.category_id == category_id
    })[0];

    var category_name = category !== undefined ? category.category_name.toLowerCase() : "all";
    if (hasWord(category_name))
        is_adult = true;
    return is_adult;
}

function getMovieUrl(stream_id, stream_type, extension) {
    var url = playlistEndpoint + stream_type + "/" + userName + "/" + password + "/" + stream_id + "." + extension;
    return url;
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

function getAllEPGUrl(streamId) {
    var url = playlistEndpoint + "player_api.php?username=" + userName + "&password=" + password + "&action=get_simple_data_table&stream_id=" + streamId;
    return url;
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

function getCurrentMovieFromId(value, movies, key) {
    var currentMovie = null;
    for (var i = 0; i < movies.length; i++) {
        if (movies[i][key] == value) {
            currentMovie = movies[i];
            break;
        }
    }
    return currentMovie;
}

function getMinute(time_string) {
    var date = new Date(time_string);
    return parseInt(date.getTime() / 60 / 1000);
}

function closeVideo() {
    try {
        mediaPlayer.close();
    } catch (e) { }
}

function getSortedMoviesByName(movies, sortKeyName, direction) {
    if (sortKeyName === "added") {
        sortKeyName = vodSeries.currentVideotype === "series" ? "last_modified" : "added";
    }

    // Function to safely convert to float and handle NaN as 0
    function getValue(value) {
        var parsedValue = parseFloat(value);
        return isNaN(parsedValue) ? 0 : parsedValue;
    }

    // Common numeric sort function
    function sortByNumber(a, b) {
        var aValue = getValue(a[sortKeyName]);
        var bValue = getValue(b[sortKeyName]);
        return (bValue - aValue) * direction;
    }

    // Switch cases simplified
    switch (sortKeyName) {
        case "number":
            sortKeyName = "num"; // Adjust key for number sort
        case "rating":
        case "added":
        case "last_modified":
            movies.sort(sortByNumber);
            break;
        case "name":
            movies.sort(function (a, b) {
                return direction * a['name'].localeCompare(b['name']);
            });
            break;
    }

    // Filter movies without names or invalid content
    return movies.filter(function (movie) {
        return movie.name && !hasWord(movie.name);
    });
}

function getSortedMovies(movies, key, currentVideotype) {
    if (!movies.length) return movies; // Prevent accessing movies[0] when empty

    if (key === "number") key = "num";
    if (key === "added") {
        key = (currentVideotype === "series") ? "last_modified" : "added";
    }

    // Sort movies based on key
    movies.sort(function (a, b) {
        if (key === "name") {
            return a[key].localeCompare(b[key]);
        }

        var aValue = parseFloat(a[key]) || 0;
        var bValue = parseFloat(b[key]) || 0;
        return bValue - aValue;
    });

    // Filter movies without a name or containing invalid words
    return movies.filter(function (movie) {
        return movie.name && !hasWord(movie.name);
    });
}

function showLoader(flag) {
    if (flag) $("#loader").show();
    else $("#loader").hide();
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
    $("#" + mediaPlayer.parent_id)
        .find(".video-progress-bar-slider")
        .val(newTime)
        .change();
    $("#" + mediaPlayer.parent_id)
        .find(".video-current-time")
        .html(mediaPlayer.formatTime(newTime));
}

function showTopBar() {
    $(".top-bar").removeClass("hide");
    $('.top-bar-logo').removeClass('hide')
}

function hideTopBar() {
    $(".top-bar").addClass("hide");
    $('.top-bar-logo').addClass('hide')
}

function hideEntireSearchPage() {
    $("#entire-search-page").addClass("hide");
}

function isAdultPattern(lowerCaseName, searchValue) {
    return (
        !lowerCaseName.includes("xxx") &&
        !lowerCaseName.includes("sex") &&
        !lowerCaseName.includes("adult") &&
        !lowerCaseName.includes("porn") &&
        lowerCaseName.includes(searchValue)
    );
}

function renderLaunguagesModal() {
    var html = "";
    languages.map(function (item, index) {
        html +=
            '<div class="modal-operation-menu-type-3 language-item" ' +
            '   data-sort_key="default" ' +
            "   onclick=\"setting.selectLanguage('" +
            item.code +
            "'," +
            index +
            ')"' +
            '   onmouseenter="setting.hoverLanguage(' +
            index +
            ')"' +
            '   data-language="' +
            item.code +
            '"' +
            '   data-word_code="' +
            item.code +
            '"' +
            ">\n" +
            item.name +
            "</div>";
    });
    $("#select-language-body").html(html);
    initLanguages();
}

function showNoEPGToast() {
    var noEpgAvaliable = currentWords["no_epg_avaliable"];
    showToast(noEpgAvaliable, "");
}

function isTimestampOrDateFormat(end) {
    if (!isNaN(Number(end)) && end.length <= 13) {
        return 'timestamp';
    }

    if (!isNaN(Date.parse(end))) {
        return 'dateFormat';
    }

    return 'unknown format';
}

function unFocusSearchBars() {
    $("#vod-series-search-value").blur();
    $("#search-value").blur();
}

function hasWord(categoryName) {
    if (categoryName.toLowerCase().includes("xxx") || categoryName.toLowerCase().includes("sex") || categoryName.toLowerCase().includes("adult") || categoryName.toLowerCase().includes("porn"))
        return true;
    else
        return false;
}