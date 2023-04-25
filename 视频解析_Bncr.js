/**作者
 * @author 薛定谔的大灰机
 * @name 短视频解析
 * @origin 大灰机
 * @version 1.0.9
 * @description 多个视频解析，目前支持抖音、哔哩哔哩
 * 抖音
 * @rule (http.?://\S+douyin\.com/\S+/?)
 * 哔哩哔哩
 * @rule (http.?://.*b23\.tv/\S+/?)
 * @rule (http.?://\S+.bilibili\.com/\S+/?)
 * @priority 9999
 * @admin false
 * @disable false
 */

/**
说明：
app_id和app_secret申请地址(https://www.mxnzp.com/)
 */

const mo = require('./mod/subassembly')      // 此脚本依赖仓库模块，请拉取全部文件
const axios = require('axios');
const sysdb = new BncrDB('API')

// 短链接生成API
const short_url = `https://xiaoapi.cn/API/dwz.php?url=`
// 抖音短视频解析API
const douyin_api_url = `https://www.mxnzp.com/api/douyin/video`
// 哔哩哔哩视频解析（有水印）
const bilibili_api_url = ` https://www.mxnzp.com/api/bilibili/video`


module.exports = async s => {
    if (Token = await sysdb.get('MXNZP')) {
        main(s, Token)
    } else {
        set(s)
    }
}

async function main(s, Token) {
    app_id = Token.app_id
    app_secret = Token.app_secret
    tail = `?url=${btoa(s.param(1))}&app_id=${app_id}&app_secret=${app_secret}`
    s.delMsg(await s.reply(`正在解析`), { wait: 5 })
    if (s.param(1).includes(`douyin`)) {
        content = await douyin()
    } else if (s.param(1).includes(`bilibili`) || s.param(1).includes(`b23`)) {
        content = await bilibili()
    } else {
        content = `不知道啥问题，请找开发者`
    }
    await mo.reply(s, content)
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
        type: `video`,
        msg: msg,
        path: {
            path: video,
            suffix: `mp4`,
        },
    }
}


async function bilibili() {
    if (!(data = (await get(bilibili_api_url + tail)).data) || (data.list.length == 0)) {
        console.log(data)
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
        type: `video`,
        msg: msg,
        path: {
            path: video,
            suffix: `mp4`,
        },
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

async function set(s) {
    set_json = {
        "TIP": [
            "输入app_id (MXNZP)",
            "输入app_secret (MXNZP)",
        ],
        "name": [
            "app_id",
            "app_secret",
        ],
        "param": {
            "app_id": "",
            "app_secret": "",
        }
    }
    for (let i = 0; i < set_json.TIP.length; i++) {
        if (api_key = await mo.again(s, set_json.TIP[i])) {
            set_json.param[set_json.name[i]] = api_key
            s.delMsg(await s.reply(await sysdb.set('MXNZP', set_json.param, { def: '设置成功' })), { wait: 2 })
        } else {
            return
        }
    }
    console.log(set_json.param);
    main(s, set_json.param)
}
