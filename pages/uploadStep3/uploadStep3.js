const app = getApp()
const api = require('../../utils/request.js')
import WxValidate from '../../utils/WxValidate'
var that
Page({
  data: {
    art: '',
    czIndex: null,
    czArr: ['整套出租', '独立房间', '合住房间'],
    jgIndex: null,
    jgArr: ['无', '海景', '湖景', '江景', '山景'],
    modalName: null,
    houseType: null,
    houseTypeList: [
      { name: '卧室', num: 0, type: 'bedroom_count' },
      { name: '客厅', num: 0, type: 'livingroom_count' },
      { name: '卫生间', num: 0, type: 'bathroom_count' },
      { name: '厨房', num: 0, type: 'kitchen_count' },
      { name: '书房', num: 0, type: 'study_count' },
      { name: '阳台', num: 0, type: 'balcony_count' },
    ],
    copyList: [],
    // areatext: '请输入床型/尺寸/数量',
    multiShow: true,
    pageType: null

  },
  onLoad: function (options) {
    app.mtj.trackEvent('wode_13')
    that = this
    console.log(options)
    that.setData({
      houseId: options.id
    })
    that.initValidate()
    let data = {
      upload_house_id: options.id,
      type: 3
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
        let houseTypeList = that.data.houseTypeList
        // let copyList = that.data.houseTypeList
        let czArr = that.data.czArr
        let jgArr = that.data.jgArr
        houseTypeList.map((item, index, arr) => {
          if (item.type == 'bedroom_count') {
            item.num = art.bedroom_count ? art.bedroom_count: '1'
          }
          if (item.type == 'livingroom_count') {
            item.num = art.livingroom_count ? art.livingroom_count : '0'
          }
          if (item.type == 'bathroom_count') {
            item.num = art.bathroom_count ? art.bathroom_count : '1'
          }
          if (item.type == 'kitchen_count') {
            item.num = art.kitchen_count ? art.kitchen_count : '0'
          }
          if (item.type == 'study_count') {
            item.num = art.study_count ? art.study_count : '0'
          }
          if (item.type == 'balcony_count') {
            item.num = art.balcony_count ? art.balcony_count : '0'
          }
        })
        czArr.map((item,index,arr) => {
          if (item == art.rent_type) {
            console.log(index)
            that.setData({
              czIndex: index
            })
          }
        })
        jgArr.map((item, index, arr) => {
          if (item == art.landscape) {
            that.setData({
              jgIndex: index
            })
          }
        })
        console.log(art)
        console.log(houseTypeList)
        that.setData({
          art: art,
          houseTypeList: houseTypeList,
          // copyList: copyList,
          houseType: art.house_type

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
    data.type = 3
    data.target = target
    data.upload_house_id = that.data.houseId
    console.log(data)
    if (target == 'next') {
      if (!that.WxValidate.checkForm(data)) {
        const error = that.WxValidate.errorList[0]
        console.log(error)
        that.showToast(error.msg)
        return false
      } else {
        that.updateHouse(data)
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
            url: '../uploadStep4/uploadStep4?id=' + e.upload_house_id + '&type=' + that.data.pageType,
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
  pickChange(e) {
    console.log(e)
    let target = e.currentTarget.dataset.target
    let data = target + "Index"
    that.setData({
      [data]: e.detail.value
    })
  },
  showModal(e) {
    let target = e.currentTarget.dataset.target
    that.setData({
      modalName: target
    })
  },
  hideModal() {
    that.setData({
      modalName: null
    })
  },
  confirmModal(e){
    let houseTypeList = that.data.houseTypeList;
    // let newArr = []
    houseTypeList.map((item,index,arr)=>{
      that.setData({
        ['art.' + item.type]: item.num
      })
      // newArr.push({ type: item.type,num: item.num})
    })
    // console.log(newArr)
    that.setData({
      houseTypeList: houseTypeList,
      modalName: null
    })
    // that.hideModal()
  },
  ifshowArea(e) {
    console.log(e)
    let t_show = e.currentTarget.dataset.show == "yes" ? true : false;
    if (t_show) {//不显示textarea 
      that.setData({
        multiShow: t_show
      });
    } else {//显示textarea 
      that.setData({
        multiShow: t_show
      });
    }
  },
  textareaInput(e){
    that.setData({
      'art.bed_type': e.detail.value
    })
  },
  bindMinus(e) {
    let index = parseInt(e.currentTarget.dataset.index);
    let num = that.data.houseTypeList[index].num;

    num--;
    
    let houseTypeList = that.data.houseTypeList;
    houseTypeList[index].num = num;
    // 将数值与状态写回
    that.setData({
      houseTypeList: houseTypeList,
    });
  },
  bindPlus(e) {
    let index = parseInt(e.currentTarget.dataset.index);
    let num = that.data.houseTypeList[index].num;
    // 自增
    num++;
    
    let houseTypeList = that.data.houseTypeList;
    houseTypeList[index].num = num;
    // 将数值与状态写回
    that.setData({
      houseTypeList: houseTypeList,
    });
  },

  showToast(e) {
    wx.showToast({
      title: e,
      icon: 'none',
      mask: true,
      duration: 2000
    })
  },
  initValidate() {
    // 验证字段的规则
    const rules = {
      house_type: {
        required: true,
      },
      rent_type: {
        required: true,
      },
      landscape: {
        required: true,
      },
      bedroom_count: {
        required: true,
      },
      livingroom_count: {
        required: true,
      },
      bathroom_count: {
        required: true,
      },
      kitchen_count: {
        required: true,
      },
      balcony_count: {
        required: true,
      },
      study_count: {
        required: true,
      },
      bathroom_type: {
        required: true,
      },
      house_area: {
        required: true,
        range: [1,10000]
      },
      bed_type: {
        required: true,
      },
      space_bed_num: {
        required: true,
        range: [0, 1000]
      },
      addbed_flag: {
        required: true,
      },
      live_num: {
        required: true,
        range: [1, 1000]
      },
      landlord_flag: {
        required: true,
      },
      sametype_num: {
        required: true,
        range: [1, 1000]
      },
    }
    const messages = {
      house_type: {
        required: '请选择房屋类型',
      },
      rent_type: {
        required: '请选择出租方式',
      },
      landscape: {
        required: '请选择景观',
      },
      bedroom_count: {
        required: '请选择房屋户型',
      },
      livingroom_count: {
        required: '请选择房屋户型',
      },
      bathroom_count: {
        required: '请选择房屋户型',
      },
      kitchen_count: {
        required: '请选择房屋户型',
      },
      balcony_count: {
        required: '请选择房屋户型',
      },
      study_count: {
        required: '请选择房屋户型',
      },
      bathroom_type: {
        required: '请选择卫生间类型',
      },
      house_area: {
        required: '请输入房屋面积',
        range: '请输入正确的房屋面积'
      },
      bed_type: {
        required: '请选择床型',
      },
      space_bed_num: {
        required: '请输入公共空间床铺数量',
        range: '请输入正确的公共空间床铺数量'
      },
      addbed_flag: {
        required: '请选择是否额外加床',
      },
      live_num: {
        required: '请选择宜居人数',
        range: '请输入正确的宜居人数'
      },
      landlord_flag: {
        required: '请选择房东是否住在该房源',
      },
      sametype_num: {
        required: '请输入同类型房屋数量',
        range: '请输入正确的同类型房屋数量'
      },
    }
    // 创建实例对象
    this.WxValidate = new WxValidate(rules, messages)
  },

  onShow: function () {
    console.log(that.data.art)
  },

})