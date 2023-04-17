/**作者
 * @author 薛定谔的大灰机
 * @name 短视频解析
 * @origin 大灰机
 * @version 1.0.6
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

/**
说明：
短视频解析app_id和app_secret申请地址(https://www.mxnzp.com/)
 */

const mo = require('./mod/subassembly')      // 此脚本依赖仓库模块，请拉取全部文件
const axios = require('axios');
const sysdb = new BncrDB('MXNZP')

// 短链接生成API
const short_url = `https://xiaoapi.cn/API/dwz.php?url=`
// 抖音短视频解析API
const douyin_api_url = `https://www.mxnzp.com/api/douyin/video`
// 哔哩哔哩视频解析（有水印）
const bilibili_api_url = ` https://www.mxnzp.com/api/bilibili/video`


module.exports = async s => {
    app_id = await sysdb.get('app_id') || ``            // 可以通过'set MXNZP app_id *****'设置，或者在此行的||后面填入app_id
    app_secret = await sysdb.get('app_secret') || ``    // 可以通过'set MXNZP app_secret *****'设置，或者在此行的||后面填入app_secret
    if (!(app_id || app_secret)) {
        s.reply('使用`set MXNZP app_id *****`设置app_id\n使用`set MXNZP app_secret *****`设置app_secret后使用')
        return
    }
    tail = `?url=${btoa(s.param(1))}&app_id=${app_id}&app_secret=${app_secret}`
    await s.reply(`正在解析`)
    if (s.param(1).includes(`douyin`)) {
        content = await douyin()
        await mo.sendMsg(s, {
            type: `video`,
            msg,
            path: video
        })
    } else if (s.param(1).includes(`bilibili`) || s.param(1).includes(`b23`)) {
        content = await bilibili()
        await mo.sendMsg(s, {
            type: `video`,
            msg,
            path: video
        })
    }
}

async function douyin() {
    if (!(data = (await get(douyin_api_url + tail)).data)) {
        return {
            video: ``,
            msg: `解析失败`
        }
    }
    console.log(data);
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
    console.log(data);
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
