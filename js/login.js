"use strict";
var login = {
    keys: {
        focusedPart: "loginButton",
        buttonSelection: 0
    },

    getPlayListDetail: function (action) {
        var _this = this;
        try {
            tizen.systeminfo.getPropertyValue("ETHERNET_NETWORK", function (data) {
                console.log('data', data)
                var temp = data.macAddress.replace(/:/g, "");
                var tvMacAddress = "sams" + temp;
                if (data !== undefined) {
                    if (typeof data.macAddress != "undefined") {
                        _this.getPlaylistInfo(tvMacAddress, action);
                    } else {
                        _this.getPlaylistInfo(tvMacAddress, action);
                    }
                } else {
                    _this.getPlaylistInfo(tvMacAddress, action);
                }
            });
        } catch (e) {
            this.getPlaylistInfo('sams', action);
        }
    },

    getPlaylistInfo: function (tvMacAddress, action) {
        var _this = this;
        initLanguages();
        var originData = {
            app_device_id: "sams28af42f30a6c",
            version: config.version,
            app_type: config.platform,
            is_paid: config.isPaid
        };
        var encoded = encode(originData);

        auth(encoded)
            .then(function (response) {
                var data = decrypt(response.data);
                console.log('data', data);
                $(".website-url").text(config.websiteURL);
                $(".mac-address-devicekey").removeClass("hide");
                $(".mac-address").text(data.mac_address);
                $(".device-key").text(data.device_key);

                _this.setTimeFormat();
                _this.setLiveStreamFormat();
                _this.setParentControlDiable();
                _this.setLanguageData();
                macAddress = data.mac_address;
                if (data.subtitleAPIKey !== undefined) {
                    config.subtitleAPIKey = data.subtitleAPIKey;
                }

                if (data.parent_synced === 0) {
                    var originData = {
                        mac_address: data.mac_address,
                        parent_control: parentPassword
                    };

                    var encoded = encode(originData);
                    updateParentPassword(encoded);

                } else {
                    parentPassword = data.parent_control;
                }

                saveToLocalStorage("storedData", data)
                _this.preProcess(data, action);
            })
            .catch(function (e) {
                console.log("Api request failed", e);
                var storedData = getLocalStorageData("storedData");
                if (storedData) {
                    _this.preProcess(storedData, action);
                }
                console.log(e);
            });
    },

    setTimeFormat: function () {
        timeFormat = getLocalStorageData('timeFormat');
        if (timeFormat === null)
            timeFormat = 12;
    },

    setLiveStreamFormat: function () {
        liveStreamFormat = getLocalStorageData('liveStreamFormat');
        if (liveStreamFormat === null)
            liveStreamFormat = 'ts';
    },

    setParentControlDiable: function () {
        parentControlDisable = getLocalStorageData('parentControlDisable');
        if (parentControlDisable === null)
            parentControlDisable = false;
    },

    setLanguageData: function () {
        setting.translatedDoms = $("*").filter(function () {
            return $(this).data("word_code") !== undefined;
        });
        setting.changeDomsLanguage();
    },

    preProcess: function (data, action) {
        var serverURLs = [];
        var playlistURLs = data.urls;

        playlistURLs.map(function (item, index) {
            var tempArray1 = item.url.split("?");
            try {
                if (tempArray1.length > 1 || (!checkM3U(item.url) && !item.url.includes('type=m3u'))) {
                    var isPlaylist = item.url.includes("playlist");
                    if (isPlaylist) {
                        var regex = /(.*?)\/playlist\/(.*?)\/(.*?)(\/|$)/;
                        var match = item.url.match(regex);
                        playlistEndpoint = match[1] + "/";
                        var userName = match[2];
                        var password = match[3];
                    } else if (!item.url.includes('type=m3u')) {
                        var parts = item.url.replace(/\/\//g, '/').split('/');
                        var length = parts.length;
                        if (length > 1) {
                            playlistEndpoint = parts[0] + "//" + parts[1] + "/";
                            var userName = parts[length - 3];
                            var password = parts[length - 2];
                        }
                    } else {
                        var tempArray2 = tempArray1[1].split("&");
                        tempArray2.map(function (item) {
                            var temp5 = item.split("=");
                            var key = temp5[0];
                            var value = temp5[1];
                            if (key.toLowerCase() === "username") userName = value;
                            if (key.toLowerCase() === "password") password = value;
                        });
                        var lastSlashIndex = tempArray1[0].lastIndexOf('/');
                        playlistEndpoint = tempArray1[0].slice(0, lastSlashIndex + 1);
                    }
                    serverURLs.push({
                        epgUrl: "",
                        id: item.id + '_' + item.url.replace(/[^0-9a-z]/gi, ""),
                        originType: "xc",
                        originUrl: playlistEndpoint,
                        password: password,
                        playlistName: item.name,
                        playlistType: "xc",
                        url: playlistEndpoint,
                        userName: userName,
                        playlist: item,
                        isPlaylist: isPlaylist
                    });
                } else {
                    serverURLs.push({
                        epgUrl: "",
                        id: item.id + '_' + item.url.replace(/[^0-9a-z]/gi, ""),
                        originType: "general",
                        originUrl: item.url,
                        password: "",
                        playlistName: item.name,
                        playlistType: "general",
                        url: item.url,
                        userName: "",
                        playlist: item,
                        isPlaylist: false
                    });
                }
            } catch (e) {
                serverURLs.push({
                    epgUrl: "",
                    id: item.id + '_' + item.url.replace(/[^0-9a-z]/gi, ""),
                    originType: "general",
                    originUrl: item.url,
                    password: "",
                    playlistName: item.name,
                    playlistType: "general",
                    url: item.url,
                    userName: "",
                    playlist: item,
                    isPlaylist: false
                });
            }

        });

        saveData("macAddress", data.mac_address);
        saveData("deviceKey", data.device_key);
        saveData("playlistURLs", serverURLs);
        saveData("expireDate", data.expire_date);
        saveData("isTrial", data.is_trial);

        var diffInDays = getRemainDays(data);
        $(".remain-days").text(diffInDays);

        if (data.expire_date <= config.today) {
            saveData("isMacValid", false);
            $("#loading-page").hide();
            $("#expired-text").show();
            $("#trial-text").hide();
            $(".account_expired").removeClass("hide");
            $(".login-button").hide();
            $("#login-container").removeClass("hide");
        } else {
            $("#expired-text").hide();
            $("#trial-text").show();
            if (diffInDays < 8) {
                if (action === 'reload') {
                    this.login();
                } else {
                    saveData("isTrial", 0);
                    $(".tv_is_trial").removeClass("hide");
                    if ((data.urls[0].name).toLowerCase() == "demo") {
                        $(".no-playlist-desc").removeClass("hide");
                    } else {
                        $(".add-playlist-text").removeClass("hide");
                    }
                    $("#loading-page").addClass("hide");
                    $("#login-container").removeClass("hide");
                }
            } else {
                saveData("isTrial", 2);
                $(".mac_activated").removeClass("hide");
                this.login();
            }
        }
    },

    login: function () {
        if (isMacValid) {
            var prevPlaylist = getLocalStorageData('playlist');
            var prevPlaylistID = prevPlaylist === null ? 0 : prevPlaylist.id;
            for (var i = 0; i < playlistURLs.length; i++) {
                if (playlistURLs[i].id == prevPlaylistID) {
                    settings.saveSettings("playlist", playlistURLs[i]);
                    this.proceedLogin();
                    return;
                }
            }
            settings.saveSettings("playlist", playlistURLs[0]);
            this.proceedLogin();
        } else {
            showToast(config.expireNoti, "");
        }
    },

    proceedLogin: function () {
        playlists.renderPlaylist();
        var _this = this;
        movieHelper.init("live");
        movieHelper.init("vod");
        movieHelper.init("series");
        showLoadImage();
        var playlist = settings.playlist;
        var playlistType = playlist.playlistType;
        if (playlistType === "xc") {
            var loginAPI = getLoginAPI(playlist);
            var prefixUrl = loginAPI[0];
            var loginUrl = loginAPI[1];
            $.ajax({
                method: "get",
                crossDomain: true,
                url: loginUrl,
                success: function (data) {
                    if (typeof data == "string")
                        data = JSON.parse(data)

                    saveData("serverInfo", data.server_info);
                    saveData("userInfo", data.user_info);
                    if (typeof serverInfo == "undefined" || typeof userInfo == "undefined") {
                        _this.goToPlaylistPageWithError();
                    } else {
                        calculateTimeDifference(
                            serverInfo.time_now,
                            serverInfo.timestamp_now
                        );

                        if (userInfo.auth === 0 || (userInfo.status && (userInfo.status === "Expired" || userInfo.status === "Banned"))) {
                            _this.goToPlaylistPageWithError();
                            if (userInfo.exp_date == null) {
                                $(".playlist-expired").text("Unlimited");
                            } else {
                                $(".playlist-expired").text("Unlimited");
                                var expireDateObj = moment(Number(userInfo.exp_date) * 1000);
                                $(".playlist-expired").text(expireDateObj.format("Y-MM-DD"));
                            }
                        } else {
                            if (userInfo.exp_date == null) {
                                $(".playlist-expired").text("Unlimited");
                            } else {
                                var expireDateObj = moment(Number(userInfo.exp_date) * 1000);
                                $(".playlist-expired").text(expireDateObj.format("Y-MM-DD"));
                            }
                            $.when(
                                $.ajax({ method: "get", url: prefixUrl + "get_live_streams" }),
                                $.ajax({ method: "get", url: prefixUrl + "get_live_categories" }),
                                $.ajax({ method: "get", url: prefixUrl + "get_vod_categories" }),
                                $.ajax({ method: "get", url: prefixUrl + "get_series_categories" }),
                                $.ajax({ method: "get", url: prefixUrl + "get_vod_streams" }),
                                $.ajax({ method: "get", url: prefixUrl + "get_series" })
                            )
                                .then(function (liveStreams, liveCategories, vodCategories, seriesCategories, vodStreams, seriesData) {
                                    if (typeof liveCategories[0] == "string")
                                        liveCategories[0] = JSON.parse(liveCategories[0])

                                    if (typeof vodCategories[0] == "string")
                                        vodCategories[0] = JSON.parse(vodCategories[0])

                                    if (typeof seriesCategories[0] == "string")
                                        seriesCategories[0] = JSON.parse(seriesCategories[0])

                                    movieHelper.setCategories("live", liveCategories[0]);
                                    movieHelper.setCategories("vod", vodCategories[0]);
                                    movieHelper.setCategories("series", seriesCategories[0]);
                                    movieHelper.setMovies("live", liveStreams[0]);
                                    movieHelper.setMovies("vod", vodStreams[0]);
                                    movieHelper.setMovies("series", seriesData[0]);
                                    movieHelper.insertMoviesToCategories("live");
                                    movieHelper.insertMoviesToCategories("vod");
                                    movieHelper.insertMoviesToCategories("series");
                                    $("#loading-page").addClass("hide");
                                    home.init();
                                })
                                .fail(function (e) {
                                    console.log(e);
                                    _this.goToPlaylistPageWithError();
                                });
                        }
                    }
                },
                error: function (error) {
                    console.log(error)
                    try {
                        _this.getM3UDataFromXC();
                    } catch (e) {
                        _this.goToPlaylistPageWithError();
                    }
                },
                timeout: 60000
            });
        } else if (playlistType === "general") {
            $(".playlist-expired").text("Unlimited");
            playlistEndpoint = settings.playlist.url;
            $.ajax({
                method: "get",
                url: playlistEndpoint,
                success: function (data) {
                    parseM3uResponse("general", data);
                    $("#loading-page").addClass("hide");
                    home.init();
                },
                error: function (error) {
                    _this.goToPlaylistPageWithError();
                },
                timeout: 60000
            });
        }
    },

    getM3UDataFromXC: function () {
        var _this = this;
        $.ajax({
            method: "get",
            url: settings.playlist.playlist.url,
            timeout: 60000,
            success: function (data) {
                settings.playlist.playlistType = "general";
                parseM3uResponse("general", data);
                $("#loading-page").addClass("hide");
                home.init();
            },
            error: function (error) {
                console.log("error", error);
                _this.goToPlaylistPageWithError();
            }
        });
    },

    hoverLogin: function (index) {
        this.keys.buttonSelection = index;
        var elements = $(".login-button");
        var element = elements[index];
        $(elements).removeClass("active");
        $(element).addClass("active");
    },

    goToPlaylistPageWithError: function () {
        movieHelper.insertMoviesToCategories("live", []);
        movieHelper.insertMoviesToCategories("vod", []);
        movieHelper.insertMoviesToCategories("series", []);
        $("#loading-page").addClass("hide");
        showToast("current playlist is not working", "");
        home.init();
        home.hoverMainMenu(4);
        home.handleMenuClick();
        playlists.isError = true;
        $(".playlist-state").removeClass("playing");
        $(".exit-index").removeClass("hide");
        $("#home-expire-date").text("Unknown");
    },

    cancel: function () {
        tizen.application.getCurrentApplication().exit();
    },

    handleMenuLeftRight: function () {
        var keys = this.keys;
        keys.buttonSelection = keys.buttonSelection === 1 ? 0 : 1;
        this.hoverLogin(keys.buttonSelection);
    },

    handleMenuClick: function () {
        var elements = $(".login-button");
        var element = elements[this.keys.buttonSelection];
        $(element).trigger("click");
    },

    HandleKey: function (e) {
        switch (e.keyCode) {
            case tvKey.ArrowLeft:
                this.handleMenuLeftRight();
                break;
            case tvKey.ArrowRight:
                this.handleMenuLeftRight();
                break;
            case tvKey.Enter:
                this.handleMenuClick();
                break;
            case tvKey.Back:
                exit.init(currentRoute);
                break;
        }
    }
};
