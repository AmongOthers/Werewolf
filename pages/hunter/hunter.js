var player = require("../../js/player.js");

var app = getApp();
Page({
    data: {
        players: player.players,
        playerStubs: [],
        titlebarImage: "../../images/wheat.png",
        arrowImage: "../../images/arrow.png",
        isGoingToFire: false,
        bowImage: "../../images/bow.png",
        bowAndArrowImage: "../../images/bow-arrow.png",
        bowAnimationData: {},
        bowAndArrowAnimationData: {}
    },
    arrowImageWidthInPx: 10,
    arrowImageHeightInPx: 80,
    arrowSpeedIn100ms: 100,
    bowAreaCenterInCanvas: {},
    leftAnchorInCanvas: {},
    rightAnchorInCanvas: {},
    centerAnchorInCanvas: {},
    arrowAnchorInCanvas: {},
    onLoad: function () {
        var playerStubs = [];
        var stubNumber = 4 - player.players.length % 4;
        for (var i = 0; i < stubNumber; i++) {
            playerStubs.push(i);
        }
        this.setData({
            playerStubs: playerStubs,
        });
        //微信小程序在开发者工具上调用drawImage，第一次总会报错undefined，所以使用这种方式来避免报错
        var context = wx.createContext();
        context.drawImage("../../images/arrow.png", 0, 0, 0, 0);
        wx.drawCanvas({
            canvasId: "hunter-ground",
            actions: context.getActions()
        });
    },
    onShow: function() {
        var hunterAreaWidthInRpx = 400;
        var hunterAreaHeightInRpx = 200;
        var bowImageWidth = 186;
        var bowImageHeight = 54;
        var titlebarHeight = 120;
        var arrowImageWidth = 20;
        var arrowImageHeight = 160;
        var windowWidth = app.globalData.windowWidth;
        var windowHeight = app.globalData.windowHeight;
        var pxRatio = app.globalData.pxRatio;
        //去掉titleBar
        windowHeight = windowHeight -  titlebarHeight / pxRatio; 
        var leftAnchorX = windowWidth / 2 - bowImageWidth / 2 / pxRatio;
        var leftAnchorY = windowHeight - (hunterAreaHeightInRpx - bowImageHeight) / 2 / pxRatio;
        var rightAnchorX = windowWidth / 2 + bowImageWidth / 2 / pxRatio;
        var rightAnchorY = leftAnchorY;
        this.leftAnchorInCanvas = {
            x: leftAnchorX + 8,
            y: leftAnchorY
        };
        this.rightAnchorInCanvas = {
            x: rightAnchorX - 8,
            y: rightAnchorY
        };
        this.centerAnchorInCanvas = {
            x: windowWidth / 2,
            y: leftAnchorY
        };
        this.arrowAnchorInCanvas = {
            x: this.centerAnchorInCanvas.x - arrowImageWidth / 2 / pxRatio,
            y: rightAnchorY - arrowImageHeight / pxRatio
        };
        this.bowAreaCenterInCanvas = {
            x: windowWidth / 2,
            y: windowHeight - hunterAreaHeightInRpx / 2 / pxRatio
        };
        console.log("left anchor: (x: " + this.leftAnchorInCanvas.x + " , y: " + this.leftAnchorInCanvas.y + ")");
        console.log("right anchor: (x: " + this.rightAnchorInCanvas.x + " , y: " + this.rightAnchorInCanvas.y + ")");
        console.log("center anchor: (x: " + this.centerAnchorInCanvas.x + " , y: " + this.centerAnchorInCanvas.y + ")");
        console.log("arrow anchor: (x: " + this.arrowAnchorInCanvas.x + " , y: " + this.arrowAnchorInCanvas.y + ")");
        console.log("bowAreaCenterInCanvas: (x: " + this.bowAreaCenterInCanvas.x + " , y: " + this.bowAreaCenterInCanvas.y + ")");
    },
    bowGroundTouchStart: function(e) {
    },
    bowGroundTouchMove: function(e) {
        this.touches = e.touches;
        this.touches.forEach(function (item) {
            this.selectTarget(item);
        }.bind(this))
    },
    bowGroundTouchEnd: function() {
        // if(this.markingPlayerIndex >= 0) {
        //     this.setData({
        //         isGoingToFire: true
        //     });
        // }
    },
    drawArrow(index) {
        var pxRatio = app.globalData.pxRatio;
        var windowHeight = app.globalData.windowHeight;
        var windowWidth = app.globalData.windowWidth;
        var columnWidth = windowWidth / 4;
        var playerHeight = 160 / pxRatio;
        var row = Math.floor(index / 4);
        var column = index % 4; 
        var targetCenter = {
            x: column * columnWidth + columnWidth / 2,
            y: row * playerHeight + playerHeight / 2
        } 
        var hDistance = this.bowAreaCenterInCanvas.x - targetCenter.x;
        var vDistance = this.bowAreaCenterInCanvas.y - targetCenter.y;
        var angle = Math.atan(vDistance / hDistance);
        var bowAnimation = wx.createAnimation({
            duration: 100,
            timingFunction: 'ease'
        });
        if(angle > 0) {
            bowAnimation.rotateZ(angle * 180 / Math.PI - 90).step();
        } else {
            bowAnimation.rotateZ(90 + angle * 180 / Math.PI).step();
        }
        this.setData({
            bowAnimationData: bowAnimation.export()
        });
        console.log("before angle: " + angle);
        if(angle >= 0) {
            angle = 90 + angle * 180 / Math.PI;
        } else {
            angle = 270 + angle * 180 / Math.PI;
        }
        console.log("after angle: " + angle);
        var distance = Math.sqrt(hDistance * hDistance + vDistance * vDistance);
        console.log("distance: " + distance);
        this.doDrawArrow(0, angle, distance)
    }, 
    doDrawArrow: function(start, angle, distance) {
        this.drawArrowInCanvas(start, angle, distance);
        start += this.arrowSpeedIn100ms;
        if(start <= distance - this.arrowImageHeightInPx) {
            setTimeout(function() {
                this.doDrawArrow(start, angle, distance);
            }.bind(this), 100);
        } else {
            this.drawArrowInCanvas(distance - this.arrowImageHeightInPx, angle, distance);
        }
    }, 
    drawArrowInCanvas: function(start, angle, distance) {
        var context = wx.createContext();
        context.save();
        context.translate(this.bowAreaCenterInCanvas.x, this.bowAreaCenterInCanvas.y);
        context.rotate(angle * Math.PI / 180);
        context.drawImage("../../images/arrow.png", 0, start, this.arrowImageWidthInPx, this.arrowImageHeightInPx);
        context.restore();
        wx.drawCanvas({
            canvasId: "hunter-ground",
            actions: context.getActions()
        });
    },
    selectTarget: function (touch) {
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
        if (this.markingPlayerIndex < this.data.players.length && this.markingPlayerIndex != this.data.killedPlayerIndex && center - topSpace <= y && y <= center + bottomSpace &&
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
        if(this.markingPlayerIndex >= 0) {
            this.targetSelected(this.markingPlayerIndex);
        }
        console.log("markingPlayerIndex: " + this.markingPlayerIndex);
    },
    targetSelected: function(index) {
        var pxRatio = app.globalData.pxRatio;
        var windowHeight = app.globalData.windowHeight;
        var windowWidth = app.globalData.windowWidth;
        var columnWidth = windowWidth / 4;
        var playerHeight = 160 / pxRatio;
        var row = Math.floor(index / 4);
        var column = index % 4; 
        var targetCenter = {
            x: column * columnWidth + columnWidth / 2,
            y: row * playerHeight + playerHeight / 2
        } 
        var hDistance = this.bowAreaCenterInCanvas.x - targetCenter.x;
        var vDistance = this.bowAreaCenterInCanvas.y - targetCenter.y;
        var angle = Math.atan(vDistance / hDistance);
        var bowAndArrowAnimation = wx.createAnimation({
            duration: 100,
            timingFunction: 'ease'
        });
        if(angle > 0) {
            bowAndArrowAnimation.rotateZ(angle * 180 / Math.PI - 90).step();
        } else {
            bowAndArrowAnimation.rotateZ(90 + angle * 180 / Math.PI).step();
        }
        this.setData({
            bowAndArrowAnimationData: bowAndArrowAnimation.export()
        });
    },
    leftAction: function() {
        this.setData({
            isGoingToFire: true
        });
        this.drawArrow(this.markingPlayerIndex);
    },
    rightAction: function() {
        var bowAndArrowAnimation = wx.createAnimation({
            duration: 100,
            timingFunction: 'ease'
        });
        bowAndArrowAnimation.rotateZ(0).step();
        this.setData({
            markingPlayerIndex: -1,
            bowAndArrowAnimationData: bowAndArrowAnimation.export()
        });
    }
})