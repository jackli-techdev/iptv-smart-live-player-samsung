"use strict";
var playlists = {
    prevRoute: "",
    isError: false,
    keys: {
        playlistSelection: 0
    },
    playlistDoms: [],

    init: function (prevRoute) {
        if (!playlists.isError)
            $(".exit-index").addClass("hide");
        else
            $(".exit-index").removeClass("hide");

        this.prevRoute = prevRoute;
        this.renderPlaylist();
        currentRoute = "playlist-page";
        displayCurrentPage(currentRoute);
    },

    renderPlaylist: function () {
        var htmlContents = "";
        var currentPlaylistId = settings.playlist.id;
        var keys = this.keys;
        playlistURLs.map(function (item, index) {
            var isPlaying = currentPlaylistId === item.id ? true : false;
            if (playlistURLs.length === 1) isPlaying = true
            keys.playlistSelection = currentPlaylistId === item.id ? index : 0
            var itemURL = item.playlist.is_protected == 1 ? currentWords["playlist_protected"] : item.url
            htmlContents +=
                '<div class="playlist-item-container ' + (isPlaying ? "active" : "") + '" onmouseenter="playlists.hoverPlayListItem(' +
                index +
                ')" onclick="playlists.changePlaylist(' +
                index +
                ')">' +
                '<div class="playlist-name">' +
                item.playlistName +
                "</div>" +
                '<span class="playlist-icon-wrapper">' +
                itemURL +
                '</span> <div class="playlist-state ' +
                (isPlaying ? "playing" : "") +
                '">Connected</div>' +
                '</div>';

        });
        $("#playlist-items-container").html(htmlContents);
        this.playlistDoms = $(".playlist-item-container");
    },

    hoverPlayListItem: function (index) {
        var keys = this.keys;
        keys.playlistSelection = index;
        $(this.playlistDoms).removeClass("active");
        $(this.playlistDoms[index]).addClass("active");
        moveScrollPosition(
            $("#playlist-items-container"),
            this.playlistDoms[index],
            "vertical",
            false
        );
    },

    changePlaylist: function (index) {
        var currentPlaylist = playlistURLs[index];
        if (currentPlaylist.id === settings.playlist_id) {
            this.goBack();
        } else {
            $(home.menu_doms).removeClass("active");
            $(this.playlistDoms).find(".playlist-state").removeClass("playing");
            $($(this.playlistDoms[index]).find(".playlist-state")).addClass("playing");

            settings.saveSettings("playlist", currentPlaylist);

            currentRoute = "login";
            $("#playlist-page").addClass("hide");
            $("#login-container").removeClass("hide");
            $(".changeServerTile").removeClass("active");
            $(".settingTile").removeClass("active");
            login.proceedLogin();
        }
    },

    handleMenuClick: function () {
        var keys = this.keys;
        $(this.playlistDoms[keys.playlistSelection]).trigger("click");
    },

    handleMenuLeftRight: function (increment) {
        var keys = this.keys;
        keys.playlistSelection += increment;
        if (keys.playlistSelection < 0) keys.playlistSelection = 0;
        if (keys.playlistSelection >= this.playlistDoms.length)
            keys.playlistSelection = this.playlistDoms.length - 1;
        this.hoverPlayListItem(keys.playlistSelection);
    },

    handleMenusUpDown: function (increment) {
        var keys = this.keys;
        keys.playlistSelection += increment;
        if (keys.playlistSelection < 0)
            keys.playlistSelection = keys.playlistSelection - increment
        if (keys.playlistSelection >= this.playlistDoms.length)
            keys.playlistSelection = this.playlistDoms.length - 1;
        this.hoverPlayListItem(keys.playlistSelection);
    },

    goBack: function () {
        if (this.prevRoute == "setting-page") {
            $("#playlist-page").addClass("hide");
            $("#" + this.prevRoute).removeClass("hide");
            currentRoute = this.prevRoute;
        } else {
            $("#playlist-page").addClass("hide");
            $(".top-bar").removeClass("hide");
            $("#home-page").removeClass("hide");
            currentRoute = "home-page";
        }
    },

    HandleKey: function (e) {
        switch (e.keyCode) {
            case tvKey.ArrowLeft:
                this.handleMenuLeftRight(-1);
                break;
            case tvKey.ArrowRight:
                this.handleMenuLeftRight(1);
                break;
            case tvKey.ArrowUp:
                this.handleMenusUpDown(-3);
                break;
            case tvKey.ArrowDown:
                this.handleMenusUpDown(3);
                break;
            case tvKey.Enter:
                this.handleMenuClick();
                break;
            case tvKey.ColorF0Red:
                exit.init(currentRoute);
                break;
            case tvKey.Back:
                if (this.isError) {
                    showToast("Please add correct playlist and try again.", "")
                } else
                    this.goBack();
                break;
        }
    }
};
