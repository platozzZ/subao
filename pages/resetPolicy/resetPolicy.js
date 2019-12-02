const app = getApp();
import WxValidate from '../../utils/WxValidate'
var that
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // zhengce:1,
    zhengce:[
      { title: '宽松', des:'入住前1天12:00前退订，可获100%退款，之后退订不退款'},
      {title: '适中', des: '入住的前5天12:00前退订，可获100%退款，之后退订不退款'},
      { title: '严格', des: '入住的前7天12:00前退订，可获50%退款，之后退订不退款'},
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    that = this
    var title=options.zhengce
    var zhengce=that.data.zhengce
     zhengce.forEach((item)=>{
       if(item.title==title){
         item.checked = true
       }
     })
    that.setData({
     zhengce:zhengce

    })
  },

  //选择政策
  radioChange(e) {
   console.log(e.detail.value)
    let pages = getCurrentPages();
    var prepage = pages[pages.length-2]
    prepage.setData({
      'art.refund_rule': e.detail.value
    })
    wx.navigateBack()
  },


 



})