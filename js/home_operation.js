"use strict";
var home_page = {
  initiated: false,
  keys: {
    focused_part: "menu_selection",
    menu_selection: 0,
    notiSelection: 0,
    reloadModalBtnSelection: 0
  },
  reloadModalButnDoms: $("#reload-modal button"),
  prev_focus_dom: [],
  menu_doms: [],
  init: function () {
    playlist_page.isError = false;
    var menu_doms = [];
    menu_doms[0] = $("#home-page .home-live-tile");
    menu_doms[1] = $("#home-page .movies-tile");
    menu_doms[2] = $("#home-page .series-tile");
    menu_doms[3] = $("#home-page .catchup-tile");
    menu_doms[4] = $("#home-page .playlist-tile");
    menu_doms[5] = $("#home-page .exit-tile");
    menu_doms[6] = $("#home-page .reload-tile");
    menu_doms[7] = $("#home-page .settings-tile");
    menu_doms[8] = $("#home-page .user-tile");
    this.menu_doms = menu_doms;

    this.prev_focus_dom = null;
    hideLoadImage();
    hideTopBar();
    $("#app").removeClass("hide");
    turn_off_page.prev_route = "home-page";
    if (current_route !== "turn-off-page") current_route = "home-page";
    $("#login-container").addClass("hide");
    goToHomePage();

    var html = "";
    languages.map(function (item, index) {
      html +=
        '<div class="language-operation-modal" ' +
        '   data-sort_key="default" ' +
        "   onclick=\"setting_page.selectLanguage('" +
        item.code +
        "'," +
        index +
        ')"' +
        '   onmouseenter="setting_page.hoverLanguage(' +
        index +
        ')"' +
        '   data-language="' +
        item.code +
        '"' +
        '   data-word_code="' +
        item.code +
        '"' +
        ">\n" +
        item.name +
        "</div>";
    });
    $("#select-language-body").html(html);
    setting_page.language_doms = $(".language-operation-modal");
    setting_page.doms_translated = $("*").filter(function () {
      return $(this).data("word_code") !== undefined;
    });
    setting_page.changeDomsLanguage();
    this.hoverMainMenu(0);
    displayCurrentPage(current_route);
  },

  reEnter: function () {
    goToHomePage();
  },
  clickMainMenu: function (index) {
    switch (index) {
      case -1:
        hideVodSeriesPage();
        goToHomePage();
        this.keys.focused_part = "menu_selection";
        break;
      case 0:
        channel_page.init();
        break;
      case 1:
        vod_series_page.init("vod");
        break;
      case 2:
        vod_series_page.init("series");
        break;
      case 3:
        catchupListPage.init();
        break;
      case 4:
        $("#setting-page").addClass("hide");
        $(".setting-mac-address").addClass("hide");
        $("#channel-page").addClass("hide");
        $("#vod-series-page").addClass("hide");
        playlist_page.init("home-page");
        break;
      case 5:
        this.goBack();
        break;
      case 6:
        this.showReloadModal();
        break;
      case 7:
        setting_page.init();
        break;
      case 8:
        this.showUserAccounts();
        break;
    }
  },

  reloadConfirm: function (index) {
    $("#reload-modal").modal("hide");
    if (index === 1) {
      current_route = "login";
      showLoadImage();
      $("#app").addClass("hide");
      $(this.menu_doms[6]).removeClass("active");
      login_page.getPlayListDetail('reload');
      initRangeSider();
      settings.initFromLocal();
    } else {
      $(this.menu_doms[this.keys.menu_selection]).addClass("active");
      this.keys.focused_part = "menu_selection";
    }
  },

  showContactUSModal: function () {
    $(".support-email").text(contacts[0].contact_id);
    $(".telelgram-id").text(contacts[1].contact_id);
    $(".whatsapp-number").text(contacts[2].contact_id);
    $(".viber-id").text(contacts[3].contact_id);
    $("#contactus-modal").modal("show");
    this.keys.focused_part = "contactus_modal";
  },

  clickTopBarMenu: function (index) {
    fullScreenLoader();
    closePlayer();
    console.log(index)
    switch (index) {
      case 0:
        hideVodSeriesPage();
        hideTopBar();
        goToHomePage();
        showLoader(false);
        this.keys.focused_part = "menu_selection";
        break;
      case 2:
        channel_page.init();
        break;
      case 3:
        vod_series_page.init("vod");
        break;
      case 4:
        vod_series_page.init("series");
        break;
      case 5:
        setting_page.init();
        break;
    }
  },
  goBack: function () {
    var keys = this.keys;
    if (keys.focused_part === "menu_selection") {
      $(".home-menu").removeClass("active");
      $(".home-top-bar .item").removeClass("active");
      $(".home-bottom-bar .item").removeClass("active");
      turn_off_page.init(current_route);
    }
    if (keys.focused_part === "user_account_modal") {
      $(this.menu_doms[this.keys.menu_selection]).addClass("active");
      $("#user-account-modal").modal("hide");
      keys.focused_part = "menu_selection";
    } else if (keys.focused_part == "reloadModal") {
      $(this.menu_doms[this.keys.menu_selection]).addClass("active");
      $("#reload-modal").modal("hide");
      keys.focused_part = "menu_selection";
    } else if (keys.focused_part === "contactus_modal") {
      $(this.menu_doms[this.keys.menu_selection]).addClass("active");
      $("#contactus-modal").modal("hide");
      keys.focused_part = "menu_selection";
    }
  },
  showUserAccounts: function () {
    $(".account-icon").removeClass("active");
    $("#user-account-expire-date").text(expire_date);
    if (is_trial == 2 || is_trial == 3)
      $("#user-account-is_trial").text("Active");
    else $("#user-account-is_trial").text("Free Trial");
    $("#user-account-modal").modal("show");
    this.keys.focused_part = "user_account_modal";
  },

  showReloadModal: function () {
    $(".refresh-icon").removeClass("active");
    $("#reload-modal").modal("show");
    this.keys.focused_part = "reloadModal";
    this.hoverReloadModalBtn(this.keys.reloadModalBtnSelection);
  },

  hoverMainMenu: function (index) {
    var keys = this.keys;
    keys.focused_part = "menu_selection";
    keys.menu_selection = index;
    $(this.prev_focus_dom).removeClass("active");
    this.prev_focus_dom = this.menu_doms[index];
    $(this.menu_doms[index]).addClass("active");
  },

  handleMenuClick: function () {
    var keys = this.keys;
    switch (keys.focused_part) {
      case "menu_selection":
        $(this.menu_doms[keys.menu_selection]).trigger("click");
        break;
      case "reloadModal":
        $(this.reloadModalButnDoms[keys.reloadModalBtnSelection]).trigger("click");
        break;
    }
  },

  hoverReloadModalBtn: function (index) {
    this.keys.reloadModalBtnSelection = index;
    $(this.reloadModalButnDoms).removeClass("active");
    $(this.reloadModalButnDoms[this.keys.reloadModalBtnSelection]).addClass("active");
  },

  handleMenusUpDown: function (increment) {
    var keys = this.keys;
    if (keys.focused_part === "menu_selection") {
      if (keys.menu_selection >= 0 && keys.menu_selection <= 4 && increment > 0) {
        keys.menu_selection = 5;
        this.hoverMainMenu(keys.menu_selection);
      } else if (keys.menu_selection >= 5 && keys.menu_selection <= 8 && increment < 0) {
        keys.menu_selection = 0;
        this.hoverMainMenu(keys.menu_selection);
      }
    }
  },

  handleMenuLeftRight: function (increment) {
    var keys = this.keys;
    if (keys.focused_part === "menu_selection") {
      keys.menu_selection += increment;
      if (increment > 0) {
        if (keys.menu_selection === 5)
          keys.menu_selection = 4;
        if (keys.menu_selection === 9)
          keys.menu_selection = 8;
      } else {
        if (keys.menu_selection === -1)
          keys.menu_selection = 0;
        if (keys.menu_selection === 4)
          keys.menu_selection = 5;
      }
      this.hoverMainMenu(keys.menu_selection);
    } else if (keys.focused_part === "reloadModal") {
      keys.reloadModalBtnSelection = keys.reloadModalBtnSelection === 0 ? 1 : 0;
      this.hoverReloadModalBtn(keys.reloadModalBtnSelection);
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
