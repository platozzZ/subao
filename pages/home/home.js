const app = getApp()
const login = require('../../utils/wxLogin.js')
const api = require('../../utils/request.js')
var that
Page({
  data: {

  },
  onLoad: function (options) {
    that = this
    console.log('homePage-onLoad')

    login.wxLogin(app)

    // that.gwtStatistic()
  },
  onReady: function () {

  },
  onShow: function () {

    // let that = this
    // login.wxLogin(app)
  },

})