function initRangeSlider() {
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

function setCurrentTime(time) {
    mediaPlayer.videoObj.currentTime = time
}