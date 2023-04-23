/**作者
 * @author 薛定谔的大灰机
 * @name 机场签到
 * @origin 大灰机
 * @version 1.0.2
 * @description 每日GlaDOS签到(每签到一次续杯一天，理论无限续杯)
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^(机场|鸡场)(签到|推送|管理|重置)$
 * @admin true
 * @cron 10 14 14,20 * * *
 * @disable false
 */

/**
 * 注册地址(可以注册多个账号哦)
 * https://glados.space/landing/60XD9-DF0Q1-2HN0Q-OA72J
 * https://60xd9-df0q1-2hn0q-oa72j.glados.space
 */

const mo = require('./mod/subassembly')      // 此脚本依赖仓库模块，请拉取全部文件
const sysdb = new BncrDB('GlaDOS')

module.exports = async s => {
    switch (s.param(2)) {
        case '签到':
            main(s, (await sysdb.get(s.getUserId()))?.Cookie)
            break;
        case '推送':
            push(s, true)
            break;
        case '管理':
            manage(s)
            break;
        case '重置':
            s.delMsg(await s.reply(await reset(s.getUserId())), { wait: 2 })
            break;
        default:
            console.log(`定时执行`);
            push(s)
            break;
    }
}

async function main(s, Cookie) {
    if (Cookie && Cookie.length > 0) {
        s.delMsg(s.getMsgId())
        for (let i = 0; i < Cookie.length; i++) {
            sign_in(s, Cookie[i])
        }
        return msg
    } else {
        await set(s)
    }
}

// 管理
async function manage(s) {
    s.delMsg(s.getMsgId())
    if (!await sysdb.get(s.userId)) return set(s)
    param = await mo.again(s, `请选择序号：\n1：推送(修改推送)\n2：新增(原有基础上增加一个Cookie)\n3：删除(原有基础上删除一个Cookie)\n4：重置(删除你录入的全部坤场Cookie)`)
    switch (param) {
        case '推送':
        case '1':
            push(s)
            break;
        case '新增':
        case '2':
            add(s)
            break;
        case '删除':
        case '3':
            del(s)
            break;
        case '重置':
        case '4':
            s.delMsg(await s.reply(await reset(s.getUserId())), { wait: 2 })
            break;
        default:
            console.log(`退出`)
            return
            break;
    }
}

// 设置参数
async function set(s) {
    set_json = {
        "tip": [
            "输入Cookie(多个用&分割)",
            "是否推送?\n不区分大小写(Y/N)",
        ],
        "param": {
            "From": {},
            "Push": false,
            "Cookie": [],
        }
    };
    for (let i = 0; i < set_json.tip.length; i++) {
        if (Cookies = await mo.again(s, set_json.tip[i])) {
            if (i === 0) set_json.param.Cookie = Cookies.split(`&`)
            if (!set_json.param.Push && i === 1 && ['y', 'Y'].includes(Cookies)) set_json.param.Push = true

        } else {
            return
        }
    };
    set_json.param.From = s.getFrom()
    s.delMsg(await s.reply(await sysdb.set(s.getUserId(), set_json.param, { def: '设置成功' })), { wait: 2 }) && main(s, (await sysdb.get(s.getUserId()))?.Cookie);   // 值
}

// 重置参数
async function reset(key) {
    await sysdb.del(key);
    return await sysdb.get(key, '重置成功')
}

// 增加
async function add(s) {
    let value = await sysdb.get(s.getUserId())
    if (Cookie = value?.Cookie) {
        let param = {
            Cookie
        }
        if (Cookies = await mo.again(s, `当前存在${Cookie.length}个Cookie\n输入Cookie(多个用&分割)`)) {
            for (let i = 0; i < Cookies.split(`&`).length; i++) {
                param.Cookie[Cookie.length] = Cookies.split(`&`)[i]
            }
            s.reply(`新增${Cookies.split(`&`).length}条Cookie${await sysdb.set(s.getUserId(), value, { def: '成功' })}`)
        } else {
            return
        }
    } else {
        set(s)
    }

}

// 删除
async function del(s) {
    let value = await sysdb.get(s.getUserId())
    if (Cookie = value?.Cookie) {
        if (Cookie.length < 1) return s.delMsg(await s.reply(`Cookie为空`), { wait: 2 }), set(s)
        s.delMsg(await s.reply(`当前存在${Cookie.length}个Cookie`), { wait: 2 })
        if (Cookies = await mo.again(s, `请选择删除第几条`)) {
            delete Cookie[Cookies - 1]
            s.delMsg(await s.reply(`删除第${Cookies}条Cookie${await sysdb.set(s.getUserId(), value, { def: '成功' })}`), { wait: 2 })
        } else {
            return
        }
    } else {
        set(s)
    }

}

// 推送
async function push(s, noedit) {
    s.delMsg(s.getMsgId())
    if ((await s.getFrom() == `cron`) || noedit) {
        if (await s.isAdmin()) coercive = true
        for (let i = 0, values = await sysdb.keys(); i < values.length; i++) {
            if ((value = await sysdb.get(values[i])) && value.Cookie.length > 0) {
                if (coercive || value.Push) {
                    for (let j = 0; j < value.Cookie.length; j++) {
                        // msg = `form：${(await sysdb.get(values[i])).From}`
                        // msg += `\nuserId：${values[i]}`
                        // console.log(msg);
                        await sysMethod.push({
                            platform: (await sysdb.get(values[i])).From,
                            userId: values[i],
                            msg: await sign_in(s, value.Cookie[j], true),
                            type: 'text',
                        });
                        await sysMethod.sleep(1);
                    }
                } else {
                    main(s, value.Cookie)
                }
            }
        }
    } else {
        if (value = await sysdb.get(s.getUserId())) {
            if (['Y', `y`].includes(msg = await mo.again(s, `当前状态为：${value.Push ? `"推送"` : `"不推送"`}\n输入Y切换状态(不区分大小写)`))) {
                if (value.Push == false) value.Push = true
                else if (value.Push == true) value.Push = false
                s.delMsg(await s.reply(`设置状态为${value.Push ? `"推送"` : `"不推送"`}${await sysdb.set(s.getUserId(), value, { def: '成功' })}`), { wait: 3 })
            } else {
                s.delMsg(await s.reply(`退出`), { wait: 2 })
            }
        }
    }

}

// 签到
async function sign_in(s, Cookie, push) {
    vip = {
        10: "5GB",
        21: "200GB",
        31: "500GB",
        41: "2000GB",
        51: "5000GB",
    }
    let headers = {
        "Content-Type": "application/json;charset=UTF-8",
        "Accept": "application/json, text/plain, */*",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.52",
        "Cookie": Cookie,
    }
    let options = [
        {
            "url": "https://glados.rocks/api/user/checkin",
            "method": "post",
            "data": '{"token":"glados.network"}',
            "headers": headers
        },
        {
            "url": "https://glados.rocks/api/user/status",
            "method": "get",
            "headers": headers
        },
    ]
    let checkin = await mo.request(options[0])
    let statuss = await mo.request(options[1])
    if ((checkin.status == 200 || checkin.data) && (statuss.status == 200 || statuss.data)) {
        let data = checkin.data
        let status = statuss.data
        if ((data.code == 0 || data.code == 1) && (status.code == 0 || status.code == 1)) {
            if (data.message == `Checkin! Get 1 Day`) data.message = `签到成功！获得 1 天`
            if (data.message == `Please Try Tomorrow`) data.message = `请明天试试`
            if (time = data.list[0].time) time = mo.time(time, 2)
            else time = "暂无数据"
            if ((traffic = Number(status.data.traffic)) > 1073741824) traffic = `${((traffic) / 1073741824).toFixed(2)}GB`
            else traffic = `${(traffic / 1048576).toFixed(2)}MB`
            msg = `用户ID：${data.list[0].user_id}\n`
            msg += `剩余天数：${Number(status.data.leftDays)}天\n`
            msg += `本月流量：${vip[status.data.vip]}\n`  // 通过vip级别对应的流量套餐
            msg += `已用流量：${traffic}\n`
            msg += `签到结果：${data.message}\n`
            msg += `签到时间：${time}\n`
        } else {
            console.log(`\n${Cookie}`, data)
            msg = `${data.message}\n检查Cookie\n重置后再试`
        }
    } else {
        msg = `查询出错，Cookie可能错误\n重置后再试`
    }
    if (push) return msg
    else s.reply({
        msg: msg,
        type: `text`,
        dontEdit: true
    });
}
