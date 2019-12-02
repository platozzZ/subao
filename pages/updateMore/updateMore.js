const app = getApp()
const api = require('../../utils/request.js')
var that
Page({
  data: {
    art: '',
  },
  onLoad(options) {
    that = this
  },
  onShow(){
    that.getMyHouse()
  },
  getMyHouse() {
    api.request('/pms/house/upload_better_list.do', 'POST', '', true).then(res => {
      console.log('getMyHouse:', res.data)
      if (res.data.rlt_code == 'S_0000') {
        let datas = res.data.data
        datas.betterList.map((item, idnex, arr) => {
          item.sources = item.sources.split(",")
        })
        datas.canBetterList.map((item, idnex, arr) => {
          item.sources = item.sources.split(",")
        })
        console.log(datas)
        that.setData({
          art: datas
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {

    }).finally(() => {

    })
  },
  toUpdate(e) {
    // let info = encodeURIComponent(JSON.stringify(data));
    // let address = e.currentTarget.dataset.address
    // let id = e.currentTarget.dataset.id
    // let imgurl = e.currentTarget.dataset.imgurl
    // let name = e.currentTarget.dataset.name
    // let sources = encodeURIComponent(JSON.stringify(e.currentTarget.dataset.sources));
    let item = encodeURIComponent(JSON.stringify(e.currentTarget.dataset.item));
    console.log(e)
    console.log(item)
    // wx.navigateTo({
    //   url: '../uploadStep01/uploadStep01?address=' + address + '&id=' + id + '&imgurl=' + imgurl + '&name=' + name + '&sources=' + sources + '&item=' + item,
    // })
    wx.navigateTo({
      url: '../uploadStep01/uploadStep01?item=' + item,
    })
  },
})