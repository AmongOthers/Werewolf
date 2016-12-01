var player = require("../../js/player.js");
var app = getApp();

Page({
    data: {
        players: player.players,
        playerStubs: [],
        titlebarImage: "../../images/wheat.png",
        medicineImage: "../../images/medicine.png",
        poisonImage: "../../images/poison.png",
        poisonAvatarImage: "../../images/poison-avatar.png",
        clawmarkImage: "../../images/clawmark.png",
        healImage: "../../images/heal.png",
        markingPlayerIndex: -1,
        poisonTargetAnimationData: {},
        healAnimationData: {},
        killedPlayerIndex: -1,
        isHealed: false
    },
    onLoad: function () {
        var playerStubs = [];
        var stubNumber = 4 - player.players.length % 4;
        for (var i = 0; i < stubNumber; i++) {
            playerStubs.push(i);
        }
        this.setData({
            playerStubs: playerStubs,
            killedPlayerIndex: 1
        });
    },
    poisonTouchStart: function (e) {
        this.markingPlayerIndex = -1;
        this.poisonPlayerIndex = -1;
        this.poisonedPlayerIndex = -1;
        var touch = e.touches[0];
        var poisonAnimation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease'
        });
        if(touch.clientX <= app.globalData.windowWidth / 2) {
            poisonAnimation.rotateZ(-30).step();
        } else {
            poisonAnimation.rotateZ(30).step();
        }
        this.setData({
            poisonPlayerIndex: -1,
            markingPlayerIndex: -1,
            touchingPoisonArea: "touching-poison-area",
            poisonAnimationData: poisonAnimation.export()
        });
    },
    poisonTouchMove: function (e) {
        this.touches = e.touches;
        this.touches.forEach(function (item) {
            this.heal(item);
        }.bind(this));
    },
    poisonTouchEnd: function (e) {
        var poisonOriginAnimation = wx.createAnimation({
            duration: 500,
            timingFunction: 'ease'
        });
        poisonOriginAnimation.rotateZ(0).step();
        var poisonPlayerIndex = this.markingPlayerIndex;
        this.setData({
            touchingPoisonArea: "",
            poisonAnimationData: poisonOriginAnimation.export(),
            poisonPlayerIndex: poisonPlayerIndex,
            markingPlayerIndex: -1
        });
    },
    poisonFlagTapped: function() {
        this.poisonedPlayerIndex = this.data.poisonPlayerIndex;
        this.poisonPlayerIndex = -1;
        this.setData({
            poisonPlayerIndex: -1,
            poisonedPlayerIndex: this.poisonedPlayerIndex
        });
        setTimeout(function() {
            var poisonTargetAnimation = wx.createAnimation({
                duration: 1000,
                timingFunction: 'ease'
            });
            poisonTargetAnimation.opacity(1).step();
            this.setData({
                poisonTargetAnimationData: poisonTargetAnimation.export()
            });
        }.bind(this), 100);
    },
    medicineFlagTapped: function() {
        var healAnimation = wx.createAnimation({
            duration: 1000,
            timingFunction: 'ease'
        });
        healAnimation.opacity(0).step();
        this.setData({
            isHealed: true,
            healAnimationData: healAnimation.export()
        });
    },
    heal: function (touch) {
        var pxRatio = app.globalData.pxRatio;
        var windowWidth = app.globalData.windowWidth;
        var x = touch.clientX;
        var y = touch.clientY - 120 / pxRatio;

        var columnWidth = windowWidth / 4;
        var column = Math.floor(x / columnWidth);
        var hSpace = 68 / 2 / pxRatio;
        var hCenter = column * columnWidth + columnWidth / 2;
        column = column > 3 ? 3 : column;

        var playerHeight = 160 / pxRatio;
        var row = Math.floor(y / playerHeight);
        var topSpace = 68 / 2 / pxRatio;
        var bottomSpace = topSpace * 1.5; //命中文字的范围适当放宽一点
        var center = row * playerHeight + playerHeight / 2;
        this.markingPlayerIndex = row * 4 + column;
        if (this.markingPlayerIndex < this.data.players.length &&this.markingPlayerIndex != this.data.killedPlayerIndex && center - topSpace <= y && y <= center + bottomSpace &&
            hCenter - hSpace <= x && x <= hCenter + hSpace) {
            this.setData({
                markingPlayerIndex: this.markingPlayerIndex
            });
        } else {
            this.markingPlayerIndex = -1;
            this.setData({
                markingPlayerIndex: -1
            });
        }

        console.log("markingPlayerIndex: " + this.markingPlayerIndex);
    }
})