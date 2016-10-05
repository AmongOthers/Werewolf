var util = require("../../utils/util.js");

var app = getApp();
Page({
    data: {
        config: {},
        cover: "../../images/cover.jpg",
        swiperCurrent: 1,
        isChoosing: true,
        roles:[],
        choosedRole: {}
    },
    onLoad: function() {
        var roles = [];
        app.globalData.gameConfig.forEach(function(item) {
            var count = item.count;
            var role = item.role;
            for(var i = 0; i < count; i++) {
                roles.push(role);
            }
        });
        util.shuffle(roles);
        this.setData({
            config: app.globalData.gameConfig,
            roles: roles
        });
    },
    swiperCurrentChange: function(e) {
        var current = e.detail.current;
        this.setData({
            swiperCurrent: current + 1 
        });
    },
    chooseRole: function() {
        this.setData({
            isChoosing: false,
            choosedRole: this.data.roles[this.data.swiperCurrent - 1]
        });
    }
});