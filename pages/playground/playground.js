//index.js
var storyboard = require("../../engine/storyboard.js");
var history = require("../../engine/history.js");
var util = require("../../utils/util.js");

//获取应用实例
var app = getApp()
Page({
  data: {
    sun: "../../images/sun.png",
    moon: "../../images/moon.png",
    sunLogo: "../../images/sun-logo.png",
    moonLogo: "../../images/moon-logo.png",
    isDay: true,
    animationData: {},
    storyboard: {},
    viewShown: "",
    touchingTime: "day",
    historyEvents: []
  },
  angle: 0,
  touchHistory: function(e) {
    if(this.timeoutId != -1) {
      clearTimeout(this.timeoutId);
    }
    var index = e.target.dataset.historyIndex;
    var historyItem = this.data.storyboard.history[index];
    this.setData({
      viewShown: "view-shown",
      touchingTime: historyItem.time,
      historyEvents: historyItem.events
    });
  },
  touchHistoryEnd: function(e) {
    var that = this;
    this.timeoutId = setTimeout(function() {
      that.setData({
        viewShown: ""
      });
    }, 1000);
  },
  onLoad: function () {
    storyboard.history = storyboard.history.reverse();
    this.setData({
      storyboard: storyboard
    });
  },
  intervalId: -1,
  timeoutId: -1,
  onShow: function() {
    var that = this;
    this.intervalId = setInterval(function() {
      that.timeAfterTime();
    }, 3000);
  },
  onHide: function() {
    clearInterval(this.intervalId);
  },
  timeAfterTime: function() {
    this.angle = this.angle + 180;
    if(this.data.isDay) {
      var animation = wx.createAnimation({
        duration: 2000,
        timingFunction: 'ease'
      });
      animation.rotate(this.angle).step();
      this.setData({
        animationData: animation.export()
      });
    } else {
      var animation = wx.createAnimation({
        duration: 2000,
        timingFunction: 'ease'
      });
      animation.rotate(this.angle).step();
      this.setData({
        animationData: animation.export()
      });
    }
    this.setData({
      isDay: !this.data.isDay
    });
  }
})
