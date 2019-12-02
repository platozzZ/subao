function getCode(_this, num) {
    _this.setData({
        reg: true //按钮1隐藏，按钮2显示
    })
    var remain = num;//用另外一个变量来操作秒数是为了保存最初定义的倒计时秒数，就不用在计时完之后再手动设置秒数
    var time = setInterval(function () {
        if (remain == 1) {
            clearInterval(time);
            _this.setData({
                second: num,
                reg: false
            })
            return false      //必须有
        }
        remain--;
        _this.setData({
            second: remain
        })
    }, 1000)
}
module.exports = {
    getCode                  //此js模块化  也可以写成getCode:getCode
}