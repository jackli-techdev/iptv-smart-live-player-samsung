"use strict";
var mediaPlayer = {
  videoObj: null,
  parent_id: "",
  currentURL: "",
  isSameChannel: false,
  STATES: {
    STOPPED: 0,
    PLAYING: 1,
    PAUSED: 2,
    PREPARED: 4
  },
  currentTime: 0,
  isEnded: false,
  reConnectTimer: null,
  reConnectCount: 0,
  reconnectMaxCount: 20,

  live_init: function (id, parent_id) {
    this.id = id;
    this.videoObj = null;
    this.state = 0;
    this.state = this.STATES.STOPPED;
    this.parent_id = parent_id;
    this.currentTime = 0;
    var that = this;

    if (!this.videoObj && id) {
      this.videoObj = document.getElementById(id);
      var videoObj = this.videoObj;
      var that = this;

      this.reConnectCount = 0;
      clearTimeout(this.reConnectTimer);

      this.videoObj.addEventListener("error", function (e) {
        $("#" + that.parent_id).find(".video-error").show();
        that.retryPlayAsync();
      });

      this.videoObj.addEventListener("canplay", function (e) {
        $("#" + that.parent_id).find(".video-error").hide();
        $('#' + that.parent_id).find('.reconnect-noti').hide();
        that.reConnectCount = 0;
        clearTimeout(that.reConnectTimer);

      });
      this.videoObj.addEventListener("durationchange", function (event) { });
      this.videoObj.addEventListener("loadeddata", function (event) {
        $("#" + that.parent_id).find(".video-error").hide();
        var duration = parseInt(videoObj.duration);
        var attributes = {
          min: 0,
          max: duration
        };
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .attr(attributes);
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .rangeslider("update", true);
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .prop("disabled", false);
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .rangeslider("update");

        $('#' + that.parent_id).find('.reconnect-noti').hide();
        that.reConnectCount = 0;
        clearTimeout(that.reConnectTimer);
      });

      $('#' + that.parent_id).find('.reconnect-noti').hide();

      this.videoObj.ontimeupdate = function (event) {
        var duration = videoObj.duration;
        var currentTime = videoObj.currentTime;
        if (duration > 0) {
          $("#" + that.parent_id)
            .find(".progress-amount")
            .css({ width: currentTime / duration * 100 + "%" });
          $("#" + that.parent_id)
            .find(".video-progress-bar-slider")
            .val(currentTime)
            .change();
          $("#" + that.parent_id)
            .find(".video-current-time")
            .html(that.formatTime(currentTime));
        }
      };

      this.videoObj.addEventListener("loadedmetadata", function () {
        var duration = parseInt(videoObj.duration);
        var attributes = {
          min: 0,
          max: duration
        };
        $("#" + that.parent_id)
          .find(".video-total-time")
          .text(that.formatTime(duration));
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .attr(attributes);
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .rangeslider("update", true);
        var width = videoObj.videoWidth;
        var height = videoObj.videoHeight;
        $(".video-resolution").text(width + 'x' + height + 'px')
      });

      this.videoObj.addEventListener("waiting", function (event) { });
      this.videoObj.addEventListener("suspend", function (event) { });
      this.videoObj.addEventListener("stalled", function (event) { });
      this.videoObj.addEventListener("ended", function (event) {
        that.retryPlayAsync();
      });
    }
  },

  init: function (id, parent_id) {
    var _this = this;
    this.id = id;
    this.videoObj = null;
    this.state = 0;
    this.state = this.STATES.STOPPED;
    this.parent_id = parent_id;
    this.currentTime = 0;

    if (!this.videoObj && id) {
      this.videoObj = document.getElementById(id);
      var videoObj = this.videoObj;
      var that = this;
      this.videoObj.addEventListener("error", function (e) {
        $("#" + that.parent_id).find(".video-error").show();
      });
      this.videoObj.addEventListener("canplay", function (e) {
        $("#" + that.parent_id).find(".video-error").hide();
      });
      this.videoObj.addEventListener("durationchange", function (event) { });
      this.videoObj.addEventListener("loadeddata", function (event) {
        var duration = parseInt(videoObj.duration);
        var attributes = {
          min: 0,
          max: duration
        };
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .attr(attributes);
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .rangeslider("update", true);
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .prop("disabled", false);
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .rangeslider("update");
        if (currentRoute === "vod-series-player-video") {
          vodSeriesPlayer.showResumeBar();
        }
      });
      this.videoObj.ontimeupdate = function (event) {
        $("#" + that.parent_id).find(".video-error").hide();
        var duration = videoObj.duration;
        var currentTime = videoObj.currentTime;
        if (duration > 0) {
          $("#" + that.parent_id)
            .find(".progress-amount")
            .css({ width: currentTime / duration * 100 + "%" });
          $("#" + that.parent_id)
            .find(".video-progress-bar-slider")
            .val(currentTime)
            .change();
          $("#" + that.parent_id)
            .find(".video-current-time")
            .html(that.formatTime(currentTime));
        }
      };
      this.videoObj.addEventListener("loadedmetadata", function () {
        var duration = parseInt(videoObj.duration);

        var attributes = {
          min: 0,
          max: duration
        };
        $("#" + that.parent_id)
          .find(".video-total-time")
          .text(that.formatTime(duration));
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .attr(attributes);
        $("#" + that.parent_id)
          .find(".video-progress-bar-slider")
          .rangeslider("update", true);
      });
      this.videoObj.addEventListener("waiting", function (event) { });
      this.videoObj.addEventListener("suspend", function (event) { });
      this.videoObj.addEventListener("stalled", function (event) { });

      function onVideoEnded() {
        if (!mediaPlayer.isEnded) {
          vodSeriesPlayer.showNextVideo(1);
          mediaPlayer.isEnded = true
        }
      }
      this.videoObj.addEventListener("ended", onVideoEnded);
    }
  },

  play: function () {
    if (this.state < this.STATES.PAUSED) {
      return;
    }
    this.state = this.STATES.PLAYING;
    this.videoObj.play();
  },

  playFromNetworkIssue: function () {
    this.state = this.STATES.PLAYING;
    this.videoObj.play();
  },

  retryPlayAsync: function () {
    if (currentRoute !== "channel-page")
      return;
    clearTimeout(this.reConnectTimer);
    this.reConnectCount += 1;
    if (this.reConnectCount >= this.reconnectMaxCount) {
      $('#' + this.parent_id).find('.reconnect-noti').hide();
      return;
    }
    $('#' + this.parent_id).find('.reconnect-noti').show();
    var that = this;
    try {
      this.videoObj.pause();
    } catch (e) {
    }
    this.reconnectTimer = setTimeout(function () {
      that.playAsync(that.currentURL);
    }, 4000)
  },

  playAsync: function (url) {
    console.log('url', url)
    mediaPlayer.isEnded = false
    if (url === this.currentURL) {
      this.isSameChannel = true;
    } else
      this.isSameChannel = false;

    this.currentURL = url;

    if (url) {
      try {
        this.videoObj.pause();
      } catch (e) {
      }

      var that = this;
      if (this.reConnectCount < 1)
        $("#" + this.parent_id).find(".video-error").hide();
      while (this.videoObj.firstChild)
        this.videoObj.removeChild(this.videoObj.firstChild);
      this.videoObj.load();

      var source = document.createElement("source");
      source.setAttribute("src", url);
      this.videoObj.appendChild(source)

      this.videoObj.play();
      $('#' + this.parent_id).find('.progress-amount').css({ width: 0 })
      source.addEventListener("error", function (e) {
        $('#' + that.parent_id).find(".video-error").show();
        that.retryPlayAsync();
      });
      source.addEventListener("emptied", function (e) {
        $('#' + that.parent_id).find('.video-error').show();
        that.retryPlayAsync();
      });
    } else {
      this.videoObj.play();
    }
    this.state = this.STATES.PLAYING;
  },

  pause: function () {
    try {
      this.videoObj.pause();
    } catch (e) {
    }
    this.state = this.STATES.PAUSED;
  },

  stop: function () {
    try {
      this.videoObj.pause();
    } catch (e) {
    }
    this.state = this.STATES.STOPPED;
  },

  close: function () {
    try {
      this.videoObj.pause();
    } catch (e) {
    }
    this.state = this.STATES.STOPPED;
  },

  formatTime: function (seconds) {
    var hh = Math.floor(seconds / 3600),
      mm = Math.floor(seconds / 60) % 60,
      ss = Math.floor(seconds) % 60;
    return (
      (hh ? (hh < 10 ? "0" : "") + hh + ":" : "") +
      (mm < 10 ? "0" : "") +
      mm +
      ":" +
      (ss < 10 ? "0" : "") +
      ss
    );
  },

  getAudioTracks: function () {
    var vid = this.videoObj;
    var totalTrackInfo;
    totalTrackInfo = vid.audioTracks;
    return totalTrackInfo;
  },

  setDisplayArea_0: function () {
    this.videoObj.width = 1920;
    this.videoObj.height = 1080;
  },

  setDisplayArea_1: function () {
    this.videoObj.width = parseInt($(this.videoObj).width());
    this.videoObj.height = parseInt($(this.videoObj).height());
  }
};
