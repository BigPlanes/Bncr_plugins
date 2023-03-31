/**作者
 * @author 薛定谔的大灰机
 * @name 爱快重拨
 * @origin 大灰机
 * @version 1.0.2
 * @description 控制iKuai重新拨号
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^(爱快|ikuai|iKuai)(重拨|重置)([0-9]+)$
 * @rule ^(爱快|ikuai|iKuai)(重拨|重置)$
 * @admin true
 * @disable false
 */

sysMethod.testModule(['md5'], { install: true });
const axios = require('axios');
const sysdb = new BncrDB('DHJ');    // 表
const md5 = require('md5');

module.exports = async s => {
    let hide = true     // 隐藏IP网段
    let mode = 1        // 模式，link: 0，vlan: 1
    let msg_list = 20   // 撤回IP列表消息时间
    let msg_wait = 2    // 撤回消息时间
    let Redial_wait = 3 // 重拨间隔时间（重拨是禁用线路再启用，其中的间隔时间）

    const key = `ikuai`;    // 键

    ['重拨'].includes(s.param(2)) && await main(key);
    ['重置'].includes(s.param(2)) && await reset(key);
    async function main() {
        s.delMsg(s.getMsgId())
        if (value = await sysdb.get(key)) {
            if (s.param(3)) {
                await Redial(s.param(3))
            } else {
                await select_id(await get_ip(value, await get_cookie(value)))
            }
        } else {
            await set(key)
        }
    }

    // 获取Cookie
    async function get_cookie(value) {
        json_getCookie = {
            "url": `${value?.host}/Action/login`,
            "headers": {
                "cookie": `username=${value?.username};login=1`,
            },
            "data": {
                "username": value?.username,
                "passwd": md5(value.password),
                "pass": Buffer.from(`salt_11${value.password}`).toString(`base64`),
                "remember_password": true
            }
        }
        if (data = await post(json_getCookie.url, json_getCookie.headers, json_getCookie.data)) {
            if (data.status === 200) {
                if (data.data.Result === 10000) {
                    cookie = `${JSON.stringify(data.headers["set-cookie"]).match(/sess_key=.*?;/)[0]}username=${value.username};login=1`;
                    return cookie
                } else return console.log(`获取Cookie异常：\n${JSON.stringify(data.data)}`)
            } else return console.log(`获取Cookie异常：${data.status}`)
        }
    }

    //获取当前线路
    async function get_ip(value, cookie) {
        json_getIp = {
            "url": `${value.host}/Action/call`,
            "headers": {
                "cookie": cookie,
            },
            "data": {
                "func_name": "monitor_iface",
                "action": "show",
                "param": {
                    "TYPE": "iface_check,iface_stream"
                }
            }
        }
        if (data = await post(json_getIp.url, json_getIp.headers, json_getIp.data)) {
            if (data.status === 200) {
                if (data.data.Result === 30000) {
                    let wansNum = data.data.Data.iface_check.length;
                    let id = []
                    if (wansNum === 1) {
                        if (hide) {
                            ip = `*${data.data.Data.iface_check[0].ip_addr.match(/[.].*/)}`
                        } else ip = data.data.Data.iface_check[0].ip_addr
                        updatetime = time(data.data.Data.iface_check[0].updatetime, 2)
                        msg = `\n${data.data.Data.iface_check[0].id}. IP: ${ip}`
                        msg += `\n${updatetime}`
                    } else {
                        msg = `当前线路数量：${wansNum}\n`
                        // msg += `\n┄┅┄┅┄┅┄┅┄┅┄┅┄`
                        msg += `\n0. 全部`
                        for (let i = 0; i < wansNum; i++) {
                            id[i] = data.data.Data.iface_check[i].id
                            if (hide) {
                                ip = `*${data.data.Data.iface_check[i].ip_addr.match(/[.].*/)}`
                            } else ip = data.data.Data.iface_check[i].ip_addr
                            updatetime = time(data.data.Data.iface_check[i].updatetime, 2)
                            msg += `\n┄┅┄┅┄┅┄┅┄┅┄┅┄`
                            msg += `\n${data.data.Data.iface_check[i].id}. IP: ${ip}`
                            msg += `\n${updatetime}`
                        }
                        // msg += `\n\n请选择重拨线路`
                    }
                    s.delMsg(await s.reply({
                        type: `image`,
                        path: `https://img.qichacha.com/Product/32b13678-5d09-4734-b91d-ad9fdd0cf24d.jpg`,
                        msg: msg
                    }), { wait: msg_list })
                    return id
                } else return console.log(`获取IP异常：\n${JSON.stringify(data.data)}`)
            } else return console.log(`获取IP异常：${data.status}`)
        }
    }

    // 获取需要重拨的线路id
    async function select_id(id) {
        await sysMethod.sleep(1);
        msgid_ids = await s.reply({
            type: 'text',
            msg: "选择需要重启的线路"
        });
        //内容
        let content = await s.waitInput(async (s) => {
            let msg = s.getMsg();
            if (msg === 'q') {
            } else if (msg == 0) {
                for (let i = 1; i <= id.length; i++) {
                    await Redial(id[i])
                }
            }
        }, 120);
        if (content === null) return s.delMsg(await s.reply('超时已退出'), msgid_ids, { wait: msg_wait });
        if (content.getMsg() === 'q') return s.delMsg(await s.reply('已退出'), msgid_ids, content.getMsgId(), { wait: msg_wait });
        //撤回用户发的信息
        s.delMsg(content.getMsgId(), msgid_ids);
        if (ge_tmsg = content.getMsg().match(/(\d+)([-\s])(\d+)/)) {
            for (let i = ge_tmsg[1]; i <= ge_tmsg[3]; i++) {
                await Redial(i)
            }
        } else if ((ge_tmsg = content.getMsg().split(',')).length > 1) {
            for (let i = 0; i < ge_tmsg.length; i++) {
                await Redial(ge_tmsg[i])
            }
        } else {
            await Redial(content.getMsg())
        }
    }

    // pppoe重拨
    async function Redial(id) {
        json_Redial = {
            "url": `${value.host}/Action/call`,
            "headers": {
                "cookie": cookie,
            },
            "data": {
                "func_name": "wan",
                "action": {
                    "modes": [
                        "link",
                        "vlan"
                    ],
                    "link": [
                        "link_pppoe_down",
                        "link_pppoe_up"
                    ],
                    "vlan": [
                        "vlan_down",
                        "vlan_up"
                    ]
                },
                "param": {
                    "id": id
                }
            },
            "data_back": {
                "modes": [
                    "link",
                    "vlan"
                ],
                "link": [
                    "link_pppoe_down",
                    "link_pppoe_up"
                ],
                "vlan": [
                    "vlan_down",
                    "vlan_up"
                ]
            },
            "tip": [
                "禁用",
                "启用"
            ]
        }
        for (let i = 0; i < 2; i++) {
            json_Redial.data.action = json_Redial.data_back[json_Redial.data_back.modes[mode]][i];
            (i === 1) && (await sysMethod.sleep(Redial_wait));
            if (data = await post(json_Redial.url, json_Redial.headers, json_Redial.data)) {
                if (data.status === 200) {
                    if (data.data.Result === 30000) {
                        console.log(`${json_Redial.tip[i]}:${data.data.ErrMsg}`)
                        // await s.reply(`ID:${json_Redial.data.param.id}:${json_Redial.tip[i]}完成`)
                    } else return console.log(`PPPoE\nID:${json_Redial.data.param.id}:${json_Redial.tip[i]}异常：\n${JSON.stringify(data.data)}`)
                } else return console.log(`PPPoE\nID:${json_Redial.data.param.id}:${json_Redial.tip[i]}异常：${data.status}`)
            };
            (i === 1) && s.delMsg(await s.reply(`ID:${json_Redial.data.param.id}:重启完成`), { wait: 5 });
        }
        return true;
    }

    // post请求
    async function post(url, headers, data) {
        var data = await axios({
            "url": url,
            "method": "post",
            "headers": headers,
            "data": JSON.stringify(data),
        });
        return data
    }

    // 设置iKuai参数
    async function set(key) {
        json_set = {
            "param": [
                "host",
                "username",
                "password",
                // "pass"
            ],
            "tip": [
                "爱快地址",
                "登录名",
                "password",
                // "pass参数"
            ]
        }
        let value = {}
        for (let i = 0; i < json_set.param.length; i++) {
            if (values = await dialogue(json_set.tip[i])) {
                value[json_set.param[i]] = values
            } else {
                return values
            }
        };
        // 写入数据库
        values && s.delMsg(await s.reply(await sysdb.set(key, value, { def: '设置成功' })), { wait: msg_wait }) && main(key);   // 值
        // 对话
        async function dialogue(tip) {
            first = await s.reply(`输入${tip}`);
            //内容
            let content = await s.waitInput(async (s) => {
                let msg = s.getMsg();
                if (msg === 'q') {
                } else if (!msg) {
                    s.delMsg(await s.reply('错误,重新输出'), { wait: msg_wait })
                    return 'again'
                }
            }, 30);
            if (content === null) return s.delMsg(await s.reply('超时已退出'), { wait: msg_wait });
            if (content.getMsg() === 'q') return s.delMsg(await s.reply('已退出'), content.getMsgId(), { wait: msg_wait });
            //撤回用户发的信息
            s.delMsg(content.getMsgId(), first);
            return content.getMsg()
        }
    };
    // 重置iKuai参数
    async function reset(key) {
        await sysdb.del(key);
        (log = await sysdb.get(key, '重置成功')) && s.delMsg(await s.reply(log), { wait: msg_wait });
    };
}

// 时间戳转换
function time(t, l) {
    var num = Number(t)
    // 时间戳长度
    var v = num.toString().length
    if (v == 10) {
        var Data = new Date(num * 1000)// 十位需要乘1000，十三位可以直接用
    } else if (v == 13) {
        var Data = new Date(num)// 十位需要乘1000，十三位可以直接用
    } else {
        // console.log(`时间戳值异常`)
        return t
    }
    // console.log(v)
    if (!l) {
        var l = ``
        // console.log(`时间戳转换格式为空，默认1`)
    }
    if (l == `1`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日${Data.getHours()}:${Data.getMinutes()}:${Data.getSeconds()}`
    } else if (l == `2`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日${Data.getHours()}:${Data.getMinutes()}分`
    } else if (l == `3`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日${Data.getHours()}时`
    } else if (l == `4`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日`
    } else if (l == `5`) {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月`
    } else if (l == `6`) {
        var time = `${Data.getFullYear()}年`
    } else {
        var time = `${Data.getFullYear()}年${Data.getMonth() + 1}月${Data.getDate()}日${Data.getHours()}:${Data.getMinutes()}:${Data.getSeconds()}`
    }
    return time
}