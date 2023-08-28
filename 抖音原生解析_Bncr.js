/**作者
 * @author 薛定谔的大灰机
 * @name 抖音原生解析
 * @origin 大灰机
 * @version 1.0.2
 * @description 视频解析，仅支持抖音
 * @rule (http.?://\S+douyin\.com/\S+/?)
 * @priority 9999
 * @admin false
 * @disable false
 */

// const UA = require('/bncr/BncrData/plugins/红灯区/mod/USER_AGENTS')     // 依赖红灯区UA模块 (调用方法：'await UA.USER_AGENT('Browser')')
const xbogus = require('./mod/X_Bogus')      // 此脚本依赖仓库模块，请拉取全部文件
const mo = require('./mod/subassembly')      // 此脚本依赖仓库模块，请拉取全部文件

module.exports = async s => {
    // 获取UA
    // user_agent = await UA.USER_AGENT('Browser')
    user_agent = "Mozilla/5.0(WindowsNT10.0;Win64;x64)AppleWebKit/537.36(KHTML,likeGecko)Chrome/" + 108 + Math.round(Math.random() * 10) + ".0.3497." + Math.round(Math.random() * 100) + "Safari/537.36 Edg/115.0.1901.203"

    // 链接提取视频id
    if (s.param(1).includes(`www`)) {
        data = s.param(1)
        aweme_id = (data.match(/video\/(\d*)/)[1]) || (data.match(/note\/(\d*)/)[1])
    } else {
        data = (await mo.request({ url: s.param(1) })).request._header
        if (!data.match(/video\/(\d*)?/) && !data.match(/note\/(\d*)?/)) {
            s.reply(`检查链接！`)
            console.log(`检查链接！\n${data.match(/video\/(\d*)?/) || data.match(/note\/(\d*)?/)}`)
            return
        }
        aweme_id = (data.match(/video\/(\d*)?/) || data.match(/note\/(\d*)?/))[1]
    }
    s.reply(`正在解析抖音……`)

    // 通过user_agent生成X_Bogus
    let query = `aweme_id=${aweme_id}&aid=1128&version_name=23.5.0&device_platform=android&os_version=2333`
    let X_Bogus = await xbogus.sign(query, user_agent)
    let msToken = `msToken=${getRandomString(107)}`
    let odin_tt = `odin_tt=324fb4ea4a89c0c05827e18a1ed9cf9bf8a17f7705fcc793fec935b637867e2a5a9b8168c885554d029919117a18ba69;${await ttwid()}`
    let bd_ticket_guard_client_data = `bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWNsaWVudC1jc3IiOiItLS0tLUJFR0lOIENFUlRJRklDQVRFIFJFUVVFU1QtLS0tLVxyXG5NSUlCRFRDQnRRSUJBREFuTVFzd0NRWURWUVFHRXdKRFRqRVlNQllHQTFVRUF3d1BZbVJmZEdsamEyVjBYMmQxXHJcbllYSmtNRmt3RXdZSEtvWkl6ajBDQVFZSUtvWkl6ajBEQVFjRFFnQUVKUDZzbjNLRlFBNUROSEcyK2F4bXAwNG5cclxud1hBSTZDU1IyZW1sVUE5QTZ4aGQzbVlPUlI4NVRLZ2tXd1FJSmp3Nyszdnc0Z2NNRG5iOTRoS3MvSjFJc3FBc1xyXG5NQ29HQ1NxR1NJYjNEUUVKRGpFZE1Cc3dHUVlEVlIwUkJCSXdFSUlPZDNkM0xtUnZkWGxwYmk1amIyMHdDZ1lJXHJcbktvWkl6ajBFQXdJRFJ3QXdSQUlnVmJkWTI0c0RYS0c0S2h3WlBmOHpxVDRBU0ROamNUb2FFRi9MQnd2QS8xSUNcclxuSURiVmZCUk1PQVB5cWJkcytld1QwSDZqdDg1czZZTVNVZEo5Z2dmOWlmeTBcclxuLS0tLS1FTkQgQ0VSVElGSUNBVEUgUkVRVUVTVC0tLS0tXHJcbiJ9`
    let cookie = `${msToken};${odin_tt};${bd_ticket_guard_client_data}`
    let url = `https://www.douyin.com/aweme/v1/web/aweme/detail/?${query}&X-Bogus=${X_Bogus}`

    // 获取接口数据
    var i = 1
    do {
        var { data } = await mo.request({
            url: url,
            method: "get",
            headers: {
                "User-Agent": user_agent,
                "Cookie": cookie,
                "Referer": "https://www.douyin.com/"
            },
        })
        console.log(`${data == null ? `重复第${i}次` : ``}`)
        if (i == 5 && data == null) {
            console.log(`访问接口5次超时，停止！`)
            s.reply(`接口故障`)
            return
        }
        i++
    } while (data == null)
    if (!data) {
        console.log(`解析失败，请检查接口是否正常\n${url}`)
        s.reply(`解析出错：接口数据为空`)
        return
    } else if (data.status_code == `0`) {
        console.log(`打开data成功`)
        // s.reply(`获取到数据，请稍后……`)
    } else if (!data.item_list && data.filter_list == ``) {
        s.reply(`解析出错：数据为空`)
        return
    }
    content = (await douyin(data))
    if (content.type === `图集`) {
        s.reply(content.msg)
        for (let i = 0; i < content.file.length; i++) {
            await mo.reply(s, {
                type: `image`,
                // msg: (i + 1),
                path: {
                    path: content.file[i],
                    suffix: content.suffix
                },
                dontEdit: true
            })
        }
    } else {
        await mo.reply(s, {
            type: `video`,
            msg: content.msg,
            path: {
                path: content.file,
                suffix: content.suffix
            },
            dontEdit: true
        })
    }

    async function douyin(data) {
        let type = data.aweme_detail.images ? `图集` : `视频`
        // 点赞数量
        digg_count = data.aweme_detail.statistics.digg_count || ``
        // 作品发布时间(需调用时间戳转换模块)
        create_time = mo.time(data.aweme_detail.create_time, 2) || ``
        // 作者昵称
        nickname = data.aweme_detail.author.nickname || ``
        // 作者年龄
        user_age = data.aweme_detail.author.user_age || ``
        // UID
        uid = data.aweme_detail.author.uid || ``
        // 标题
        desc = data.aweme_detail.desc || ``
        // 头像
        avatar = data.aweme_detail.author.avatar_thumb.url_list[0].replace('100x100', '1080x1080') || ``
        // 音频
        if (!data.aweme_detail.music || !data.aweme_detail.music.play_url || !data.aweme_detail.music.play_url.url_list[0]) {
            music = `【无可用音频】`
        } else {
            music = data.aweme_detail.music.play_url.url_list[0]
        }

        if (!data.aweme_detail?.images) {
            // 视频
            file = data.aweme_detail.video.play_addr.url_list[0]
            _msg = `[烟花]视频:${await short_url(file)}\n`
            suffix = `mp4`
        } else if (data.aweme_detail.images.length > 0) {
            file = []
            for (let i = 0; i < data.aweme_detail.images.length; i++) {
                file[i] = data.aweme_detail.images[i].url_list[0]
            }
            _msg = `[烟花]数量:${data.aweme_detail.images.length}`
            suffix = `jpg`
        } else {
            console.log(`解析失败，请查看视频是否正常`)
            msg = `解析失败，请查看视频是否正常`
        }
        msg = `抖音原生${type}解析\n \n`
        msg += `[庆祝]标题：${desc}\n`
        msg += `┄┅┄┅┄┅┄┅┄┅┄┅┄\n`
        msg += `[哇]作者:【${nickname}】`
        if (user_age == `-1`) msg += `\n`
        else  msg += ` ${user_age}岁\n`
        msg += `UID:${uid}\n`
        msg += `┄┅┄┅┄┅┄┅┄┅┄┅┄\n`
        msg += `[咖啡]发布时间:${create_time}\n`
        msg += `┄┅┄┅┄┅┄┅┄┅┄┅┄\n`
        msg += `[太阳]头像:${await short_url(avatar)}\n`
        msg += `┄┅┄┅┄┅┄┅┄┅┄┅┄\n`
        msg += `[爱心]点赞:【${digg_count}】\n`
        msg += `┄┅┄┅┄┅┄┅┄┅┄┅┄\n`
        msg += `[月亮]音频:${await short_url(music)}\n`
        msg += `┄┅┄┅┄┅┄┅┄┅┄┅┄\n`
        msg += _msg
        return { msg, file, suffix, type }
    }
}

// 缩短链请求
async function short_url(url) {
    var data = await mo.request({
        "url": `http://xiaoapi.cn/API/dwz.php?url=${url}`,
        "method": "get",
    });
    if (data?.status === 200) {
        return data.data
    } else {
        console.log('缩短链失败', url);
        return url
    }
}

function getRandomString(len) {
    let _charStr = 'abacdefghjklmnopqrstuvwxyzABCDEFGHJKLMNOPQRSTUVWXYZ0123456789',
        min = 0,
        max = _charStr.length - 1,
        _str = '';                    //定义随机字符串 变量
    //判断是否指定长度，否则默认长度为15
    len = len || 15;
    //循环生成字符串
    for (var i = 0, index; i < len; i++) {
        index = (function (randomIndexFunc, i) {
            return randomIndexFunc(min, max, i, randomIndexFunc);
        })(function (min, max, i, _self) {
            let indexTemp = Math.floor(Math.random() * (max - min + 1) + min),
                numStart = _charStr.length - 10;
            if (i == 0 && indexTemp >= numStart) {
                indexTemp = _self(min, max, i, _self);
            }
            return indexTemp;
        }, i);
        _str += _charStr[index];
    }
    return _str;
}

async function ttwid() {
    // request 网络请求
    var { headers } = await mo.request({
        url: `https://ttwid.bytedance.com/ttwid/union/register/`,
        method: "post",
        data: {
            "region": "cn", "aid": 1768, "needFid": false, "service": "www.ixigua.com",
            "migrate_info": {
                "ticket": "", "source": "node"
            },
            "cbUrlProtocol": "https", "union": true
        },
    })
    text = String(headers[`set-cookie`][0].split(`;`)[0])
    return text
}
