/**
 * @title subassembly-开发
 * @create_at 2033-11-30 10:12:09
 * @description 方便开发
 * @author 薛定谔的大灰机
 * @origin 大灰机
 * @version v1.0.5
 * @module true
 * @encrypt false
 * @public false
 */
const axios = require('axios')
const fs = require('fs')
const _path = require('path')
const system = new BncrDB('system')
const { randomUUID } = require('crypto');

module.exports = {
    downloadFile,
    request,
    reply,
    again,
    time,
}

// 请求
async function request(options) {
    if (!options?.url) throw new Error('网址为必填项')
    try {
        var data = await axios({
            url: options.url,
            method: options?.method || 'GET',
            data: options?.data || {},
            params: options?.params || {},      // 访问时的拼接参数
            headers: options?.headers || {},
            responseType: options?.responseType || "",
            timeout: options?.timeout || 15000,
        });
    }
    catch (err) {
        return
    }
    if (data.status === 200) {
        return data
    } else {
        return
    }
}

// 对话
async function again(s, tip, wait) {
    !wait && (wait = 120);
    first = await s.reply({ msg: `${tip}`, type: `text`, dontEdit: true });
    //内容
    let content = await s.waitInput(() => { }, wait)
    if (content === null) return s.delMsg(await s.reply({ msg: '超时已退出', type: `text`, dontEdit: true }), first, { wait: 2 });
    if (content.getMsg() === 'q') return s.delMsg(await s.reply({ msg: '已退出', type: `text`, dontEdit: true }), s.getMsgId(), first, content.getMsgId(), { wait: 2 });
    //撤回用户发的信息
    s.delMsg(content.getMsgId(), first);
    return content.getMsg()
}

// 发送消息,自动判断平台并缓存到本地再发送
async function reply(s, content) {
    type = content?.type || `text`
    if (type === `text`) {
        msg = content?.msg || content
    } else {
        msg = content?.msg || ``
    }
    path = content.path?.path || ``
    suffix = content.path?.suffix       // 文件后缀
    dontEdit = content.path?.dontEdit
    download = content.path?.download
    async function down() {
        temporary = await s.reply(msg)
        open = false;
        (path = await downloadFile(path, suffix)), open = true;   /* 存储文件 */
        if (msgid = await s.reply({
            type: type,
            path: path,
            msg: msg,
        })) {
            s.delMsg(temporary)
            open && fs.unlinkSync(path);
        }
    }
    if (download) {
        await down()
    } else if (['qq'].includes(s.getFrom())) {
        await s.reply(msg)
        await s.reply({
            type: type,
            path: await system.get('Host') + (await downloadFile(path, suffix)).match(/\/public.*/g),
        })
        await sysMethod.sleep(15);
        fs.unlinkSync(path);
    } else if (['HumanTG'].includes(s.getFrom())) {
        if (!(msgid = await s.reply({
            type: type,
            path: path,
            msg: msg,
        }))) {
            await down()
        }
    } else {
        await s.reply(msg)
        await s.reply({
            type: type,
            path: path,
        })
    }
}

// 下载文件
async function downloadFile(url, suffix, filename = randomUUID().split('-').join('')) {
    filePath = _path.join(process.cwd(), 'BncrData/public', `${filename}.${suffix}`);
    response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(filePath));
    return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(filePath));
        response.data.on('error', reject);
    });
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
    if (!l) {
        var l = ``
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
