/**作者
 * @author 薛定谔的大灰机
 * @name 全网影视
 * @origin 大灰机
 * @version 1.0.0
 * @description 全网免费影视动漫（数据来源：妖狐数据开放API接口：https://api.yaohud.cn）
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^(vip|VIP|动漫|电影|影视)(.*)$
 * @admin false
 * @disable false
 */

/**
说明：
Key申请地址(https://api.yaohud.cn)
 */
 
const mo = require('./mod/subassembly')      // 此脚本依赖仓库模块，请拉取全部文件
const sysdb = new BncrDB('API')

module.exports = async s => {
    if (key = await sysdb.get('yaohu')) {
        main(s, key)
    } else {
        set(s)
    }
}

async function set(s) {
    set_json = {
        "TIP": [
            "输入妖狐API_KEY",
        ],
        "param": {
            "KEY": ""
        }
    }
    for (let i = 0; i < set_json.TIP.length; i++) {
        if (api_key = await mo.again(s, set_json.TIP[i])) {
            set_json.param.KEY = api_key
            s.delMsg(await s.reply(await sysdb.set('yaohu', set_json.param, { def: '设置成功' })), { wait: 2 })
            main(s, api_key)
        } else {
            return
        }
    }
}

async function main(s, key) {
    s.delMsg(s.getMsgId())
    params = {
        key: key.KEY,
        msg: s.param(2) || '参数值',
        n: '',
        m3u8: 'yes',
        type: 'json',
    }
    if ((data = await mo.request({ url: 'https://api.yaohud.cn/api/v5/yingshi', method: 'get', params })).status == 200) {
        if ((data = data.data) && ((data == `没有找到该资源`) || data.code == 403)) {
            return s.delMsg(await s.reply(data.msg || data), { wait: 5 })
        } else {
            params.n = await mo.again(s, `请选择：\n${data}`, 60)
        }
    }
    if (params.n && (data = await mo.request({ url, method: 'get', params })).status == 200) {
        if ((data = data.data).code == 200) {
            image = data.data.picture
            msg = `${data.data.name}`
            msg += `\n${data.data.language}`
            msg += `，${data.data.list_name}`
            msg += `，${data.data.Updatestatus}`
            msg += `\n┄┅┄┅┄┅┄┅┄┅┄┅┄`
            msg += `\n${data.data.introduction}`
            if (data.url.length == 1) {
                num = 0
            } else {
                num = (await mo.again(s, `请选择：\n当前共${data.url.length / 2}集`)) * 2 - 1
                return
            }
            msg += `\n┄┅┄┅┄┅┄┅┄┅┄┅┄`
            msg += `\nm3u8链接：${data.url[(num)]}\n在线播放：${data.m3u8url[num]}`
            await mo.reply(s, {
                type: 'image',
                msg,
                path: {
                    path: image,
                    suffix: `jpg`,
                },
            })
        } else {
            s.delMsg(await s.reply('接口返回错误'), { wait: 5 })
        }
    }
}
