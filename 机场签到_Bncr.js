/**作者
 * @author 薛定谔的大灰机
 * @name 机场签到
 * @origin 大灰机
 * @version 1.0.0
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
    wait = 2

    switch (s.param(2)) {
        case '签到':
            main(s)
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
            main(s)
            break;
    }
}

async function main(s) {
    if (Cookie = (await sysdb.get(s.getUserId()))?.Cookie) {
        for (let i = 0; i < Cookie.length; i++) {
            s.reply({
                msg: await sign_in(Cookie[i]),
                type: `text`, dontEdit: true
            })
        }
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
    s.delMsg(await s.reply(await sysdb.set(s.getUserId(), set_json.param, { def: '设置成功' })), { wait }) && main(s);   // 值
}

// 重置参数
async function reset(key) {
    await sysdb.del(key);
    // msg = 
    return await sysdb.get(key, '重置成功')
}

async function sign_in(Cookie) {
    let { data, status } = await mo.request({
        "url": "https://glados.rocks/api/user/checkin",
        "method": "post",
        "headers": {
            "Content-Type": "application/json;charset=UTF-8",
            "Accept": "application/json, text/plain, */*",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36 Edg/106.0.1370.52",
            "Cookie": String(Cookie),
        },
        "data": '{"token":"glados.network"}',
    })
    if (status == 200 || data) {
        if (data.code == 0 || data.code == 1) {
            if (data.message == `Checkin! Get 1 Day`) data.message = `签到成功！获得 1 天`
            if (data.message == `Please Try Tomorrow`) data.message = `请明天试试`
            if (!(time = data.list[0].time)) {
                time = "暂无数据"
            } else {
                time = mo.time(time, 2)
            }
            msg = `用户ID：${data.list[0].user_id}\n`
            // msg += `剩余天数：${query(Cookie).leftDays}\n`
            // msg += `单月流量：*GB\n`
            msg += `单月流量：200GB\n`  // 假的，没法拿到流量总额
            // msg += `已用流量：${query(Cookie).traffic}\n`
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
