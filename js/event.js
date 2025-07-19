"use strict";

document.addEventListener("keydown", function (e) {
    if (e.keyCode == tvKey.Exit)
        tizen.application.getCurrentApplication().exit();

    switch (e.keyCode) {
        case 65376: // Done
        case 65385: // Cancel
            $('input').blur();
            return;
    }

    switch (currentRoute) {
        case "login":
            login.HandleKey(e);
            break;
        case "home-page":
            home.HandleKey(e);
            break;
        case "channel-page":
            channel.HandleKey(e);
            break;
        case "vod-series-page":
            vodSeries.HandleKey(e);
            break;
        case "vod-summary-page":
            vodSummary.HandleKey(e);
            break;
        case "vod-series-player-video":
            vodSeriesPlayer.HandleKey(e);
            break;
        case "trailer-page":
            trailer.HandleKey(e);
            break;
        case "series-summary-page":
            seriesSummary.HandleKey(e);
            break;
        case "playlist-page":
            playlists.HandleKey(e);
            break;
        case "setting-page":
            setting.HandleKey(e);
            break;
        case "parent-confirm-page":
            parentConfirm.HandleKey(e);
            break;
        case "exit-modal":
            exit.HandleKey(e);
            break;
        case "entire-search-page":
            entireSearch.HandleKey(e);
            break;
        case "catchup-page":
            catchup.HandleKey(e);
            break;
        case 'network-page':
            network.HandleKey(e);
            break;
    }
});
