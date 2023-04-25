/**作者
 * @author 薛定谔的大灰机
 * @name 今日油价
 * @origin 大灰机
 * @version 1.0.2
 * @description 查询今日油价
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^([^ \n]+)油价$
 * @rule ^油价([^ \n]+)$
 * @priority 0
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

// 油价查询API
const api = 'https://www.mxnzp.com/api/oil/search'

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
    if (body = (await mo.request({
        url: `${api}?province=${encodeURI(s.param(1))}&app_id=${app_id}&app_secret=${app_secret}`,
        method: `get`
    })).data) {
        if (body.code === 1) {
            console.log(body);
            msg = `地区：${body.data?.province}`
            msg += `\n0号柴油：${body.data?.t0}`
            msg += `\n89号汽油：${body.data?.t89}`
            msg += `\n92号汽油：${body.data?.t92}`
            msg += `\n95号汽油：${body.data?.t95}`
            msg += `\n98号汽油：${body.data?.t98}`
            // msg += `\n：${}`
        } else {
            msg = body.msg
        }
        mo.reply(s, msg)
    }
}

async function set(s) {
    set_json = {
        "TIP": [
            "输入app_id (MXNZP)",
            "输入app_secret (MXNZP)",
        ],
        "name":[
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
