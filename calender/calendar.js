var p_YM = '2000-01';
var events = [];
var titles = [];
var urlParams = new URLSearchParams(window.location.search);
var myParam = urlParams.get('a');
var preModifyTitle = '';

(function () {
  $(function () {
    // calendar element 취득
    var calendarEl = $('#calendar')[0];

    var Today = new Date();
    var Year = Today.getFullYear();
    var Month = ('0' + (Today.getMonth() + 1)).slice(-2);
    var Day = ('0' + Today.getDate()).slice(-2);
    var DateString = Year + '-' + Month + '-' + Day;

    console.log(DateString);

    // 공휴일 배열을 전역 변수로 정의
    var Holis = [];

    // 공휴일 배열을 이벤트로 변환할 함수
    function getHolidayEvents() {
      var Mon_day;

      for (let k = 2000; k <= 2043; k++) {
        year = k;
        for (let j = 1; j <= 12; j++) {
          //월마다 공휴일 구하기
          if (j < 10) {
            j = '0' + j;
          }

          Mon_day = day_max(j);
          for (let i = 1; i <= Mon_day; i++) {
            let Holiday;
            if (i < 10) {
              Holiday = year + '' + j + '0' + i;
            } else {
              Holiday = year + '' + j + i;
            }

            var days = [];
            if (isHoliday(Holiday) != null) {
              if (i < 10) {
                days[0] = year + '-' + j + '-' + '0' + i;
              } else {
                days[0] = year + '-' + j + '-' + i;
              }

              days[1] = isHoliday(Holiday);
              console.log(Holiday);

              Holis.push({
                title: days[1],
                start: days[0],
                backgroundColor: '#ffc4c4',
                display: 'background',
              });
            }
          }
        }
      }
      return Holis;
    }

    function day_max(month) {
      var Today = new Date();
      var year = Today.getFullYear();

      var Mon_day = 30;
      if (
        month == 1 ||
        month == 3 ||
        month == 5 ||
        month == 7 ||
        month == 8 ||
        month == 10 ||
        month == 12
      ) {
        Mon_day = 31;
      } else if (month == 2) {
        if (year % 4 == 0) {
          Mon_day = 29;
        } else {
          Mon_day = 28;
        }
      }
      return Mon_day;
    }

    // full-calendar 생성하기
    var calendar = new FullCalendar.Calendar(calendarEl, {
      height: '700px', // calendar 높이 설정
      expandRows: true, // 화면에 맞게 높이 재설정
      slotMinTime: '08:00', // Day 캘린더에서 시작 시간
      slotMaxTime: '20:00', // Day 캘린더에서 종료 시간
      // 해더에 표시할 툴바
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek',
      },
      initialView: 'dayGridMonth', // 초기 로드 될때 보이는 캘린더 화면(기본 설정: 달)
      initialDate: DateString, // 초기 날짜 설정 (설정하지 않으면 오늘 날짜가 보인다.)
      navLinks: true, // 날짜를 선택하면 Day 캘린더나 Week 캘린더로 링크
      editable: true, // 수정 가능?
      selectable: true, // 달력 일자 드래그 설정가능
      nowIndicator: true, // 현재 시간 마크
      dayMaxEvents: true, // 이벤트가 오버되면 높이 제한 (+ 몇 개식으로 표현)
      dayCellContent: function (e) {
        e.dayNumberText = e.dayNumberText.replace('일', '');
      },
      locale: 'ko', // 한국어 설정
      events: loadEvents(myParam),
      events: getHolidayEvents().concat(events), // 공휴일 이벤트 추가

      eventAdd: function (obj) {
        // 이벤트가 추가되면 발생하는 이벤트
      },
      eventChange: function (obj) {
        // 이벤트가 수정되면 발생하는 이벤트
        console.log(obj.event);
        removeEvent(obj);
        saveEvents(obj.event);
      },
      eventClick: function (obj) {
        //이벤트 클릭 이벤트
        $('#addEventModalLabel').text('일정 수정');
        $('#submitBtn').text('수정');
        $('#deleteBtn').show();
        $('#subject').val(obj.event.title);
        $('#start').val(obj.event.startStr.substring(0, 10));
        $('#end').val(obj.event.endStr.substring(0, 10));
        $('#addEventModal').modal('show');
        preModifyTitle = obj.event.title;
      },
      eventRemove: function (obj) {
        // 이벤트가 삭제되면 발생하는 이벤트
        console.log(obj);
      },
      select: function (arg) {
        // 캘린더에서 드래그로 이벤트를 생성할 수 있다.
        console.log(myParam);
        $('#addEventModalLabel').text('일정 추가');
        $('#deleteBtn').hide();
        $('#submitBtn').text('저장');
        $('#addEventModal').modal('show');
        $('#start').val(arg.startStr);
        $('#end').val(arg.endStr);
        calendar.unselect();
      },
      dayCellDidMount: function (info) {
        var date = info.date;
        var dateString = date.toISOString().split('T')[0];

        // 공휴일 체크
        Holis.forEach(function (holiday) {
          if (holiday[0] === dateString) {
            info.el.classList.add('holiday'); // 특정 날짜 셀에 'holiday' 클래스 추가
          }
        });
      },
    });

    // 캘린더 랜더링
    calendar.render();

    $('#deleteBtn').click(function () {
      if (confirm('일정을 삭제하시겠습니까?')) {
      } else {
        var historyEvents = loadEvents(myParam);
        for (var i = 0; i < historyEvents.length; i++) {
          if (historyEvents[i].title == $('#subject').val()) {
            historyEvents.splice(i, 1);
            myParam = btoa(encodeURIComponent(JSON.stringify(historyEvents)));
          }
        }
      }

      $('#addEventModal').modal('hide');
      location.reload(true);
    });

    $('#eventForm').submit(function (e) {
      e.preventDefault();

      const subject = $('#subject').val();
      const start = $('#start').val();
      const end = $('#end').val();

      e = {
        title: subject,
        start: start,
        end: end,
        allDay: true,
      };
      if ($('#submitBtn').text() == '저장') {
        saveEvents(e);
        calendar.addEvent(e);
      } else if ($('#submitBtn').text() == '수정') {
        var historyEvents = loadEvents(myParam);
        for (var i = 0; i < historyEvents.length; i++) {
          if (historyEvents[i].title == preModifyTitle) {
            historyEvents.splice(i, 1);
            myParam = btoa(encodeURIComponent(JSON.stringify(historyEvents)));
            window.history.replaceState({}, null, '?a=' + myParam);
            if (preModifyTitle != subject) {
              saveEvents(e);
              calendar.addEvent(e);
            }
          }
        }
      }

      $('#addEventModal').modal('hide');
      $('#subject').val('');
      location.reload(true);
    });
  });
})();

// 이벤트를 DB화
function saveEvents(event) {
  if (myParam != null) {
    var historyEvents = loadEvents(myParam);
    historyEvents.push(event);
    var encodeEvents = btoa(encodeURIComponent(JSON.stringify(historyEvents)));
  } else {
    var eventList = [event];
    var encodeEvents = btoa(encodeURIComponent(JSON.stringify(eventList)));
  }
  window.history.replaceState({}, null, '?a=' + encodeEvents);
  myParam = encodeEvents;

  console.log('성공');
}

// url 복사
function copyToClipBoard() {
  var url = window.location.href;
  console.log(url);
  navigator.clipboard.writeText(url).then(() => {
    console.log('복사 성공');
  });
}

// url 디코딩
function loadEvents(url) {
  if (url != null) {
    var decodeEvents = JSON.parse(decodeURIComponent(atob(url)));
    return decodeEvents;
  } else {
    return [];
  }
}

// 이벤트 삭제
function removeEvent(obj) {
  var historyEvents = loadEvents(myParam);
  for (var i = 0; i < historyEvents.length; i++) {
    if (historyEvents[i].title == obj.oldEvent._def.title) {
      historyEvents.splice(i, 1);
      myParam = btoa(encodeURIComponent(JSON.stringify(historyEvents)));
    }
  }
}

function get_events() {
  YM[0] = Year;
  YM[1] = Month;
}

// isHoliday에 날짜 년-월-일을 입력하여 공휴일인지 true / false 값을 return 받을 수 있다.

// 실행 함수 : isHoliday(strDate.replace(/-/g, ""))
// return 값 : true / false

/**
 * 입력한 날짜가 공휴일인지 검사를 한다.
 * 공휴일인 경우에는 경고창 후 멈춘다.
 * 입력형식 : 2023년 11월 21일 --> 20231121
 *
 * @param string
 */

function isHoliday(yyyymmdd) {
  // 검사년도
  var yyyy = yyyymmdd.substring(0, 4);
  var holidays = new Array();
  var event; //반환값

  // 음력 공휴일을 양력으로 바꾸어서 입력
  var tmp01 = lunerCalenderToSolarCalenger(yyyy + '0101'); // 음력설날
  var tmp02 = lunerCalenderToSolarCalenger(yyyy + '0815'); // 음력추석
  holidays[0] = getDateNextPre(tmp01, 'pre', 1); //String(Number(tmp01) - 1); // 음력설 첫째날
  holidays[1] = tmp01; // 음력설 둘째날
  holidays[2] = getDateNextPre(tmp01, 'next', 1); //Number(tmp01) + 1; // 음력설 셋째날
  holidays[3] = getDateNextPre(tmp02, 'pre', 1); //Number(tmp02) - 1; // 추석 첫째날
  holidays[4] = tmp02; // 추석 둘째날
  holidays[5] = getDateNextPre(tmp02, 'next', 1); //Number(tmp02) + 1; // 추석 셋째날
  holidays[6] = lunerCalenderToSolarCalenger(yyyy + '0408'); // 석가탄신일

  // 양력 공휴일 입력
  holidays[7] = yyyy + '0101'; // 양력설날
  holidays[8] = yyyy + '0301'; // 삼일절
  holidays[9] = yyyy + '0405'; // 식목일
  holidays[10] = yyyy + '0505'; // 어린이날
  holidays[11] = yyyy + '0606'; // 현충일
  holidays[12] = yyyy + '0815'; // 광복절
  holidays[13] = yyyy + '1003'; // 개천절
  holidays[14] = yyyy + '1225'; // 성탄절
  for (var i = 0; i < holidays.length; i++) {
    if (holidays[i] == yyyymmdd) {
      switch (i) {
        case 0:
          event = '설 연휴';
          return event;

        case 1:
          event = '설 연휴';
          return event;

        case 2:
          event = '설 연휴';
          return event;

        case 3:
          event = '추석 연휴';
          return event;

        case 4:
          event = '추석 연휴';
          return event;

        case 5:
          event = '추석 연휴';
          return event;

        case 6:
          event = '석가탄신일';
          return event;

        case 7:
          event = '새해 첫 날';
          return event;

        case 8:
          event = '삼일절';
          return event;

        case 9:
          event = '식목일';
          return event;

        case 10:
          event = '어린이날';
          return event;

        case 11:
          event = '현충일';
          return event;

        case 12:
          event = '광복절';
          return event;

        case 13:
          event = '개천절';
          return event;

        case 14:
          event = '성탄절';
          return event;
      }
      return null;
    }
  }
}

/**
 * 음력을 양력으로 바꾸어서 반환한다.
 *
 * @param string
 * return string
 */
function lunerCalenderToSolarCalenger(input_day) {
  var kk = [
    [1, 2, 4, 1, 1, 2, 1, 2, 1, 2, 2, 1] /* 1841 */,
    [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 1],
    [2, 2, 2, 1, 2, 1, 4, 1, 2, 1, 2, 1],
    [2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
    [2, 1, 2, 1, 5, 2, 1, 2, 2, 1, 2, 1],
    [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
    [2, 1, 2, 3, 2, 1, 2, 1, 2, 1, 2, 2],
    [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
    [2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 5, 2] /* 1851 */,
    [2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 1, 2],
    [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2],
    [1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
    [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
    [1, 2, 1, 1, 5, 2, 1, 2, 1, 2, 2, 2],
    [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
    [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
    [2, 1, 6, 1, 1, 2, 1, 1, 2, 1, 2, 2],
    [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2] /* 1861 */,
    [2, 1, 2, 1, 2, 2, 1, 2, 2, 3, 1, 2],
    [1, 2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
    [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
    [2, 1, 1, 2, 4, 1, 2, 2, 1, 2, 2, 1],
    [2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
    [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
    [1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2, 1],
    [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1],
    [2, 2, 2, 1, 2, 1, 2, 1, 1, 5, 2, 1],
    [2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1, 2] /* 1871 */,
    [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
    [1, 1, 2, 1, 2, 4, 2, 1, 2, 2, 1, 2],
    [1, 1, 2, 1, 2, 1, 2, 1, 2, 2, 2, 1],
    [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
    [2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1, 2],
    [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
    [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    [2, 2, 4, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
    [1, 2, 1, 2, 1, 2, 5, 2, 2, 1, 2, 1] /* 1881 */,
    [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
    [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
    [2, 1, 1, 2, 3, 2, 1, 2, 2, 1, 2, 2],
    [2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
    [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
    [2, 2, 1, 5, 2, 1, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2] /* 1891 */,
    [1, 1, 2, 1, 1, 5, 2, 2, 1, 2, 2, 2],
    [1, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
    [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
    [2, 1, 2, 1, 5, 1, 2, 1, 2, 1, 2, 1],
    [2, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
    [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [2, 1, 5, 2, 2, 1, 2, 1, 2, 1, 2, 1],
    [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 2, 5, 2, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1] /* 1901 */,
    [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
    [1, 2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2],
    [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
    [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
    [1, 2, 2, 4, 1, 2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
    [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
    [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
    [2, 1, 2, 1, 1, 5, 1, 2, 2, 1, 2, 2] /* 1911 */,
    [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
    [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
    [2, 2, 1, 2, 5, 1, 2, 1, 2, 1, 1, 2],
    [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
    [2, 3, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1],
    [2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 5, 2, 2, 1, 2, 2],
    [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
    [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2] /* 1921 */,
    [2, 1, 2, 2, 3, 2, 1, 1, 2, 1, 2, 2],
    [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2],
    [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
    [2, 1, 2, 5, 2, 1, 2, 2, 1, 2, 1, 2],
    [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
    [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
    [1, 5, 1, 2, 1, 1, 2, 2, 1, 2, 2, 2],
    [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2],
    [1, 2, 2, 1, 1, 5, 1, 2, 1, 2, 2, 1],
    [2, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1] /* 1931 */,
    [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
    [1, 2, 2, 1, 6, 1, 2, 1, 2, 1, 1, 2],
    [1, 2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2],
    [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
    [2, 1, 4, 1, 2, 1, 2, 1, 2, 2, 2, 1],
    [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
    [2, 2, 1, 1, 2, 1, 4, 1, 2, 2, 1, 2],
    [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 1, 2],
    [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    [2, 2, 1, 2, 2, 4, 1, 1, 2, 1, 2, 1] /* 1941 */,
    [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 1, 2],
    [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
    [1, 1, 2, 4, 1, 2, 1, 2, 2, 1, 2, 2],
    [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
    [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
    [2, 5, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
    [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
    [2, 2, 1, 2, 1, 2, 3, 2, 1, 2, 1, 2],
    [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2] /* 1951 */,
    [1, 2, 1, 2, 4, 2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 1, 2, 2, 1, 2, 2, 1, 2, 2],
    [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
    [2, 1, 4, 1, 1, 2, 1, 2, 1, 2, 2, 2],
    [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
    [2, 1, 2, 1, 2, 1, 1, 5, 2, 1, 2, 2],
    [1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
    [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
    [2, 1, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1],
    [2, 1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2] /* 1961 */,
    [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
    [2, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2, 1],
    [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
    [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1],
    [2, 2, 5, 2, 1, 1, 2, 1, 1, 2, 2, 1],
    [2, 2, 1, 2, 2, 1, 1, 2, 1, 2, 1, 2],
    [1, 2, 2, 1, 2, 1, 5, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
    [2, 1, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
    [1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1, 2] /* 1971 */,
    [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
    [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2, 1],
    [2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1, 2],
    [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
    [2, 2, 1, 2, 1, 2, 1, 5, 2, 1, 1, 2],
    [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 1],
    [2, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1],
    [2, 1, 1, 2, 1, 6, 1, 2, 2, 1, 2, 1],
    [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
    [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2] /* 1981 */,
    [2, 1, 2, 3, 2, 1, 1, 2, 2, 1, 2, 2],
    [2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
    [2, 1, 2, 2, 1, 1, 2, 1, 1, 5, 2, 2],
    [1, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
    [1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1, 1],
    [2, 1, 2, 2, 1, 5, 2, 2, 1, 2, 1, 2],
    [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
    [2, 1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2],
    [1, 2, 1, 1, 5, 1, 2, 1, 2, 2, 2, 2],
    [1, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2] /* 1991 */,
    [1, 2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2],
    [1, 2, 5, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    [2, 2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2],
    [1, 2, 2, 1, 2, 2, 1, 5, 2, 1, 1, 2],
    [1, 2, 1, 2, 2, 1, 2, 1, 2, 2, 1, 2],
    [1, 1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1],
    [2, 1, 1, 2, 3, 2, 2, 1, 2, 2, 2, 1],
    [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1],
    [2, 2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1],
    [2, 2, 2, 3, 2, 1, 1, 2, 1, 2, 1, 2] /* 2001 */,
    [2, 2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    [2, 2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2],
    [1, 5, 2, 2, 1, 2, 1, 2, 2, 1, 1, 2],
    [1, 2, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
    [1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 2, 2],
    [1, 1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2],
    [2, 1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2],
    [2, 2, 1, 1, 5, 1, 2, 1, 2, 1, 2, 2],
    [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 2, 1, 2, 1, 1, 2, 1, 2, 1] /* 2011 */,
    [2, 1, 6, 2, 1, 2, 1, 1, 2, 1, 2, 1],
    [2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2],
    [1, 2, 1, 2, 1, 2, 1, 2, 5, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 2, 2, 2, 1, 2, 2],
    [1, 1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2],
    [2, 1, 1, 2, 3, 2, 1, 2, 1, 2, 2, 2],
    [1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2],
    [2, 1, 2, 1, 2, 1, 1, 2, 1, 2, 1, 2],
    [2, 1, 2, 5, 2, 1, 1, 2, 1, 2, 1, 2],
    [1, 2, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1] /* 2021 */,
    [2, 1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2],
    [1, 5, 2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1],
    [2, 1, 2, 1, 1, 5, 2, 1, 2, 2, 2, 1],
    [2, 1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2],
    [1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 2],
    [1, 2, 2, 1, 5, 1, 2, 1, 1, 2, 2, 1],
    [2, 2, 1, 2, 2, 1, 1, 2, 1, 1, 2, 2],
    [1, 2, 1, 2, 2, 1, 2, 1, 2, 1, 2, 1],
    [2, 1, 5, 2, 1, 2, 2, 1, 2, 1, 2, 1] /* 2031 */,
    [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 5, 2, 2, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 2, 1, 2, 2, 2, 1],
    [2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2],
    [2, 2, 1, 2, 1, 4, 1, 1, 2, 1, 2, 2],
    [2, 2, 1, 2, 1, 1, 2, 1, 1, 2, 1, 2],
    [2, 2, 1, 2, 1, 2, 1, 2, 1, 1, 2, 1],
    [2, 2, 1, 2, 5, 2, 1, 2, 1, 2, 1, 1],
    [2, 1, 2, 2, 1, 2, 2, 1, 2, 1, 2, 1],
    [2, 1, 1, 2, 1, 2, 2, 1, 2, 2, 1, 2] /* 2041 */,
    [1, 5, 1, 2, 1, 2, 1, 2, 2, 2, 1, 2],
    [1, 2, 1, 1, 2, 1, 1, 2, 2, 1, 2, 2],
  ];
  var gan = new Array(
    '甲',
    '乙',
    '丙',
    '丁',
    '戊',
    '己',
    '庚',
    '辛',
    '壬',
    '癸'
  );
  var jee = new Array(
    '子',
    '丑',
    '寅',
    '卯',
    '辰',
    '巳',
    '午',
    '未',
    '申',
    '酉',
    '戌',
    '亥'
  );
  var ddi = new Array(
    '쥐',
    '소',
    '범',
    '토끼',
    '용',
    '뱀',
    '말',
    '양',
    '원숭이',
    '닭',
    '개',
    '돼지'
  );
  var week = new Array('일', '월', '화', '수', '목', '금', '토');
  var md = new Array(31, 0, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
  var year = input_day.substring(0, 4);
  var month = input_day.substring(4, 6);
  var day = input_day.substring(6, 8);

  // 음력에서 양력으로 변환
  var lyear, lmonth, lday, leapyes;
  var syear, smonth, sday;
  var mm, y1, y2, m1;
  var i, j, k1, k2, leap, w;
  var td, y;
  lyear = get_year(year); // 년도 check
  lmonth = get_month(month); // 월 check
  y1 = lyear - 1841;
  m1 = lmonth - 1;
  leapyes = 0;
  var byoonchecked = false;
  if (kk[y1][m1] > 2) {
    if (byoonchecked) {
      leapyes = 1;
      switch (kk[y1][m1]) {
        case 3:
        case 5:
          mm = 29;
          break;
        case 4:
        case 6:
          mm = 30;
          break;
      }
    } else {
      switch (kk[y1][m1]) {
        case 1:
        case 3:
        case 4:
          mm = 29;
          break;
        case 2:
        case 5:
        case 6:
          mm = 30;
          break;
      } // end of switch
    } // end of if
  } // end of if
  lday = get_day(day, mm);
  td = 0;
  for (i = 0; i < y1; i++) {
    for (j = 0; j < 12; j++) {
      switch (kk[i][j]) {
        case 1:
          td = td + 29;
          break;
        case 2:
          td = td + 30;
          break;
        case 3:
          td = td + 58; // 29+29
          break;
        case 4:
          td = td + 59; // 29+30
          break;
        case 5:
          td = td + 59; // 30+29
          break;
        case 6:
          td = td + 60; // 30+30
          break;
      } // end of switch
    } // end of for
  } // end of for
  for (j = 0; j < m1; j++) {
    switch (kk[y1][j]) {
      case 1:
        td = td + 29;
        break;
      case 2:
        td = td + 30;
        break;
      case 3:
        td = td + 58; // 29+29
        break;
      case 4:
        td = td + 59; // 29+30
        break;
      case 5:
        td = td + 59; // 30+29
        break;
      case 6:
        td = td + 60; // 30+30
        break;
    } // end of switch
  } // end of for
  if (leapyes == 1) {
    switch (kk[y1][m1]) {
      case 3:
      case 4:
        td = td + 29;
        break;
      case 5:
      case 6:
        td = td + 30;
        break;
    } // end of switch
  } // end of switch
  td = td + parseFloat(lday) + 22;
  // td : 1841 년 1 월 1 일 부터 원하는 날짜까지의 전체 날수의 합
  y1 = 1840;
  do {
    y1 = y1 + 1;
    if (y1 % 400 == 0 || (y1 % 100 != 0 && y1 % 4 == 0)) {
      y2 = 366;
    } else {
      y2 = 365;
    }
    if (td <= y2) {
      break;
    } else {
      td = td - y2;
    }
  } while (1); // end do-While
  syear = y1;
  md[1] = Number(y2) - 337;
  m1 = 0;
  do {
    m1 = m1 + 1;
    if (td <= md[m1 - 1]) {
      break;
    } else {
      td = td - md[m1 - 1];
    }
  } while (1); // end of do-While
  smonth = Number(m1);
  sday = Number(td);
  // 월이 한자리인경우에는 앞에 0을 붙혀서 반환
  if (smonth < 10) {
    smonth = '0' + smonth;
  }
  // 일이 한자리인경우에는 앞에 0을 붙혀서 반환
  if (sday < 10) {
    sday = '0' + sday;
  }
  //return new String(syear + smonth + sday);
  return new String(String(syear) + String(smonth) + String(sday));
}

/**
 * 작성일 : 2023.11.21
 * 년도검사를 한다.
 * 1841~2043년 까지만 검사가 가능하다.
 * 년도가 검사 범위를 벗어나면 경고창 후 멈춘다.
 *
 * @param int
 * @return int
 */
function get_year(src) {
  if (src < 1841 || src > 2043) {
    alert('연도 범위는 1841 ~ 2043 까지입니다.');
    return;
  } else {
    return src;
  }
}

/**
 * 달이 12보다 크거나 1보다 작은지 검사한다.
 * 날짜가 잘못된 경우에는 경고창 후 멈춘다.
 *
 * @param int
 * @return int
 */
function get_month(src) {
  if (src < 1 || src > 12) {
    alert('월 범위는 1 ~ 12 까지입니다.');
    return;
  } else {
    return src;
  }
}

/**
 * 날짜가 1일보다 크고 src보다 작은 경우는 날짜를 반환한다.
 * 날짜가 잘못된 경우에는 경고창 후 멈춘다.
 *
 * @param int
 * @param int
 * @return int
 */
function get_day(src, day) {
  if (src < 1 || src > day) {
    alert('일 범위가 틀립니다.');
    return;
  } else {
    return src;
  }
}

/*
 * 날짜의 입력된 일수 만큼의 날짜 return
 * pyyyymmdd : 20231121
 * pgubn : pre, next
 * pday  : 1 2
 * return : yyyymmdd
 */
function getDateNextPre(pyyyymmdd, pgubn, pday) {
  var ndate = new Date(
    pyyyymmdd.substring(0, 4),
    pyyyymmdd.substring(4, 6),
    pyyyymmdd.substring(6, 8)
  );
  var chkdate = new Date(
    pyyyymmdd.substring(0, 4),
    pyyyymmdd.substring(4, 6),
    pyyyymmdd.substring(6, 8)
  );
  switch (pgubn) {
    case 'pre':
      chkdate.setDate(ndate.getDate() - pday);
      break;
    case 'next':
      chkdate.setDate(ndate.getDate() + pday);
      break;
  }
  //날짜포맷맞추기
  var szyyyymmdd = String(chkdate.getFullYear());
  if (String('0' + String(chkdate.getMonth())).length > 2) {
    szyyyymmdd = szyyyymmdd + '' + String(chkdate.getMonth());
  } else {
    szyyyymmdd = szyyyymmdd + '0' + String(chkdate.getMonth());
  }
  if (String('0' + String(chkdate.getDate())).length > 2) {
    szyyyymmdd = szyyyymmdd + '' + String(chkdate.getDate());
  } else {
    szyyyymmdd = szyyyymmdd + '0' + String(chkdate.getDate());
  }
  var rtnDate = szyyyymmdd;
  return rtnDate;
}
