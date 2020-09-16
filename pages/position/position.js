// pages/position/position.js
let cdata = require('../../data/cities.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotcities: [
      '定位',
      '北京市',
      '广州市',
      '上海市',
      '深圳市',
      '南京市',
      '杭州市',
      '绥化市',
      '迁安市',
      '秦皇岛市',
      '上饶市'
    ],
    currentIndex: 0, //默认index为0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let city = wx.getStorageSync('lastcity'); //得到本地定位的city名称
    let history = wx.getStorageSync('historycity'); //得到历史记录的城市
    console.log(city)
    if (city) {
      if (city.type == 'quick') {
        this.setData({
          currentIndex: city.currentIndex,
          currentHIndex:-1
        })
      } else if (city.type == 'history'){
        for (let i = 0; i < history.length; i++) {
          if (city.name == history[i]) {
            this.setData({
              currentHIndex: i,
              currentIndex:-1
            })
            break;
          }
        }
      }
    }

    let allCities = cdata.getCities();

    this.setData({
      allCities: allCities,
      history: history
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

        windowHeight = (windowHeight * (750 / windowWidth));
        self.setData({
          windowWidth: windowWidth,
          windowHeight: windowHeight,
        })
      }
    });
  },

  /**
   * 输入城市文字
   */
  cityInput: function(e) {
    let value = e.detail.value;

    if (value == "") {
      this.setData({
        list: []
      })
      return
    }

    let list = this.getList(value);

    this.setData({
      inputText: value,
      list: list
    })
  },

  /**
   * 获取命中的城市
   */
  getList: function(value) {
    let allCities = this.data.allCities;
    let history = wx.getStorageSync('historycity'); //得到历史记录的城市
    let list = [];
    let beiyonglist = [];
    for (let i = 0; i < allCities.length; i++) {
      let pro = allCities[i];
      let canbeiyong = false;
      if (pro.province.indexOf(value) != -1) {
        canbeiyong = true;
      }
      for (let j = 0; j < pro.cities.length; j++) {
        let city = pro.cities[j];
        if (city.indexOf(value) != -1) {
          canbeiyong = false;
          let obj = {}
          let str = pro.province ? city + ' , ' + pro.province : city
          obj.str = str;
          for (let k = 0; k < history.length;k++){//判断历史记录是否包含
            if (str.indexOf(history[k])!=-1){
              obj.has = true
            }
          }
          list.push(obj);
        }

        if (canbeiyong) {
          let obj = {};
          let str = pro.province ? city + ' , ' + pro.province : city
          obj.str = str;
          for(let m=0;m<history.length;m++){
            if (str.indexOf(history[m]) != -1) {
              obj.has = true
            }
          }
          beiyonglist.push(obj)
        }
      }
    }

    if (list.length > 0) {
      return list;
    } else {
      return beiyonglist
    }
  },

  /**
   * 点击叉号
   */
  close: function() {
    this.setData({
      list: [],
      inputText: "",
      inputValue: ""
    })
  },

  /**
   * 清除历史记录
   */
  clear: function() {
    wx.removeStorageSync('historycity');
    let city = wx.getStorageSync('lastcity'); //得到本地定位的city名称
    if (city.type == "history") {

    }
    let history = wx.getStorageSync('historycity'); //得到历史记录的城市
    this.setData({
      history: []
    })
  },

  /**
   * 点击城市
   */
  change: function(e) {
    let index = e.currentTarget.dataset.index;
    let city = e.currentTarget.dataset.city;
    let type = e.currentTarget.dataset.type;
    let lastcity;

    if (type == 'quick') {
      this.setData({
        currentIndex: index,
        currentHIndex: -1
      })

      lastcity = {
        type: 'quick',
        currentIndex: index,
        name: city
      }
    } else if (type == 'history') {
      this.setData({
        currentIndex: -1,
        currentHIndex: index
      })
      lastcity = {
        type: 'history',
        name: city
      }
    }

    wx.setStorage({
      key: 'lastcity',
      data: lastcity,
    })

    let pages = getCurrentPages();
    let prepage = pages[pages.length - 2];
    let date = prepage.data.date;

    prepage.setData({
      city: city,
      address: city
    })

    if (city == '定位') {
      let changeInterval = prepage.data.changeInterval; //当前的改变城市状态时的定时器
      let locInterval = prepage.data.locInterval; //当前的定位定时器
      console.log('当前的改变城市定时器为' + changeInterval)
      console.log('当前的定位定时器为' + locInterval)
      clearInterval(changeInterval);
      clearInterval(locInterval);
      console.log(date)
      prepage.getUserLocation(date);

      let locIntervalNow = setInterval(function() {
        prepage.getUserLocation(date);
      }, 60000)
      prepage.setData({
        locInterval: locIntervalNow
      })

    } else {
      let changeInterval = prepage.data.changeInterval; //当前的改变城市状态时的定时器
      let locInterval = prepage.data.locInterval; //当前的定位定时器
      console.log('当前的改变城市定时器为' + changeInterval)
      console.log('当前的定位定时器为' + locInterval)
      clearInterval(changeInterval);
      clearInterval(locInterval);
      prepage.changeCity(city);

      let changeIntervalNow = setInterval(function() {
        prepage.changeCity(city, date)
      }, 60000)
      prepage.setData({
        changeInterval: changeIntervalNow
      })
    }
    wx.navigateBack({})
  },

  /**
   * 点击选择按钮
   */
  select: function(e) {
    let city = e.currentTarget.dataset.city;
    console.log(city)
    let history = wx.getStorageSync('historycity') ? wx.getStorageSync('historycity') : []; //得到历史记录的城市
    let citystr = city.str;

    if (citystr.indexOf(',') != -1) {
      citystr = citystr.substring(0, citystr.indexOf(',') - 1);
    }

    if(!city.has){
      history.unshift(citystr);
    }
    
    let lastcity = {
      type: 'history',
      name: citystr
    }

    wx.setStorage({
      key: 'lastcity',
      data: lastcity,
    })

    wx.setStorage({
      key: 'historycity',
      data: history,
    })

    let pages = getCurrentPages();
    let prepage = pages[pages.length - 2];
    let date = prepage.data.date;

    prepage.setData({
      city: citystr,
      address: citystr
    })

    let changeInterval = prepage.data.changeInterval; //当前的改变城市状态时的定时器
    let locInterval = prepage.data.locInterval; //当前的定位定时器
    console.log('当前的改变城市定时器为' + changeInterval)
    console.log('当前的定位定时器为' + locInterval)
    clearInterval(changeInterval);
    clearInterval(locInterval);
    prepage.changeCity(citystr);

    let changeIntervalNow = setInterval(function() {
      prepage.changeCity(citystr, date)
    }, 60000)
    prepage.setData({
      changeInterval: changeIntervalNow
    })
    wx.navigateBack({})
  },

  /**
   * 点击取消按钮
   */
  back: function() {
    wx.navigateBack({

    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})