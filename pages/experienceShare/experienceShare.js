var WxParse = require('../../wxParse/wxParse.js');
const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({
  data: {
    id: '',
    error: false,
    showContainer: false,
    detail: {},
    isIphoneX: false
  },
  onLoad: function(options) {
    that = this;
    that.setData({
      id: options.id
    })
    that.setData({
      isIphoneX: app.globalData.isIphoneX
    })
    that.getExperience(options.id)

  },
  //获取经验分享detail
  getExperience(id) {
    let data = {
      article_id: id
    }
    api.request('/pms/article/read', 'POST', data, true, false).then(res => {
      console.log('getExperience:',res.data)

      if (res.data.rlt_code == 'S_0000') {
        var art = res.data.data
        if(!art){
          that.setData({
            error:true,
          })
          return false;
        }
        art.create_time = util.formatDates(new Date(art.create_time))
        wx.setNavigationBarTitle({
          title: art.type == 1 ? '经验分享' : '短篇科普'
        })
        var article = art.content
        WxParse.wxParse('article', 'html', article, that, 4);
        that.setData({
          detail: art,
          showContainer: true
        })

      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => {})
  },

  //去首页
  toNewIndex: function(e) {
    app.mtj.trackEvent('wenzhang_1');
    wx.reLaunch({
      url: '../newIndex/newIndex',
    })
  },

  //查看更多详情
  toMore() {
    wx.navigateTo({
      url: '../lookMoreArticle/lookMoreArticle',
    })
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
  //分享配置
  onShareAppMessage: function(options) {
    app.mtj.trackEvent('wenzhang_2');
    console.log(options)
    let title = that.data.detail.title

    return {
      title: title,
      path: "/pages/experienceShare/experienceShare?id=" + that.data.id,
      imageUrl: `${that.data.detail.thumbnail}`,
      success: function(res) {
        console.log('onShareAppMessage  success:', res)
      },
      fail: function(res) {
        console.log('onShareAppMessage  fail:', res)
      }
    }
  }

})