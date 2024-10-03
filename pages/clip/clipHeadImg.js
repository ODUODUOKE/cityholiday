// pages/clip/clipHeadImg.js

import WeCropper from '../../utils/weCropper/we-cropper' // 之前复制过来的we-cropper.js的位置

const app = getApp()
const device = wx.getSystemInfoSync()
const width = device.windowWidth
const height = device.windowHeight - 80

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cropperOpt: {
      id: 'cropper',
      targetId: 'targetCropper',
      pixelRatio: device.pixelRatio,
      width,
      height,
      scale: 2.5,
      zoom: 8,
      cut: {
        x: (width - 200) / 2,
        y: (height - 200) / 2,
        width: 200,
        height: 200
      },
      boundStyle: {
        color: "green",
        mask: 'rgba(0,0,0,0.8)',
        lineWidth: 1
      }
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(option) {

    console.log('option:',option);

    const {
      cropperOpt
    } = this.data
    cropperOpt.src = option.src
    cropperOpt.boundStyle.color = "green"

    this.setData({
      cropperOpt
    })

    this.cropper = new WeCropper(cropperOpt)
      .on('ready', (ctx) => {
      })
      .on('beforeImageLoad', (ctx) => {
        wx.showToast({
          title: '上传中',
          icon: 'loading',
          duration: 20000
        })
      })
      .on('imageLoad', (ctx) => {
        wx.hideToast()
      })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    wx.hideHomeButton();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  touchStart(e) {
    this.cropper.touchStart(e)
  },
  touchMove(e) {
    this.cropper.touchMove(e)
  },
  touchEnd(e) {
    this.cropper.touchEnd(e)
  },
  // 点击取消，返回上一页
  cancel() {
 
    // 重新打开首页
    wx.reLaunch({
      url: '/pages/index/index'
    });

  },
  getCropperImage() {
    this.cropper.getCropperImage()
      .then((src) => {
        const nameLast = src.substring(src.lastIndexOf('.') + 1)
        const timeStamp = new Date().getTime()
        const fileName = `${timeStamp}.${nameLast}`
        console.log('打印裁切图片名称:',fileName);

        wx.redirectTo({
          url: '/pages/index/index?src=' + src,
        })

      })
      .catch((err) => {
        wx.showModal({
          title: '温馨提示',
          content: err.message
        })
      })
  },
})
