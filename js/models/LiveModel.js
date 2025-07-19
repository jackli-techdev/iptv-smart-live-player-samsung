"use strict";

var LiveModel = {
  movies: [],
  category_name: "live_categories",
  favoriteMovieCount: 200,
  recentMovieCount: 15,
  movieKey: "stream_id",
  categories: [],
  programmes: {},
  favoriteIds: [],

  getProgrammeVideoUrl: function (channel_id, programme) {
    var start_time = getServerChannelTime(programme.start).format(
      "Y-MM-DD:HH-mm"
    );

    var duration = getMinute(programme.stop) - getMinute(programme.start);
    var url =
      playlistEndpoint + "streaming/timeshift.php?username=" + userName + "&password=" + password + "&stream=" + channel_id + "&start=" + start_time + "&duration=" + duration;

    return {
      duration: duration,
      url: url
    };
  },
  getMovieFromId: function (id) {
    var movies = this.movies;
    var result = null;
    this.categories.map(function (item) {
      movies = movies.concat(item.movies);
    });
    for (var i = 0; i < movies.length; i++) {
      if (movies[i].stream_id == id) {
        result = movies[i];
        break;
      }
    }
    return result;
  },
  getNextProgrammes: function (programmes) {
    var current_program_exist = false;
    var next_programmes = [];
    var current_time = moment(new Date()).unix();

    var k = 0;
    for (var i = 0; i < programmes.length; i++) {
      var item = programmes[i];
      if (timeFormat == 12) {
        var formatText = "YYYY-MM-DD hh:mm a";
      } else var formatText = "YYYY-MM-DD HH:mm";

      var stop = moment(item.stop, formatText).unix();
      if (stop >= current_time) {
        k++;
        var start = moment(item.start, formatText).unix();
        if (start <= current_time) current_program_exist = true;
        next_programmes.push(programmes[i]);
      }
    }

    return {
      current_program_exist: current_program_exist,
      programmes: next_programmes
    };
  }
};
