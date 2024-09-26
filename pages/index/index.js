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
      avatarUrl: defaultAvatarUrl,
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
    //canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    // 是否可以使用button.open-type.getUserInfo
    //canIUseNicknameComp: wx.canIUse('input.type.nickname'),
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
  onImageClick2: function(e) {
  
      this.setData({
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

      let imgUrl;
      if( this.data.userInfo.tmpAvatarUrl=='' ){
        imgUrl = this.data.userInfo.avatarUrl;
      }else{
        imgUrl = this.data.userInfo.tmpAvatarUrl;
      }
       
      this.canvasDraw(imgUrl,imgPath);

      this.setData({
        hidden: true, // 关闭微信弹窗loding
        // hasNewImg: true // 设置存在新图片
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

        //向画布载入图片的方法 
        that.canvasDrawSignImg(result.tempFiles[0].tempFilePath);

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

    console.log("获取微信授权头像:",avatarUrl);
    this.canvasDrawSignImg(avatarUrl);

    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: true,
    })

  },
  onShareAppMessage() {
    return {
      title: '柿柿看呀，换个头像~', // 分享出的卡片标题
      path: 'pages/index/index', // 他人通过卡片进入小程序的路径，可以在后面拼接URL的形式带参数
      imageUrl: '/share/share.png', // 分享出去的图片，默认为当前页面的截图。图片路径可以是本地文件路径或者网络图片路径。支持PNG及JPG。
    };
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
  onReady: function () {    
    const query = wx.createSelectorQuery()
    query.select('#shareCanvas')
        .fields({
          id: true,
          node: true,
          size: true
        })
        .exec(this.init.bind(this));
  },
  init(res) {
    const canvas = res[0].node
    const ctx = canvas.getContext('2d')
    const dpr = wx.getSystemInfoSync().pixelRatio
    // 新接口需显示设置画布宽高；
    canvas.width = res[0].width * dpr
    canvas.height = res[0].height * dpr
    ctx.scale(dpr, dpr);

    this.setData({
      canvas,
      ctx
    });

    // 获取base64本地图片获取路径
    var base64 =  this.data.userInfo.avatarUrl;//base64格式图片
    var imgPath = wx.env.USER_DATA_PATH+'/index_'+Date.now()+ '.png';
    //如果图片字符串不含要清空的前缀,可以不执行下行代码.
    var imageData = base64.replace(/^data:image\/\w+;base64,/, "");
    var fs = wx.getFileSystemManager();
    fs.writeFileSync(imgPath, imageData, "base64");

    //向画布载入图片的方法 
    this.canvasDrawSignImg(imgPath);
  },
  canvasDraw(img1Url,img2Url) {

    /** 多个图片合并的话，由于异步执行，由于尺寸原因可能存在img2渲染早于img，所以合并 */
    /** 背景图片 img */
    /** 模板图片 img2 */

    let img = this.data.canvas.createImage();
    img.onload = () => {
      // 绘制图片 img
      this.data.ctx.drawImage(img, 0, 0, 200, 200);
      // img.complete表示图片是否加载完成，结果返回true和false;
      if( img.complete ){
        let img2 = this.data.canvas.createImage();
        img2.onload = () => {
          // 绘制图片 img2
          this.data.ctx.drawImage(img2, 0, 0, 200, 200);
        };
        img2.src = img2Url;
      }
    };
    img.src = img1Url;

  },
  canvasDrawSignImg(imgUrl) {
    
    let img = this.data.canvas.createImage();
    img.onload = () => {
      // 绘制图片 img
      this.data.ctx.drawImage(img, 0, 0, 200, 200);
    };
    img.src = imgUrl;

  },
})
