"use strict";
var settings = {
  playlist_id: 0,
  playlist: {},
  vod_sort: "added",
  series_sort: "added",
  live_sort: "default",
  sort_keys: {
    added: "order_by_added",
    number: "order_by_number",
    rating: "order_by_rating",
    name: "order_by_name",
    "a-z": "sort_a_z",
    "z-a": "sort_z_a"
  },
  language: "en",
  time_format: "24",
  playlist_type: "",
  initFromLocal: function () {


    var temp = getLocalStorageData("playlist_id");
    if (temp) this.playlist_id = temp;
    else this.playlist_id = 0;
    var keys = ["vod_sort", "series_sort", "live_sort"];
    var that = this;
    keys.map(function (key) {
      temp = getLocalStorageData(key);
      if (temp) that[key] = temp;
    });

    temp = getLocalStorageData("language");

    if (temp) {
      this.language = temp;
    } else {
      if (typeof navigator.language != "undefined") {
        var lang_tmps = navigator.language.split("-");
        this.language = lang_tmps[0];
      }
    }
  },
  saveSettings: function (key, value, type) {
    this[key] = value;
    if (type === "object" || type === "array") value = JSON.stringify(value);
    saveToLocalStorage(key, value);
  }
};
