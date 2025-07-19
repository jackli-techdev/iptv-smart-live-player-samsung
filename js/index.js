var init = function () {

    login.getPlayListDetail('');
    initRangeSlider();
    settings.initFromLocal();

    document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
            webapis.avplay.suspend();
        } else {
            webapis.avplay.restore();
        }
    });
}

document.addEventListener("keyboardStateChange", keyboardVisibilityChange, false);

document.addEventListener("cursorStateChange", cursorVisibilityChange, false);

function keyboardVisibilityChange(event) {
    var visibility = event.detail.visibility;
    if (visibility) {
        isKeyboard = true;
    } else {
        isKeyboard = false;
        $("input").blur();
    }
}

function cursorVisibilityChange(event) {
    var visibility = event.detail.visibility;
    if (visibility) {
        // Do something.
    } else {
        // Do something.
    }
}

window.addEventListener("load", (event) => {
    var isNetworkConnected = false;

    setInterval(function () {
        var gatewayStatus = webapis.network.isConnectedToGateway();
        if (gatewayStatus) {
            if (!isNetworkConnected) {
                console.log("Network is connected for the first time");
                if (currentRoute === 'channel-page') {
                    channel.showMovie(channel.movies[channel.keys.channelSelection]);
                }
                else if (currentRoute === 'catchup-page') {
                    catchup.playPauseVideoFromNetworkIssue();
                }
                else if (currentRoute === 'vod-series-player-video') {
                    vodSeriesPlayer.playPauseVideoFromNetworkIssue();
                }

                isNetworkConnected = true;
                network.goBack();
            }
        } else {
            if (isNetworkConnected) {
                network.init();
                console.log("Network is disconnected");
                if (currentRoute === 'catchup-page') {
                    catchup.playPauseVideo();
                }
                else if (currentRoute === 'vod-series-player-video') {
                    vodSeriesPlayer.playPauseVideo();
                }
                isNetworkConnected = false;
            }
        }
    }, 1000);
});


document.addEventListener('keydown', function (e) {
    if (e.keyCode === 10182) {
        console.log('Exit button pressed');
        exit.init(currentRoute);
    }
});

window.onload = init;