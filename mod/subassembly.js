const axios = require('axios')
const fs = require('fs')
const _path = require('path')


module.exports = {
    downloadFile,
    dialogue,
    request,
    sendMsg,
    time,
}

// 请求
async function request(options) {
    if (!options?.url) throw new Error('url is required')
    var data = await axios({
        url: options.url,
        method: options?.method || 'GET',
        data: options?.data || {},
        headers: options?.headers || {},
        responseType: options?.responseType || "",
        timeout: options?.timeout || 15000,
    });
    if (data.status === 200) {
        return data
    } else {
        return
    }
}

// 对话
async function dialogue(s, tip, wait) {
    !wait && (wait = 60);
    first = await s.reply({ msg: `输入${tip}`, type: `text`, dontEdit: true });
    //内容
    let content = await s.waitInput(() => { }, wait)
    if (content === null) return s.delMsg(await s.reply({ msg: '超时已退出', type: `text`, dontEdit: true }), first, { wait: msg_wait });
    if (content.getMsg() === 'q') return s.delMsg(await s.reply({ msg: '已退出', type: `text`, dontEdit: true }), first, content.getMsgId(), { wait: msg_wait });
    //撤回用户发的信息
    s.delMsg(content.getMsgId(), first);
    return content.getMsg()
}

// 发送消息
async function sendMsg(s, content, download) {
    type = content?.type
    path = content?.path
    msg = content?.msg
    dontEdit = content?.dontEdit
    if (['HumanTG'].includes(s.getFrom())) {
        (msgid = await s.reply({
            type: type,
            path: path,
            msg: msg,
        })) && await s.delMsg(s.getMsgId());
        if (!msgid || download) {
            // await s.reply(`文件发送失败`)
            // await sysMethod.sleep(1)
            await s.reply(msg)
            open = false;
            (path = await downloadFile(path)), open = true;   /* 存储视频 */
            if (await s.reply({
                type: type,
                path: path,
                msg: msg,
            })) {
                await s.delMsg(s.getMsgId());
                open && fs.unlinkSync(video);
            }
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
async function downloadFile(url, filename = new Date().getTime()) {
    filePath = _path.join(process.cwd(), 'BncrData/public', `${filename}.jpg`);
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