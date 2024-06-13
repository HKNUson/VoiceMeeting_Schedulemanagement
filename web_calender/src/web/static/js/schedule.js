var sche_ = [];

function get_Month() {
  var YM = [];

  var Today = new Date();
  var Year = Today.getFullYear();
  YM[0] = Year;
  YM[1] = Month;
  var Month = ('0' + (Today.getMonth() + 1)).slice(-2);

  return YM;
}

class schedule {
  constructor(scheduleDate, title, content) {
    this.scheduleDate = scheduleDate;
    this.title = title;
    this.content = content;
  }

  get_title() {
    return this.title;
  }

  get_sche(YM) {
    var ev_len = events.length;
    var sc_len = sche_.length;
    for (var i = 0; i < ev_len; i++) {
      if (sc_len == 0) {
        var ev_y = events[i].start.getFullYear();
        var ev_m = ('0' + (events[i].start.getMonth() + 1)).slice(-2);
        var ev_ym = ev_y + '-' + ev_m;
        if (YM == ev_ym) {
          let sc = new schedule(ev_ym, events[i].title, events[i].content);
          console.log(sc);
          sche_.push(sc);
        }
      }
      for (var j = 0; j < sc_len; j++) {
        console.log('.');
        if (sche_[j] != events[i]) {
          console.log(sche_[j]);
          var ev_y = events[i].start.getFullYear();
          var ev_m = ('0' + (events[i].start.getMonth() + 1)).slice(-2);
          var ev_ym = ev_y + '-' + ev_m;
          if (YM == ev_ym) {
            let sc = new schedule(ev_ym, events[i].title, events[i].content);
            console.log(sc);
            sche_.push(sc);
          }
        }
      }
    }
  }
}
