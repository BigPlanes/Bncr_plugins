# pyxyohttpapi

### 介绍
 这是xyo_httpapi的python模块




2.9.2版本的MD5为  
>925aebf19da6a5abb229cfc25b53a0d8



***最后版本为2.9.2往后改订阅制，并且强制更新***
***禁用强制更新的方式为 在host文件内添加屏蔽***
>0.0.0.0 sxyo.cn


    
#### 如果你知道 xyo_httpapi 那你就知道这是干嘛的  

模块分版本放在dll目录下

https://www.yuque.com/docs/share/5550af9e-3800-4060-af8a-f2f64c98ee00?# 《pyxyohttpapi开发文档》  
***开发文档可能会漏，以模块内部的函数体为主***  


**因为官方文档不更新所以我几乎每个接口都要测试过才会上来，**

**已经废弃或者失效的接口也会删除,大概更新完2.9.2的所有功能后不更新了，具体再看吧**  


### 已经实现
#### 插件接口
  
- [x] OutPut // 在框架记录页输出一行信息  
- [x] GetVer // 获取框架版本号    
- [x] RestartFramework // 重启框架    
- [x] GetRuntime // 获取框架运行时长    
- [x] GetWxidLogintime // 获取微信登录时长  
- [x] GetWxidRecmsgNum // 获取微信收信数量    
- [x] GetWxidSendmsgNum // 获取微信发信数量  
- [x] GetHttpApiCurrentVer // 取 httpApi 当前使用版本    
- [x] GetHttpApiNewestVer // 取 httpApi 当前最新版本    
- [x] AntiWithdrawON // 开启防撤回    
- [x] AntiWithdrawOFF // 关闭防撤回  
- [x] ExitWeChat // 退出指定微信  
- [x] GetRobotList // 获取登录账号列表

#### 个人接口
  
- [x] AgreeFriendVerify // 同意好友请求  
- [x] WithdrawOwnMessage // 撤回自身消息  
- [x] DeleteFriend // 删除好友  
- [x] GetFriendlist // 获取好友列表  
- [x] GetFriendsStatus // 好友状态检测    
- [x] GetHeadimgByWxid // 获取某个头像  
- [x] SendTextMsg // 发送文字消息    
- [x] SendImageMsg // 发送图片消息  
- [x] SendVideoMsg // 发送视频消息    
- [x] SendFileMsg // 发送文件消息  
- [x] SendCardMsg // 发送名片消息    
- [x] SendFavoritesMsg // 发送收藏消息  
- [x] SendShareLinkMsg // 发送普通分享链接  
- [x] SendMusicLinkMsg // 发送一条可播放的歌曲链接    
- [x] AccepteTransfer // 同意转账  
- [x] GetNoteByWxid // 获取好友的备注(缓存获取)  
- [x] ModifyFriendNote // 修改好友备注  
- [x] GetSubscriptionlist // 获取公众号列表  
- [x] FavoritesGetList // 获取收藏列表    
- [x] FavoritesMsg // 收藏消息  
- [x] GetInfoByWxid // wxid查详细信息  
- [x] SearchAccount // 搜索好友

#### 朋友圈
  
- [x] GetMoments // 获取朋友圈  
- [x] GetMomentsForFriend // 获取好友朋友圈    
- [x] MomentsLike // 朋友圈点赞    
- [x] MomentsComment // 朋友圈评论    
- [x] SendMoments_Video // 发视频朋友圈    
- [x] SendMoments_Img // 发图片朋友圈    
- [x] SendMoments_Str // 发文本朋友圈


#### 群
  
- [x] GetGrouplist // 获取群列表    
- [x] GetGroupMember // 获取群成员列表    
- [x] GetGroupMemberDetailInfo // 获取某个群成员详细    
- [x] GetNameByWxid // 通过ID获取好友,群聊,公众号的昵称(缓存获取)      
- [x] ModifyGroupName // 修改群名称    
- [x] QuitGroup // 退出群聊    
- [x] SendGroupMsgAndAt // 艾特成员并发送群消息   
- [x] SendMsgAtAll // 发送群消息并艾特所有人    
- [x] SesNicknameInGroup // 修改我在群里的昵称    
- [x] ContactRemove // 移出通讯录    
- [x] ContactSave // 保存到通讯录

### 参与贡献


