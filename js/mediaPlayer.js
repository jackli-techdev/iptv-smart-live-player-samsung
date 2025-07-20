"use strict";
var media_player = {
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
  state: 0,
  current_time: 0,

  live_init: function (id, parent_id, currentProgramDuration) {
    media_player.currentProgramDuration = currentProgramDuration;
    this.id = id;
    this.videoObj = null;
    media_player.state = 0;
    this.state = this.STATES.STOPPED;
    this.parent_id = parent_id;
    this.current_time = 0;

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
        that.videoObj.style.display = 'block';
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
        if (current_route === "vod-series-player-video") {
          vod_series_player_page.showResumeBar();
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
        showLoader(false);
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
      this.videoObj.addEventListener("ended", function (event) { });
    }
  },

  retryPlayAsync: function (url, retries, interval) {
    var that = this;
    retries = (typeof retries !== 'undefined') ? retries : 3;
    interval = (typeof interval !== 'undefined') ? interval : 10000;

    function attemptPlay(remainingRetries) {
      that.playAsync(url).catch(function (error) {
        console.error('Error occurred:', error);
        if (remainingRetries > 0) {
          attemptPlay(remainingRetries - 1);
        } else {
          setTimeout(function () {
            if (that.isSameChannel)
              attemptPlay(retries);
          }, interval);
        }
      });
    }

    attemptPlay(retries);
  },

  init: function (id, parent_id) {
    this.id = id;
    this.videoObj = null;
    media_player.state = 0;
    media_player.state = this.STATES.STOPPED;
    this.parent_id = parent_id;
    this.current_time = 0;

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
        that.videoObj.style.display = 'block';
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
        if (current_route === "vod-series-player-video") {
          vod_series_player_page.showResumeBar();
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
        showLoader(false);
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
      this.videoObj.addEventListener("ended", function (event) {
        if (current_route === "vod-series-player-video")
          vod_series_player_page.showNextVideo(1);
      });
    }
  },

  play: function (url) {
    if (media_player.state < this.STATES.PAUSED) {
      return;
    }
    media_player.state = this.STATES.PLAYING;
    if (url) {
      this.videoObj.src = url;
    } else {
      this.videoObj.play();
    }
  },

  playAsync: function (url) {
    if (url === this.currentURL) {
      this.isSameChannel = true;
    } else
      this.isSameChannel = false;

    if (current_route !== "channel-page")
      showLoader(true);

    this.currentURL = url;
    userAgent = getLocalStorageData("userAgent");
    var that = this;
    if (url) {
      if (useragentFlag) {
        return fetch(url, {
          headers: {
            'User-Agent': userAgent
          }
        })
          .then(function (response) {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            var newUrl = response.url;
            that.videoObj.pause();

            $("#" + that.parent_id).find(".video-error").hide();
            while (that.videoObj.firstChild)
              that.videoObj.removeChild(that.videoObj.firstChild);
            that.videoObj.load();

            var source = document.createElement("source");
            source.setAttribute("src", newUrl);
            that.videoObj.appendChild(source)

            that.videoObj.play();
            source.addEventListener("error", function (e) {
              $("#" + that.parent_id).find(".video-error").show();
            });
            source.addEventListener("emptied", function (event) {
              $("#" + that.parent_id).find(".video-error").show();
            });
            media_player.state = media_player.STATES.PLAYING;
          }).catch(function (error) {
            that.videoObj.pause();
            $("#" + that.parent_id).find(".video-error").hide();
            while (that.videoObj.firstChild)
              that.videoObj.removeChild(that.videoObj.firstChild);
            that.videoObj.load();

            var source = document.createElement("source");
            source.setAttribute("src", url);
            that.videoObj.appendChild(source)

            that.videoObj.play();
            source.addEventListener("error", function (e) {
              $("#" + that.parent_id).find(".video-error").show();
            });
            source.addEventListener("emptied", function (event) {
              $("#" + that.parent_id).find(".video-error").show();
            });
            console.error('Fetching video failed:', error);
            media_player.state = media_player.STATES.PLAYING;
          });
      } else {
        that.videoObj.pause();
        $("#" + that.parent_id).find(".video-error").hide();
        while (that.videoObj.firstChild)
          that.videoObj.removeChild(that.videoObj.firstChild);
        that.videoObj.load();

        var source = document.createElement("source");
        source.setAttribute("src", url);
        that.videoObj.appendChild(source)

        that.videoObj.play();
        source.addEventListener("error", function (e) {
          $("#" + that.parent_id).find(".video-error").show();
        });
        source.addEventListener("emptied", function (event) {
          $("#" + that.parent_id).find(".video-error").show();
        });
      }
    } else {
      media_player.state = media_player.STATES.PLAYING;
      this.videoObj.play();
    }
    media_player.state = media_player.STATES.PLAYING;
  },

  playFromNetworkIssue: function () {
    this.state = this.STATES.PLAYING;
    this.videoObj.play();
  },

  pause: function () {
    this.videoObj.pause();
    media_player.state = this.STATES.PAUSED;
  },

  stop: function () {
    this.videoObj.pause();
    media_player.state = this.STATES.STOPPED;
  },

  close: function () {
    if (this.videoObj && typeof this.videoObj.pause === 'function') {
      this.videoObj.pause();
      $("#vod-series-video-progress").css({ 'width': 0 });
      this.videoObj.style.display = 'none'; // Hide the video element
    } else {
      console.log("Video object is not initialized or does not have a pause method.");
    }
    media_player.state = this.STATES.STOPPED;
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

  getSubtitleOrAudioTrack: function (kind) {
    var totalTrackInfo;
    if (kind == 'TEXT') {
      totalTrackInfo = this.videoObj.textTracks;
    } else totalTrackInfo = this.videoObj.audioTracks;
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
