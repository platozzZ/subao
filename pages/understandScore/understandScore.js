const app = getApp();
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({

  /**
   * 页面的初始数据
   */
  data: {
    history: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    that = this
    that.getHistoryList(options.id)
  },

  //获取历史评估
  getHistoryList(id) {
    let data = {
      house_id: id
    }
    api.request('/pms/house/assess/view_assess_history.do', 'POST', data, true, false).then(res => {
      console.log(res)
      
      if (res.data.rlt_code == 'S_0000') { 
        var art = res.data.data
         for(var i=0;i<art.length;i++){
           art[i].create_time = util.formatDates(new Date(art[i].create_time))
         }
        
        that.setData({
          history: art
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => {})
  },


  //modal显示
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      duration: 2000,
      mask: true
    })
  },


})