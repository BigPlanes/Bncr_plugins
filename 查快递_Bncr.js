/**作者
 * @author 薛定谔的大灰机
 * @name 查快递
 * @origin 大灰机
 * @version 1.0.0
 * @description 查询快递
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^(快递|查快递)$
 * @rule ^(快递|查快递)([^ \n]+)$
 * @admin false
 * @disable false
 */

/**
说明：
查询快递token注册地址(https://admin.alapi.cn/user/register)
 */

const axios = require("axios")

const token = ``
const api_kd = `https://v2.alapi.cn/api/kd`

module.exports = async s => {
    let fold = true         // 折叠
    let order = `asc`       // 查询结果排序方式[desc, asc]
    msg_wait = 2

    let data = {}
    if (!token) {
        s.reply(`token空`)
        return
    } else {
        data.order = order
        data.token = token
    }
    if (s.param(2)) {
        data.number = s.param(2)
    } else {
        s.delMsg(s.getMsgId())
        if (number = await dialogue(s, `快递单号`)) {
            data.number = number
        } else {
            return
        }
    }
    if (date = (await post(api_kd, data)).data) {
        if (date.code == 200 && date.data && date.data.info.length > 0) {
            let msgid = await s.reply(kd_msg(date.data, fold))
            if (await dialogue(s, `Y展开`) == (`y` || `Y`)) {
                s.delMsg(msgid, { wait: 10 })
                s.reply(kd_msg(date.data, false))
            }
        } else if (date.code == 422) {
            if (com = getCodeByMsg(await dialogue(s, `快递公司（有字母则大写）`))) {
                data.com = com
            } else {
                return
            }
            if (date = (await post(api_kd, data)).data) {
                if (date.code == 200 && date.data && date.data.info.length > 0) {
                    let msgid = await s.reply(kd_msg(date.data, fold))
                    if (await dialogue(s, `输入Y展开`) == (`y` || `Y`)) {
                        s.delMsg(msgid, { wait: 10 })
                        s.reply(kd_msg(date.data, false))
                    }
                } else {
                    s.reply(date.msg)
                }
            }
        }
    }
}

function kd_msg(data, num) {
    if (num) {
        num = 1
    } else {
        num = data.info.length
    }
    state = ["快递状态", "正常", "派送中", "已签收", "退回", "其他问题"]
    msg = `快递状态：${data.status_desc}`
    msg += `\n快递公司：${getCodeByMsg(data.com, true)}\n`
    for (let i = 0; i < num; i++) {
        msg += `\n${data.info[i].content}`
        msg += `\n${data.info[i].time}\n`
        // msg += `\n：${}`
    }
    return msg
}

function getCodeByMsg(msg, reverse) {
    for (let i = 0; i < expressList.length; i++) {
        const express = expressList[i];
        if (express.name.includes(msg) || express.code.includes(msg)) {
            if (reverse) {
                return express.name;
            } else {
                return express.code;
            }
        }
    }
    return null;
}

async function dialogue(s, tip) {
    first = await s.reply({ msg: `输入${tip}`, type: `text`, dontEdit: true });
    //内容
    let content = await s.waitInput(() => { }, 30)
    if (content === null) return s.delMsg(await s.reply({ msg: '超时已退出', type: `text`, dontEdit: true }), first, { wait: msg_wait });
    if (content.getMsg() === 'q') return s.delMsg(await s.reply({ msg: '已退出', type: `text`, dontEdit: true }), first, content.getMsgId(), { wait: msg_wait });
    //撤回用户发的信息
    s.delMsg(content.getMsgId(), first);
    return content.getMsg()
}

// post请求
async function post(url, data) {
    var data = await axios({
        url: url,
        method: "post",
        data: data,
    });
    if (data.status === 200) {
        return data
    } else {
        return
    }
}

// 快递编号列表
const expressList = [
    {
        "name": "中通快递",
        "code": "zto"
    },
    {
        "name": "申通快递",
        "code": "sto"
    },
    {
        "name": "圆通速递",
        "code": "yto"
    },
    {
        "name": "天天快递",
        "code": "tiantian"
    },
    {
        "name": "EMS快递",
        "code": "ems"
    },
    {
        "name": "韵达快递",
        "code": "yunda"
    },
    {
        "name": "优速快递",
        "code": "yousu"
    },
    {
        "name": "百世快运",
        "code": "800best"
    },
    {
        "name": "百世汇通快递",
        "code": "huitong"
    },
    {
        "name": "宅急送快递",
        "code": "zhaijisong"
    },
    {
        "name": "龙邦快递",
        "code": "longbang"
    },
    {
        "name": "苏宁快递",
        "code": "suning"
    },
    {
        "name": "国通快递",
        "code": "guotong"
    },
    {
        "name": "邮政",
        "code": "pingyou"
    },
    {
        "name": "顺丰",
        "code": "shunfeng"
    }
]
