function rand(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

function randString(length) {
    var ALLOWED_CHARACTERS =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var result = "";
    for (let i = 0; i < length; i++) {
        const pos = rand(0, ALLOWED_CHARACTERS.length - 1);
        result += ALLOWED_CHARACTERS[pos];
    }
    return result;
}

function encode(data) {
    var ALLOWED_CHARACTERS =
        "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    data.app_device_id = window.btoa(data.app_device_id);
    const base64 = window.btoa(JSON.stringify(data));

    const pos = this.rand(2, Math.min(43, base64.length));
    const length = this.rand(0, ALLOWED_CHARACTERS.length);

    const char1 = ALLOWED_CHARACTERS[pos];
    const char2 = ALLOWED_CHARACTERS[length];
    const rand_str = randString(length);

    return (
        base64.substring(0, pos) +
        rand_str +
        base64.substring(pos, base64.length) +
        char1 +
        char2
    );
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