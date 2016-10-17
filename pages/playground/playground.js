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
    originAnimationData: {},
    boardAnimationData: {}
  },
  name: "曾我部",
  room: 1,
  angle: 0,
  intervalId: -1,
  timeoutId: -1,
  scaleToBigger: true,
  windowWidth: 0,
  pxRatio: 1,
  locationX: 0,
  locationY: 0,
  players: [],
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
    wx.getSystemInfo({
      success: function (res) {
        var windowWidth = res.windowWidth;
        this.windowWidth = windowWidth;
        this.pxRatio = 750 / windowWidth;
      }.bind(this)
    })
    wx.connectSocket({
      url: "ws://localhost:8080"
    });
    wx.onSocketOpen(function (res) {
      var initPlayer = {
        type: "init",
        room: this.room,
        name: this.name
      };
      wx.sendSocketMessage({
        data: JSON.stringify(initPlayer)
      });
    }.bind(this));
    wx.onSocketMessage(function (res) {
      var data = res.data;
      var players = JSON.parse(data);
      this.players = players;
      this.updateCanvas();
    }.bind(this));
  },
  updateCanvas: function () {
    var context = wx.createContext();
    for (var i = 0; i < this.players.length; i++) {
      var player = this.players[i];
      var x, y;
      if (player.name == this.name) {
        x = this.locationX;
        y = this.locationY;
      } else {
        var ratio = this.windowWidth / player.w;
        x = player.x * ratio;
        y = player.y * ratio;
      }
      context.setFillStyle("#ff0000");
      context.drawImage("../../images/paw.png", x - 15, y - 15, 30, 30);
      context.fillText(player.name, x - 15, y - 15);
    }
    wx.drawCanvas({
      canvasId: "wolf-ground",
      actions: context.getActions()
    });
  },
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

    var originAnimation = wx.createAnimation({
      duration: 500,
      timingFunction: "ease"
    });
    originAnimation.scale(1, 1).step();
    this.data.originAnimationData = originAnimation.export();
    // setInterval(function() {
    //   var currentPlayerIndex = this.data.currentPlayerIndex;
    //   this.setData({
    //     currentPlayerIndex : (currentPlayerIndex < this.data.players.length - 1 ? currentPlayerIndex + 1 : 0)
    //   });
    // }.bind(this), 4000);
    // setInterval(function () {
    //   if (this.scaleToBigger) {
    //     this.setData({
    //       currentPlayerAnimationData: this.data.biggerAnimationData
    //     });
    //   } else {
    //     this.setData({
    //       currentPlayerAnimationData: this.data.originAnimationData
    //     });
    //   }
    //   this.scaleToBigger = !this.scaleToBigger;
    // }.bind(this), 1000);
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
      var boardAnimation = wx.createAnimation({
        duration: 2000,
        timingFunction: "ease"
      });
      boardAnimation.backgroundColor("#808080").step();
      this.setData({
        animationData: animation.export(),
        boardAnimationData: boardAnimation.export(),
        isDay: !this.data.isDay
      });
    } else {
      var animation = wx.createAnimation({
        duration: 2000,
        timingFunction: 'ease'
      });
      var boardAnimation = wx.createAnimation({
        duration: 2000,
        timingFunction: "ease"
      });
      boardAnimation.backgroundColor("#ffffff").step();
      animation.rotate(this.angle).step();
      this.setData({
        animationData: animation.export(),
        boardAnimationData: boardAnimation.export(),
        isDay: !this.data.isDay
      });
    }
  },
  canvastouchstart: function (e) {
    e.touches.forEach(function (item) {
      this.sendLocation(item);
    }.bind(this));
  },
  canvastouchend: function (e) {
    e.touches.forEach(function (item) {
      this.sendLocation(item);
    }.bind(this));
  },
  canvastouchmove: function (e) {
    e.touches.forEach(function (item) {
      this.sendLocation(item);
    }.bind(this));
  },
  sendLocation: function (touch) {
    var x = touch.clientX;
    var y = touch.clientY - 160 / this.pxRatio;
    var context = wx.createContext();
    this.locationX = x;
    this.locationY = y;
    this.updateCanvas();
    var message = {
      type: "update",
      name: this.name,
      room: this.room,
      x: x,
      y: y,
      w: this.windowWidth,
      h: 0
    };
    wx.sendSocketMessage({
      data: JSON.stringify(message)
    });
  }
})
