//index.js
var storyboard = require("../../engine/storyboard.js");
var history = require("../../engine/history.js");
var util = require("../../utils/util.js");
var player = require("../../js/player.js");

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
    historyEvents: [],
    players: player.players,
    playerStubs: [],
    currentPlayerIndex: 4,
    currentPlayerAnimationData: {},
    biggerAnimationData: {},
    originAnimationData: {}
  },
  angle: 0,
  touchHistory: function (e) {
    if (this.timeoutId != -1) {
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
  touchHistoryEnd: function (e) {
    var that = this;
    this.timeoutId = setTimeout(function () {
      that.setData({
        viewShown: ""
      });
    }, 1000);
  },
  onLoad: function () {
    var playerStubs = [];
    var stubNumber = 4 - player.players.length % 4;
    for (var i = 0; i < stubNumber; i++) {
      playerStubs.push(i);
    }
    storyboard.history = storyboard.history.reverse();
    this.setData({
      storyboard: storyboard,
      playerStubs: playerStubs
    });
  },
  intervalId: -1,
  timeoutId: -1,
  scaleToBigger: true,
  onShow: function () {
    // var that = this;
    // this.intervalId = setInterval(function() {
    //   that.timeAfterTime();
    // }, 2000);
    var biggerAnimation = wx.createAnimation({
          duration: 500,
          timingFunction: "ease"
        });
    biggerAnimation.scale(1.4, 1.4).step();
    this.data.biggerAnimationData = biggerAnimation.export();

    var originAnimation= wx.createAnimation({
          duration: 500,
          timingFunction: "ease"
        });
    originAnimation.scale(1, 1).step();
    this.data.originAnimationData = originAnimation.export();
    setInterval(function() {
      var currentPlayerIndex = this.data.currentPlayerIndex;
      this.setData({
        currentPlayerIndex : (currentPlayerIndex < this.data.players.length - 1 ? currentPlayerIndex + 1 : 0)
      });
    }.bind(this), 4000);
    setInterval(function () {
      if (this.scaleToBigger) {
        this.setData({
          currentPlayerAnimationData: this.data.biggerAnimationData
        });
      } else {
        this.setData({
          currentPlayerAnimationData: this.data.originAnimationData
        });
      }
      this.scaleToBigger = !this.scaleToBigger;
    }.bind(this), 1000);
  },
  onHide: function () {
    clearInterval(this.intervalId);
  },
  timeAfterTime: function () {
    this.angle = this.angle + 180;
    if (this.data.isDay) {
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
