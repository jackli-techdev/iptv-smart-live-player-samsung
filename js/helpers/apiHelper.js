"use strict";

function auth(data) {
    return $.ajax({
        method: "POST",
        url: config.panelEndPoint + "authenticate",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ data: data })
    })
        .then(function (response) {
            return response;
        }).catch(function (e) {
            return $.ajax({
                method: "POST",
                url: config.panelEndPoint1 + "authenticate",
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({ data: data })
            }).then(function (response) {
                return response;
            }).catch(function (e) {
                return $.ajax({
                    method: "POST",
                    url: config.panelEndPoint2 + "authenticate",
                    headers: { "Content-Type": "application/json" },
                    data: JSON.stringify({ data: data })
                }).then(function (response) {
                    return response;
                }).catch(function (e) {
                    console.log(e)
                })
            })
        });
}

function updateParentPassword(data) {
    $.ajax({
        method: "POST",
        url: config.panelEndPoint + "parent-control/update",
        headers: { "Content-Type": "application/json" },
        data: JSON.stringify({ data: data })
    });
}

function getLoginAPI(playlist) {
    userName = playlist.userName;
    password = playlist.password;
    playlistEndpoint = playlist.url;
    var prefixUrl =
        playlistEndpoint +
        "player_api.php?username=" +
        userName +
        "&password=" +
        password +
        "&action=";
    var loginUrl = prefixUrl.replace("&action=", "");
    return [prefixUrl, loginUrl];
}

function decrypt(encodedData) {
    encodedData = String(encodedData);
    var ALLOWED_CHARACTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    // Extract the last two characters which represent the inserted position and length
    const char1 = encodedData[encodedData.length - 2];
    const char2 = encodedData[encodedData.length - 1];

    // Find their corresponding indexes
    const pos = ALLOWED_CHARACTERS.indexOf(char1);
    const length = ALLOWED_CHARACTERS.indexOf(char2);

    // Remove the last two characters (char1 and char2) from the string
    encodedData = encodedData.substring(0, encodedData.length - 2);

    // Remove the random string that was inserted during encoding
    const base64 = encodedData.substring(0, pos) + encodedData.substring(pos + length);


    // Decode the base64 string
    const decodedData = atob(base64);
    var m = JSON.parse(utf8Decode(decodedData));

    return m;
}

function utf8Decode(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; ++i) {
        bytes[i] = str.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
} 