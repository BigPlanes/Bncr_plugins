/**作者
 * @author 薛定谔的大灰机
 * @name 短视频解析
 * @origin 大灰机
 * @version 1.0.4
 * @description 猪头短视频解析<https://watermark.iculture.cc/>
 * @rule (http.?://\S+douyin\.com/\S+/?)
 * @priority 9999
 * @admin false
 * @disable false
 */


const path = require('path');
const fs = require('fs');
const axios = require('axios')
// 短视频解析API
const api_url = `https://www.mxnzp.com/api/douyin/video?url=`

// app_id和app_secret去https://www.mxnzp.com/申请，填在下方
const app_id = `aicepjhumrabnmkn`
const app_secret = `UHl1Q0hhWEc5Lzl3ZmM4S0dOYUJlZz09`
// 短链接生成API
const short_url = `https://xiaoapi.cn/API/dwz.php?url=`

module.exports = async s => {
    let url = `${api_url}${btoa(s.param(1))}&app_id=${app_id}&app_secret=${app_secret}`
    await s.reply(`正在解析`)
    // await s.delMsg(s.getMsgId())
    if (json = await get(url)) {
        // return
        if (json.code == 1) {
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
    console.log(msg);
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
            (video = await downloadFile(video)), open = true;   /* 存储图片 */
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
    video = json.data.url
    msg = `抖音解析成功\n `
    msg += `\n标题：${json.data.title}`
    msg += `\n时长：${json.data?.durationFormat}`
    msg += `\n分辨率：${json.data?.accept}`
    msg += `\n视频：${await get(`${short_url}${json.data.url}`)}`
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
