// 引入头像模板文件
import {defaultImg,templateImage} from '../../utils/headTemplate.js'
// 默认头像
const defaultAvatarUrl = defaultImg.InitUserImg;

Page({
  data: {
    // 备注
    motto: '',
    // 用户信息
    userInfo: {
      // 头像
      avatarUrl: defaultAvatarUrl!=null?defaultAvatarUrl:'',
      // 昵称
      nickName: '',
      // 临时头像，缓存
      tmpAvatarUrl: ''
    },
    // 引用js文件，头像模板base64编码文件
    templateImage,
    // loading弹窗
    hidden: true, // true 隐藏/ false 显示
    // 是否显示头像模板
    showTemplate:false,
    // 是否合并图片
    hasNewImg: false, // 不生效
    // 是否有用户信息
    hasUserInfo: false,
    // 是否可以使用getUserProfile
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    // 是否可以使用button.open-type.getUserInfo
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },
  // 选择模板
  selectTemplate: function() {
    this.setData({
      showTemplate: !this.data.showTemplate
    })
  },
  saveImgae: function(){
    // 你可以在这里执行进一步的操作，例如将图片保存到相册
    wx.saveImageToPhotosAlbum({
        filePath: this.data.userInfo.avatarUrl,
        success: function() {
            wx.showToast({
                title: '图片已保存到相册',
                icon: 'success'
            });
        },
        fail: function(err) {
            console.error('保存图片失败:', err);
        }
    });
  },
  // 点击图片
  onImageClick: function(e) {

    let that = this;

    // wx.showToast({
    //   title: 'Image clicked!',
    //   icon: 'none'
    // });

      that.setData({
        hidden: false, // 打开微信弹窗loding
        hasNewImg: true // 设置存在新图片
      });

      const timestamp = Date.now();

      // 获取base64本地图片获取路径
      var base64 =  e.currentTarget.dataset.img;//base64格式图片
      var imgPath = wx.env.USER_DATA_PATH+'/index_'+timestamp+ '.png';
      //如果图片字符串不含要清空的前缀,可以不执行下行代码.
      var imageData = base64.replace(/^data:image\/\w+;base64,/, "");
      var fs = wx.getFileSystemManager();
      fs.writeFileSync(imgPath, imageData, "base64");

      // 绘制背景海报到canvas
      const ctx = wx.createCanvasContext('shareCanvas',that)

      let imgUrl;
      if( that.data.userInfo.tmpAvatarUrl=='' ){
        imgUrl = that.data.userInfo.avatarUrl;
      }else{
        imgUrl = that.data.userInfo.tmpAvatarUrl;
      }
      // 背景图片
      ctx.drawImage(imgUrl, 0, 0, 200, 200)
      // 模板图片
      ctx.drawImage(imgPath, 0, 0, 200, 200)
      ctx.draw( false, () => {
          wx.canvasToTempFilePath({
              canvasId: 'shareCanvas',
              success: function(res) {
                console.log('合并图片地址:',res);
                var tempFilePath = res.tempFilePath;

                // 头像地址
                that.data.userInfo.avatarUrl = tempFilePath;
                // 延时1秒（3000毫秒）后执行
                setTimeout(() => {
                  that.setData({
                    // 隐藏loading
                    hidden: true,
                    // 临时头像地址
                    "userInfo.tmpAvatarUrl": imgUrl,
                  });
                }, 300);
              },
              fail: function(err) {
                  console.error('canvasToTempFilePath failed:', err);
              }
          });
      });

      // 关闭选择模板
      this.selectTemplate();

  },
  // 获取本地图片到临时缓存中
  uploadImg: function (){
    var that = this;
		wx.chooseMedia({
			count: 1, // 最多可以选择的文件个数
			mediaType: ['image'], // 文件类型
			sizeType: ['original'], // 是否压缩所选文件
			sourceType: ['album'], // 可以指定来源是相册`album`还是相机`camera`，默认二者都有
			success(result) {
        that.setData({
          "userInfo.avatarUrl": result.tempFiles[0].tempFilePath,
          hasUserInfo: true
        })
			},

		})
  },
  // 重选图片
  restPhoto: function (){

    this.setData({
      hidden: false
    });

    setTimeout(() => {
      wx.reLaunch({
        url: '/pages/index/index'
      });
    }, 500);

  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e) {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res)

        console.log('打印获取用户信息:',res);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },
  onLoad() {
    // "shareAppMessage"表示“发送给朋友”按钮，"shareTimeline"表示“分享到朋友圈”按钮
    wx.showShareMenu({
      menus: ['shareAppMessage', 'shareTimeline'],// 需要显示的转发按钮名称列表.合法值包含 "shareAppMessage"、"shareTimeline"
      success(res) {
        console.log(res);
      },
      fail(e) {
        console.log(e);
      }
    });
  },
  onShareAppMessage() {
    return {
      title: '柿柿看呀，换个头像~', // 分享出的卡片标题
      path: 'pages/index/index', // 他人通过卡片进入小程序的路径，可以在后面拼接URL的形式带参数
      imageUrl: '/share/share.png', // 分享出去的图片，默认为当前页面的截图。图片路径可以是本地文件路径或者网络图片路径。支持PNG及JPG。
    };
  },
})
