"use strict";
(function () {
    var i, keyCode = {}, supportedKeys;   // Register Keys;
    try {
        supportedKeys = tizen.tvinputdevice.getSupportedKeys();
        for (i = 0; i < supportedKeys.length; i++) {
            keyCode[supportedKeys[i].name] = supportedKeys[i].code;
            tizen.tvinputdevice.registerKey(supportedKeys[i].name);
        }
        tizen.tvinputdevice.unregisterKey("VolumeUp");
        tizen.tvinputdevice.unregisterKey("VolumeDown");
        tizen.tvinputdevice.unregisterKey("VolumeMute");
    } catch (e) {
    }
    var tvKey = {
        N0: 48,
        N1: 49,
        N2: 50,
        N3: 51,
        N4: 52,
        N5: 53,
        N6: 54,
        N7: 55,
        N8: 56,
        N9: 57,
        Minus: 189,

        ArrowLeft: 37,
        ArrowUp: 38,
        ArrowRight: 39,
        ArrowDown: 40,
        Enter: 13,
        Back: 10009,

        VolumeUp: 447,
        VolumeDown: 448,
        VolumeMute: 449,
        ChannelUp: 427,
        ChannelDown: 428,
        ChannelList: 10073,
        PreviousChannel: 10190,

        ColorF0Red: 403,
        ColorF1Green: 404,
        ColorF2Yellow: 405,
        ColorF3Blue: 406,

        MediaPlayPause: 10252,
        MediaRewind: 412,
        MediaFastForward: 417,
        MediaPlay: 415,
        MediaPause: 19,
        MediaStop: 413,
        MediaRecord: 416,
        MediaTrackPrevious: 10232,
        MediaTrackNext: 10233,

        Menu: 18,
        Tools: 10135,
        Info: 457,
        Source: 10072,
        Exit: 10182,
        Caption: 10221,
        E_Manual: 10146,
        Three_D: 10199,
        Extra: 10253,
        PictureSize: 10140,
        Soccer: 10228,
        Teletext: 10200,
        MTS: 10195,
        Search: 10225,
        Guide: 458,
    };
    window.tvKey = tvKey;
})();
