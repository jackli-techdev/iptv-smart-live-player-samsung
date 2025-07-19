"use strict";

var settings = {
    translatedDoms: [],
    playlist: {},
    playlistID: 0,
    vodSort: "added",
    seriesSort: "added",
    liveSort: "default",
    sortKeys: {
        added: "order_by_added",
        number: "order_by_number",
        rating: "order_by_rating",
        name: "order_by_name",
        "a-z": "sort_a_z",
        "z-a": "sort_z_a"
    },
    language: "en",
    timeFormat: 12,
    playlistType: "",

    changeDomsLanguage: function () {
        this.getSelectedLanguageWords(settings.language);
        this.translatedDoms.each(function (index, item) {
            var wordCode = $(item).data("word_code");
            if (currentWords[wordCode] !== undefined) {
                $(item).text(currentWords[wordCode]);
            }
        });
    },

    getSelectedLanguageWords: function (code) {
        var words = [];
        for (var i = 0; i < languages.length; i++) {
            if (languages[i].code === code) {
                words = languages[i].words;
                break;
            }
        }
        currentWords = words;
    },

    saveSettings: function (key, value) {
        this[key] = value;
        saveToLocalStorage(key, value);
    },

    initFromLocal: function () {
        var temp = getLocalStorageData("playlist");
        if (temp) this.playlistID = temp.id;
        else this.playlistID = 0;

        var keys = ["vodSort", "seriesSort", "liveSort"];
        var _this = this;
        keys.forEach(function (key) {
            var temp = getLocalStorageData(key);
            if (temp) _this[key] = temp;
        });

        var localLangCode = getLocalStorageData('language');
        if (localLangCode === null)
            localLangCode = "en";

        settings.language = localLangCode;
    },
}