const app = getApp();
const api = require('../../utils/request.js')
var that
Page({
  data: {
    housetype: [
      {
        title:'公寓',
        list:[
          { name: '普通公寓', checked: false },
          { name: '酒店式公寓', checked: false },
          { name: 'Loft公寓', checked: false },
          
        ]
      }, {
        title: '民居',
        list: [
          { name: '小区住宅', checked: false },
          { name: '小区复式跃层', checked: false },
          { name: '自建住宅', checked: false },
          { name: '农家乐', checked: false },
          { name: '渔家乐', checked: false }
        ]
      }, {
        title: '别墅',
        list: [
          { name: '独栋别墅', checked: false },
          { name: '联排别墅', checked: false },
          { name: '别墅套间', checked: false },
          { name: '叠拼别墅', checked: false },
        ]
      }, {
        title: '客栈',
        list: [
          { name: '客栈民宿', checked: false },
        ]
      }, {
        title: '特色民宿',
        list: [
          { name: '四合院', checked: false },
          { name: '老洋房', checked: false },
          { name: '房车露营车', checked: false },
          { name: '船屋游艇', checked: false },
          { name: '蒙古包', checked: false },
          { name: '帐篷', checked: false },
          { name: '吊脚楼', checked: false },
          { name: '木屋', checked: false },
          { name: '树屋', checked: false },
          { name: '集装箱', checked: false },
          { name: '窑洞', checked: false },
          { name: '石屋', checked: false },
          { name: '土楼', checked: false },
          { name: '韩屋', checked: false }

        ]
      }
    ],
  },
  onLoad: function (options) {
    that = this
    console.log(options)
    if(!!options.name){
      let housetype = that.data.housetype
      housetype.map((item,index,arr)=>{
        item.list.map((iteml,indexl,arrl)=>{
          if (iteml.name == options.name){
            console.log(iteml)
            iteml.checked = true
          }
        })
      })
      that.setData({
        housetype: housetype
      })
    }
  },
  radioChange(e){
    console.log(e)
    let pages = getCurrentPages();    //获取当前页面信息栈
    let prevPage = pages[pages.length - 2]     //获取上一个页面信息栈
    
    prevPage.setData({
      houseType: e.detail.value
    })
    wx.navigateBack()
  },
})