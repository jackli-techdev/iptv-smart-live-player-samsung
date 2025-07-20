"use strict";
var playlist_page = {
  initiated: false,
  prev_route: "",
  isError: false,
  keys: {
    focused_part: "playlist_selection",
    playlist_selection: 0
  },
  playlist_doms: [],
  init: function (prev_route) {
    this.prev_route = prev_route;
    if (!this.initiated) {
      this.renderPlaylist()
    }
    var connectedWord = current_words["connected"];
    $(".playlist-state").text(connectedWord);
    $("#home-page").addClass("hide");
    hideTopBar();
    $("#playlist-page").removeClass("hide");
    current_route = "playlist-page";
  },
  renderPlaylist: function () {
    var htmlContents = "";
    var current_playlist_id = settings.playlist_id;
    var keys = this.keys
    console.log("playlist_urls")
    playlist_urls.map(function (item, index) {
      var is_playing = false;
      if (current_playlist_id === item.id) {
        is_playing = true;
        $(".current-playlist-name").text(item.playlist_name);
      }

      if (playlist_urls.length === 1) is_playing = true;
      keys.playlist_selection = current_playlist_id === item.id ? index : 0;
      var itemURL = item.playlist.is_protected == 1 ? (current_words["playlist_protected"] === undefined ? 'Playlist is protected.' : current_words["playlist_protected"]) : item.url;
      var connectedWord = current_words["connected"] !== undefined ? current_words["connected"] : 'connected';
      htmlContents += '<div class="playlist-item-container ' + (is_playing ? "active" : "") + '" onmouseenter="playlist_page.hoverPlayListItem(' + index + ')" onclick="playlist_page.changePlaylist(' + index + ')">' +
        '<div class="playlist-item-wrapper">' +
        '<div>' +
        '<div class="playlist-name">' + item.playlist_name + '</div>' +
        '<span class="playlist-icon-wrapper">' + itemURL + '</span>' +
        '</div>' +
        '<div class="playlist-state ' + (is_playing ? "playing" : "") + '">' + connectedWord + '</div>' +
        '</div>' +
        '</div>';
    });
    $("#playlist-items-container").html(htmlContents);
    this.initiated = true;
    this.playlist_doms = $(".playlist-item-container");
  },

  hoverPlayListItem: function (index) {
    var keys = this.keys;
    keys.focused_part = "playlist_selection";
    keys.playlist_selection = index;
    $(this.playlist_doms).removeClass("active");
    $(this.playlist_doms[index]).addClass("active");
    moveScrollPosition(
      $("#playlist-items-container"),
      this.playlist_doms[index],
      "vertical",
      false
    );
  },

  changePlaylist: function (index) {
    var current_playlist = playlist_urls[index];
    if (current_playlist.id === settings.playlist_id) {
      this.goBack();
    } else {
      $(".current-playlist-name").text(current_playlist.playlist_name);
      $('.playlist-tile').removeClass("active");
      $(this.playlist_doms).find(".playlist-state").removeClass("playing");
      $($(this.playlist_doms[index]).find(".playlist-state")).addClass(
        "playing"
      );
      $($(this.playlist_doms[index])).addClass("active");
      settings.saveSettings(
        "playlist_id",
        current_playlist.playlist.url.replace(/[^0-9a-z]/gi, ""),
        ""
      );
      settings.saveSettings("playlist", current_playlist, "array");

      current_route = "login";
      $("#playlist-page").addClass("hide");
      $("#login-container").removeClass("hide");
      $(".changeServerTile").removeClass("active");
      $(".settingTile").removeClass("active");
      login_page.proceed_login();
    }
  },

  handleMenuClick: function () {
    var keys = this.keys;
    $(this.playlist_doms[keys.playlist_selection]).trigger("click");
  },

  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    keys.playlist_selection += increment;
    if (keys.playlist_selection < 0) keys.playlist_selection = 0;
    if (keys.playlist_selection >= this.playlist_doms.length)
      keys.playlist_selection = this.playlist_doms.length - 1;
    this.hoverPlayListItem(keys.playlist_selection);
  },

  handleMenusUpDown: function (increment) {
    var keys = this.keys;
    keys.playlist_selection += increment;
    if (increment < 0) {
      if (keys.playlist_selection < 3) {
        return;
      } else
        this.hoverPlayListItem(keys.playlist_selection);
    } else {
      if (keys.playlist_selection >= this.playlist_doms.length)
        keys.playlist_selection = this.playlist_doms.length - 1;
      this.hoverPlayListItem(keys.playlist_selection);
    }
  },

  goBack: function () {
    if (this.prev_route == "setting-page") {
      $("#playlist-page").addClass("hide");
      $("#" + this.prev_route).removeClass("hide");
      current_route = this.prev_route;
    } else {
      $("#playlist-page").addClass("hide");
      showTopBar();
      goToHomePage();
    }
  },

  HandleKey: function (e) {
    switch (e.keyCode) {
      case tvKey.RETURN:
        if (this.isError) {
          showToast("Please connect/add to the correct playlist and try again.", "")
        } else
          this.goBack();
        break;
      case tvKey.LEFT:
        this.handleMenuLeftRight(-1);
        break;
      case tvKey.RIGHT:
        this.handleMenuLeftRight(1);
        break;
      case tvKey.UP:
        this.handleMenusUpDown(-3);
        break;
      case tvKey.DOWN:
        this.handleMenusUpDown(3);
        break;
      case tvKey.ENTER:
        this.handleMenuClick();
        break;
    }
  }
};
