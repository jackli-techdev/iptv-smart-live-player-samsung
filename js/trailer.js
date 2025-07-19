"use strict";
var trailer = {
  player: null,
  done: false,
  backUrl: "home-page",
  isPaused: false,

  init: function (url, prev_route, type) {
    showLoader(true);
    this.backUrl = prev_route;
    $(".top-bar").addClass("hide");
    if (type == "movies") $("#vod-summary-page").addClass("hide");
    else $("#series-summary-page").addClass("hide");

    $("#trailer-player-page").show();
    currentRoute = "trailer-page";
    trailer.player = new YT.Player("trailer-player", {
      height: "100%",
      width: "100%",
      videoId: url,
      events: {
        onReady: trailer.onPlayerReady,
        onStateChange: trailer.onPlayerStateChange
      }
    });
    $("#trailer-player").on("load", function () {
      var head = $("#trailer-player").contents().find("head");
      var css = "<style>.ytp-chrome-top-buttons{display:none}</style>";
      $(head).append(css);
    });
  },

  goBack: function () {
    showLoader(false);
    currentRoute = this.backUrl;
    this.player.stopVideo();
    $("#trailer-player-page").hide();
    $("#trailer-player").remove();
    $("#trailer-player-page").html('<div id="trailer-player"></div>');
    if (this.backUrl === "vod-summary-page") {
      $(".top-bar").addClass("hide");
      $("#vod-summary-page").removeClass("hide");
    }

    if (this.backUrl === "series-summary-page")
      $("#series-summary-page").removeClass("hide");
  },

  onPlayerReady: function (event) {
    showLoader(false);
    event.target.playVideo();
    $(".ytp-chrome-top-buttons").hide();
  },

  onPlayerStateChange: function (event) { },

  seekTo: function (step) {
    var currentTime = this.player.getCurrentTime();
    var newTime = currentTime + step;
    var duration = this.player.getDuration();
    if (newTime < 0) newTime = 0;
    if (newTime > duration) newTime = duration;
    this.player.seekTo(newTime);
  },

  HandleKey: function (e) {
    switch (e.keyCode) {
      case tvKey.ArrowRight:
        this.seekTo(5);
        break;
      case tvKey.ArrowLeft:
        this.seekTo(-5);
        break;
      case tvKey.Enter:
        if (this.isPaused) this.player.playVideo();
        else this.player.pauseVideo();
        this.isPaused = !this.isPaused;
        break;
      case tvKey.Back:
        this.goBack();
        break;
    }
  }
};
