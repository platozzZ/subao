const app = getApp()
const api = require('../../utils/request.js')
var that
Page({
  data: {
    art: '',
    list: [
      {
        title: '空调',
        key: 'aircondition',
        radio: true,
        list: [
          { title: '全部房屋', checked: false, }, 
          { title: '部分房屋', checked: false, },
        ]
      }, {
        title: '热水',
        key: 'hotwater',
        radio: true,
        list: [
          { title: '全天热水', checked: false, },
          { title: '分时段热水', checked: false, },
        ]
      }, {
        title: '居家',
        key: 'home_sth',
        list: [
          { title: 'Wi-Fi', checked: false },
          { title: '有线网络', checked: false },
          { title: '电视', checked: false },
          { title: '电视(55寸含以上)', checked: false },
          { title: '拖鞋', checked: false },
          { title: '电热水壶',checked: false },
          { title: '电吹风', checked: false },
          { title: '晾衣架', checked: false },
          { title: '冰箱', checked: false },
          { title: '对开门冰箱', checked: false },
          { title: '洗衣机', checked: false },
          { title: '烘干机/干衣机', checked: false },
          { title: '打扫工具', checked: false },
          { title: '洗衣粉/液', checked: false },
          { title: '暖气', checked: false },
          { title: '电熨斗/挂烫机', checked: false },
          { title: '加湿器', checked: false },
          { title: '空气净化器', checked: false },
          { title: '新风系统',checked: false },
          { title: '地毯', checked: false },
          { title: '挂墙装饰画/字画', checked: false },
          { title: '真皮/实木沙发', checked: false },
          { title: '休闲椅', checked: false },
          { title: '茶几', checked: false },
          { title: '净水机/滤水系统', checked: false },
          { title: '中央空调', checked: false },
        ]
      }, {
        title: '洗浴用品',
        key: 'bath_sth',
        list: [
          { title: '独立卫浴', checked: false },
          { title: '洗发水/沐浴露', checked: false },
          { title: '牙具', checked: false },
          { title: '毛巾', checked: false },
          { title: '卫生纸', checked: false },
          { title: '浴巾', checked: false },
          { title: '香皂/洗手液', checked: false },
          { title: '浴缸', checked: false },
          { title: '智能马桶盖', checked: false },
        ]
      }, {
        title: '餐厨',
        key: 'kitchen_sth',
        list: [
          { title: '烹饪锅具', index: 0, checked: false },
          { title: '餐具', index: 1, checked: false },
          { title: '刀具菜板', index: 2, checked: false },
          { title: '燃气灶', index: 3, checked: false },
          { title: '电饭煲', index: 4, checked: false },
          { title: '洗涤用具', index: 5, checked: false },
          { title: '电磁炉', index: 6, checked: false },
          { title: '调料', index: 7, checked: false },
          { title: '微波炉', index: 8, checked: false },
          { title: '烧烤器具', index: 9, checked: false },
          { title: '整体橱柜', index: 10, checked: false },
          { title: '红酒', index: 11, checked: false },
          { title: '啤酒', index: 12, checked: false },
        ]
      }, {
        title: '娱乐',
        key: 'play_sth',
        list: [
          { title: '麻将机', index: 0, checked: false },
          { title: '卡拉OK/家庭影院', index: 1, checked: false },
          { title: '投影设备', index: 2, checked: false },
          { title: '桌面游戏', index: 3, checked: false },
          { title: '游戏机', index: 4, checked: false },
          { title: '桌面足球', index: 5, checked: false },
          { title: '音响/蓝牙音箱', index: 6, checked: false },
        ]
      }, {
        title: '安全',
        key: 'safe_sth',
        list: [
          { title: '保安', index: 0, checked: false },
          { title: '门禁系统', index: 1, checked: false },
          { title: '灭火器', index: 2, checked: false },
          { title: '智能门锁', index: 3, checked: false },
          { title: '火灾报警器', index: 4, checked: false },
          { title: '一氧化碳报警器', index: 5, checked: false },
          { title: '保险箱', index: 6, checked: false },
        ]
      }, {
        title: '建筑',
        key: 'build_sth',
        list: [
          { title: '有窗户', index: 0, checked: false },
          { title: '落地窗', index: 1, checked: false },
          { title: '电梯', index: 2, checked: false },
          { title: '私家花园', index: 3, checked: false },
          { title: '私家泳池', index: 4, checked: false },
          { title: '观景露台', index: 5, checked: false },
          { title: '私家温泉', index: 6, checked: false },
        ]
      }, {
        title: '周边(500米)',
        key: 'surround_sth',
        list: [
          { title: '餐厅', index: 0, checked: false },
          { title: '超市', index: 1, checked: false },
          { title: '提款机', index: 2, checked: false },
          { title: '药店', index: 3, checked: false },
          { title: '菜市场', index: 4, checked: false },
          { title: '免费停车', index: 5, checked: false },
          { title: '儿童乐园', index: 6, checked: false },
          { title: '泳池', index: 7, checked: false },
          { title: '公共花园', index: 8, checked: false },
        ]
      }, {
        title: '其他',
        key: 'else_sth',
        list: [
          { title: '行李寄存', checked: false },
          { title: '急救包', checked: false },
        ]
      }
    ],
    pageType: null
  },
  onLoad(options) {
    app.mtj.trackEvent('wode_15')
    that = this
    console.log(options)
    that.setData({
      houseId: options.id
    })
    let data = {
      upload_house_id: options.id,
      type: 5
    }
    that.getData(data)
    if (options.type == 0) {
      that.setData({
        pageType: 0
      })
    }
  },
  getData(e) {
    console.log(e)
    api.request('/pms/upload/house/detail.do', 'POST', e, true).then(res => {
      console.log('getData:', res.data)
      // let art = res.data
      if (res.data.rlt_code == 'S_0000') {
        let art = res.data.data
        let list = that.data.list
        art.homeSth = new Array(art.home_sth)
        art.bathSth = new Array(art.bath_sth)
        art.kitchenSth = new Array(art.kitchen_sth)
        art.playSth = new Array(art.play_sth)
        art.safeSth = new Array(art.safe_sth)
        art.buildSth = new Array(art.build_sth)
        art.surroundSth = new Array(art.surround_sth)
        art.elseSth = new Array(art.else_sth)
        console.log(art)
        list.map((item,index,arr)=>{
          if (!!art.aircondition){
            if (item.name = "aircondition"){
              item.list.map((iteml, indexl, arrl) => {
                if (art.aircondition == iteml.title){
                  iteml.checked = true
                }
              })
            }
          } 
          if (!!art.hotwater){
            if (item.name = "hotwater") {
              item.list.map((iteml, indexl, arrl) => {
                if (art.hotwater == iteml.title) {
                  iteml.checked = true
                }
              })
            }
          }
          if (!!art.home_sth || art.home_sth == "[]") {
            if (item.name = "home_sth") {
              item.list.map((iteml, indexl, arrl) => {
                art.homeSth.map((itema, indexa, arra) => {
                  let jsonItem = JSON.parse(itema)
                  if (jsonItem.indexOf(iteml.title) > -1){
                    iteml.checked = true
                  }
                })
              })
            }
          }
          if (!!art.bath_sth || art.bath_sth == "[]") {
            if (item.name = "bath_sth") {
              item.list.map((iteml, indexl, arrl) => {
                art.bathSth.map((itema, indexa, arra) => {
                  let jsonItem = JSON.parse(itema)
                  if (jsonItem.indexOf(iteml.title) > -1) {
                    iteml.checked = true
                  }
                })
              })
            }
          }
          if (!!art.kitchen_sth || art.kitchen_sth == "[]") {
            if (item.name = "kitchen_sth") {
              item.list.map((iteml, indexl, arrl) => {
                art.kitchenSth.map((itema, indexa, arra) => {
                  let jsonItem = JSON.parse(itema)
                  if (jsonItem.indexOf(iteml.title) > -1) {
                    iteml.checked = true
                  }
                })
              })
            }
          }
          if (!!art.play_sth || art.play_sth == "[]") {
            if (item.name = "play_sth") {
              item.list.map((iteml, indexl, arrl) => {
                art.playSth.map((itema, indexa, arra) => {
                  let jsonItem = JSON.parse(itema)
                  if (jsonItem.indexOf(iteml.title) > -1) {
                    iteml.checked = true
                  }
                })
              })
            }
          }
          if (!!art.safe_sth || art.safe_sth == "[]") {
            if (item.name = "safe_sth") {
              item.list.map((iteml, indexl, arrl) => {
                art.safeSth.map((itema, indexa, arra) => {
                  let jsonItem = JSON.parse(itema)
                  if (jsonItem.indexOf(iteml.title) > -1) {
                    iteml.checked = true
                  }
                })
              })
            }
          }
          if (!!art.build_sth || art.build_sth == "[]") {
            if (item.name = "build_sth") {
              item.list.map((iteml, indexl, arrl) => {
                art.buildSth.map((itema, indexa, arra) => {
                  let jsonItem = JSON.parse(itema)
                  if (jsonItem.indexOf(iteml.title) > -1) {
                    iteml.checked = true
                  }
                })
              })
            }
          }
          if (!!art.surround_sth || art.surround_sth == "[]") {
            if (item.name = "surround_sth") {
              item.list.map((iteml, indexl, arrl) => {
                art.surroundSth.map((itema, indexa, arra) => {
                  let jsonItem = JSON.parse(itema)
                  if (jsonItem.indexOf(iteml.title) > -1) {
                    iteml.checked = true
                  }
                })
              })
            }
          }
          if (!!art.else_sth || art.else_sth == "[]") {
            if (item.name = "else_sth") {
              item.list.map((iteml, indexl, arrl) => {
                art.elseSth.map((itema, indexa, arra) => {
                  let jsonItem = JSON.parse(itema)
                  if (jsonItem.indexOf(iteml.title) > -1) {
                    iteml.checked = true
                  }
                })
              })
            }
          }
          
          
        })



        // let sourcesList = new Array(sources)
        // console.log(sourcesList)
        // let newArr
        // sourcesList.map((item, index, arr) => {
        //   console.log(item)
        //   let jsonItem = JSON.parse(item)
        //   console.log(jsonItem)
        //   newArr = jsonItem
        // })
        // console.log(newArr)
        // let checkList = that.data.checkList
        // newArr.map((item, index, arr) => {
        //   checkList.map((itemc, indexc, arrc) => {
        //     if (item.source == itemc.source) {
        //       itemc.checked = true
        //     }
        //   })
        // })
        that.setData({
          art: art,
          list: list
        })
      } else {
        that.showToast(res.data.rlt_msg)
      }
    }).catch(res => {
      console.log(res)
      // that.showToast(res.data.rlt_msg)
    }).finally(() => { })
  },
  formSubmit(e) {
    console.log(e)
    let target = e.detail.target.dataset.target
    let data = e.detail.value
    data.type = 5
    data.target = target
    data.upload_house_id = that.data.houseId
    console.log(data)
    if (target == 'next') {
      if (!!data.aircondition || !!data.hotwater || data.home_sth.length > 0 || data.bath_sth.length > 0 || data.kitchen_sth.length > 0 || data.play_sth.length > 0 || data.safe_sth.length > 0 || data.build_sth.length > 0 || data.surround_sth.length > 0 || data.else_sth.length > 0){
        that.updateHouse(data)
      } else {
        that.showToast('请至少勾选一项')
        return
      }
      return
    }
    that.updateHouse(data)

  },
  updateHouse(e) {
    console.log(e)
    api.request('/pms/upload/house/update.do', 'POST', e, true).then(res => {
      console.log('updateHouse:', res.data)
      let art = res.data
      if (art.rlt_code == 'S_0000') {
        if (e.target == 'next') {
          wx.redirectTo({
            url: '../uploadStep6/uploadStep6?id=' + e.upload_house_id + '&type=' + that.data.pageType,
          })
          return
        }
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 2000
        })
      } else {
        that.showToast(art.rlt_msg)
      }
    }).catch(res => {
      that.showToast(art.rlt_msg)
    }).finally(() => { })
  },
  onShow: function () {

  },
  onUnload: function () {

  },
  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
})