/**作者
 * @author 薛定谔的大灰机
 * @name 今日油价
 * @origin 大灰机
 * @version 1.0.0
 * @description 查询今日油价
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^([^ \n]+)油价$
 * @rule ^油价([^ \n]+)$
 * @priority 1
 * @admin false
 * @disable true
 */

/**
 *接口可能不准
 */

const mo = require('./mod/subassembly')      // 此脚本依赖仓库模块，请拉取全部文件
const axios = require('axios');
const sysdb = new BncrDB('MXNZP')

// 油价查询API
const api = 'https://www.mxnzp.com/api/oil/search'

module.exports = async s => {
    app_id = await sysdb.get('app_id') || ``            // 可以通过'set MXNZP app_id *****'设置，或者在此行的||后面填入app_id
    app_secret = await sysdb.get('app_secret') || ``    // 可以通过'set MXNZP app_secret *****'设置，或者在此行的||后面填入app_secret
    if (!(app_id || app_secret)) {
        s.reply('使用`set MXNZP app_id *****`设置app_id\n使用`set MXNZP app_secret *****`设置app_secret后使用')
        return
    }
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
        mo.sendMsg(s, msg)
    }
}
