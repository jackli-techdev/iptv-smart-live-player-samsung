"use strict";
var trailer_page = {
  player: null,
  done: false,
  back_url: "home-page",
  is_paused: false,
  init: function (url, prev_route, type) {
    showLoader(true);
    this.back_url = prev_route;
    hideTopBar();
    if (type == "movies") $("#vod-summary-page").addClass("hide");
    else $("#series-summary-page").addClass("hide");

    $("#trailer-player-page").show();
    current_route = "trailer-page";
    trailer_page.player = new YT.Player("trailer-player", {
      height: "100%",
      width: "100%",
      videoId: url,
      events: {
        onReady: trailer_page.onPlayerReady,
        onStateChange: trailer_page.onPlayerStateChange
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
    current_route = this.back_url;
    this.player.stopVideo();
    $("#trailer-player-page").hide();
    $("#trailer-player").remove();
    $("#trailer-player-page").html('<div id="trailer-player"></div>');
    if (this.back_url === "vod-summary-page") {
      hideTopBar();
      $("#vod-summary-page").removeClass("hide");
    }

    if (this.back_url === "series-summary-page")
      $("#series-summary-page").removeClass("hide");
  },
  onPlayerReady: function (event) {
    showLoader(false);
    event.target.playVideo();
    $(".ytp-chrome-top-buttons").hide();
  },
  onPlayerStateChange: function (event) { },
  seekTo: function (step) {
    var current_time = this.player.getCurrentTime();
    var new_time = current_time + step;
    var duration = this.player.getDuration();
    if (new_time < 0) new_time = 0;
    if (new_time > duration) new_time = duration;
    this.player.seekTo(new_time);
  },
  HandleKey: function (e) {
    switch (e.keyCode) {
      case tvKey.RETURN:
        this.goBack();
        break;
      case tvKey.RIGHT:
        this.seekTo(5);
        break;
      case tvKey.LEFT:
        this.seekTo(-5);
        break;
      case tvKey.ENTER:
        if (this.is_paused) this.player.playVideo();
        else this.player.pauseVideo();
        this.is_paused = !this.is_paused;
        break;
    }
  }
};
