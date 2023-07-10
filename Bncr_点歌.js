/**作者
 * @author 薛定谔的大灰机
 * @name 点歌
 * @origin 大灰机
 * @version 1.0.0
 * @description 发送一首音乐
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^点歌([^\n]+) ([^\n]+)$
 * @rule ^点歌([^\n]+)$
 * @priority 9999
 * @admin false
 * @disable false
 */


const axios = require("axios")
const fs = require('fs');
const path = require('path');

module.exports = async s => {
    let platform = 1
    let msg_wait = 2

    s.delMsg(s.getMsgId())
    let url = [
        `http://ovooa.muban.plus/API/QQ_Music_new/?&limit=${s.param(2) || "15"}&`,
        `http://ovooa.muban.plus/API/wydg/api.php?sc=${s.param(2) || "15"}&`
    ][platform]
    let urls = `${url}msg=${encodeURI(s.param(1))}`
    console.log(urls);
    songs = (await get(urls)).data
    // console.log(songs);
    if (songs.code === 1 && !!songs.data) {
        if (songs.data.length > 1) {
            if (platform === 0) {
                msg = songs.msg
            } else {
                msg = songs.text
            }
            for (let i = 0; i < songs.data.length; i++) {
                msg += `\n【${i + 1}】：${songs.data[i].singer}《${songs.data[i].song}》`
            }
            s.reply(msg);
            ["wxXyo", "wxQianxun", "ssh"].includes(s.getFrom()) && (song_wx_link(urls, await dialogue()));
            ["tgBot", "HumanTG"].includes(s.getFrom()) && (await song_wx_link(urls, dialogue())) && (song_text());
        }
    }
    async function dialogue() {
        let content = await s.waitInput(async (s) => {
            let msg = s.getMsg();
            if (msg === 'q') {
            } else if (!(msg && (escape(msg).indexOf("%u") < 0)) || (msg > songs.data.length)) {
                s.delMsg(await s.reply('错误,重新输出'), { wait: msg_wait })
                return 'again'
            }
        }, 30);
        if (content === null) return s.delMsg(await s.reply('超时已退出'), { wait: msg_wait });
        if (content.getMsg() === 'q') return s.delMsg(await s.reply('已退出'), content.getMsgId(), { wait: msg_wait });
        //撤回用户发的信息
        s.delMsg(content.getMsgId());
        return content.getMsg()
    }
    async function song_text(urls, song) {
        if (!song) {
            let song = (await get(`${urls}&n=${await dialogue()}`)).data
        }
        if (song.code === 1 && !!song.data) {
            if (platform === 0) {
                msg = `${song.data.song}_${song.data.singer}`
                msg += `\n${song.data.music}`
                msg += `\n${song.data.size.br}`
            } else {
                msg = `${song.data.Music}_${song.data.Singer}`
                msg += `\n${song.data.Url}`
            }
        } else {
            msg = song.msg
        }
        s.reply(msg)
    }
    async function song_wx_link(urls, n) {
        if (!n) {
            return
        }
        console.log(`${urls}&n=${n}`);
        let song = (await get(`${urls}&n=${n}`)).data
        song_text(urls, song)
        if (song.code === 1 && !!song.data) {
            if (platform === 0) {
                msg = {
                    type: "music",
                    content: {
                        title: `${song.data.song}_${song.data.singer}`,
                        desc: `${song.data.album}`
                    },
                    path: {
                        url: `${song.data.url}`,
                        dataurl: `${song.data.music}`,
                        thumburl: `${song.data.picture}`
                    }
                }
            } else {
                msg = {
                    type: "music",
                    content: {
                        title: `${song.data.Music}`,
                        desc: `${song.data.Singer}`
                    },
                    path: {
                        url: `${song.data.Music_Url}`,
                        dataurl: `${song.data.Url}`,
                        thumburl: `${song.data.Cover}`
                    }
                }
            }
        } else {
            msg = song.msg
        }
        // s.reply(msg)
        return msg
    }
}

// get请求
async function get(url) {
    var data = await axios({
        url: url,
        method: "get",
    });
    if (data.status === 200) {
        return data
    } else {
        return
    }
}

async function downloadFile(url, filename = new Date().getTime()) {
    filePath = path.join(process.cwd(), 'BncrData/public', `${filename}.jpg`);
    response = await axios.get(url, { responseType: 'stream' });
    response.data.pipe(fs.createWriteStream(filePath));
    return new Promise((resolve, reject) => {
        response.data.on('end', () => resolve(filePath));
        response.data.on('error', reject);
    });
}
