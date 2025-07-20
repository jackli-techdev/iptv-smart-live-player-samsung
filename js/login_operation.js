"use strict";
var login_page = {
  keys: {
    btn_selection: 0
  },
  login_succeed: false,
  get_live_streams_data: [],
  get_live_categories_data: [],
  get_vod_categories_data: [],
  get_series_categories_data: [],
  get_vod_streams_data: [],
  get_series_data: [],

  rand: function (min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  },
  rand_string: function (length) {
    var ALLOWED_CHARACTERS =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var result = "";
    for (var i = 0; i < length; i++) {
      var pos = this.rand(0, ALLOWED_CHARACTERS.length - 1);
      result += ALLOWED_CHARACTERS[pos];
    }
    return result;
  },

  getEncryptKey: function (length) {
    var encrypt_base = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    if (length <= 0) {
      return '';
    }

    var randomString = '';
    for (var i = 0; i < length; i++) {
      var randomCharacter =
        encrypt_base[Math.floor(Math.random() * encrypt_base.length)];
      randomString += randomCharacter;
    }
    return randomString;
  },

  getEncryptKey: function (length) {
    const symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    let s = '';
    while (s.length < length) {
      const randomIndex = Math.floor(Math.random() * symbols.length);
      s += symbols.charAt(randomIndex);
    }
    return s;
  },

  getEncryptKeyPosition: function (character) {
    const symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    for (let i = 0; i < symbols.length; i++) {
      if (symbols[i] === character) {
        return i;
      }
    }

    return null;
  },
  getEncryptPositionChar: function (position) {
    const symbols = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    return symbols.charAt(position);
  },

  encrypt: function (data) {
    data.device_id = window.btoa(data.device_id);
    let string_data = JSON.stringify(data);
    string_data = btoa(string_data);
    let encrypt_key_length = parseInt(Math.random() * 30);
    if (encrypt_key_length < 20) encrypt_key_length = 20;
    let position = Math.floor(Math.random() * string_data.length);
    if (position >= 42) position = 42;
    const encrypt_key = this.getEncryptKey(encrypt_key_length);
    let encrypted_data = string_data
      .slice(0, position)
      .concat(encrypt_key)
      .concat(string_data.slice(position));
    encrypted_data =
      this.getEncryptPositionChar(position) + this.getEncryptPositionChar(encrypt_key_length) + encrypted_data;
    return encrypted_data;
  },

  decrypt: function (data) {
    var rawResponse = String(data);
    var encPosChar = rawResponse[rawResponse.length - 2];
    var encLenChar = rawResponse[rawResponse.length - 1];
    var encPos = this.getEncryptKeyPosition(encPosChar);
    var encLen = this.getEncryptKeyPosition(encLenChar);
    rawResponse = rawResponse.substring(0, rawResponse.length - 2);
    var encodeStr =
      rawResponse.substring(0, encPos) + rawResponse.substring(encPos + encLen);
    var decodedStr = atob(encodeStr);
    var m = JSON.parse(this.utf8Decode(decodedStr));
    return m;
  },

  utf8Decode: function (str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; ++i) {
      bytes[i] = str.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  },

  updateQR: function (mac_address, device_key) {
    var link = 'https://xciptvsmartplayer.com/playlists?mac_address=' + mac_address + '&device_key=' + device_key;

    new QRCode(document.getElementById("login-qr-code"), {
      text: link,
      width: 300,
      height: 300,
    });
    new QRCode(document.getElementById("playlist-qr-code"), {
      text: link,
      width: 300,
      height: 300,
    });
    // new QRCode(document.getElementById("email-qrcode"), {
    //   text: contacts[0].contact_link,
    //   width: 250,
    //   height: 250,
    // });
    // new QRCode(document.getElementById("telegram-qrcode"), {
    //   text: contacts[1].contact_link,
    //   width: 250,
    //   height: 250,
    // });
    // new QRCode(document.getElementById("whatsapp-qrcode"), {
    //   text: contacts[2].contact_link,
    //   width: 250,
    //   height: 250,
    // });
    // new QRCode(document.getElementById("viber-qrcode"), {
    //   text: contacts[3].contact_link,
    //   width: 250,
    //   height: 250,
    // });
  },

  fetchPlaylistInformation: function (mac_address, action) {
    var that = this;
    var originData = {
      device_id: 'lgos569831320cb8',
      app_type: platform,
      version: appVersion,
      app_name: "xciptvsmartplayer"
    };
    var encoded = this.encrypt(originData);

    time_format = getLocalStorageData("timeFormat");
    if (time_format === null)
      time_format = 12;

    liveStreamFormat = getLocalStorageData("liveStreamFormat");
    if (liveStreamFormat === null)
      liveStreamFormat = "default";

    liveStreamSort = getLocalStorageData("liveStreamSort");
    if (liveStreamSort === null)
      liveStreamSort = "default";

    liveAutoPlay = getLocalStorageData("liveAutoPlay");
    if (liveAutoPlay === null)
      liveAutoPlay = false;

    visibleArchiveIcon = getLocalStorageData("visibleArchiveIcon");
    if (visibleArchiveIcon === null)
      visibleArchiveIcon = false;

    useragentFlag = getLocalStorageData("useragentFlag");
    if (useragentFlag === null)
      useragentFlag = false;


    userAgent = getLocalStorageData("userAgent");
    if (userAgent === null)
      userAgent = "XCIPTV Smart Player";
    readNotiIDs = getLocalStorageData("readNotiIDs");
    if (readNotiIDs === null)
      readNotiIDs = [];

    setting_page.language_doms = $(".language-operation-modal");
    setting_page.doms_translated = $("*").filter(function () {
      return $(this).data("word_code") !== undefined;
    });
    setting_page.changeDomsLanguage();
    return $.ajax({
      method: "POST",
      url: panel_url + "4mIJ2YvhjFyGPgbmCNpKtg9eAUYdRzQR",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: { data: encoded }
    }).then(function (data) {

      var data = that.decrypt(data.data);
      console.log('data', data)
      saveData("contacts", data.contacts)

      parent_account_password = getLocalStorageData('parent_account_password');
      if (parent_account_password === null)
        parent_account_password = "0000";

      if (action !== 'reload')
        that.updateQR(data.mac_address, data.device_key);

      $(".loading-mac-devicekey").removeClass("hide");
      $(".mac-address").text(data.mac_address);
      $(".device-key").text(data.device_key);

      saveToLocalStorage("macAddress", data.mac_address);
      saveToLocalStorage("deviceKey", data.device_key)

      device_id = data.device_id;
      if (data.subtitleAPIKey !== undefined) {
        subtitleAPIKey = data.subtitleAPIKey
      }

      var previousData = { date: Date.now(), data: data };
      saveToLocalStorage("saved_previous_data", previousData);

      login_page.preProcess(data, action);
    })
      .catch(function (e) {
        console.log("Api request failed", e);
        var pIDData = getLocalStorageData('saved_previous_data');
        var pData = getLocalStorageData("saved_previous_data");

        if (pIDData || pData) {
          login_page.preProcess(pData.data, action);
        } else {
          login_page.keys.focused_part = "restart_modal"
          $("#restart-modal").show()
          $(".loader-image-container").addClass("hide")
          showToast("Sorry, Something went wrong.", "Please restart the app.");
        }
        console.log(e);
      });
  },

  handleRestart: function () {
    this.getPlayListDetail('')
  },

  preProcess: function (data, action) {
    var that = this;

    var serverURLInfo = [];
    var playlistURLs = data.playlists;

    playlistURLs.map(function (item, index) {
      var temp_array1 = item.url.split("?");
      if (temp_array1.length > 1 || (!checkM3U(item.url) && !item.url.includes('type=m3u_plus'))) {
        var isPlaylist = item.url.includes("playlist");
        if (isPlaylist) {
          var regex = /(.*?)\/playlist\/(.*?)\/(.*?)(\/|$)/;
          var match = item.url.match(regex);
          var api_host_url = match[1];
          var user_name = match[2];
          var password = match[3];
        } else if (!item.url.includes('type=m3u_plus') && !item.url.includes('type=m3u')) {
          var parts = item.url.replace(/\/\//g, '/').split('/');
          var length = parts.length;
          if (length > 1) {
            api_host_url = parts[0] + "//" + parts[1];
            var user_name = parts[length - 3];
            var password = parts[length - 2];
          }
        } else {
          var temp_array2 = temp_array1[1].split("&");
          temp_array2.map(function (item) {
            var temp5 = item.split("=");
            var key = temp5[0];
            var value = temp5[1];
            if (key.toLowerCase() === "username") user_name = value;
            if (key.toLowerCase() === "password") password = value;
          });
          var lastSlashIndex = temp_array1[0].lastIndexOf('/');
          api_host_url = temp_array1[0].slice(0, lastSlashIndex);

        }
        serverURLInfo.push({
          epg_url: "",
          id: item.url.replace(/[^0-9a-z]/gi, ""),
          origin_type: "xc",
          origin_url: api_host_url,
          password: password,
          playlist_name: item.name,
          playlist_type: "xc",
          url: api_host_url,
          username: user_name,
          playlist: item,
          isPlaylist: isPlaylist
        });
      } else {
        serverURLInfo.push({
          epg_url: "",
          id: item.url.replace(/[^0-9a-z]/gi, ""),
          origin_type: "general",
          origin_url: item.url,
          password: "",
          playlist_name: item.name,
          playlist_type: "general",
          url: item.url,
          username: "",
          playlist: item,
          isPlaylist: false
        });
      }
    });

    var userAgentData = data.user_agent !== undefined ? data.user_agent : "XCIPTV Smart Player"
    saveData("mac_address", data.mac_address);
    saveData("device_key", data.device_key);
    saveData("playlist_urls", serverURLInfo);
    saveData("userAgent", userAgentData);
    saveData("expire_date", data.expire_date);
    saveData("is_trial", data.is_trial);
    $(".server-logo").attr("src", data.logo_url);

    saveToLocalStorage("userAgent", userAgentData);

    playlist_page.renderPlaylist()

    var today = moment().format("Y-MM-DD");
    var date1 = new Date(today);
    var date2 = new Date(data.expire_date);
    var diffInMs = date2.getTime() - date1.getTime();
    var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    $("#remain_days").text(Math.ceil(diffInDays));

    if (data.expire_date <= today) {
      $("#loading-page").hide();
      saveData("mac_valid", false);
      $("#login-note-2-0").show();
      $("#login-note-2-1").hide();
      $(".account_expired").removeClass("hide");
      $(".login-continue").hide();
      $(".cancel-button").hide();
      $(".login-page-container").css({ padding: "200px" });
      $("#login-container").removeClass("hide");
    } else {
      $("#login-note-2-0").hide();
      $("#login-note-2-1").show();

      if (diffInDays < 8) {
        if (action === 'reload') {
          login_page.login();
        } else {
          saveData("is_trial", 0);
          $(".tv_is_trial").removeClass("hide");
          $(".mac_activated").addClass("hide");
          if (data.playlists[0].name == "demo") {
            $(".no_playlist_description").removeClass("hide");
          } else {
            $(".to_add_manage").removeClass("hide");
          }
          $("#loading-page").addClass("hide");
          $("#login-container").removeClass("hide");
        }
      } else {
        $(".tv_is_trial").addClass("hide");
        $(".mac_activated").removeClass("hide");
        saveData("is_trial", 2);
        login_page.login();
      }
    }
  },
  getPlayListDetail: function (action) {
    var that = this;
    if (platform === 'Samsung') {
      try {
        tizen.systeminfo.getPropertyValue("ETHERNET_NETWORK", function (data) {
          var mac_address = data.macAddress.replace(/:/g, "");
          if (data !== undefined) {
            if (typeof data.macAddress != "undefined") {
              that.fetchPlaylistInformation(mac_address, action);
            } else {
              that.fetchPlaylistInformation(mac_address, action);
            }
          } else {
            that.fetchPlaylistInformation(mac_address, action);
          }
        });
      } catch (e) {
        this.fetchPlaylistInformation("samsungMaAddress", action);
      }
    } else {
      try {
        webOS.service.request("luna://com.webos.service.sm", {
          method: "deviceid/getIDs",
          parameters: {
            idType: ["LGUDID"]
          },
          onSuccess: function (inResponse) {
            mac_address = "";
            var temp = inResponse.idList[0].idValue.replace(/['-]+/g, "");
            for (var i = 0; i <= 5; i++) {
              mac_address += temp.substr(i * 2, 2);
              if (i < 5) mac_address += ":";
            }
            var mac_address = "lgos" + mac_address.replace(/:/g, "");
            if (mac_address !== undefined) {
              that.fetchPlaylistInformation(mac_address, action);
            } else {
              that.fetchPlaylistInformation(mac_address, action);
            }
          },
          onFailure: function (inError) {
            console.log(inError)
          }
        });
      } catch (e) {
        this.fetchPlaylistInformation(mac_address, action);
      }
    }

  },

  login: function () {
    if (mac_valid) {
      var prev_playlist_id = getLocalStorageData("playlist_id");
      for (var i = 0; i < playlist_urls.length; i++) {
        if (playlist_urls[i].id == prev_playlist_id) {
          settings.saveSettings("playlist", playlist_urls[i], "array");
          settings.saveSettings("playlist_id", playlist_urls[i].id, "");
          this.proceed_login();
          return;
        }
      }

      settings.saveSettings(
        "playlist_id",
        playlist_urls[0].playlist.url.replace(/[^0-9a-z]/gi, "")
      );
      settings.saveSettings("playlist", playlist_urls[0], "array");
      settings.saveSettings("playlistURL", playlist_urls[0].playlist, "array");
      this.proceed_login();
    } else {
      showToast(
        "You can not use our service now, please extend your expire date by paying us",
        ""
      );
    }
  },

  hoverLogin: function (index) {
    var keys = this.keys;
    var elements = $(".login-button");
    if (index == 0) {
      var current_element = elements[index];
      keys.btn_selection = 0;
      $(elements).removeClass("active");
      $(current_element).addClass("active");
    } else {
      var current_element = elements[index];
      $(elements).removeClass("active");
      $(current_element).addClass("active");
      keys.btn_selection = 1;
    }
  },

  goToPlaylistPageWithError: function () {
    MovieHelper.insertMoviesToCategories("live");
    MovieHelper.insertMoviesToCategories("vod");
    MovieHelper.insertMoviesToCategories("series");
    $("#loading-page").addClass("hide");
    showToast("current playlist is not working", "");
    home_page.init();
    home_page.hoverMainMenu(2);
    home_page.handleMenuClick();
    playlist_page.isError = true;
    $("#home-expire-date").text("Unknown");
  },

  proceed_login: function () {

    var that = this;

    MovieHelper.init("live");
    MovieHelper.init("vod");
    MovieHelper.init("series");

    showLoadImage();

    var playlist = settings.playlist;
    $(".current-playlist-name").text(playlist.playlist_name);
    var playlist_type = playlist.playlist_type;
    api_host_url = settings.playlist.url;
    if (playlist_type === "xc") {
      user_name = playlist.username;
      password = playlist.password;
      var prefix_url =
        api_host_url +
        "/player_api.php?username=" +
        user_name +
        "&password=" +
        password +
        "&action=";
      var login_url = prefix_url.replace("&action=", "");

      $.ajax({
        method: "get",
        crossDomain: true,
        url: login_url,
        success: function (data) {
          if (typeof data.server_info != "undefined") {
            saveData("server_info", data.server_info);
            calculateTimeDifference(
              data.server_info.time_now,
              data.server_info.timestamp_now
            );
          }
          if (typeof data.user_info != "undefined") {
            saveData("user_info", data.user_info);
            if (
              data.user_info.auth == 0 ||
              (typeof data.user_info.status != "undefined" &&
                (data.user_info.status === "Expired" ||
                  data.user_info.status === "Banned"))
            ) {
              that.goToPlaylistPageWithError();
              if (data.user_info.exp_date) {
                if (data.user_info.exp_date == null) {
                  $(".playlist-expiry-date").text("Unlimited");
                } else {
                  var exp_date_obj = moment(
                    Number(data.user_info.exp_date) * 1000
                  );
                  $(".playlist-expiry-date").text(
                    exp_date_obj.format("Y-MM-DD")
                  );
                }
              }
            } else {
              if (data.user_info.exp_date == null) {
                $(".playlist-expiry-date").text("Unlimited");
              } else {
                var exp_date_obj = moment(
                  Number(data.user_info.exp_date) * 1000
                );
                $(".playlist-expiry-date").text(exp_date_obj.format("Y-MM-DD"));
              }
              $.when(
                $.ajax({
                  method: "get",
                  url: prefix_url + "get_live_streams",
                  success: function (data) {
                    MovieHelper.setEntireMovies("live", data);
                    MovieHelper.setMovies("live", data);
                    var catchupData = [];
                    catchupData = data.filter(function (item) {
                      return item.tv_archive > 0;
                    });
                    LiveModel.catchup = catchupData;
                    login_page.get_live_streams_data = data;
                  }
                }),
                $.ajax({
                  method: "get",
                  url: prefix_url + "get_live_categories",
                  success: function (data) {
                    MovieHelper.setCategories("live", data);
                    login_page.get_live_categories_data = data;
                  }
                }),
                $.ajax({
                  method: "get",
                  url: prefix_url + "get_vod_categories",
                  success: function (data) {
                    MovieHelper.setCategories("vod", data);
                    login_page.get_vod_categories_data = data;
                  }
                }),
                $.ajax({
                  method: "get",
                  url: prefix_url + "get_series_categories",
                  success: function (data) {
                    MovieHelper.setCategories("series", data);
                    login_page.get_series_categories_data = data;
                  }
                }),
                $.ajax({
                  method: "get",
                  url: prefix_url + "get_vod_streams",
                  success: function (data) {
                    MovieHelper.setEntireMovies("vod", data);
                    MovieHelper.setMovies("vod", data);
                    login_page.get_vod_streams_data = data;
                  }
                }),
                $.ajax({
                  method: "get",
                  url: prefix_url + "get_series",
                  success: function (data) {
                    MovieHelper.setMovies("series", data);
                    MovieHelper.setEntireMovies("series", data);
                    login_page.get_series_data = data;
                  }
                })
              )
                .then(function () {
                  try {
                    MovieHelper.insertMoviesToCategories("live");
                    MovieHelper.insertMoviesToCategories("vod");
                    MovieHelper.insertMoviesToCategories("series");

                    $("#loading-page").addClass("hide");
                    home_page.init();
                  } catch (e) {
                    console.log(e);
                    that.goToPlaylistPageWithError();
                  }
                })
                .fail(function (e) {
                  console.log(e);
                  that.goToPlaylistPageWithError();
                });
            }
          }
        },
        error: function (error) {
          if (playlist.isPlaylist) {
            api_host_url = settings.playlist.url;
            $.ajax({
              method: "get",
              url: api_host_url,
              success: function (data) {
                parseM3uResponse("general", data);
                $("#loading-page").addClass("hide");
                home_page.init();
              },
              error: function (error) {
                console.log("error", error);
                that.goToPlaylistPageWithError();
              }
            });
          } else {
            that.goToPlaylistPageWithError();
          }
        },
        timeout: 15000
      });
    } else if (playlist_type === "general") {
      api_host_url = settings.playlist.url;
      $(".playlist-expiry-date").text("Unlimited");
      $.ajax({
        method: "get",
        url: api_host_url,
        success: function (data) {
          parseM3uResponse("general", data);
          $("#loading-page").addClass("hide");
          home_page.init();
        },
        error: function (error) {
          console.log("error", error);
          that.goToPlaylistPageWithError();
        }
      });
    }
  },

  handleMenuClick: function () {
    var keys = this.keys;
    if (keys.focused_part === "restart_modal") {
      this.handleRestart();
    } else {
      var elements = $(".login-button");
      var current_element = elements[keys.btn_selection];
      $(current_element).trigger("click");
    }
  },

  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    keys.btn_selection += increment;
    var elements = $(".login-button");
    if (keys.btn_selection < 0) keys.btn_selection = elements.length - 1;
    if (keys.btn_selection >= elements.length) keys.btn_selection = 0;

    var current_element = elements[keys.btn_selection];
    $(elements).removeClass("active");
    $(current_element).addClass("active");
  },

  cancel: function () {
    exitApp();
  },

  HandleKey: function (e) {
    switch (e.keyCode) {
      case tvKey.LEFT:
        this.handleMenuLeftRight(-1);
        break;
      case tvKey.RIGHT:
        this.handleMenuLeftRight(1);
        break;
      case tvKey.ENTER:
        this.handleMenuClick();
        break;
      case tvKey.RETURN:
        turn_off_page.init(current_route);
        break;
    }
  }
};
