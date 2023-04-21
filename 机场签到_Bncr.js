/**作者
 * @author 薛定谔的大灰机
 * @name 机场签到
 * @origin 大灰机
 * @version 1.0.1
 * @description 每日GlaDOS签到(每签到一次续杯一天，理论无限续杯)
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^(机场|鸡场)(签到|重置|增加|删除)$
 * @admin true
 * @cron 0 0 8,20 * * *
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
    sign_in_sleep = 1   // 每个账号签到之间的间隔时间
    wait = 2            // 设置成功，重置成功等提示消息的撤回时间

    switch (s.param(2)) {
        case '签到':
            main(s, (await sysdb.get(s.getUserId()))?.Cookie)
            break;
        case '重置':
            s.delMsg(await s.reply(await reset(s.getUserId())), { wait })
            break;
        case '增加':
            break;
        case '删除':
            break;
        default:
            console.log(`定时执行`);
            for (let i = 0, Cookies = await sysdb.keys(); i < Cookies.length; i++) {
                console.log(await main(s, (await sysdb.get(Cookies[i]))?.Cookie))
            }
            break;
    }
}

async function main(s, Cookie) {
    if (Cookie) {
        s.delMsg(s.getMsgId())
        for (let i = 0; i < Cookie.length; i++) {
            msg = await sign_in(Cookie[i])
            s.reply({
                msg: msg,
                type: `text`,
                dontEdit: true
            })
            await sysMethod.sleep(sign_in_sleep)
        }
        return msg
    } else {
        await set(s)
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
            "Push": {},
            "Cookie": [],
        }
    };
    for (let i = 0; i < set_json.tip.length; i++) {
        if (values = await mo.dialogue(s, set_json.tip[i], wait)) {
            if (i === 0) set_json.param.Cookie = values.split(`&`)
            if (i === 1) set_json.param.Push = values
        } else {
            return
        }
    };
    set_json.param.From = s.getFrom()
    s.delMsg(await s.reply(await sysdb.set(s.getUserId(), set_json.param, { def: '设置成功' })), { wait }) && main(s, (await sysdb.get(s.getUserId()))?.Cookie);   // 值
}

// 重置参数
async function reset(key) {
    await sysdb.del(key);
    return await sysdb.get(key, '重置成功')
}

// 签到
async function sign_in(Cookie) {
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
            return msg
        } else {
            console.log(`\n${Cookie}`, data)
            return `${data.message}\n检查Cookie\n重置后再试`
        }
    } else {
        return `查询出错，Cookie可能错误\n重置后再试`
    }
}
