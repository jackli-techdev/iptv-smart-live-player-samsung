"use strict";
var setting_page = {
  player: null,
  keys: {
    focused_part: "menu_selection",
    menu_selection: 0,
    time_format_modal: 0,
    hide_category_modal: 0,
    clear_history_series_modal: 0,
    clear_history_movies_modal: 0,
    clear_history_modal_button: 0,
    clear_history_movies_modal_button: 0,
    subtitle_selection: 0,
    subtitle_font_selection: 0,
    subtitle_font_size: 30,
    subtitle_color_selection: 0,
    subtitle_background_selection: 0,
    clearCacheSelection: 0,
    clear_history_channels_modal: 0,
    clear_history_channels_modal_button: 0,
    liveChannelSettingsSelection: 0,
    useragent_selection: -1,
  },
  useragentItemDoms: [],
  menu_doms: $(".setting-menu-item-wrapper"),
  prev_focus_dom: [],
  clear_history_channels_modal_button_dom: $(
    ".clear-history-channels-modal-button"
  ),
  clear_history_modal_button_dom: $(".clear-history-modal-button"),
  clear_history_modal_button_dom: $(".clear-history-modal-button"),
  clear_history_movies_modal_button_dom: $(
    ".clear-history-movies-modal-button"
  ),
  subtitle_settings_modal_dom: $(
    "#subtitle-settings-body .hide-category-modal-option"
  ),
  subtitle_font_dom: $(".subtitle-fontsize-wrapper .increase-fontsize-btn"),
  subtitle_color_dom: $(".subtitle-color-item .color-item"),
  subtitle_background_dom: $(".subtitle-background-item .background-item"),
  sortChannelsDoms: $('.sort-channels-item'),
  initiated: false,
  parent_control_doms: [],
  hide_category_doms: [],
  clear_history_channels_doms: [],
  clear_history_movies_doms: [],
  clear_history_series_doms: [],
  hide_category_movie_type: "",
  clear_history_movies_type: "",
  clear_history_series_type: "",
  doms_translated: [],
  language_doms: [],
  clearHistoryChannelsIds: [],
  clearHistorySeriesIds: [],
  clearHistoryMoviesIds: [],


  init: function () {
    var keys = this.keys;
    this.prev_focus_dom = [];

    keys.focused_part = "menu_selection";
    keys.menu_selection = 0;
    this.prev_focus_dom = this.menu_doms[0];
    current_route = "setting-page";
    hideTopBar();
    hideVodSeriesPage();
    $(".setting-mac-address").removeClass("hide");
    this.updateSubtitleSetting();
    var parent_control_doms = $(
      "#parent-control-modal .parent-modal-input-item-container"
    );
    $("#parent-control-modal .parent-control-modal-button").map(function (
      index,
      item
    ) {
      parent_control_doms.push(item);
    });
    this.parent_control_doms = parent_control_doms;
    this.hoverSettingMenu(0);
    displayCurrentPage(current_route);
  },

  updateSubtitleSetting: function () {
    var storedSubtitleColor = getLocalStorageData('subtitleColor') !== null ? getLocalStorageData('subtitleColor') : textTracksColor
    var storedTextTrackFontSize = getLocalStorageData('textTracksFontSize') !== null ? getLocalStorageData('textTracksFontSize') : textTracksFontSize
    var storedSubtitleBackgroundColor = getLocalStorageData('subtitleBackgroundColor') !== null ? getLocalStorageData('subtitleBackgroundColor') : subtitleBackgroundColor

    $('.subtitle-font-size').text(storedTextTrackFontSize)
    $(".subtitle-setting-modal-option-color").css({
      background: storedSubtitleColor
    });
    $(".subtitle-example-text").css({
      color: storedSubtitleColor
    });


    if (storedSubtitleBackgroundColor !== "none") {
      $(".subtitle-setting-modal-option-bk").css({
        background: storedSubtitleBackgroundColor
      });
      $(".subtitle-example-text-item").css({
        background: storedSubtitleBackgroundColor
      });
    }
    else
      $(".subtitle-setting-modal-option-bk").css({ background: "transparent", border: "solid 1px white" });
  },

  goBack: function () {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
        $("#setting-page").addClass("hide");
        $(".setting-mac-address").addClass("hide");
        goToHomePage();
        break;
      case "parent_control_modal":
        this.cancelResetParentAccount();
        break;
      case "user_account_modal":
        $("#user-account-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "clear_history_channels_modal":
        $("#clear-history-channels-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "clear_history_channels_button":
        $("#clear-history-channels-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "clear_history_movies_modal":
        $("#clear-history-movies-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "clear_history_movies_button":
        $("#clear-history-movies-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "clear_history_series_modal":
        $("#clear-history-series-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "clear_history_series_button":
        $("#clear-history-series-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "hide_category_modal":
        $("#hide-category-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "language_selection":
        $("#language-select-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "time_format_modal":
        $("#time-format-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "add_playlist_page":
        $("#language-select-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "subtitle_settings":
        $("#subtitle-settings-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "subtitle_color_settings":
        $("#subtitle-settings-color-modal").modal("hide");
        $("#subtitle-settings-modal").modal("show");
        keys.focused_part = "subtitle_settings";
        break;
      case "subtitle_background_settings":
        $("#subtitle-settings-background-modal").modal("hide");
        $("#subtitle-settings-modal").modal("show");
        keys.focused_part = "subtitle_settings";
        break;
      case "clearCacheSelection":
        $("#clear-cache-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "contactus_modal":
        $("#contactus-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "liveChannelSettingsModal":
        $("#live-settings-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
      case "useragent_modal":
        $("#useragent-modal").modal("hide");
        keys.focused_part = "menu_selection";
        break;
    }
  },
  showParentControlModal: function () {
    $("#parent-account-valid-error").hide();
    $(".parent-modal-input-wrapper input").val("");
    $("#parent-control-modal").modal("show");
    this.keys.focused_part = "parent_control_modal";
    $(this.parent_control_doms).removeClass("active");
    this.keys.parent_control_modal = 0;
    $(this.parent_control_doms[0]).addClass("active");
    $(this.parent_control_doms[0]).find("input").focus();
  },

  clickParentControl: function (index) {
    var keys = this.keys;
    keys.parent_control_modal = index;
    switch (keys.parent_control_modal) {
      case 0:
      case 1:
      case 2:
        $(this.parent_control_doms[index]).find("input").focus();
        var that = this;
        setTimeout(function () {
          var tmp = $(that.parent_control_doms[index]).find("input").val();
          $(that.parent_control_doms[index])
            .find("input")[0]
            .setSelectionRange(tmp.length, tmp.length);
        }, 200);
        break;
      case 3:
        this.resetParentAccount();
        break;
      case 4:
        this.cancelResetParentAccount();
        break;
    }
  },
  resetParentAccount: function () {
    $("#parent-account-valid-error").hide();
    var origin_parent_password = $("#current_parent_password").val();
    var new_password = $("#new_parent_password").val();
    var new_password_confirm = $("#new_parent_password_confirm").val();
    if (origin_parent_password != parent_account_password) {
      $("#parent-account-valid-error")
        .text("Current password does not match")
        .slideDown();
      return;
    }
    if (new_password != new_password_confirm) {
      $("#parent-account-valid-error")
        .text("Password does not match")
        .slideDown();
      return;
    }
    parent_account_password = new_password;

    saveToLocalStorage("parent_account_password", parent_account_password);
    $("#parent-control-modal").modal("hide");
    this.keys.focused_part = "menu_selection";
  },
  cancelResetParentAccount: function () {
    $("#parent-control-modal").modal("hide");
    this.keys.focused_part = "menu_selection";
  },
  getSelectedLanguageWords: function (code) {
    var words = [];
    for (var i = 0; i < languages.length; i++) {
      if (languages[i].code === code) {
        words = languages[i].words;
        break;
      }
    }
    current_words = words;
  },

  showHideCategoryModal: function (movie_type) {
    this.hide_category_movie_type = movie_type;
    var categories;
    if (movie_type === "live")
      categories = MovieHelper.getCategories("live", true, false);
    if (movie_type === "movie" || movie_type === "vod")
      categories = MovieHelper.getCategories("vod", true, false);
    if (movie_type === "series")
      categories = MovieHelper.getCategories("series", true, false);
    var htmlContent = "";
    categories.map(function (category, index) {
      htmlContent +=
        '<div class="hide-category-modal-option"' +
        '   onclick="setting_page.clickHideCategory(' +
        index +
        ')"' +
        '   onmouseenter="setting_page.hoverHideCategory(' +
        index +
        ')"' +
        ">" +
        '   <input class="hide-category-checkbox" type="checkbox" name="checkbox"' +
        '       id="hide-category-element-' +
        category.category_id +
        '" ' +
        (category.is_hide ? "checked" : "") +
        ' value="' +
        category.category_id +
        '">' +
        '   <label for="hide-category-item-' +
        category.category_id +
        '">' +
        category.category_name +
        "</label>" +
        "</div>";
    });
    $("#hide-modal-categories-container").html(htmlContent);
    $("#hide-category-modal").modal("show");
    $($(".hide-category-modal-option")).removeClass("active");
    $($(".hide-category-modal-option")[0]).addClass("active");
    $($(".hide-category-btn-wrapper")).removeClass("active");
    var hide_category_doms = $(".hide-category-modal-option");
    this.hide_category_doms = hide_category_doms;
    this.keys.focused_part = "hide_category_modal";
    this.keys.hide_category_modal = 0;
    $(this.hide_category_doms).removeClass("active");
    $(this.hide_category_doms[0]).addClass("active");
    $("#hide-modal-categories-container").scrollTop(0);
  },

  showClearCacheModal: function () {
    var keys = this.keys;
    $("#clear-cache-modal").modal("show");
    $($('.clear-cache-modal-button')[keys.clearCacheSelection]).addClass("active")
    keys.focused_part = "clearCacheSelection";
  },

  hoverClearCacheBtn: function (index) {
    var keys = this.keys;
    keys.focused_part = "clearCacheSelection";
    keys.clearCacheSelection = index;
    $($('.clear-cache-modal-button')).removeClass("active")
    $($('.clear-cache-modal-button')[keys.clearCacheSelection]).addClass("active")
  },

  clearLocalstorageData: function () {
    var prefix = storage_id;

    for (var i = localStorage.length - 1; i >= 0; i--) {
      var key = localStorage.key(i);
      if (key.indexOf(prefix) === 0) { // Check if key starts with prefix
        localStorage.removeItem(key);
      }
    }

    for (var j = 0; j < localStorage.length; j++) {
      console.log(localStorage.key(j));
    }
  },

  handleClearCacheClick: function () {
    var keys = this.keys;
    $("#clear-cache-modal").modal("hide");
    if (keys.clearCacheSelection == 0) {
      $('.setting-icon').removeClass("active");
      this.clearLocalstorageData();
      current_route = "login";
      showLoadImage();
      $("#app").addClass("hide");
      login_page.getPlayListDetail('reload');
      initRangeSider();
      settings.initFromLocal();
    } else {
      keys.focused_part = "menu_selection"
    }
  },

  showTimeFormat: function () {
    $("#time-format-modal").modal("show");

    var _12_hour_format = current_words["_12_hour_format"];
    var _24_hour_format = current_words["_24_hour_format"];
    var htmlContent = "";
    htmlContent +=
      '<div class="time-format-modal-option" onclick="setting_page.clickTimeFormat0(0)" onmouseenter= "setting_page.hoverTimeFormat(0)"  >' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="time-format-12"' +
      (time_format == 12 ? "checked" : "") +
      ' value="12">' +
      '   <label for="time-format-12" data-word_code="_12_hour_format" >' +
      _12_hour_format +
      "</label></div>" +
      '<div class="time-format-modal-option" onclick="setting_page.clickTimeFormat1(1)" onmouseenter= "setting_page.hoverTimeFormat(1)">' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="time-format-24"' +
      (time_format == 24 ? "checked" : "") +
      ' value="24">' +
      '   <label for="time-format-24" data-word_code="_24_hour_format">' +
      _24_hour_format +
      "</label></div>";
    $("#time-format-modal-container").html(htmlContent);
    $($(".time-format-modal-option")).removeClass("active");
    if (time_format == 12) {
      $($(".time-format-modal-option")[0]).addClass("active");
    } else $($(".time-format-modal-option")[1]).addClass("active");
    this.keys.focused_part = "time_format_modal";
  },

  clickHideCategory: function (index) {
    var current_item = this.hide_category_doms[index];
    var current_value = $($(current_item).find("input")[0]).prop("checked");
    current_value = !current_value;
    $($(current_item).find("input")[0]).prop("checked", current_value);
    if (this.hide_category_movie_type === "live")
      MovieHelper.saveHiddenCategories("live", index, current_value);
    else if (
      this.hide_category_movie_type === "movie" ||
      this.hide_category_movie_type === "vod"
    )
      MovieHelper.saveHiddenCategories("vod", index, current_value);
    else MovieHelper.saveHiddenCategories("series", index, current_value);
  },

  clickClearHistoryChannels: function (index, id) {
    var current_item = this.clear_history_channels_doms[index];
    var current_value = $($(current_item).find("input")[0]).prop("checked");
    current_value = !current_value;
    $($(current_item).find("input")[0]).prop("checked", current_value);
    var clearHistoryChannelsIds = this.clearHistoryChannelsIds;

    if (current_value) {
      if (!clearHistoryChannelsIds.includes(id)) {
        clearHistoryChannelsIds.push(id);
      }
    } else {
      var index = clearHistoryChannelsIds.indexOf(id);
      if (index > -1) {
        clearHistoryChannelsIds.splice(index, 1);
      }
    }
    this.clearHistoryChannelsIds = clearHistoryChannelsIds;
  },

  clickClearHistoryMovies: function (index, id) {
    var current_item = this.clear_history_movies_doms[index];
    var current_value = $($(current_item).find("input")[0]).prop("checked");
    current_value = !current_value;
    $($(current_item).find("input")[0]).prop("checked", current_value);
    var clearHistoryMoviesIds = this.clearHistoryMoviesIds;

    if (current_value) {
      if (!clearHistoryMoviesIds.includes(id)) {
        clearHistoryMoviesIds.push(id);
      }
    } else {
      var index = clearHistoryMoviesIds.indexOf(id);
      if (index > -1) {
        clearHistoryMoviesIds.splice(index, 1);
      }
    }
    this.clearHistoryMoviesIds = clearHistoryMoviesIds;
  },

  clickClearHistorySeries: function (index, id) {
    var current_item = this.clear_history_series_doms[index];
    var current_value = $($(current_item).find("input")[0]).prop("checked");
    current_value = !current_value;
    $($(current_item).find("input")[0]).prop("checked", current_value);
    var clearHistorySeriesIds = this.clearHistorySeriesIds;

    if (current_value) {
      if (!clearHistorySeriesIds.includes(id)) {
        clearHistorySeriesIds.push(id);
      }
    } else {
      var index = clearHistorySeriesIds.indexOf(id);
      if (index > -1) {
        clearHistorySeriesIds.splice(index, 1);
      }
    }
    this.clearHistorySeriesIds = clearHistorySeriesIds;
  },

  clickSelectAllClearHistorySeries: function () {
    var clear_history_series_doms = this.clear_history_series_doms;
    var clearHistorySeriesIds = this.clearHistorySeriesIds;
    var item_length = clear_history_series_doms.length;
    for (var i = 0; i < item_length; i++) {
      var current_item = clear_history_series_doms[i];
      var current_value = $($(current_item)).prop("checked");
      var current_value_id = $($(current_item)).data("series_id");
      if (!clearHistorySeriesIds.includes(current_value_id)) {
        clearHistorySeriesIds.push(current_value_id);
      }
      $($(current_item).find("input")[0]).prop("checked", !current_value);
    }
    this.clearHistorySeriesIds = clearHistorySeriesIds;
  },

  clickSelectAllClearHistoryMovies: function (index, id) {
    var clear_history_movies_doms = this.clear_history_movies_doms;
    var clearHistoryMoviesIds = this.clearHistoryMoviesIds;
    var item_length = clear_history_movies_doms.length;
    for (var i = 0; i < item_length; i++) {
      var current_item = clear_history_movies_doms[i];
      var current_value = $($(current_item)).prop("checked");
      var current_value_id = $($(current_item)).data("series_id");
      if (!clearHistoryMoviesIds.includes(current_value_id)) {
        clearHistoryMoviesIds.push(current_value_id);
      }
      $($(current_item).find("input")[0]).prop("checked", !current_value);
    }
    this.clearHistoryMoviesIds = clearHistoryMoviesIds;
  },

  hoverSelectAllClearHistoryMovies: function () { },

  hoverSelectAllClearHistorySeries: function () { },

  clickTimeFormat0: function (index) {
    var time_format_doms = $(".time-format-modal-option");
    var current_item = time_format_doms[index];
    var temp = 0;
    if (index == 0) temp = 1;
    else temp = 0;

    var temp_item = time_format_doms[temp];
    var current_value = $($(current_item).find("input")[0]).prop("checked");

    if (current_value == false)
      current_value = true
    $($(current_item).find("input")[0]).prop("checked", current_value);
    $($(temp_item).find("input")[0]).prop("checked", !current_value);
    if (index == 0) {
      time_format = 12;
    } else time_format = 24;
    saveToLocalStorage('timeFormat', time_format);
  },

  clickTimeFormat1: function (index) {
    var time_format_doms = $(".time-format-modal-option");
    var current_item = time_format_doms[index];
    var temp = 0;
    if (index == 0) temp = 1;
    else temp = 0;

    var temp_item = time_format_doms[temp];
    var current_value = $($(current_item).find("input")[0]).prop("checked");

    if (current_value == false)
      current_value = true

    $($(current_item).find("input")[0]).prop("checked", current_value);
    $($(temp_item).find("input")[0]).prop("checked", !current_value);

    if (index == 0) {
      time_format = 12;
    } else time_format = 24;
    saveToLocalStorage('timeFormat', time_format);
  },

  showLanguages: function () {
    var keys = this.keys;
    keys.focused_part = "language_selection";
    keys.language_selection = 0;
    var language_doms = this.language_doms;
    language_doms.map(function (index, item) {
      var language = $(item).data("language");
      if (language == settings.language) {
        keys.language_selection = index;
      }
    });
    $(language_doms).removeClass("active");
    $(language_doms[keys.language_selection]).addClass("active");
    $("#language-select-modal").modal("show");
    moveScrollPosition(
      $("#select-language-body"),
      language_doms[keys.language_selection],
      "vertical",
      false
    );
  },

  showSubtitleSettings: function () {
    var keys = this.keys;
    keys.focused_part = "subtitle_settings";
    keys.subtitle_selection = 0;
    $("#subtitle-settings-modal").modal("show");
  },

  selectLanguage: function (code, index) {
    settings.saveSettings("language", code, "");
    var keys = this.keys;
    keys.language_selection = index;
    $(this.language_doms).removeClass("active");
    $(this.language_doms[index]).addClass("active");
    $("#language-select-modal").modal("hide");
    keys.focused_part = "menu_selection";
    this.changeDomsLanguage();
  },
  changeDomsLanguage: function () {
    this.getSelectedLanguageWords(settings.language);
    var doms_translated = this.doms_translated;
    doms_translated.map(function (index, item) {
      var word_code = $(item).data("word_code");
      if (typeof current_words[word_code] != "undefined") {
        $(item).text(current_words[word_code]);
      }
    });
    document.getElementById('vod-series-category-search-value').placeholder = current_words['search_category'];
    document.getElementById('live-category-search-value').placeholder = current_words['search_category'];
    document.getElementById("entire-search-input").placeholder = current_words['search'];
  },
  confirmParentPassword: function () {
    $("#parent-confirm-password-error").hide();
    var typed_parent_password = $("#parent-confirm-password").val();
    if (parent_account_password === typed_parent_password) {
      $("#parent-confirm-modal").modal("hide");
      this.keys.focused_part = this.keys.prev_focus;
      this.showCategoryContent();
    } else {
      $("#parent-confirm-password-error")
        .text("Password does not match")
        .show();
      return;
    }
  },
  cancelParentPassword: function () {
    $("#parent-confirm-modal").modal("hide");
    this.keys.focused_part = this.keys.prev_focus;
  },

  hoverHideCategory: function (index) {
    var keys = this.keys;
    keys.focused_part = "hide_category_modal";
    if (index < 0)
      keys.hide_category_modal = this.hide_category_doms.length + index;
    else keys.hide_category_modal = index;
    $(this.hide_category_doms).removeClass("active");
    $(this.hide_category_doms[keys.hide_category_modal]).addClass("active");
    if (keys.hide_category_modal < this.hide_category_doms.length)
      moveScrollPosition(
        $("#hide-modal-categories-container"),
        this.hide_category_doms[keys.hide_category_modal],
        "vertical"
      );
  },
  hoverTimeFormat: function (index) {
    var keys = this.keys;
    keys.time_format_modal = index;
    this.time_format_doms = $(".time-format-modal-option");
    $(this.time_format_doms).removeClass("active");
    $(this.time_format_doms[index]).addClass("active");
    if (keys.time_format_modal < this.time_format_doms.length)
      moveScrollPosition(
        $("#time-format-modal-container"),
        this.time_format_doms[keys.time_format_modal],
        "vertical"
      );
  },
  hoverParentControl: function (index) {
    var keys = this.keys;
    keys.focused_part = "parent_control_modal";
    keys.parent_control_modal = index;
    $(this.parent_control_doms).removeClass("active");
    $(this.parent_control_doms[index]).addClass("active");
  },

  hoverSettingMenu: function (index) {
    var keys = this.keys;
    keys.menu_selection = index;
    $(".setting-menu-item-wrapper").removeClass("active");
    $(this.prev_focus_dom).removeClass("active");
    this.prev_focus_dom = this.menu_doms[index];
    $(this.menu_doms).removeClass("active");
    $(this.menu_doms[index]).addClass("active");
  },
  hoverLanguage: function (index) {
    var keys = this.keys;
    keys.focused_part = "language_selection";
    var language_doms = this.language_doms;
    keys.language_selection = index;
    $(language_doms).removeClass("active");
    $(language_doms[keys.language_selection]).addClass("active");
    moveScrollPosition(
      $("#select-language-body"),
      language_doms[keys.language_selection],
      "vertical",
      false
    );
  },
  hoverTimeFormatItem: function () {
    var keys = this.keys;
    keys.focused_part = "time_format_modal";
    var time_format_doms = $(".time-format-modal-option");
    $(time_format_doms).removeClass("active");
    $(time_format_doms[keys.time_format_modal]).addClass("active");
  },

  showClearChannelsHistory: function () {
    var categories;
    categories = MovieHelper.getCategories("live", true, true);
    var category = categories[0];
    var channels = category.movies;
    if (!channels.length) {
      var text = current_words["no_recently_channels"];
      showToast(text, "");
      return;
    }

    var htmlContent = "";
    channels.map(function (channel, index) {
      htmlContent +=
        '<div data-channel_id = "' +
        channel.stream_id +
        '" class="clear-history-channels-modal-option"' +
        '   onclick="setting_page.clickClearHistoryChannels(' +
        index +
        "," +
        channel.stream_id +
        ')"' +
        ' onmouseenter="setting_page.hoverClearHistoryChannels(' +
        index +
        ')"' +
        ">" +
        '   <input class="hide-category-checkbox" type="checkbox" name="checkbox"' +
        '       id="hide-category-item-' +
        channel.stream_id +
        '" ' +
        "" +
        ' value="' +
        channel.stream_id +
        '">' +
        '   <label for="hide-category-item' +
        channel.stream_id +
        '">' +
        channel.name +
        "</label>" +
        "</div>";
    });
    $("#clear-history-channels-modal-container").html(htmlContent);
    $("#clear-history-channels-modal").modal("show");
    $($(".clear-history-channels-modal-option")).removeClass("active");
    $($(".clear-history-channels-modal-option")[0]).addClass("active");
    $($(".hide-category-btn-wrapper")).removeClass("active");
    var clear_history_channels_doms = $(".clear-history-channels-modal-option");
    this.clear_history_channels_doms = clear_history_channels_doms;
    this.keys.focused_part = "clear_history_channels_modal";
    this.keys.clear_history_channels_modal = 0;
    $(this.clear_history_channels_doms).removeClass("active");
    $(this.clear_history_channels_doms[0]).addClass("active");
    $("#clear-history-channels-modal-container").scrollTop(0);
  },

  hoverClearChannelsHistory: function (index) {
    var keys = this.keys;
    keys.focused_part = "clear_history_channels_button";
    keys.clear_history_channels_modal_button = index;
    $(this.prev_focus_dom).removeClass("active");
    $(".clear-history-channels-modal-option").removeClass("active");
    this.prev_focus_dom = this.clear_history_channels_modal_button_dom[index];
    $(this.clear_history_channels_modal_button_dom[index]).addClass("active");
  },

  clickSelectAllClearHistoryChannels: function () {
    var clear_history_channels_doms = this.clear_history_channels_doms;
    var clearHistoryChannelsIds = this.clearHistoryChannelsIds;
    var item_length = clear_history_channels_doms.length;
    for (var i = 0; i < item_length; i++) {
      var current_item = clear_history_channels_doms[i];
      var current_value = $($(current_item)).prop("checked");
      var current_value_id = $($(current_item)).data("channel_id");
      if (!clearHistoryChannelsIds.includes(current_value_id)) {
        clearHistoryChannelsIds.push(current_value_id);
      }
      $($(current_item).find("input")[0]).prop("checked", !current_value);
    }
    this.clearHistoryChannelsIds = clearHistoryChannelsIds;
  },

  clickClearChannelsHistory: function (index) {
    var keys = this.keys;
    if (index == 0 && this.clearHistoryChannelsIds.length > 0) {
      var clearHistoryChannelsIds = this.clearHistoryChannelsIds;
      MovieHelper.saveClearHistoryMovies("live", clearHistoryChannelsIds);
    } else {
      this.clearHistoryChannelsIds = [];
    }
    keys.clear_history_channels_modal_button = 0;
    $(this.clear_history_channels_modal_button_dom).removeClass("active");
    keys.clear_history_channels_modal = 0;
    $(this.clear_history_channels_doms).removeClass("active");
    $("#clear-history-channels-modal").modal("hide");
    keys.focused_part = "menu_selection";
  },

  clearHistorySeries: function () {
    this.clear_history_series_type = "series";
    var categories;
    categories = MovieHelper.getCategories("series", true, true);

    var category = categories[0];
    var movies = category.movies;
    if (!movies.length) {
      var text = current_words["no_recently_series"];
      showToast(text, "");
      return;
    }

    var htmlContent = "";
    movies.map(function (movie, index) {
      htmlContent +=
        '<div data-series_id = "' +
        movie.series_id +
        '" class="clear-history-series-modal-option"' +
        '   onclick="setting_page.clickClearHistorySeries(' +
        index +
        "," +
        movie.series_id +
        ')"' +
        ' onmouseenter="setting_page.hoverClearHistorySeries(' +
        index +
        ')"' +
        ">" +
        '   <input class="hide-category-checkbox" type="checkbox" name="checkbox"' +
        '       id="hide-category-item-' +
        movie.series_id +
        '" ' +
        "" +
        ' value="' +
        movie.series_id +
        '">' +
        '   <label for="hide-category-item' +
        movie.series_id +
        '">' +
        movie.name +
        "</label>" +
        "</div>";
    });
    $("#clear-history-series-modal-container").html(htmlContent);
    $("#clear-history-series-modal").modal("show");
    $($(".clear-history-series-modal-option")).removeClass("active");
    $($(".clear-history-series-modal-option")[0]).addClass("active");
    $($(".hide-category-btn-wrapper")).removeClass("active");
    var clear_history_series_doms = $(".clear-history-series-modal-option");
    this.clear_history_series_doms = clear_history_series_doms;
    this.keys.focused_part = "clear_history_series_modal";
    this.keys.clear_history_series_modal = 0;
    $(this.clear_history_series_doms).removeClass("active");
    $(this.clear_history_series_doms[0]).addClass("active");
    $("#clear-history-series-modal-container").scrollTop(0);
  },
  clearHistoryMovies: function () {
    this.clear_history_movies_type = "vod";
    var categories;
    categories = MovieHelper.getCategories("vod", true, true);
    var category = categories[0];
    var movies = category.movies;
    if (!movies.length) {
      var text = current_words["no_recently_movies"];
      showToast(text, "");
      return;
    }

    var htmlContent = "";
    movies.map(function (movie, index) {
      htmlContent +=
        '<div class="clear-history-movies-modal-option"' +
        '   onclick="setting_page.clickClearHistoryMovies(' +
        index +
        "," +
        movie.stream_id +
        ')"' +
        ' onmouseenter="setting_page.hoverClearHistoryMovies(' +
        index +
        ')"' +
        ">" +
        '   <input class="hide-category-checkbox" type="checkbox" name="checkbox"' +
        '       id="hide-category-item-' +
        movie.stream_id +
        '" ' +
        "" +
        ' value="' +
        movie.stream_id +
        '">' +
        '   <label for="hide-category-item' +
        movie.stream_id +
        '">' +
        movie.name +
        "</label>" +
        "</div>";
    });
    $("#clear-history-movies-modal-container").html(htmlContent);
    $("#clear-history-movies-modal").modal("show");
    $($(".clear-history-movies-modal-option")).removeClass("active");
    $($(".clear-history-movies-modal-option")[0]).addClass("active");
    $($(".hide-category-btn-wrapper")).removeClass("active");
    var clear_history_movies_doms = $(".clear-history-movies-modal-option");
    this.clear_history_movies_doms = clear_history_movies_doms;
    this.keys.focused_part = "clear_history_movies_modal";
    this.keys.clear_history_movies_modal = 0;
    $(this.clear_history_movies_doms).removeClass("active");
    $(this.clear_history_movies_doms[0]).addClass("active");
    $("#clear-history-movies-modal-container").scrollTop(0);
  },

  clickClearSeriesHistory: function (index) {
    var keys = this.keys;
    if (index == 0 && this.clearHistorySeriesIds.length > 0) {
      var clearHistorySeriesIds = this.clearHistorySeriesIds;
      MovieHelper.saveClearHistoryMovies("series", clearHistorySeriesIds);
    } else {
      this.clearHistorySeriesIds = [];
    }
    keys.clear_history_modal_button = 0;
    $(this.clear_history_modal_button_dom).removeClass("active");
    keys.clear_history_series_modal = 0;
    $(this.clear_history_series_doms).removeClass("active");
    $("#clear-history-series-modal").modal("hide");
    keys.focused_part = "menu_selection";
  },
  hoverClearSeriesHistory: function (index) {
    var keys = this.keys;
    keys.focused_part = "clear_history_series_button";
    keys.clear_history_modal_button = index;
    $(this.prev_focus_dom).removeClass("active");
    $(".clear-history-series-modal-option").removeClass("active");
    this.prev_focus_dom = this.clear_history_modal_button_dom[index];
    $(this.clear_history_modal_button_dom[index]).addClass("active");
  },
  hoverClearHistorySeries: function (index) {
    var keys = this.keys;
    keys.focused_part = "clear_history_series_modal";
    if (index < 0)
      keys.clear_history_series_modal =
        this.clear_history_series_doms.length + index;
    else keys.clear_history_series_modal = index;
    $(".clear-history-series-modal-option").removeClass("active");
    $(this.prev_focus_dom).removeClass("active");
    this.prev_focus_dom = this.clear_history_series_doms[
      keys.clear_history_series_modal
    ];
    $(this.clear_history_series_doms[keys.clear_history_series_modal]).addClass(
      "active"
    );
    if (keys.clear_history_series_modal < this.clear_history_series_doms.length)
      moveScrollPosition(
        $("#clear-history-series-modal-container"),
        this.clear_history_series_doms[keys.clear_history_series_modal],
        "vertical"
      );
  },

  hoverClearHistoryMovies: function (index) {
    var keys = this.keys;
    keys.focused_part = "clear_history_movies_modal";
    if (index < 0)
      keys.clear_history_movies_modal =
        this.clear_history_movies_doms.length + index;
    else keys.clear_history_movies_modal = index;
    $(this.prev_focus_dom).removeClass("active");
    $(".clear-history-movies-modal-option").removeClass("active");
    this.prev_focus_dom = this.clear_history_movies_doms[
      keys.clear_history_movies_modal
    ];
    $(this.clear_history_movies_doms[keys.clear_history_movies_modal]).addClass(
      "active"
    );
    if (keys.clear_history_movies_modal < this.clear_history_movies_doms.length)
      moveScrollPosition(
        $("#clear-history-movies-modal-container"),
        this.clear_history_movies_doms[keys.clear_history_movies_modal],
        "vertical"
      );
  },

  hoverClearHistoryChannels: function (index) {
    var keys = this.keys;
    keys.focused_part = "clear_history_channels_modal";
    if (index < 0)
      keys.clear_history_channels_modal =
        this.clear_history_channels_doms.length + index;
    else keys.clear_history_channels_modal = index;
    $(this.prev_focus_dom).removeClass("active");
    $(".clear-history-channels-modal-option").removeClass("active");
    this.prev_focus_dom = this.clear_history_channels_doms[
      keys.clear_history_channels_modal
    ];
    $(this.clear_history_channels_doms[keys.clear_history_channels_modal]).addClass(
      "active"
    );
    if (keys.clear_history_channels_modal < this.clear_history_channels_doms.length)
      moveScrollPosition(
        $("#clear-history-channels-modal-container"),
        this.clear_history_channels_doms[keys.clear_history_channels_modal],
        "vertical"
      );
  },

  clickClearMoviesHistory: function (index) {
    var keys = this.keys;
    if (index == 0 && this.clearHistoryMoviesIds.length > 0) {
      var clearHistoryMoviesIds = this.clearHistoryMoviesIds;
      MovieHelper.saveClearHistoryMovies("vod", clearHistoryMoviesIds);
    } else {
      this.clearHistoryMoviesIds = [];
    }
    keys.clear_history_movies_modal_button = 0;
    $(this.clear_history_movies_modal_button_dom).removeClass("active");
    keys.clear_history_movies_modal = 0;
    $(this.clear_history_movies_doms).removeClass("active");
    $("#clear-history-movies-modal").modal("hide");
    keys.focused_part = "menu_selection";
  },

  hoverClearMoviesHistory: function (index) {
    var keys = this.keys;
    keys.focused_part = "clear_history_movies_button";
    keys.clear_history_movies_modal_button = index;
    $(this.prev_focus_dom).removeClass("active");
    $(".clear-history-movies-modal-option").removeClass("active");
    this.prev_focus_dom = this.clear_history_movies_modal_button_dom[index];
    $(this.clear_history_movies_modal_button_dom[index]).addClass("active");
  },

  removeSubtitleColorBKColorActive: function () {
    $(this.subtitle_settings_modal_dom).removeClass("active");
  },

  hoverIncreaseSubtitleFontSize: function (index) {
    var keys = this.keys;
    keys.subtitle_selection = 0;
    keys.focused_part = "subtitle_settings";
    this.removeSubtitleColorBKColorActive()
    keys.subtitle_font_selection = index;
    if (keys.subtitle_selection == 0) {
      $(this.subtitle_font_dom).removeClass("active");
      $(this.subtitle_font_dom[keys.subtitle_font_selection]).addClass(
        "active"
      );
    }
  },

  increaseSubtitleFontSize: function (increase) {
    var keys = this.keys;
    keys.subtitle_font_size += increase;
    if (keys.subtitle_font_size < 30) {
      keys.subtitle_font_size = 30;
      showToast("The minimum font size is 30px.", "");
    }
    if (keys.subtitle_font_size > 100) {
      keys.subtitle_font_size = 100;
      showToast("The maximum font size is 100px.", "");
    }
    $(".subtitle-font-size").text(keys.subtitle_font_size);
    textTracksFontSize = keys.subtitle_font_size;
    saveToLocalStorage('textTracksFontSize', textTracksFontSize)
  },

  hoverSubtitleModalOption: function (index) {
    var keys = this.keys;
    keys.focused_part = "subtitle_color_settings";
    $(this.subtitle_settings_modal_dom).removeClass("active");
    $(this.subtitle_font_dom).removeClass("active");
    keys.subtitle_selection = index

    $(this.subtitle_settings_modal_dom[keys.subtitle_selection]).addClass(
      "active"
    );
  },

  clickSubtitleModalOption: function (index) {
    var keys = this.keys;
    $("#subtitle-settings-modal").modal("hide");
    if (index == 0) {
      keys.focused_part = "subtitle_color_settings";
      $("#subtitle-settings-color-modal").modal("show");
    } else {
      keys.focused_part = "subtitle_background_settings";
      $("#subtitle-settings-background-modal").modal("show");
    }
  },

  hoverSubtitleColor: function (index) {
    var keys = this.keys;
    keys.subtitle_color_selection = index;
    this.hoverSettingColorMenu(keys.subtitle_color_selection);
  },

  hoverSubtitleBackground: function (index) {
    var keys = this.keys;
    keys.focused_part = "subtitle_background_settings";
    this.hoverSettingBackgroundMenu(index);
  },

  clickSubtitleColor: function (index) {
    textTracksColor = textTracksColors[index];
    saveToLocalStorage('subtitleColor', textTracksColor)
    $(".subtitle-color-check").addClass("hide");
    $(
      ".subtitle-color-item .color-" + index + " .subtitle-color-check"
    ).removeClass("hide");
    $(".subtitle-example-text").css({ color: textTracksColor });
    this.updateSubtitleSetting();
  },

  clickSubtitleBackground: function (index) {
    $(".subtitle-background-check").addClass("hide");
    $(
      ".subtitle-background-item .background-" +
      index +
      " .subtitle-background-check"
    ).removeClass("hide");
    subtitleBackgroundColor = subtitleBackgroundColors[index];
    saveToLocalStorage('subtitleBackgroundColor', subtitleBackgroundColor)
    $(".subtitle-example-text span").css({
      background: subtitleBackgroundColor
    });
    this.updateSubtitleSetting();
  },

  hoverSettingColorMenu: function (index) {
    var keys = this.keys;
    keys.subtitle_color_selection = index;
    keys.focused_part = "subtitle_color_settings";
    $(this.subtitle_color_dom).removeClass("active");
    $(this.subtitle_color_dom[index]).addClass("active");
  },

  hoverSettingBackgroundMenu: function (index) {
    var keys = this.keys;
    keys.subtitle_background_selection = index;
    keys.focused_part = "subtitle_background_settings";
    $(this.subtitle_background_dom).removeClass("active");
    $(this.subtitle_background_dom[index]).addClass("active");
  },

  showUserAccounts: function () {
    $("#user-account-expire-date").text(expire_date);
    if (is_trial == 2 || is_trial == 3)
      $("#user-account-is_trial").text("Active");
    else $("#user-account-is_trial").text("Free Trial");
    $("#user-account-modal").modal("show");
    this.keys.focused_part = "user_account_modal";
  },

  hoverConfirmBtn: function (index) {
    var keys = this.keys
    keys.useragent_selection = index;
    keys.focused_part = "useragent_modal";
    $(this.useragentItemDoms).removeClass("active");
    $(this.useragentItemDoms[index]).addClass("active");
  },

  hoverMenuItem: function (index) {

  },

  showUserAgentModal: function () {
    var tempUserAgent = getLocalStorageData('userAgent');
    if (tempUserAgent === null)
      tempUserAgent = "IPTV Smart Live Player";
    $("#useragent-confirm").val(tempUserAgent)
    $("#useragent-modal").modal("show");
    this.keys.focused_part = "useragent_modal";
    this.keys.useragent_selection = -1;
    this.renderUseragentSetting();
    this.hoverConfirmBtn(0);
  },

  showLiveSettingsModal: function () {
    this.keys.focused_part = "live_settings_modal";
    $("#live-settings-modal").modal("show");

    this.renderLiveStreamFormatItems();
    this.renderLiveSortItems();
    this.renderLiveAutoPlay();
    this.renderVisibleArchiveIconItem();

  },

  renderLiveStreamFormatItems: function () {
    var htmlContent = "";
    htmlContent +=
      '<div class="livestream-format-modal-option" onclick="setting_page.clickLiveStreamFormat(0)" onmouseenter= "setting_page.hoverLiveSettingsItem(0)"  >' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-format-default"' +
      (liveStreamFormat == 'default' ? "checked" : "") +
      ' value="default">' +
      '   <label for="livestream-format-default" >Default</label></div>' +
      '<div class="livestream-format-modal-option" onclick="setting_page.clickLiveStreamFormat(1)" onmouseenter= "setting_page.hoverLiveSettingsItem(1)"  >' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-format-ts"' +
      (liveStreamFormat == 'ts' ? "checked" : "") +
      ' value="ts">' +
      '   <label for="livestream-format-ts" >MPEGTS (.ts)</label></div>' +
      '<div class="livestream-format-modal-option" onclick="setting_page.clickLiveStreamFormat(2)" onmouseenter= "setting_page.hoverLiveSettingsItem(2)">' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-format-m3u8"' +
      (liveStreamFormat == 'm3u8' ? "checked" : "") +
      ' value="m3u8">' +
      '   <label for="livestream-format-m3u8">HLS (.m3u8)</label></div>';
    $("#livestream-format-item-container").html(htmlContent);
    $(".livestream-format-modal-option").removeClass("active");

    if (liveStreamFormat === "default") {
      this.keys.liveChannelSettingsSelection = 0;
    } else if (liveStreamFormat === 'ts') {
      this.keys.liveChannelSettingsSelection = 1;
    } else
      this.keys.liveChannelSettingsSelection = 2;

    this.hoverLiveSettingsItem(this.keys.liveChannelSettingsSelection);

  },

  renderLiveSortItems: function () {
    var htmlContent = "";
    htmlContent +=
      '<div class="livestream-format-modal-option live-sort-option" onclick="setting_page.clickLiveStreamSort(0)" onmouseenter= "setting_page.hoverLiveSettingsItem(3)"  >' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-sort-default"' +
      (liveStreamSort == 'default' ? "checked" : "") +
      ' value="default">' +
      '   <label for="livestream-sort-default" >Default</label></div>' +
      '<div class="livestream-format-modal-option live-sort-option" onclick="setting_page.clickLiveStreamSort(1)" onmouseenter= "setting_page.hoverLiveSettingsItem(4)"  >' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-sort-az"' +
      (liveStreamSort == 'a-z' ? "checked" : "") +
      ' value="a-z">' +
      '   <label for="livestream-sort-az" >A-Z</label></div>' +
      '<div class="livestream-format-modal-option live-sort-option" onclick="setting_page.clickLiveStreamSort(2)" onmouseenter= "setting_page.hoverLiveSettingsItem(5)">' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-sort-za"' +
      (liveStreamSort == 'z-a' ? "checked" : "") +
      ' value="z-a">' +
      '   <label for="livestream-sort-za">Z-A</label></div>';
    $("#livestream-sort-item-container").html(htmlContent);
  },

  renderLiveAutoPlay: function () {
    var htmlContent = "";
    htmlContent +=
      '<div class="livestream-format-modal-option live-autoplay-option" onclick="setting_page.clickLiveStreamAutoPlay()" onmouseenter= "setting_page.hoverLiveSettingsItem(6)"  >' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-autoplay"' +
      (liveAutoPlay == true ? "checked" : "") +
      ' value="ts">' +
      '   <label for="livestream-autoplay-" data-word_code="live_auto_play">Live Auto Play </label></div>';
    $("#livestream-autoplay-item-container").html(htmlContent);
  },

  renderVisibleArchiveIconItem: function () {
    var htmlContent = "";
    htmlContent +=
      '<div class="livestream-format-modal-option visible-archive-icon-option" onclick="setting_page.clickVisibleArchiveIcon()" onmouseenter= "setting_page.hoverLiveSettingsItem(7)"  >' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="livestream-autoplay"' +
      (visibleArchiveIcon == true ? "checked" : "") +
      ' value="ts">' +
      '   <label for="livestream-autoplay-" data-word_code="visible_archive_icon">Show/Hide Archive Icon</label></div>';
    $("#visible-archive-icon-item-container").html(htmlContent);
  },

  renderUseragentSetting: function () {
    var htmlContent = "";
    htmlContent +=
      '<div class="useragent-option useragent-confirm-item" onclick="setting_page.clickUseragentSetting()" onmouseenter= "setting_page.hoverConfirmBtn(1)"  >' +
      '   <input class="hide-category-checkbox" type="checkbox" name="checkbox" id="useragent-enable"' +
      (useragentFlag == true ? "checked" : "") +
      ' value="false">' +
      '   <label for="useragent-enable-" data-word_code="">Enable/Disable Useragent</label></div>';
    $("#useragent-container").html(htmlContent);
    this.useragentItemDoms = $('.useragent-confirm-item');
  },

  hoverUseragentSetting: function () {

  },

  hoverLiveSettingsItem: function (index) {
    this.keys.liveChannelSettingsSelection = index;
    var liveSettingsItemDoms = $(".livestream-format-modal-option");
    $(liveSettingsItemDoms).removeClass("active");
    $(liveSettingsItemDoms[index]).addClass("active");
    this.keys.focused_part = "liveChannelSettingsModal";
  },
  // hoverSortChannels: function (index) {
  //   this.keys.focusedPart = "sortChannelsSelection"
  //   this.keys.sortChannelsSelection = index;
  //   $(this.sortChannelsDoms).removeClass('active');
  //   $(this.sortChannelsDoms[index]).addClass('active');
  // },

  clickLiveStreamFormat: function (index) {
    var liveStreamFormatDoms = $(".livestream-format-modal-option");
    var current_item = liveStreamFormatDoms[index];

    var current_value = $($(current_item).find("input")[0]).prop("checked");

    if (current_value == false)
      current_value = true;

    $($(current_item).find("input")[0]).prop("checked", current_value);
    if (index === 0) {
      $($(liveStreamFormatDoms[1]).find("input")[0]).prop("checked", !current_value);
      $($(liveStreamFormatDoms[2]).find("input")[0]).prop("checked", !current_value);
    } else if (index === 1) {
      $($(liveStreamFormatDoms[0]).find("input")[0]).prop("checked", !current_value);
      $($(liveStreamFormatDoms[2]).find("input")[0]).prop("checked", !current_value);
    } else if (index === 2) {
      $($(liveStreamFormatDoms[0]).find("input")[0]).prop("checked", !current_value);
      $($(liveStreamFormatDoms[1]).find("input")[0]).prop("checked", !current_value);
    }

    if (index == 0) {
      liveStreamFormat = 'default';
    } else if (index === 1)
      liveStreamFormat = 'ts';
    else liveStreamFormat = 'm3u8';

    saveToLocalStorage('liveStreamFormat', liveStreamFormat);
  },

  clickLiveStreamSort: function (index) {
    var liveStreamSortDoms = $(".live-sort-option");
    var current_item = liveStreamSortDoms[index];

    var current_value = $($(current_item).find("input")[0]).prop("checked");

    if (current_value == false)
      current_value = true;

    $($(current_item).find("input")[0]).prop("checked", current_value);
    if (index === 0) {
      $($(liveStreamSortDoms[1]).find("input")[0]).prop("checked", !current_value);
      $($(liveStreamSortDoms[2]).find("input")[0]).prop("checked", !current_value);
    } else if (index === 1) {
      $($(liveStreamSortDoms[0]).find("input")[0]).prop("checked", !current_value);
      $($(liveStreamSortDoms[2]).find("input")[0]).prop("checked", !current_value);
    } else if (index === 2) {
      $($(liveStreamSortDoms[0]).find("input")[0]).prop("checked", !current_value);
      $($(liveStreamSortDoms[1]).find("input")[0]).prop("checked", !current_value);
    }

    if (index == 0) {
      liveStreamSort = 'default';
    } else if (index === 1)
      liveStreamSort = 'a-z';
    else liveStreamSort = 'z-a';

    saveToLocalStorage('liveStreamSort', liveStreamSort);
  },

  clickLiveStreamAutoPlay: function () {
    var current_item = $('.live-autoplay-option');
    var current_value = $($(current_item).find("input")[0]).prop("checked");
    var newValue = !current_value;

    $($(current_item).find("input")[0]).prop("checked", newValue);

    saveToLocalStorage('liveAutoPlay', newValue);
    liveAutoPlay = newValue;
  },

  clickVisibleArchiveIcon: function () {
    var current_item = $('.visible-archive-icon-option');
    var current_value = $($(current_item).find("input")[0]).prop("checked");
    var newValue = !current_value;

    $($(current_item).find("input")[0]).prop("checked", newValue);

    saveToLocalStorage('visibleArchiveIcon', newValue);
    visibleArchiveIcon = newValue;
  },

  clickUseragentSetting: function () {
    var current_item = $('.useragent-option');
    var current_value = $($(current_item).find("input")[0]).prop("checked");
    var newValue = !current_value;
    $($(current_item).find("input")[0]).prop("checked", newValue);
  },

  showContactUSModal: function () {
    $(".support-email").text(contacts[0].contact_id);
    $(".telelgram-id").text(contacts[1].contact_id);
    $(".whatsapp-number").text(contacts[2].contact_id);
    $(".viber-id").text(contacts[3].contact_id);
    $("#contactus-modal").modal("show");
    this.keys.focused_part = "contactus_modal";
  },

  saveUserAgent: function () {
    var newUserAgent = $("#useragent-confirm").val();
    userAgent = newUserAgent;
    saveToLocalStorage("userAgent", newUserAgent);
    $("#useragent-modal").modal("hide");
    this.keys.focused_part = "menu_selection";


    var current_item = $('.useragent-option');
    var current_value = $($(current_item).find("input")[0]).prop("checked");
    saveToLocalStorage('useragentFlag', current_value);
    useragentFlag = current_value;
  },

  cancelUseragentModal: function () {
    $("#useragent-modal").modal("hide");
    this.keys.focused_part = "menu_selection";
  },

  handleMenuClick: function () {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
        switch (keys.menu_selection) {
          case 0:
            this.showParentControlModal();
            break;
          case 1:
            this.showLiveSettingsModal();
            break;
          case 2:
            this.showLanguages();
            break;
          case 3:
            this.showSubtitleSettings();
            break;
          case 4:
            this.showTimeFormat();
            break;
          case 5:
            this.showHideCategoryModal("live");
            break;
          case 6:
            this.showHideCategoryModal("movie");
            break;
          case 7:
            this.showHideCategoryModal("series");
            break;
          case 8:
            this.showClearChannelsHistory();
            break;
          case 9:
            this.clearHistoryMovies();
            break;
          case 10:
            this.clearHistorySeries();
            break;
          case 11:
            this.showClearCacheModal();
            break;
        }
        break;
      case "parent_control_modal":
        $(this.parent_control_doms[keys.parent_control_modal]).trigger(
          "click"
        );
        break;
      case "hide_category_modal":
        $(this.hide_category_doms[keys.hide_category_modal]).trigger("click");
        break;
      case "clear_history_channels_modal":
        $(
          this.clear_history_channels_doms[keys.clear_history_channels_modal]
        ).trigger("click");
        break;
      case "clear_history_channels_button":
        $(
          this.clear_history_channels_modal_button_dom[keys.clear_history_modal_button]
        ).trigger("click");
        break;
      case "clear_history_movies_modal":
        $(
          this.clear_history_movies_doms[keys.clear_history_movies_modal]
        ).trigger("click");
        break;
      case "clear_history_series_modal":
        $(
          this.clear_history_series_doms[keys.clear_history_series_modal]
        ).trigger("click");
        break;
      case "clear_history_series_button":
        $(
          this.clear_history_modal_button_dom[keys.clear_history_modal_button]
        ).trigger("click");
        break;
      case "clear_history_movies_button":
        $(
          this.clear_history_movies_modal_button_dom[
          keys.clear_history_movies_modal_button
          ]
        ).trigger("click");
        break;
      case "language_selection":
        $(this.language_doms[keys.language_selection]).trigger("click");
        break;
      case "time_format_modal":
        var time_format_doms = $(".time-format-modal-option");
        $(time_format_doms[keys.time_format_modal]).trigger("click");
        break;
      case "subtitle_settings":
        if (keys.subtitle_selection == 0) {
          $(this.subtitle_font_dom[keys.subtitle_font_selection]).trigger(
            "click"
          );
        } else {
          $(this.subtitle_settings_modal_dom[keys.subtitle_selection]).trigger(
            "click"
          );
        }
        break;
      case "subtitle_color_settings":
        $(this.subtitle_color_dom[keys.subtitle_color_selection]).trigger(
          "click"
        );
        break;
      case "subtitle_background_settings":
        $(
          this.subtitle_background_dom[keys.subtitle_background_selection]
        ).trigger("click");
        break;
      case "clearCacheSelection":
        $($('.clear-cache-modal-button')[keys.clearCacheSelection]).trigger("click");
        break;
      case "liveChannelSettingsModal":
        var liveStreamFormatDoms = $(".livestream-format-modal-option");
        $(liveStreamFormatDoms[keys.liveChannelSettingsSelection]).trigger("click");
        break;
      case "useragent_modal":
        if (keys.useragent_selection === 0) {
          $(this.useragentItemDoms[0]).find("input").focus();
        } else {
          $(this.useragentItemDoms[keys.useragent_selection]).trigger("click");
        }
        break;
    }
  },
  handleMenusUpDown: function (increment) {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
        keys.menu_selection += 3 * increment;
        if (keys.menu_selection > this.menu_doms.length - 1)
          keys.menu_selection = this.menu_doms.length - 1;
        else if (keys.menu_selection < 0)
          keys.menu_selection = 0;
        this.hoverSettingMenu(keys.menu_selection);
        break;
      case "hide_category_modal":
        keys.hide_category_modal += increment;
        if (keys.hide_category_modal < 0) keys.hide_category_modal = 0;
        if (keys.hide_category_modal >= this.hide_category_doms.length)
          keys.hide_category_modal = this.hide_category_doms.length - 1;
        $(this.hide_category_doms).removeClass("active");
        $(this.hide_category_doms[keys.hide_category_modal]).addClass("active");
        if (keys.hide_category_modal < this.hide_category_doms.length)
          moveScrollPosition(
            $("#hide-modal-categories-container"),
            this.hide_category_doms[keys.hide_category_modal],
            "vertical"
          );
        break;
      case "clear_history_channels_modal":
        keys.clear_history_channels_modal += increment;
        if (keys.clear_history_channels_modal < 0)
          keys.clear_history_channels_modal = 0;
        if (
          keys.clear_history_channels_modal >=
          this.clear_history_channels_doms.length
        ) {
          keys.focused_part = "clear_history_channels_button";
          $(
            this.clear_history_channels_modal_button_dom[
            keys.clear_history_channels_modal_button
            ]
          ).addClass("active");
        }

        $(this.clear_history_channels_doms).removeClass("active");
        $(
          this.clear_history_channels_doms[keys.clear_history_channels_modal]
        ).addClass("active");
        if (
          keys.clear_history_channels_modal <
          this.clear_history_channels_doms.length - 4
        )
          moveScrollPosition(
            $("#hide-modal-categories-container"),
            this.clear_history_channels_doms[keys.clear_history_channels_modal],
            "vertical"
          );
        break;
      case "clear_history_channels_button":
        if (increment < 0) {
          $(this.clear_history_channels_modal_button_dom).removeClass("active");
          $(
            this.clear_history_channels_doms[
            this.clear_history_channels_doms.length - 1
            ]
          ).addClass("active");
          keys.clear_history_channels_modal =
            this.clear_history_channels_doms.length - 1;

          keys.focused_part = "clear_history_channels_modal";
        }
        break;
      case "clear_history_movies_modal":
        keys.clear_history_movies_modal += increment;
        if (keys.clear_history_movies_modal < 0)
          keys.clear_history_movies_modal = 0;
        if (
          keys.clear_history_movies_modal >=
          this.clear_history_movies_doms.length
        ) {
          keys.focused_part = "clear_history_movies_button";
          $(
            this.clear_history_movies_modal_button_dom[
            keys.clear_history_movies_modal_button
            ]
          ).addClass("active");
        }

        $(this.clear_history_movies_doms).removeClass("active");
        $(
          this.clear_history_movies_doms[keys.clear_history_movies_modal]
        ).addClass("active");
        if (
          keys.clear_history_movies_modal <
          this.clear_history_movies_doms.length - 4
        )
          moveScrollPosition(
            $("#hide-modal-categories-container"),
            this.clear_history_movies_doms[keys.clear_history_movies_modal],
            "vertical"
          );
        break;
      case "clear_history_movies_button":
        if (increment < 0) {
          $(this.clear_history_movies_modal_button_dom).removeClass("active");
          $(
            this.clear_history_movies_doms[
            this.clear_history_movies_doms.length - 1
            ]
          ).addClass("active");
          keys.clear_history_movies_modal =
            this.clear_history_movies_doms.length - 1;

          keys.focused_part = "clear_history_movies_modal";
        }
        break;
      case "clear_history_series_modal":
        keys.clear_history_series_modal += increment;
        if (keys.clear_history_series_modal < 0)
          keys.clear_history_series_modal = 0;
        if (
          keys.clear_history_series_modal >=
          this.clear_history_series_doms.length
        ) {
          keys.focused_part = "clear_history_series_button";

          $(
            this.clear_history_modal_button_dom[keys.clear_history_modal_button]
          ).addClass("active");
        }
        $(this.clear_history_series_doms).removeClass("active");
        this.prev_focus_dom = this.clear_history_series_doms[
          keys.clear_history_series_modal
        ];
        $(
          this.clear_history_series_doms[keys.clear_history_series_modal]
        ).addClass("active");

        if (
          keys.clear_history_series_modal <
          this.clear_history_series_doms.length
        )
          moveScrollPosition(
            $("#clear-history-series-modal-container"),
            this.clear_history_series_doms[keys.clear_history_series_modal],
            "vertical"
          );
        break;
      case "clear_history_series_button":
        if (increment < 0) {
          $(this.clear_history_modal_button_dom).removeClass("active");
          $(
            this.clear_history_series_doms[
            this.clear_history_series_doms.length - 1
            ]
          ).addClass("active");
          keys.clear_history_series_modal =
            this.clear_history_series_doms.length - 1;

          keys.focused_part = "clear_history_series_modal";
        }
        break;
      case "parent_control_modal":
        if (increment > 0) {
          if (keys.parent_control_modal < 3) {
            keys.parent_control_modal += increment;
          }
        } else {
          if (keys.parent_control_modal >= 3) {
            keys.parent_control_modal = 2;
          } else {
            keys.parent_control_modal += increment;
            if (keys.parent_control_modal < 0) keys.parent_control_modal = 0;
          }
        }
        $(this.parent_control_doms[0]).find("input").blur();
        $(this.parent_control_doms[1]).find("input").blur();
        $(this.parent_control_doms[2]).find("input").blur();
        $(this.parent_control_doms).removeClass("active");
        $(this.parent_control_doms[keys.parent_control_modal]).addClass(
          "active"
        );
        break;
      case "language_selection":
        var language_doms = this.language_doms;
        keys.language_selection += increment;
        if (keys.language_selection < 0)
          keys.language_selection = language_doms.length - 1;
        if (keys.language_selection >= language_doms.length)
          keys.language_selection = 0;
        this.hoverLanguage(keys.language_selection);
        break;
      case "time_format_modal":
        if (keys.time_format_modal == 0) keys.time_format_modal = 1;
        else if ((keys.time_format_modal = 1)) keys.time_format_modal = 0;
        this.hoverTimeFormatItem();
        break;
      case "subtitle_settings":
        keys.subtitle_selection += increment;
        if (keys.subtitle_selection > 2) {
          keys.subtitle_selection = 2;
        }
        if (keys.subtitle_selection < 0) {
          keys.subtitle_selection = 0;
        }
        $(this.subtitle_settings_modal_dom).removeClass("active");
        $(this.subtitle_font_dom).removeClass("active");
        if (keys.subtitle_selection == 0) {
          $(this.subtitle_font_dom[keys.subtitle_font_selection]).addClass(
            "active"
          );
        } else
          $(this.subtitle_settings_modal_dom[keys.subtitle_selection]).addClass(
            "active"
          );
        break;
      case "subtitle_color_settings":
        var prev_subtitle_color_selection = keys.subtitle_color_selection;
        keys.subtitle_color_selection += 5 * increment;
        if (keys.subtitle_color_selection >= this.subtitle_color_dom.length) {
          if (prev_subtitle_color_selection > 5 - 1) {
            keys.subtitle_color_selection = prev_subtitle_color_selection;
            return;
          }
          keys.subtitle_color_selection = this.subtitle_color_dom.length - 1;
        }
        if (keys.subtitle_color_selection < 0) {
          keys.subtitle_color_selection = prev_subtitle_color_selection;
          return;
        }
        this.hoverSettingColorMenu(keys.subtitle_color_selection);
        break;
      case "subtitle_background_settings":
        var prev_subtitle_background_selection =
          keys.subtitle_background_selection;
        keys.subtitle_background_selection += 5 * increment;
        if (
          keys.subtitle_background_selection >= this.subtitle_background_dom.length
        ) {
          if (prev_subtitle_background_selection > 5 - 1) {
            keys.subtitle_background_selection = prev_subtitle_background_selection;
            return;
          }
          keys.subtitle_background_selection =
            this.subtitle_background_dom.length - 1;
        }
        if (keys.subtitle_background_selection < 0) {
          keys.subtitle_background_selection = prev_subtitle_background_selection;
          return;
        }
        this.hoverSettingBackgroundMenu(keys.subtitle_background_selection);
        break;
      case "liveChannelSettingsModal":
        var liveStreamFormatDoms = $(".livestream-format-modal-option");
        keys.liveChannelSettingsSelection += increment;
        if (keys.liveChannelSettingsSelection > liveStreamFormatDoms.length - 1) {
          keys.liveChannelSettingsSelection = liveStreamFormatDoms.length - 1
        } else if (keys.liveChannelSettingsSelection < 0)
          keys.liveChannelSettingsSelection = 0;
        this.hoverLiveSettingsItem(keys.liveChannelSettingsSelection);
        break;
      case "useragent_modal":
        keys.useragent_selection += increment;
        if (increment > 0) {
          if (keys.useragent_selection === 0) {
            $(this.useragentItemDoms[0]).find("input").focus();
          } else if (keys.useragent_selection === 1) {
            $(this.useragentItemDoms[0]).find("input").blur();
          } else if (keys.useragent_selection > 2) {
            keys.useragent_selection = 2;
          }
          this.hoverConfirmBtn(keys.useragent_selection);
        } else {
          if (keys.useragent_selection < 0) {
            keys.useragent_selection = 0;
          } else if (keys.useragent_selection == 1) {
            $(this.useragentItemDoms[0]).find("input").blur();
          } else if (keys.useragent_selection === 0) {
            $(this.useragentItemDoms[0]).find("input").focus();
          }
          this.hoverConfirmBtn(keys.useragent_selection);
        }
        break;

    }
  },
  handleMenuLeftRight: function (increment) {
    var keys = this.keys;

    switch (keys.focused_part) {
      case "menu_selection":
        keys.menu_selection += increment;
        if (keys.menu_selection < 0)
          keys.menu_selection = 0;
        else if (keys.menu_selection > this.menu_doms.length - 1)
          keys.menu_selection = this.menu_doms.length - 1;
        this.hoverSettingMenu(keys.menu_selection);
        break;
      case "parent_control_modal":
        if (keys.parent_control_modal >= 3) {
          keys.parent_control_modal += increment;
          keys.parent_control_modal = Math.min(Math.max(keys.parent_control_modal, 3), 4);

          $(this.parent_control_doms).removeClass("active");
          $(this.parent_control_doms[keys.parent_control_modal]).addClass("active");
        }
        break;
      case "clear_history_channels_button":
        keys.clear_history_channels_modal_button += increment;
        if (keys.clear_history_channels_modal_button >= 2) {
          keys.clear_history_channels_modal_button = 2;
        } else if (keys.clear_history_channels_modal_button < 0) {
          keys.clear_history_channels_modal_button = 0;
        }
        $(this.clear_history_channels_modal_button_dom).removeClass("active");
        $(
          this.clear_history_channels_modal_button_dom[
          keys.clear_history_channels_modal_button
          ]
        ).addClass("active");
        break;
      case "clear_history_movies_button":
        keys.clear_history_movies_modal_button += increment;
        if (keys.clear_history_movies_modal_button >= 2) {
          keys.clear_history_movies_modal_button = 2;
        } else if (keys.clear_history_movies_modal_button < 0) {
          keys.clear_history_movies_modal_button = 0;
        }
        $(this.clear_history_movies_modal_button_dom).removeClass("active");
        $(
          this.clear_history_movies_modal_button_dom[
          keys.clear_history_movies_modal_button
          ]
        ).addClass("active");
        break;
      case "clear_history_series_button":
        keys.clear_history_modal_button += increment;
        if (keys.clear_history_modal_button >= 2) {
          keys.clear_history_modal_button = 2;
        } else if (keys.clear_history_modal_button < 0) {
          keys.clear_history_modal_button = 0;
        }
        $(this.clear_history_modal_button_dom).removeClass("active");
        $(
          this.clear_history_modal_button_dom[keys.clear_history_modal_button]
        ).addClass("active");
        break;
      case "subtitle_settings":
        if (keys.subtitle_selection == 0) {
          if (keys.subtitle_font_selection == 0)
            keys.subtitle_font_selection = 1;
          else keys.subtitle_font_selection = 0;
          $(this.subtitle_font_dom).removeClass("active");
          $(this.subtitle_font_dom[keys.subtitle_font_selection]).addClass(
            "active"
          );
        }
        break;
      case "subtitle_color_settings":
        keys.subtitle_color_selection += increment;
        if (keys.subtitle_color_selection < 0)
          keys.subtitle_color_selection = 0;
        if (keys.subtitle_color_selection >= this.subtitle_color_dom.length)
          keys.subtitle_color_selection = this.subtitle_color_dom.length - 1;
        this.hoverSettingColorMenu(keys.subtitle_color_selection);
        break;
      case "subtitle_background_settings":
        keys.subtitle_background_selection += increment;
        if (keys.subtitle_background_selection < 0)
          keys.subtitle_background_selection = 0;
        if (
          keys.subtitle_background_selection >= this.subtitle_background_dom.length
        )
          keys.subtitle_background_selection =
            this.subtitle_background_dom.length - 1;
        this.hoverSettingBackgroundMenu(keys.subtitle_background_selection);
        break;
      case "clearCacheSelection":
        keys.clearCacheSelection = (keys.clearCacheSelection === 0) ? 1 : 0;
        $($('.clear-cache-modal-button')).removeClass("active")
        $($('.clear-cache-modal-button')[keys.clearCacheSelection]).addClass("active")
        break;
      case "useragent_modal":
        if (keys.useragent_selection > 1) {
          keys.useragent_selection = keys.useragent_selection === 2 ? 3 : 2;
          this.hoverConfirmBtn(keys.useragent_selection);
        }
    }
  },
  HandleKey: function (e) {
    switch (e.keyCode) {
      case tvKey.RIGHT:
        this.handleMenuLeftRight(1);
        break;
      case tvKey.LEFT:
        this.handleMenuLeftRight(-1);
        break;
      case tvKey.DOWN:
        this.handleMenusUpDown(1);
        break;
      case tvKey.UP:
        this.handleMenusUpDown(-1);
        break;
      case tvKey.ENTER:
        this.handleMenuClick();
        break;
      case tvKey.RED:
        // home_page.init();
        break;
      case tvKey.RETURN:
        this.goBack();
        break;
    }
  }
};
