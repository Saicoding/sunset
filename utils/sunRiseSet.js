let days_of_month_1 = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

let days_of_month_2 = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

let h = -0.833; // 日出日落时太阳的位置

let UTo = 180.0; // 上次计算的日落日出时间，初始迭代值180.0

// 输入日期

// 输入经纬度

// 判断是否为闰年：若为闰年，返回1；若不是闰年,返回0

function leap_year(year) {

  if (((year % 400 == 0) || (year % 100 != 0) && (year % 4 == 0)))
    return true;
  else
    return false;
}

// 求从格林威治时间公元2000年1月1日到计算日天数days

function days(year, month, date) {

  let i, a = 0;

  for (i = 2000; i < year; i++) {
    if (leap_year(i))
      a = a + 366;
    else
      a = a + 365;
  }
  if (leap_year(year)) {
    for (i = 0; i < month - 1; i++) {
      a = a + days_of_month_2[i];
    }
  } else {
    for (i = 0; i < month - 1; i++) {
      a = a + days_of_month_1[i];
    }
  }
  a = a + date;
  return a;
}

// 求格林威治时间公元2000年1月1日到计算日的世纪数t
function t_century(days, UTo) {
  return (days + UTo / 360) / 36525;
}
// 求太阳的平黄径
function L_sun(t_century) {
  return (280.460 + 36000.770 * t_century);
}
// 求太阳的平近点角
function G_sun(t_century) {
  return (357.528 + 35999.050 * t_century);
}

// 求黄道经度
function ecliptic_longitude(L_sun, G_sun) {
  return (L_sun + 1.915 * Math.sin(G_sun * Math.PI / 180) + 0.02 * Math
    .sin(2 * G_sun * Math.PI / 180));
}
// 求地球倾角
function earth_tilt(t_century) {
  return (23.4393 - 0.0130 * t_century);
}
// 求太阳偏差
function sun_deviation(earth_tilt, ecliptic_longitude) {
  return (180 / Math.PI * Math.asin(Math.sin(Math.PI / 180 * earth_tilt) *
    Math.sin(Math.PI / 180 * ecliptic_longitude)));
}
// 求格林威治时间的太阳时间角GHA
function GHA(UTo, G_sun, ecliptic_longitude) {
  return (UTo - 180 - 1.915 * Math.sin(G_sun * Math.PI / 180) - 0.02 *
    Math.sin(2 * G_sun * Math.PI / 180) + 2.466 *
    Math.sin(2 * ecliptic_longitude * Math.PI / 180) - 0.053 * Math
    .sin(4 * ecliptic_longitude * Math.PI / 180));
}

// 求修正值e
function e(h, glat, sun_deviation) {
  return 180 /
    Math.PI *
    Math.acos((Math.sin(h * Math.PI / 180) - Math.sin(glat *
          Math.PI / 180) *
        Math.sin(sun_deviation * Math.PI / 180)) /
      (Math.cos(glat * Math.PI / 180) * Math
        .cos(sun_deviation * Math.PI / 180)));
}
// 求日出时间
function UT_rise(UTo, GHA, glong, e) {
  return (UTo - (GHA + glong + e));
}

// 求日落时间
function UT_set(UTo, GHA, glong, e) {
  return (UTo - (GHA + glong - e));
}

// 判断并返回结果（日出）
function result_rise(UT, UTo, glong, glat, year, month, date) {
  let d;
  if (UT >= UTo)
    d = UT - UTo;
  else
    d = UTo - UT;

  if (d >= 0.1) {

    UTo = UT;

    UT = UT_rise(
      UTo,

      GHA(UTo,
        G_sun(t_century(days(year, month, date), UTo)),

        ecliptic_longitude(
          L_sun(t_century(days(year, month, date),
            UTo)),

          G_sun(t_century(days(year, month, date),
            UTo)))),

      glong,

      e(h,
        glat,
        sun_deviation(
          earth_tilt(t_century(
            days(year, month, date), UTo)),

          ecliptic_longitude(
            L_sun(t_century(
              days(year, month, date),
              UTo)),

            G_sun(t_century(
              days(year, month, date),
              UTo))))));

    result_rise(UT, UTo, glong, glat, year, month, date);

  }

  return UT;
}

// 判断并返回结果（日落）

function result_set(UT, UTo, glong, glat, year, month, date) {
  let d;

  if (UT >= UTo)
    d = UT - UTo;

  else
    d = UTo - UT;

  if (d >= 0.1) {

    UTo = UT;

    UT = UT_set(
      UTo,

      GHA(UTo,
        G_sun(t_century(days(year, month, date), UTo)),

        ecliptic_longitude(
          L_sun(t_century(days(year, month, date),
            UTo)),

          G_sun(t_century(days(year, month, date),
            UTo)))),

      glong,

      e(h,
        glat,
        sun_deviation(
          earth_tilt(t_century(
            days(year, month, date), UTo)),

          ecliptic_longitude(
            L_sun(t_century(
              days(year, month, date),
              UTo)),

            G_sun(t_century(
              days(year, month, date),
              UTo))))));

    result_set(UT, UTo, glong, glat, year, month, date);
  }

  return UT;
}

// 求时区
 
function  Zone( glong) {

  if (glong >= 0)
    return (glong / 15.0) + 1;

  else
    return (glong / 15.0) - 1;

}

function getSunrise(mLong, mLat, date) {

  let sunrise, glong, glat;

  let year=date.year
  let month = date.month;
  let day =  date.day;

  glong = mLong;

  glat = mLat;

  sunrise = result_rise(
    UT_rise(UTo,

      GHA(UTo,
        G_sun(t_century(days(year, month,day), UTo)),

        ecliptic_longitude(
          L_sun(t_century(
            days(year, month, day), UTo)),

          G_sun(t_century(
            days(year, month, day), UTo)))),

      glong,

      e(h,
        glat,
        sun_deviation(
          earth_tilt(t_century(
            days(year, month, day), UTo)),

          ecliptic_longitude(
            L_sun(t_century(
              days(year, month, day),
              UTo)),

            G_sun(t_century(
              days(year, month, day),
              UTo)))))), UTo, glong,
    glat, year, month, day);

  let set_time = sunrise/ 15 + 8;//类似12.709286157806744的数值，单位小时

  let hour = parseInt(set_time);

  if(hour >= 24){
    hour -= 24;
  }
  hour = hour < 10 ? "0" + hour : hour

  let minute = Math.round((set_time - hour) * 60);
  minute = minute<10?"0"+minute:minute;

  return hour + ':' + minute;
}

function getSunset(mLong, mLat,date) {

  let sunset, glong, glat;

  let year = date.year
  let month = date.month;
  let day = date.day;

  glong = mLong;

  glat = mLat;

  sunset = result_set(
    UT_set(UTo,

      GHA(UTo,
        G_sun(t_century(days(year, month, day), UTo)),

        ecliptic_longitude(
          L_sun(t_century(
            days(year, month, day), UTo)),

          G_sun(t_century(
            days(year, month, day), UTo)))),

      glong,

      e(h,
        glat,
        sun_deviation(
          earth_tilt(t_century(
            days(year, month, day), UTo)),

          ecliptic_longitude(
            L_sun(t_century(
              days(year, month, day),
              UTo)),

            G_sun(t_century(
              days(year, month, day),
              UTo)))))), UTo, glong,
    glat, year, month, day);

  let set_time = sunset / 15 + 8;//类似12.709286157806744的数值，单位小时
  let hour = parseInt(set_time);
  let minute = Math.round((set_time-hour)*60);

  if (hour >= 24) {
    hour -= 24;
  }

  hour = hour < 10 ? "0" + hour : hour
  minute = minute < 10 ? "0" + minute : minute;

  return hour+':'+minute;
}

module.exports={
  getSunrise: getSunrise,
  getSunset:getSunset
}