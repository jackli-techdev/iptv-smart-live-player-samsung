"use strict";

function confirmParentPassword() {
  switch (current_route) {
    case "home-page":
      home_page.confirmParentPassword();
      break;
  }
}

function cancelParentPassword() {
  switch (current_route) {
    case "home-page":
      home_page.cancelParentPassword();
      break;
  }
}

document.addEventListener("keydown", function (e) {
  if (e.keyCode === tvKey.EXIT) {
    e.preventDefault();
    return;
  }
  switch (current_route) {
    case "login":
      login_page.HandleKey(e);
      break;
    case "home-page":
      home_page.HandleKey(e);
      break;
    case "channel-page":
      channel_page.HandleKey(e);
      break;
    case "vod-series-page":
      vod_series_page.HandleKey(e);
      break;
    case "vod-summary-page":
      vod_summary_variables.HandleKey(e);
      break;
    case "vod-series-player-video":
      vod_series_player_page.HandleKey(e);
      break;
    case "trailer-page":
      trailer_page.HandleKey(e);
      break;
    case "series-summary-page":
      series_summary_page.HandleKey(e);
      break;
    case "playlist-page":
      playlist_page.HandleKey(e);
      break;
    case "setting-page":
      setting_page.HandleKey(e);
      break;
    case "parent-confirm-page":
      parent_confirm_page.HandleKey(e);
      break;
    case "turn-off-page":
      turn_off_page.HandleKey(e);
      break;
    case "entire-search-page":
      entire_search_page.HandleKey(e);
      break;
    case "catch-up":
      catchup_variables.HandleKey(e);
      break;
    case "catchup-list-page":
      catchupListPage.HandleKey(e);
      break;
    case "fav-page":
      fav_page.HandleKey(e);
      break;
  }
});
