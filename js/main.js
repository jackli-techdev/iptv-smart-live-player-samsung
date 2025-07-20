var init = function () {
  try {
    if (window.navigator.userAgent.toLowerCase().includes('web0s')) {
      platform = 'LG'
    }
  } catch (e) {
    console.log(e);
  }

  console.log('platform', platform)
  appVersion = platform === 'Samsung' ? samsungVersion : LGVersion;
  $(".app-version").text("v" + appVersion);

  $(document).ready(function () {
    var storedMacAddress = getLocalStorageData("macAddress");
    var storedDeviceKey = getLocalStorageData("deviceKey");
    if (storedMacAddress !== null && storedDeviceKey !== null) {
      $(".mac-address").text(storedMacAddress);
      $(".device-key").text(storedDeviceKey);
      $(".loading-mac-devicekey").removeClass("hide");
    }
    login_page.getPlayListDetail('');
    initRangeSider();
  });
  settings.initFromLocal();
  window.onwheel = function () {
    return true;
  };
};

document.addEventListener("keyboardStateChange", keyboardVisibilityChange, false);

function keyboardVisibilityChange(event) {
  var visibility = event.detail.visibility;
  if (visibility) {
    isKeyboard = true;
  } else {
    isKeyboard = false;
    $("input").blur();
  }
}

// document.getElementById('input').addEventListener('focus', function () {
//   console.log("input element is focused and ready to get user input.");
// });


// document.addEventListener("cursorStateChange", cursorVisibilityChange, false);

// function cursorVisibilityChange(event) {
//   var visibility = event.detail.visibility;
//   if (visibility) {
//     console.log('Cursor appeared');
//     // Do something.
//   } else {
//     console.log('Cursor disappeared');
//     // Do something.
//   }
// }

function updateClock() {
  var now = new Date();
  var day = now.toLocaleString('en-US', { weekday: 'long' });
  var month = now.toLocaleString('en-US', { month: 'short' });
  var date = now.getDate().toString().padStart(2, '0');
  var year = now.getFullYear();
  var hours = now.getHours();
  var minutes = now.getMinutes();
  if (time_format == 24) {
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    var formattedTime = hours + ":" + minutes;
  } else {
    var AmPm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? (hours < 10 ? "0" + hours : hours) : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? "0" + minutes : minutes;
    minutes = minutes == "0" ? "00" : minutes;
    var formattedTime = hours + ":" + minutes + " " + AmPm;
  }

  $("#clock .h-min").text(formattedTime);
  var tempDate = new Date(day + ', ' + month + ' ' + date + ' ' + year);
  var translatedDate = formatDateByLanguage(tempDate);
  $("#clock .month-date").text(translatedDate);
}


// Update the clock every second
var clockInterval = setInterval(updateClock, 1000);

// Initial call to display the clock immediately
updateClock();

document.addEventListener('keydown', function (e) {
  if (e.keyCode === 10182) {
    console.log('Exit button pressed');
    turn_off_page.init(current_route);
  }
});

window.onload = init;
