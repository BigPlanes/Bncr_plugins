/**作者
 * @author 薛定谔的大灰机
 * @name 短视频解析
 * @origin 大灰机
 * @version 1.0.5
 * @description 多个视频解析，目前支持抖音、哔哩哔哩
 * 
 * 抖音
 * @rule (http.?://\S+douyin\.com/\S+/?)
 * 
 * 哔哩哔哩
 * @rule (http.?://.*b23\.tv/\S+/?)
 * @rule (http.?://\S+.bilibili\.com/\S+/?)
 * 
 * @priority 9999
 * @admin false
 * @disable false
 */


const path = require('path');
const fs = require('fs');
const axios = require('axios');

// app_id和app_secret去https://www.mxnzp.com/申请，填在下方
const app_id = ``
const app_secret = ``

// 短链接生成API
const short_url = `https://xiaoapi.cn/API/dwz.php?url=`
// 抖音短视频解析API
const douyin_api_url = `https://www.mxnzp.com/api/douyin/video`
// 哔哩哔哩视频解析（有水印）
const bilibili_api_url = ` https://www.mxnzp.com/api/bilibili/video`


module.exports = async s => {
    tail = `?url=${btoa(s.param(1))}&app_id=${app_id}&app_secret=${app_secret}`
    await s.reply(`正在解析`)
    if (s.param(1).includes(`douyin`)) {
        content = await douyin()
        await send(s, content.msg, content.video)
    } else if (s.param(1).includes(`bilibili`) || s.param(1).includes(`b23`)) {
        content = await bilibili()
        await send(s, content.msg, content.video)
    }
}

async function douyin() {
    if (!(data = (await get(douyin_api_url + tail)).data)) {
        return {
            video: ``,
            msg: `解析失败`
        }
    }
    video = data.url
    msg = `抖音解析成功\n `
    msg += `\n标题：${data.title}`
    msg += `\n时长：${data.durationFormat}`
    msg += `\n分辨率：${data.accept}`
    msg += `\n视频：${await get(`${short_url}${data.url}`)}`
    return {
        video,
        msg
    }
}


async function bilibili() {
    if (!(data = (await get(bilibili_api_url + tail)).data)) {
        return {
            video: ``,
            msg: `解析失败`
        }
    }
    video = data.list[0].url
    msg = `哔哩哔哩解析成功\n `
    msg += `\n标题：${data.title}`
    msg += `\n时长：${data.list[0].durationFormat}`
    msg += `\n分辨率：${data.list[0].accept}`
    msg += `\n视频：${await get(`${short_url}${data.list[0].url}`)}`
    return {
        video,
        msg
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
    }
}

async function send(s, msg, video) {
    if (['HumanTG'].includes(s.getFrom())) {
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
            (video = await downloadFile(video)), open = true;   /* 存储视频 */
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
        // console.log(`时间戳值异常`)
        return t
    }
    if (!l) {
        var l = ``
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

async function downloadFile(url, filename = new Date().getTime()) {
    filePath = path.join(process.cwd(), 'BncrData/public', `${filename}.mp4`);
    response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(filePath));
    return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(filePath));
        response.data.on('error', reject);
    });
}
