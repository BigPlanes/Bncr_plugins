/**作者
 * @author 薛定谔的大灰机
 * @name 爱快重拨
 * @origin 大灰机
 * @version 1.1.6
 * @description 控制iKuai重新拨号
 * @rule ^(爱快|ikuai|iKuai)(重拨|重播)([0-9]+)$
 * @rule ^(爱快|ikuai|iKuai)(查询|重拨|重播|重启|重置)$
 * @admin true
 * @disable false
 */

/**
说明：
重新拨号的逻辑是先禁用线路再启用
如果Bncr与爱快不属于同一局域网且单拨，请勿使用，否则失联！！！
不属于同一局域网但有多拨，使用时请勿重拨插件正在使用的线路，否则失联！！！

功能：
支持多线、单线重拨（自行修改插件内 'mode' 变量切换）
重拨后重启Bncr（自行修改插件内 'bncr_restart' 变量）
显示当前拨号IP列表
显示重拨后新的IP（重拨后IP未改变时'重试'）
 */

sysMethod.testModule(['md5'], { install: true });
const axios = require('axios');
const sysdb = new BncrDB('DHJ');    // 表
const key = `ikuai`;    // 键
const md5 = require('md5');
const sysDB = new BncrDB('system')

module.exports = async s => {
    let mode = 1                // 模式，link: 0，vlan: 1   (单拨选link，单线多拨选vlan)

    let retry = true            // 重拨后未换IP时是否重试
    let retry_num = 3           // 重试次数
    let retry_wait = 5          // 重试间隔时间

    let bncr_restart = false    // 重拨后是否重启Bncr
    let restart_wait = 5        // 重拨后多久执行重启Bncr

    let diy_directives = ``     // 自定义执行一条命令(例如:更换白名单)

    let hide = true             // 是否隐藏IP网段

    let content_list = 60       // 对话超时时间
    let Redial_wait = 1         // 重拨间隔时间（重拨是禁用线路再启用，其中的间隔时间）
    let msg_list = { wait: 30 } // 撤回IP列表消息时间，留空为不撤回(留空示例：let msg_list = '')
    let msg_wait = 2            // 撤回提示消息时间(成功或错误提示)

    let path = 'https://img.qichacha.com/Product/32b13678-5d09-4734-b91d-ad9fdd0cf24d.jpg'  // 图片（可为空）

    s.delMsg(s.getMsgId())
    if (value = await sysdb.get(key)) {
        oldip = []
        switch (s.param(2)) {
            case '查询':
                msg_list = { wait: 0 }
                await get_ip(value, await get_cookie(value), true)
                break;
            case '重拨':
            case '重播':
                if (s.param(3)) await select_id(await get_ip(value, await get_cookie(value), false), s.param(3))
                else await select_id(await get_ip(value, await get_cookie(value), true))
                break;
            case '重启':
                await restart(value)
                // await reboot()
                break;
            case '重置':
                await reset(key)
                break;
            default:
                return
                break;
        }
    } else await set(key)

    // 自定义命令和重启Bncr
    async function reboot() {
        // 自定义操作
        if (diy_directives) {
            console.log(`执行自定义命令`);
            await sysMethod.inline(diy_directives);
        }
        // 重启Bncr
        if (bncr_restart) {
            console.log(`执行重启Bncr`);
            await sysMethod.sleep(restart_wait)
            await sysDB.set('restartInfo', {
                platform: s.getFrom(),
                msg: 'Bncr重启完成', //重启完成回复语
                userId: s.getUserId(),
                groupId: s.getGroupId(),
                toMsgId: await s.reply(`正在重启Bncr`), //消息ID
            });
            process.exit(300);
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
    async function get_ip(value, cookie, send, newid) {
        json_getIp = {
            "url": `${value.host}/Action/call`,
            "headers": {
                "cookie": cookie,
            },
            "data_link": {
                "func_name": "monitor_iface",
                "action": "show",
                "param": {
                    "TYPE": "iface_check,iface_stream"
                }
            },
            "data_vlan": {
                "func_name": "wan",
                "action": "show",
                "param": {
                    "ORDER": "asc",
                    "ORDER_BY": "vlan_name",
                    "TYPE": "vlan_data,vlan_total",
                    "interface": "wan1",
                    "limit": "0,20",
                    "vlan_internet": 2
                }
            },
            "mode": [
                "data_link",
                "data_vlan"
            ]
        }
        do {
            if (data = await post(json_getIp.url, json_getIp.headers, json_getIp[json_getIp.mode[mode]])) {
                if (data.status === 200) {
                    if (data.data.Result === 30000) {
                        let msg
                        let id = []
                        if (mode == 0) {
                            data = data.data.Data.iface_check
                            ip_addr = 'ip_addr'
                            datetime = 'updatetime'
                        } else {
                            data = data.data.Data.vlan_data
                            ip_addr = 'pppoe_ip_addr'
                            datetime = 'pppoe_updatetime'
                        }
                        if (newid || newid == 0) {
                            if (!data[newid]) {
                                circulate = true
                                continue
                            }
                            if (hide) {
                                oldip[0] = ip = `*${data[newid][ip_addr].match(/[.].*/)}`
                            } else oldip[0] = ip = data[newid][ip_addr]
                            if (data[newid][ip_addr]) {
                                circulate = false
                                return ip
                            } else {
                                circulate = true
                                continue
                            }
                        }
                        let wansNum = data.length;
                        if (wansNum === 1) {
                            id[0] = data[0].id
                            if (hide) {
                                oldip[0] = ip = `*${data[0][ip_addr].match(/[.].*/)}`
                            } else oldip[0] = ip = data[0][ip_addr]
                            updatetime = time(data[0][datetime], 2)
                            msg = `${wansNum}. IP: ${ip}`
                            msg += `\n${updatetime}`
                        } else {
                            msg = `当前线路数量：${wansNum}\n`;
                            !(['查询'].includes(s.param(2))) && (msg += `\n0. 全部`);
                            for (let i = 0; i < wansNum; i++) {
                                id[i] = data[i].id
                                if (hide) {
                                    oldip[i] = ip = `*${data[i][ip_addr].match(/[.].*/)}`
                                } else oldip[0] = ip = data[i][ip_addr]
                                updatetime = time(data[i][datetime], 2)
                                msg += `\n┄┅┄┅┄┅┄┅┄┅┄┅┄`
                                msg += `\n${i + 1}. IP: ${ip}`
                                msg += `\n${updatetime}`
                            };
                        }
                        if (!(newid || newid == 0)) {
                            if (send) {
                                s.delMsg(await s.reply({
                                    type: `image`,
                                    path: path,
                                    msg: msg,
                                    dontEdit: true
                                }), msg_list)
                                !['HumanTG'].includes(s.getFrom()) && s.reply(msg);
                            }
                            return id
                        }
                    } else return console.log(`获取IP异常：\n${JSON.stringify(data.data)}`)
                } else return console.log(`获取IP异常：${data.status}`)
            }
            await sysMethod.sleep(1)
        } while (circulate)
    }

    // 获取并发送新IP
    async function newips(id, getMsg, num) {
        if ((newip = await get_ip(value, await get_cookie(value), false, getMsg - 1)) == oldip[getMsg - 1] && retry) {
            if (num <= retry_num) {
                s.delMsg(await s.reply(`ID:${id}\nIP未改变\n第${num}次重试`), { wait: retry_wait + msg_wait + Redial_wait })
                await sysMethod.sleep(retry_wait)
                Redial(id, getMsg, num + 1, true)
            } else {
                s.delMsg(await s.reply(`ID:${id}\nIP:${newip}\n重拨完成但IP未改变`), msg_list)
                await reboot()
            }
        } else {
            msg = `ID:${id}\n旧IP:${oldip[getMsg - 1] || `不存在的线路`}\n新IP:${newip}`
            s.delMsg(await s.reply({ msg: msg, type: 'text', dontEdit: true }), msg_list)
            console.log(msg);
            await reboot()
        }
    }

    // 获取需要重拨的线路id
    async function select_id(id, idi) {
        if (idi) {
            Redial(id[idi - 1], idi)
            return
        }
        if (id.length == 1) {
            await Redial(id[0], (id[0]))
            return
        }
        msgid_ids = await s.reply({
            type: 'text',
            msg: "选择需要重启的线路",
            dontEdit: true
        });
        //内容
        let content = await s.waitInput(async (s) => {
            let msg = s.getMsg();
            if (msg === 'q') {
            } else if (msg == 0) {
                for (let i = 0; i < id.length; i++) {
                    await Redial(id[i], i + 1)
                }
            }
        }, content_list);
        if (content === null) return s.delMsg(await s.reply({ type: 'text', msg: '超时已退出', dontEdit: true }), msgid_ids, { wait: msg_wait });
        if (content.getMsg() === 'q') return s.delMsg(await s.reply({ type: 'text', msg: '已退出', dontEdit: true }), msgid_ids, content.getMsgId(), { wait: msg_wait });
        //撤回用户发的信息
        s.delMsg(content.getMsgId(), msgid_ids);
        if (get_msg = content.getMsg().match(/(\d+)([-\s])(\d+)/)) {
            for (let i = get_msg[1]; i <= get_msg[3]; i++) {
                await Redial(id[i - 1], i)
            }
        } else if ((get_msg = content.getMsg().split(',')).length > 1) {
            for (let i = 0; i < get_msg.length; i++) {
                await Redial(id[get_msg[i] - 1], get_msg[i])
            }
        } else {
            await Redial(id[content.getMsg() - 1], content.getMsg())
        }
    }

    // pppoe重拨
    async function Redial(id, getMsg, num, notip) {
        if (!num) num = 1
        if (isNaN(id)) {
            s.delMsg(await s.reply({ type: 'text', msg: '输入错误', dontEdit: true }), { await: msg_wait })
            return
        }
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
            (i === 1) && (await sysMethod.sleep(Redial_wait));
            json_Redial.data.action = json_Redial.data_back[json_Redial.data_back.modes[mode]][i];
            if (data = await post(json_Redial.url, json_Redial.headers, json_Redial.data)) {
                if (data.status === 200) {
                    if (data.data.Result === 30000) {
                        (i === 0) && console.log(`ID:${id}`);
                        console.log(`${json_Redial.tip[i]}:${data.data.ErrMsg}`);
                        // await s.reply({ type: `ID:${json_Redial.data.param.id}:${json_Redial.tip[i]}完成`, type: 'text', dontEdit: true })
                    } else return console.log(`PPPoE\nID:${json_Redial.data.param.id}:${json_Redial.tip[i]}异常：\n${JSON.stringify(data.data)}`)
                } else return console.log(`PPPoE\nID:${json_Redial.data.param.id}:${json_Redial.tip[i]}异常：${data.status}`);
            };
        };
        if (!notip) s.delMsg(await s.reply({ msg: `ID:${id}:重启完成`, type: 'text', dontEdit: true }), { wait: 5 });
        newips(id, getMsg, num)
        return true;
    }

    // ikuai重启
    async function restart(value) {
        options = {
            "url": `${value.host}/Action/call`,
            "headers": {
                "cookie": await get_cookie(value),
            },
            "data": {
                "func_name": "reboots",
                "action": "reboots"
            }
        }
        data = await post(options.url, options.headers, options.data)
        if (data.status === 200) {
            if (data.data.Result === 30000) {
                s.reply(`正在重启`)
            } else s.reply(`失败`)
        } else s.reply(`访问失败`)
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
            ],
            "tip": [
                "爱快地址(带上协议和端口)",
                "用户名",
                "密码",
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
            if (content === null) return s.delMsg(await s.reply('超时已退出'), first, { wait: msg_wait });
            if (content.getMsg() === 'q') return s.delMsg(await s.reply('已退出'), first, content.getMsgId(), { wait: msg_wait });
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
