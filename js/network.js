"use strict";
var network = {
    init: function () {
        $("#network-modal").modal("show");
    },

    handleMenuClick: function () {
        this.goBack();
    },

    goBack: function () {
        $("#network-modal").modal("hide");
    },

    HandleKey: function (e) {
        switch (e.keyCode) {
            case tvKey.OK:
                this.handleMenuClick();
                break;
            case tvKey.Back:
                this.goBack();
                break;
        }
    }
};

window.addEventListener("load", (event) => {
    var isNetworkConnected = false;
    setInterval(function () {
        if (platform === "Samsung") {
            var gatewayStatus = webapis.network.isConnectedToGateway();
            if (gatewayStatus) {
                if (!isNetworkConnected) {
                    console.log("Network is connected for the first time");
                    if (current_route === 'channel-page') {
                        channel_page.showMovie(current_movie);
                    }
                    else if (current_route === 'catchup-page') {
                        catchup_variables.playPauseVideoFromNetworkIssue();
                    }
                    else if (current_route === 'vod-series-player-video') {
                        vod_series_player_page.playPauseVideoFromNetworkIssue();
                    }
                    isNetworkConnected = true;
                    network.goBack();
                }
            } else {
                if (isNetworkConnected) {
                    network.init();
                    // console.log("Network is disconnected");
                    if (current_route === 'catchup-page') {
                        catchup_variables.playPauseVideo();
                    }
                    else if (current_route === 'vod-series-player-video') {
                        vod_series_player_page.playPauseVideo();
                    }
                    isNetworkConnected = false;
                }
            }
        } else {
            try {
                webOS.service.request("luna://com.webos.service.connectionmanager", {
                    method: "getStatus",
                    parameters: {},
                    onSuccess: function (response) {
                        // console.log("response", response);
                        if (response.isInternetConnectionAvailable === true) {
                            // console.log("Network is connected.");
                            if (!isNetworkConnected) {
                                console.log("Network is connected for the first time");
                                if (current_route === 'channel-page') {
                                    channel_page.showMovie(currentMovie);
                                }
                                else if (current_route === 'catchup-page') {
                                    catchup_variables.playPauseVideoFromNetworkIssue();
                                }
                                else if (current_route === 'vod-series-player-video') {
                                    vod_series_player_page.playPauseVideoFromNetworkIssue();
                                }
                                isNetworkConnected = true;
                                network.goBack();
                            }
                        } else {
                            console.log("Network is not connected.");
                            if (isNetworkConnected) {
                                network.init();
                                // console.log("Network is disconnected");
                                if (current_route === 'catchup-page') {
                                    catchup_variables.playPauseVideo();
                                }
                                else if (current_route === 'vod-series-player-video') {
                                    vod_series_player_page.playPauseVideo();
                                }
                                isNetworkConnected = false;
                            }
                        }
                    },
                    onFailure: function (error) {
                        console.error("Failed to retrieve network status:", error);
                    }
                });
            } catch (e) {
                console.log('e', e)
            }
        }
    }, 1000);
});