const app = getApp()
const api = require('../../utils/request.js')
const util = require('../../utils/util.js')
var that
Page({
  data: {
    tabCur: 1,
    totalPage: '',
    pages: {
      current_page: 1,
      page_size: 20,
      type: 1
    },
    double: true,
    lookList: [],

  },
  onLoad: function (options) {
    that = this;


    that.getTypeNum()
  },
  getTypeNum() {

    api.request('/pms/article/type/count', 'POST', '', true, true).then(res => {
      console.log('文章类型个数:', res.data)

      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        if (art.length == 1) {
          that.setData({
            'pages.type': art[0].type,
            double: false
          })
        }
        that.getLookList(that.data.pages)

      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })
  },
  // 获取首页文章列表
  getLookList(data) {
    console.log(data)
    let pages = data
    api.request('/pms/article/list', 'POST', data, true).then(res => {
      console.log('文章列表:', res.data)

      if (res.data.rlt_code == 'S_0000') {
        let list
        let datas = res.data.data.rows
        if (pages.current_page == 1) {
          list = datas
        } else {
          list = that.data.lookList.concat(datas)
        }
        that.setData({
          lookList: list,
          totalPage: res.data.data.total_page,
          'pages.current_page': res.data.data.current_page + 1
        })


      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)

    }).finally(() => { })
  },

  //顶部tap切换
  tabSelect: function (e) {
    let id = e.currentTarget.dataset.id;
    let pages = that.data.pages
    let data = {
      current_page: 1,
      page_size: 20,
      type: id
    }
    that.setData({
      tabCur: id,
      'pages.type': id
    })
    that.getLookList(data)

  },

  //跳转look文章详情

  lookDetail(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../experienceShare/experienceShare?id=' + id,
    })
  },

  onReachBottom: function () {
    let totalPage = that.data.totalPage
    let data = that.data.pages

    if (totalPage >= data.current_page) {
      that.getLookList(data)
    }
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
