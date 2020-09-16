//index.js
const app = getApp()
let sunRiseSet = require('../../utils/sunRiseSet.js');
let tianqi = require('../../common/tianqi.js');
// 引入SDK核心类
let QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');

// 实例化API核心类
let demo = new QQMapWX({
  key: '6Q6BZ-HKAKQ-BHF5I-GRV5P-BTLGH-5UBKT' // 必填
});

Page({
  data: {
    longText: '东',
    latText: '北',
    nums: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    times: [{
        title: '日出',
        currentsNum: [0, 0, 0, 0]
      },
      {
        title: '日落',
        currentsNum: [0, 0, 0, 0]
      }
    ],
    today: true, //是不是今天
    mapStyle: 2,
    animationData: {}
  },

  onLoad: function() {
    let self = this;
    let myDate = new Date(); //获取当前日期
    let year = myDate.getFullYear();
    let month = myDate.getMonth() + 1;
    let day = myDate.getDate();

    let date = {};
    date.year = year;
    date.month = month;
    date.day = day;

    wx.showShareMenu({
      withShareTicket: true
    })

    month = month < 10 ? "0" + month : month; //修正日期字符串
    day = day < 10 ? "0" + day : day; //修正日期字符串

    let time = year + "-" + month + "-" + day; //拼接当前日期字符串

    let lastcity = wx.getStorageSync('lastcity');
    if (lastcity) {
      if (lastcity.name == '定位') {
        this.getUserLocation(date);
        //每1分钟更新下天气和位置信息
        let locInterval = setInterval(res => {
          self.getUserLocation(date);
        }, 60000)
        this.setData({
          locInterval: locInterval
        })
      } else {
        this.changeCity(lastcity.name, date)
        let changeInterval = setInterval(function() {
          self.changeCity(lastcity.name, date);
        }, 60000)
        this.setData({
          changeInterval: changeInterval
        })
      }

    } else {
      this.getUserLocation(date);
      //每1分钟更新下天气和位置信息
      let locInterval = setInterval(res => {
        self.getUserLocation(date);
      }, 60000)
      this.setData({
        locInterval: locInterval
      })
    }

    let hideTimeout = setTimeout(function() {
      self.setData({
        hideDialog: true
      })
    }, 8000)

    this.setData({
      time: time,
      year: year,
      month: month,
      day: day,
      date: date,
      hideTimeout: hideTimeout
    })

    let tip = wx.getStorageSync('tip')
    if (!tip) {
      setTimeout(function() {
        self.setData({
          showTip: true
        })
      }, 20000)
    }

  },

  /**
   * 生命周期事件
   */
  onShow: function() {
    let self = this;
    let hideTimeout = this.data.hideTimeout
    clearTimeout(hideTimeout)

    self.setData({
      hideDialog: false
    })

    let newHideTimeout = setTimeout(function() {
      self.setData({
        hideDialog: true
      })
    }, 8000)


    self.setData({
      hideTimeout: hideTimeout
    })

  },

  /**
   * 改变城市
   */
  changeCity: function(city, mydate) {
    let self = this;
    let date = mydate ? mydate : this.data.date;
    this.setData({
      city: city,
      address: city
    })
    demo.geocoder({
      address: city, //用户输入的地址（注：地址中请包含城市名称，否则会影响解析效果），如：'北京市海淀区彩和坊路海淀西大街74号'
      success: res => {
        let location = res.result.location;
        self.settime(location.lng, location.lat, date);
        tianqi.addressWeather(city, self);
        wx.stopPullDownRefresh();
      },
      fail: res => {
        console.log(res)
      }

    })
  },

  /**
   * 设置天气信息
   */
  setWeather: function(weatherweek) {
    let today = weatherweek[0]; //今天
    let toAirLevle = weatherweek[0].air_level; //今天的空气质量
    toAirLevle = toAirLevle.indexOf('度') == -1 ? toAirLevle : toAirLevle + '污染';

    let toair = weatherweek[0].air; //今天的空气指数
    let toStyle = tianqi.getStyle(toair);

    let wea = weatherweek[0].wea; //今天的总体天气情况
    let todayhours = weatherweek[0].hours; //今天的7个小时段的天气情况

    let toHighAndLow = {
      high: weatherweek[0].tem1.substring(0, weatherweek[0].tem1.length - 1),
      low: weatherweek[0].tem2
    }; //今天的最高气温和最低气温
    let win_speed = weatherweek[0].win_speed; //今天的风力
    let humidity = weatherweek[0].humidity; //今天的空气湿度


    let newea = weatherweek[1].wea; //明天的总体天气情况
    let nehours = weatherweek[1].hours; //明天的7个小时段的天气情况
    let neHighAndLow = {
      high: weatherweek[1].tem1.substring(0, weatherweek[1].tem1.length - 1),
      low: weatherweek[1].tem2
    };; //明天的最高气温和最低气温
    let neAirLevle = weatherweek[1].index[5].level; //明天的空气质量
    let neStyle = tianqi.getNeStyle(neAirLevle);
    neAirLevle = neAirLevle != '良' && neAirLevle != '优' ? neAirLevle + '度污染' : neAirLevle;


    let hour = tianqi.getHour(weatherweek[0].hours);
 
    let shanxingStyle = tianqi.getShanxingStyle(hour.wea);

    let angle = tianqi.getAngel(hour.win);

    let timeTem = tianqi.getTimeTem(hour); //现在的温度

    let day = this.data.imgrate == 1 || this.data.imgrate == 0;

    let suriseIcon = tianqi.getIcon(hour.wea, !day)
    let toIcon = tianqi.getIcon(wea, true);
    let neIcon = tianqi.getIcon(newea, true);
    let bg = tianqi.setBg(hour.wea, !day);

    this.setData({
      toAirLevle: toAirLevle,
      neAirLevle: neAirLevle,
      toair: toair,
      wea: wea,
      newea: newea,
      win_speed: win_speed,
      toHighAndLow: toHighAndLow,
      neHighAndLow: neHighAndLow,
      humidity: humidity,
      timeTem: timeTem,
      toStyle: toStyle,
      neStyle: neStyle,
      angle: angle,
      suriseIcon: suriseIcon,
      toIcon: toIcon,
      neIcon: neIcon,
      bg: bg,
      shanxingStyle: shanxingStyle
    })
  },

  /**
   * 声明周期事件
   */
  onReady: function() {
    let self = this;
    wx.getSystemInfo({ //得到窗口高度,这里必须要用到异步,而且要等到窗口bar显示后再去获取,所以要在onReady周期函数中使用获取窗口高度方法
      success: function(res) { //转换窗口高度
        let windowHeight = res.windowHeight;
        let windowWidth = res.windowWidth;
        //最上面标题栏不同机型的高度不一样(单位PX)

        let jiaonang = wx.getMenuButtonBoundingClientRect(); //胶囊位置及尺寸
        let statusBarHeight = res.statusBarHeight * (750 / windowWidth);
        let platform = res.platform;
        let fixedTop = (jiaonang.top + jiaonang.height) * (750 / windowWidth); //定位高度 单位rpx
        let barLineHeight = (jiaonang.top + jiaonang.height / 2) * 2 * (750 / windowWidth); //标题栏字的行高

        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight,
          platform: platform,
          statusBarHeight: statusBarHeight,
          jiaonang: jiaonang,
          fixedTop: fixedTop,
          barLineHeight: barLineHeight
        })
      }
    });
  },

  /**
   * 获取定位信息
   */
  getUserLocation: function(date) {
    let self = this;
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
          //未授权
          wx.showModal({
            title: '请求授权当前位置',
            content: '需要获取您的地理位置，请确认授权',
            success: function(res) {
              if (res.cancel) {
                //取消授权
                wx.showToast({
                  title: '拒绝授权',
                  icon: 'none',
                  duration: 3000
                })

              } else if (res.confirm) {
                //确定授权，通过wx.openSetting发起授权请求
                wx.openSetting({
                  success: function(res) {
                    if (res.authSetting["scope.userLocation"] == true) {
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        duration: 3000
                      })
                      //再次授权，调用wx.getLocation的API
                      self.geo(date);
                    } else {
                      wx.showToast({
                        title: '授权失败',
                        icon: 'none',
                        duration: 1000
                      })
                    }
                  }
                })
              }
            }
          })

        } else if (res.authSetting['scope.userLocation'] == undefined) {
          //用户首次进入页面,调用wx.getLocation的API
          self.geo(date);
        } else {
          //调用wx.getLocation的API
          self.geo(date);
        }

      }

    })
  },

  // 获取定位城市
  geo: function(date) {
    var self = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        var latitude = res.latitude
        var longitude = res.longitude
        self.settime(longitude, latitude, date)

        // 调用接口转换成具体位置
        demo.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: function(res) {
            let result = res.result;
            let nation = result.address_component.nation ? result.address_component.nation : ''; //国家
            let province = result.address_component.province ? result.address_component.province : ''; //省份
            let city = result.address_component.city ? result.address_component.city : ''; //市区
            city = city.substring(0, city.length - 1)
            tianqi.addressWeather(city, self);
            let recommend = result.formatted_addresses ? result.formatted_addresses.recommend : ''; //街道
            // let address = nation + province + city + recommend; //地址
            let address = result.address
            wx.stopPullDownRefresh();

            self.setData({
              address: address,
              city: city
            })
          },
          fail: function(res) {
            console.log(res);
          },
        })
      }
    })
  },

  /**
   * 根据times求出当前的时间比
   */
  getRate: function() {
    let self = this;
    let sunriseMinute = this.data.sunriseMinute; //今天的日出分钟数
    let sub = this.data.sub; //今天日出日落时间差
    let lastrate = this.data.rate; //当前的比例

    if (!sunriseMinute) {
      wx.showToast({
        title: '该地区极昼,无日出日落',
        icon: 'none',
        duration: 3000
      })
      if (0 != lastrate) {
        let animation = wx.createAnimation({
          duration: 1000,
        })
        let aniData1 = animation.width(0).step();
        this.setData({
          aniData1: aniData1.export(),
          imgrate: 0
        })
      }
      return
    }

    let myDate = new Date();
    let hour = myDate.getHours();
    let minute = myDate.getMinutes();
    let now = hour * 60 + minute;
    let rate = 0;

    if (now < sunriseMinute) {
      this.setData({ //设置地图类型
        mapStyle: 1
      })
    } else {
      if ((now - sunriseMinute) / sub >= 1) {
        clearInterval(this.data.interval);
        rate = 1;
        this.setData({ //设置地图类型
          mapStyle: 1
        })
      } else {
        this.setData({ //设置地图类型
          mapStyle: 2
        })
        rate = ((now - sunriseMinute) / sub).toFixed(3);
      }
    }

    if (rate != lastrate) {
      let animation = wx.createAnimation({
        duration: 1000,
      })

      let iconHeight = 0;
      let aniData1 = animation.width((520 * rate + 38) + 'rpx').step();

      //根据rate求太阳图标的高度
      let x = rate * 520;

      if (rate < 0.5) {
        x = 260 - x;
        let jiao1 = Math.atan2(150, x) * 180 / Math.PI;
        let bian1 = Math.sqrt(150 * 150 + x * x);
        jiao1 = jiao1 + 90;

        iconHeight = bian1 * Math.cos(jiao1 * Math.PI / 180) + Math.sqrt(bian1 * bian1 * Math.cos(jiao1 * Math.PI / 180) * Math.cos(jiao1 * Math.PI / 180) - bian1 * bian1 + 300 * 300) + 20
      } else if (rate == 0.5) {
        iconHeight = 155
      } else if (rate == 1) {
        iconHeight = 40
      } else {
        x = x - 260
        let jiao1 = Math.atan2(150, x) * 180 / Math.PI;
        let bian1 = Math.sqrt(150 * 150 + x * x);
        jiao1 = jiao1 + 90;
        iconHeight = bian1 * Math.cos(jiao1 * Math.PI / 180) + Math.sqrt(bian1 * bian1 * Math.cos(jiao1 * Math.PI / 180) * Math.cos(jiao1 * Math.PI / 180) - bian1 * bian1 + 300 * 300) + 20
      }

      this.setData({
        aniData1: aniData1.export(),
        imgrate: rate,
        iconHeight: iconHeight
      })
    }
  },


  /**
   * 根据经纬度和日期设置日出日落日中昼长
   */
  settime: function(lon, lat, date) {
    let sunriseTime = sunRiseSet.getSunrise(lon, lat, date); //日出时间
    let sunsetTime = sunRiseSet.getSunset(lon, lat, date); //日落时间
    let longText = "";
    let latText = "";

    let suntime = this.getMiddayTimeAndLong(sunriseTime, sunsetTime); //根据日出时间和日落时间获取时间对象
    let sunLongTime = suntime.long; //昼长
    let sunMiddayTime = suntime.midDay; //日中
    if (lon < 0) {
      longText = '西';
      lon = -lon;
    } else {
      longText = '东';
    }

    if (lat < 0) {
      latText = "南"
      lat = -lat;
    } else {
      latText = '北'
    }


    this.setSwiper(sunriseTime, sunMiddayTime, sunsetTime); //设置swiper

    this.setData({
      sunLongTime: sunLongTime,
      longitude: lon,
      latitude: lat,
      long: lon.toFixed(2),
      lat: lat.toFixed(2),
      longText: longText,
      latText: latText,
      sunriseTime: sunriseTime,
      sunsetTime: sunsetTime
    })
  },

  /**
   * 根据时间字符串设置swiper
   */
  setSwiper: function(sunriseTime, sunMiddayTime, sunsetTime) {
    let times = this.data.times;
    let riseNumArray = sunriseTime.split(':');
    let middayNumArray = sunMiddayTime.split(':');
    let setTNumArray = sunsetTime.split(':');

    // 日出
    times[0].currentsNum[0] = riseNumArray[0][0] * 1;
    times[0].currentsNum[1] = riseNumArray[0][1] * 1;
    times[0].currentsNum[2] = riseNumArray[1][0] * 1;
    times[0].currentsNum[3] = riseNumArray[1][1] * 1;

    // 日落
    times[1].currentsNum[0] = setTNumArray[0][0] * 1;
    times[1].currentsNum[1] = setTNumArray[0][1] * 1;
    times[1].currentsNum[2] = setTNumArray[1][0] * 1;
    times[1].currentsNum[3] = setTNumArray[1][1] * 1;

    this.setData({
      times: times
    })

    this.setToday(times);
  },

  /**
   * 根据今天的times对象设置当天的时间比例需要的信息
   */
  setToday: function(times) {
    let a0 = times[0].currentsNum[0];
    let a1 = times[0].currentsNum[1];
    let a2 = times[0].currentsNum[2];
    let a3 = times[0].currentsNum[3];

    let c0 = times[1].currentsNum[0];
    let c1 = times[1].currentsNum[1];
    let c2 = times[1].currentsNum[2];
    let c3 = times[1].currentsNum[3];

    let num1 = (c0 * 10 + c1) * 60 + c2 * 10 + c3;
    let num2 = (a0 * 10 + a1) * 60 + a2 * 10 + a3;

    if (num1 < num2) {
      num1 += 1440;
    }

    let sub = num1 - num2; //日出日落时间差
    let sunriseMinute = (a0 * 10 + a1) * 60 + a2 * 10 + a3; //日出时的分钟数

    this.setData({
      sub,
      sunriseMinute
    })

    this.getRate();
  },

  /**
   * 根据日出时间和日落时间获取日中时间和昼长
   * 参数：
   *      sunriseTime 日出时间(字符串) 04:32
   *      sunsetTime 日落时间(字符串) 18:24
   */
  getMiddayTimeAndLong: function(sunriseTime, sunsetTime) {
    let obj = {}

    let sunriseTimeMinutes = sunriseTime.split(':')[0] * 60 + sunriseTime.split(':')[1] * 1; //日出时相对0点的总分钟数
    let sunsetTimeMinutes = sunsetTime.split(':')[0] * 60 + sunsetTime.split(':')[1] * 1; //日落时相对0点的总分钟数
    let subTimeMinutes = sunsetTimeMinutes - sunriseTimeMinutes > 0 ? sunsetTimeMinutes - sunriseTimeMinutes : sunsetTimeMinutes + 1440 - sunriseTimeMinutes; //日出和日落的时间差
    let sunMiddayTimeMinutes = sunriseTimeMinutes + parseInt(subTimeMinutes / 2); //日中时相对0点的总分钟数

    let sunMiddayHour = parseInt(sunMiddayTimeMinutes / 60); //日中的小时数
    sunMiddayHour = sunMiddayHour < 10 ? '0' + sunMiddayHour : sunMiddayHour; //纠正字符串显示
    let sunMiddayMinute = sunMiddayTimeMinutes - sunMiddayHour * 60; //日中的分钟数
    sunMiddayMinute = sunMiddayMinute < 10 ? '0' + sunMiddayMinute : sunMiddayMinute; //纠正字符串显示
    obj.midDay = sunMiddayHour + ":" + sunMiddayMinute;

    let longHour = parseInt(subTimeMinutes / 60); //昼长小时数
    longHour = longHour < 10 ? '0' + longHour : longHour; //纠正字符串显示
    let longMinute = subTimeMinutes - longHour * 60; //昼长分钟数
    longMinute = longMinute < 10 ? "0" + longMinute : longMinute; ////纠正字符串显示
    obj.long = longHour + ':' + longMinute

    return obj
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    let self = this;
    let myDate = new Date(); //获取当前日期
    let year = myDate.getFullYear();
    let month = myDate.getMonth() + 1;
    let day = myDate.getDate();

    month = month < 10 ? "0" + month : month; //修正日期字符串
    day = day < 10 ? "0" + day : day; //修正日期字符串

    let date = {};
    date.year = year;
    date.month = month;
    date.day = day;


    let city = wx.getStorageSync('lastcity'); //得到本地定位的city名称

    self.setData({
      rate: 0
    })

    if (city) { //有选择城市记录
      if (city.name == '定位') {
        console.log('定位刷新')
        self.getUserLocation(date);
      } else {
        console.log('城市刷新')
        self.changeCity(city.name, date);
      }
    } else { //没有选择城市记录
      self.getUserLocation(date);
    }
  },

  /**
   * 关闭tip提示
   */
  closeTip: function() {
    this.setData({
      showTip: false
    })
    wx.setStorageSync('tip', true)
  },

  /**
   * 滑动组件事件
   */
  catchTouchMove: function() {
    return false
  },

  /**
   * 展示经纬度弹窗
   */
  showInput: function() {
    this.setData({
      show: true
    })
  },

  /**
   * 隐藏经纬度弹窗
   */
  hideInput: function() {
    this.setData({
      show: false
    })
  },

  /**
   * 经度输入事件
   */
  longInput: function(e) {
    this.setData({
      longvalue: e.detail.value * 1
    })
  },

  /**
   * 维度输入事件
   */
  latInput: function(e) {
    this.setData({
      latvalue: e.detail.value * 1
    })
  },

  /**
   * 点击查询事件
   */
  search: function() {
    let self = this;
    let longvalue = this.data.longvalue;
    let latvalue = this.data.latvalue;
    let date = this.data.date;

    if (!longvalue || !latvalue) {
      wx.showToast({
        title: '经纬度不能为空',
        icon: 'none',
        duration: 3000
      })
    } else if (longvalue > 180) {
      wx.showToast({
        title: '经度不能超过180°',
        icon: 'none',
        duration: 3000
      })
    } else if (latvalue > 90) {
      wx.showToast({
        title: '维度不能超过90°',
        icon: 'none',
        duration: 3000
      })
    } else {
      //清除获取地址定时器
      let postionInterval = this.data.postionInterval;
      clearInterval(postionInterval);

      this.setData({ //隐藏经纬度输入框
        show: false
      })

      self.settime(longvalue, latvalue, date, this.data.today)

      // 调用接口转换成具体位置
      demo.reverseGeocoder({
        location: {
          latitude: latvalue,
          longitude: longvalue
        },
        success: function(res) {
          let result = res.result;

          let nation = result.address_component.nation ? result.address_component.nation : ''; //国家
          let province = result.address_component.province ? result.address_component.province : ''; //省份
          let city = result.address_component.city ? result.address_component.city : ''; //市区
          let recommend = result.formatted_addresses ? result.formatted_addresses.recommend : ''; //街道
          // let address = nation + province + city + recommend; //地址
          let address = result.address;

          self.setData({
            address: address
          })
        },
        fail: function(res) {
          console.log(res);
        },
      })
    }
  },

  /**
   * 导航到选择地点页面
   */
  GOposition: function() {
    wx.navigateTo({
      url: '/pages/position/position',
    })
  },

  /**
   * 点击经纬度弹窗事件
   */
  tapInputBlock: function() {
    return false
  },

  /**
   * 分享事件
   */

  onShareAppMessage: function(e) {
    let sunriseTime = this.data.sunriseTime;
    let sunsetTime = this.data.sunsetTime;
    let sunLongTime = this.data.sunLongTime;
    return {
      title: '今日日出:' + sunriseTime + " 日落:" + sunsetTime + " 昼长:" +sunLongTime,
      path: '/pages/index/index',
    }
  }
})