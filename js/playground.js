var eventbus = require("EventBus.js");

module.exports = {
    extend: function (app, page) {
        page.canvasTouchStart = function (e) {
        };
        page.canvasTouchEnd = function (e) {
        };
        page.canvasTouchMove = function (e) {
            var touches = e.touches;
            touches.forEach(function (item) {
                page.selectTarget(item);
            }.bind(page))
        };
        page.selectTarget = function (touch) {
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
            var markingPlayerIndex = row * 4 + column;
            if (markingPlayerIndex < page.data.players.length && center - topSpace <= y && y <= center + bottomSpace &&
                hCenter - hSpace <= x && x <= hCenter + hSpace) {
                this.targetSelected(markingPlayerIndex);
            }
        }
    }
}
