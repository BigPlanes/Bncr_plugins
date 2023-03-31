/**作者
 * @author 薛定谔的大灰机
 * @name 短视频解析
 * @origin 大灰机
 * @version 1.0.3
 * @description 猪头短视频解析<https://watermark.iculture.cc/>
 * @rule (http.?://\S+douyin\.com/\S+/?)
 * @priority 99999
 * @admin false
 * @disable false
 */

// 接口支持多平台，返回值不太一样，如果有需要把分享链接发给我（自己先去网页解析一下，如果解析成功再发给我，你们也可以自己改改）

const request = require('request');
const { randomUUID } = require('crypto')
const path = require('path');
const fs = require('fs');
const axios = require('axios')
// 短视频解析API
const api_url = `https://api.iculture.cc/api/video/?url=`
// 短链接生成API
const short_url = `https://xiaoapi.cn/API/dwz.php?url=`

module.exports = async s => {
    let url = `${api_url}${s.param(1)}`
    await s.reply(`正在解析`)
    // await s.delMsg(s.getMsgId())
    if (json = await get(url)) {
        if (json.code == 200) {
            if (s.param(1).includes(`douyin`)) {
                await douyin()
            }
        } else {
            video = ``
            msg = `接口返回：${json.msg}\n状态码：${json.code}`
        }
    } else {
        video = ``
        msg = `解析失败`
    }
    if (['HumanTG'].includes(s.getFrom())) {
        // if (['HumanTG', 'tgBot'].includes(s.getFrom())) {
        (msgid = await s.reply({
            type: 'video',
            path: video,
            msg: msg,
        })) && await s.delMsg(s.getMsgId());
        if (!msgid) {
            await s.reply(`视频发送失败`)
            await sysMethod.sleep(1)
            await s.reply(msg)
            open = false;
            (video = await writeTovideo(video)), open = true;   /* 存储图片 */
            if (await s.reply({
                type: 'video',
                path: video,
                msg: msg,
            })) {
                await s.delMsg(s.getMsgId());
                open && fs.unlinkSync(video);
            }
        }
    } else {
        await s.reply(msg)
        await s.reply({
            type: 'video',
            path: video,
        })
    }
}

// get请求
async function get(url) {
    var data = await axios({
        "url": url,
        "method": "get",
    });
    if (data.status === 200) {
        return data.data
    } else {
        return
    }
}

async function douyin() {
    video = json.url
    msg = `抖音解析成功\n `
    msg += `\n作者：${json.author}`
    msg += `\nUID：${json.uid}`
    msg += `\n标题：${json.title}`
    msg += `\n点赞：${json.like}`
    msg += `\n时间：${time(json.time)}`
    // msg += `\n封面：${await req(`${short_url}${json.cover}`)}`
    // msg += `\n头像：${await req(`${short_url}${json.avatar}`)}`
    msg += `\n音频：${await get(`${short_url}${json.musicurl}`)}`
    msg += `\n视频：${await get(`${short_url}${json.url}`)}`
}

// 时间戳转换
function time(t, l) {
    var num = Number(t)
    // 时间戳长度
    var v = num.toString().length
    if (v == 10) {
        var Data = new Date(num * 1000)// 十位需要乘1000，十三位可以直接用
    } else if (v == 13) {
        var Data = new Date(num)// 十位需要乘1000，十三位可以直接用
    } else {
        console.log(`时间戳值异常`)
        return t
    }
    // console.log(v)
    if (!l) {
        var l = ``
        // console.log(`时间戳转换格式为空，默认1`)
    }
    if (l == `1`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日${Data.getHours()}:${Data.getMinutes()}:${Data.getSeconds()}`
    } else if (l == `2`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日${Data.getHours()}:${Data.getMinutes()}分`
    } else if (l == `3`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日${Data.getHours()}时`
    } else if (l == `4`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日`
    } else if (l == `5`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月`
    } else if (l == `6`) {
        var time = `${Data.getFullYear()}年`
    } else {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日${Data.getHours()}:${Data.getMinutes()}:${Data.getSeconds()}`
    }
    return time
}

async function writeTovideo(url) {
    // console.log(`正在下载文件`)
    const paths = path.join(process.cwd(), `BncrData/public/${randomUUID().split('-').join('') + '.mp4'}`);
    return new Promise((resolve, reject) => {
        let stream = request(url).pipe(
            fs.createWriteStream(paths)
        );
        stream.on('finish', () => {
            resolve(paths);
        });
    });
};