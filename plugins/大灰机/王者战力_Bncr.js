/**作者
 * @author 薛定谔的大灰机
 * @name 王者战力
 * @origin 大灰机
 * @version 1.0.0
 * @description 查询王者战力
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^战力$
 * @rule ^战力 ([^ \n]+)$
 * @rule ^战力 ([^ \n]+) ([^ \n]+)$
 * @admin false
 * @disable false
 */

const axios = require("axios")

module.exports = async s => {
    let msg_wait = 2

    // console.log(`${s.param(1)}\n${s.param(2)}\n${s.param(3)}`);

    let api = `https://www.sapi.run/hero/select.php`
    if (!(hero = s.param(1))) {
        msgid_ids = await s.reply(`输入英雄名`)
        if (!(hero = await talks())) return
    }
    if (!(type = s.param(2))) {
        msgid_ids = await s.reply(`平台任选一\naqq、awx、iqq、iwx`)
        if (!(type = await talks())) return
    }
    s.delMsg(s.getMsgId())
    let url = `${api}?hero=${encodeURI(hero)}&type=${type}`
    let data = (await get(url)).data
    console.log(data)
    if (data && data.code == 200) {
        msg = `英雄名称：${data.data.alias}`
        msg += `\n平台大区：${data.data.platform}`
        msg += `\n最低县标：${data.data.area}：${data.data.areaPower}`
        msg += `\n最低市标：${data.data.city}：${data.data.cityPower}`
        msg += `\n最低省标：${data.data.province}：${data.data.provincePower}`
        msg += `\n最低国标：${data.data.guobiao}`
        msg += `\n数据更新：${data.data.updatetime}`
        path = data.data.photo
    } else {
        msg = data.msg
    };
    console.log(msg);
    ["tgBot", "HumanTG"].includes(s.getFrom()) && s.reply({ type: "image", path: path, msg: msg });
    if (["wxXyo", "wxKeAImao", "wxQianxun", "qq"].includes(s.getFrom())) {
        await s.reply(msg)
        await s.reply({
            type: "image",
            path: path
        })
    }
    async function talks() {
        let content = await s.waitInput(async (s) => {
            let msg = s.getMsg();
            if (msg === 'q') {
            } else if (!msg || (((await get(`${api}?hero=${encodeURI(hero || msg)}&type=aqq`)).data.code) == 400)) {
                s.delMsg(await s.reply('错误,重新输出'), { wait: msg_wait })
                return 'again'
            }
        }, 30);
        if (content === null) return s.delMsg(await s.reply('超时已退出'), msgid_ids, { wait: msg_wait });
        if (content.getMsg() === 'q') return s.delMsg(await s.reply('已退出'), msgid_ids, content.getMsgId(), { wait: msg_wait });
        //撤回用户发的信息
        s.delMsg(content.getMsgId(), msgid_ids);
        return content.getMsg()
    }
}

// get请求
async function get(url) {
    var data = await axios({
        url: url,
        method: "get",
    });
    console.log(url);
    if (data.status === 200) {
        return data
    } else {
        return
    }
}
