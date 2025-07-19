"use strict";

function convertProgrammeTimeToClientTime(program_time) {
    var date = moment(program_time, "YYYYMMDDHHmmss Z");
    date.utc().add(client_offset, "minute");
    return date.format("Y-MM-DD HH:mm");
}

function getTodayDate(format) {
    var date = new Date();
    var moment_date = moment(date);
    return moment_date.format(format);
}

function calculateTimeDifference(server_time, time_stamp) {
    var date_obj = new Date(server_time);
    timeDifferenceWithServer = parseInt(
        (time_stamp * 1000 - date_obj.getTime()) / (60 * 1000)
    );
}

function getLocalChannelTime(channel_time) {
    var date = moment(channel_time);
    return date.add(timeDifferenceWithServer, "minute");
}

function getServerChannelTime(channel_time) {
    var date = moment(channel_time);
    return date.add(-timeDifferenceWithServer, "minute");
}

function getRemainDays(data) {
    var date1 = new Date(config.today);
    var date2 = new Date(data.expire_date);
    var diffInMs = date2.getTime() - date1.getTime();
    var diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    return diffInDays
}

function getConvertedDate(maxTimestamp) {
    var date = new Date(maxTimestamp);
    var year = date.getFullYear();
    var month = ("0" + (date.getMonth() + 1)).slice(-2);
    var day = ("0" + date.getDate()).slice(-2);
    var hours = ("0" + date.getHours()).slice(-2);
    var minutes = ("0" + date.getMinutes()).slice(-2);
    var dateString =
        year + "-" + month + "-" + day + " " + hours + ":" + minutes;
    return dateString;
}

function convertTime(start) {
    var date = new Date(start);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    if (timeFormat == 24) {
        hours = hours < 10 ? "0" + hours : hours;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        var formattedTime = hours + ":" + minutes;
    } else {
        var AmPm = hours >= 12 ? "PM" : "AM";
        hours = hours % 12;
        hours = hours ? (hours < 10 ? "0" + hours : hours) : 12;
        minutes = minutes < 10 ? "0" + minutes : minutes;
        minutes = minutes == "0" ? "00" : minutes;
        var formattedTime = hours + ":" + minutes + " " + AmPm;
    }
    return formattedTime;
}

function getDay(dd) {
    var date = new Date(dd);
    var daysOfWeek = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];
    var dayOfWeek = daysOfWeek[date.getDay()];
    var month = date.toLocaleString("default", { month: "short" });
    var day = date.getDate();
    return [dayOfWeek, month + " " + day];
}