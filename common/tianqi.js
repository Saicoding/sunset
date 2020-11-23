/**
 * 根据hours得到当前的hour
 */
function getHour(hours) {
  let mydate = new Date();
  let hour = mydate.getHours();
  let myhour = null;

  for (let i = 0; i < hours.length; i++) {
    if (i < hours.length - 2) {
      let h = hours[i].day;
      h = h.substring(3, h.length - 1) * 1;

      let nh = hours[i + 1].day;
      nh = nh.substring(3, nh.length - 1) * 1;
      if (h < nh) {
        if (hour >= h && hour < nh) {
          myhour = hours[i];
          break;
        }
      } else {
        if (hour >= h && hour < nh + 24) {
          myhour = hours[i];
          break;
        }
      }
    }
  }
  if(!myhour){
    console.log('没有当前时间')
    return hours[0]
  }else{
    return myhour
  }

}


/**
 * 根据hour信息得到信息
 */
function getTimeTem(hour) {
  let nowTem = hour.tem;
  nowTem = nowTem.substring(0, nowTem.length - 1);
  let timeTem = {
    tem: nowTem,
    wea: hour.wea,
    win_speed: hour.win_speed
  }

  return timeTem;
}

/**
 * 天气api实况天气（地址）
 */
function addressWeather(city, self) {
  var _this = self;
  city = city.indexOf('市') == -1 ? city:city.substring(0,city.length-1)
  console.log(city)
  wx.request({
    url: 'https://www.tianqiapi.com/api/',
    data: {
      city,
      appid: 15261146,
      appsecret:'J1c4TTzo',
      version:'v1'
    },
    method: 'GET',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function(res) {
      console.log(res)
      _this.setWeather(res.data.data)
      _this.setData({
        weatherweek: res.data
      });
    },
    fail:function(res){
      console.log(res)
    }
  });

  wx.request({
    url: 'https://www.tianqiapi.com/api/',
    data: {
      city,
      appid: 15261146,
      appsecret: 'J1c4TTzo',
      version: 'v6'
    },
    method: 'GET',
    header: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    success: function (res) {
      let update_time = res.data.update_time;
      let updateMinutesStr = getUpdateMinutes(update_time);

      _this.setData({
        showUpdateTip:true,
        updateMinutesStr: updateMinutesStr,
        pressure: res.data.pressure
      });
      setTimeout(function(){
        _this.setData({
          showUpdateTip: false,
        });
      },6000)
    },
    fail: function (res) {
      console.log(res)
    }
  });
}

function getUpdateMinutes(time){
  let timeArray = time.split(":");
  let str ="";
  let mydate = new Date();
  let hour = mydate.getHours();
  let minute = mydate.getMinutes();
  let sub = hour*60+minute-timeArray[0]*60-timeArray[1];

  if(sub <=60){
    str= sub+'分钟前发布'
  }else{
    str = '数据采集于'+time
  }

  return str;
}

/**
 * 根据控制质量设置颜色对象
 */
function getStyle(level) {
  let style = {};
  if (level <= 50) {
    style.color = "#23b085";
    style.icon = "/img/aqi/100.png";
  } else if (level <= 100 && level > 50) {
    style.color = "#edc446";
    style.icon = "/img/aqi/100.png";
  } else if (level > 100 && level < 150) {
    style.color = "#ff7e00";
    style.icon = "/img/aqi/200.png";
  } else if (level > 150 && level < 200) {
    style.color = "#ff0000";
    style.icon = "/img/aqi/300.png";
  } else if (level > 200 && level < 300) {
    style.color = "#99004c";
    style.icon = "/img/aqi/500.png";
  } else {
    style.color = "#7e0023";
    style.icon = "/img/aqi/500.png";
  }
  return style
}

/**
 * 根据控制质量设置颜色对象
 */
function getNeStyle(level) {
  let style = {};
  console.log('明日的污染程度是'+level)
  if (level == '优' ) {
    style.color = "#23b085";
  } else if (level=='轻' || level == '良') {
    style.color = "#edc446";
  } else if (level == '中') {
    style.color = "#edc446";
  } else if (level == '重') {
    style.color = "#99004c";
  } else {
    style.color = "#7e0023";
  }
  return style
}

/**
 * 根据当前天气设置扇形颜色
 */
function getShanxingStyle(wea){
  let style;
  switch(wea){
    case '晴':
      style = "qing"
      break;
    case '阴':
      style = "yin"
    break;
    case '多云':
      style = "duoyun"
      break;
    case '小雨':
    case '雷阵雨':
      style = "xiaoyu"
      break;
    case '阵雨':
      style = "zhenyu"
      break;
    case '大雨':
      style = "dayu"
      break;
    case '中雨':
      style = "zhongyu"
      break;
    case '暴雨':
      style = "baoyu"
      break;
    case '雾':
    case '霾':
      style = "wu"
      break;
    case '沙尘':
      style = 'shachen';
      break;
  }
  return style
}

/**
 * 根据风向设置角度
 */
function getAngel(direct) {
  let angle = null;
  switch (direct) {
    case '东风':
      angle = 90;
      break;
    case '南风':
      angle = 180;
      break;
    case '西风':
      angle = 270;
      break;
    case '北风':
      angle = 0;
      break;
    case '东南风':
      angle = 135;
      break;
    case '西南风':
      angle = 225;
      break;
    case '东北风':
      angle = 45;
      break;
    case '西北风':
      angle = -45
      break;
  }
  return angle;
}

function myswitch(wea,day){
  let icon;
  switch (wea) {
    case '晴':
      icon = day ? '/img/wea/0.png' : '/img/wea/30.png'
      break
    case '阴':
      icon = '/img/wea/2.png'
      break
    case '多云':
      icon = day ? '/img/wea/1.png' : '/img/wea/31.png'
      break
    case '雨夹雪':
      icon = '/img/wea/6.png'
      break
    case '小雨':
      icon = '/img/wea/7.png'
      break
    case '中雨':
      icon = '/img/wea/8.png'
      break
    case '大雨':
      icon = '/img/wea/9.png'
      break
    case '小雪':
      icon = '/img/wea/14.png'
      break
    case '中雪':
      icon = '/img/wea/15.png'
      break
    case '大雪':
      icon = '/img/wea/16.png'
      break
    case '雾':
      icon = day ? '/img/wea/19.png' : '/img/wea/32.png'
      break
    case '暴雨':
    case '大暴雨':
      icon = '/img/wea/10.png'
      break
    case '雷阵雨':
      icon = '/img/wea/4.png'
      break
    case '阵雪':
      icon = day ? '/img/wea/13.png' : '/img/wea/34.png'
      break
    case '阵雨':
      icon = day ? '/img/wea/3.png' : '/img/wea/33.png'
      break
    case '暴雪':
      icon = '/img/wea/17.png'
      break
    case '扬沙':
      icon = '/img/wea/20.png'
      break
    case '浮尘':
      icon = '/img/wea/45.png'
      break
    case '霾':
      icon = '/img/wea/18.png'
      break
    default:
      icon = '/img/wea/na.png'
      break;
  }
  return icon
}

/**
 * 根据天气设置图标
 */
function getIcon(wea,day) {
  let icons = [];
  if (wea.indexOf('转') !=-1){//如果有转字
    let wea1 = wea.substring(wea.indexOf('转') + 1);
    let wea2 = wea.substring(0,wea.indexOf('转'));
    icons[0] = myswitch(wea2,day);
    icons[1] = myswitch(wea1,day);
  }else{
    icons[0] = myswitch(wea,day);
  }
  return icons;
}

/**
 * 根据天气和时间设置背景图片
 */
function setBg(wea,day){
  let bg;
  switch(wea){
    case '晴':
      bg = day ? '/img/bg/bg0.png' : '/img/bg/bg30.png'
    break;
    case '阴':
      bg = '/img/bg/bg2.png'
      break;
    case '雷阵雨':
      bg = '/img/bg/bg5.png'
      break;
    case '小雪':
    case '中雪':
    case '大雪':
    case '暴雪':
    case '阵雪':
      bg = '/img/bg/bg17.png'
      break;
    case '多云':
      let i = Math.round(Math.random())
      bg = i = 0 ? '/img/bg/bg31.png' :'/img/bg/bg32.png'
      break;
    case '小雨':
    case '中雨':
    case '大雨':
    case '暴雨':
    case '阵雨':
      bg = '/img/bg/bg33.png'
      break;
    case '扬沙':
    case '霾':
    case '雾':
    case '浮尘':
      bg = '/img/bg/bg35.png'
      break;
    case '霾':
    case '浮尘':
      bg = '/img/bg/bg46.png'
      break;
      default:
      bg = '/img/bg/bge.jpg'
      break;
  }
  return bg;
}

module.exports = {
  getHour: getHour,
  getTimeTem: getTimeTem,
  addressWeather: addressWeather,
  getStyle: getStyle,
  getAngel: getAngel,
  getIcon: getIcon,
  setBg:setBg,
  getNeStyle: getNeStyle,
  getShanxingStyle: getShanxingStyle
}