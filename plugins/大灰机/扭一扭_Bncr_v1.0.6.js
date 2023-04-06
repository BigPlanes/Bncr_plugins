/**作者
 * @author 薛定谔的大灰机
 * @name 扭一扭
 * @origin 大灰机
 * @version 1.0.6
 * @description 发送美女视频
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule 扭一扭
 * @admin true
 * @disable false
 */

const axios = require('axios')

module.exports = async s => {
    let num = 10            // 数量
    let time = 8            // 轮换时间
    let delVideo = true     // 是否删除最后一条
    let msg = ``            // 标题

    main()
    async function main() {
        for (let i = 0; i < num; i++) {
            num = Math.floor(Math.random() * (2629 - 1 + 1) + 1);
            video_url = `https://api.ainio.cn/mp4/sp/${num}.mp4`
            if (i === 0) {
                await s.delMsg(s.getMsgId())
                if (s.getFrom() === 'HumanTG') {
                    if (!(msgid = await s.reply({
                        type: 'video',
                        path: video_url,
                        msg: msg
                    }))) return await main()
                    // await TG()
                } else {
                    await other()
                    return
                }
            } else if (i > 0 && s.getFrom() === 'HumanTG') {
                edit = await s.Bridge.editImage({
                    type: 'video',
                    path: video_url,
                    msg: msg,
                    groupId: s.getGroupId(),
                    userId: s.getUserId(),
                    msgId: msgid
                });
                if (!edit) continue
            }
            await sysMethod.sleep(time)
        }
        delVideo && s.delMsg(msgid)
    }
    // get请求
    async function get(url) {
        var data = await axios({
            "url": url,
            "method": "get",
        });
        if (data.status === 200) {
            return data
        } else {
            return
        }
    }
    async function other() {
        // console.log(json[0])
        await s.reply({
            type: 'video',
            path: video_url,
            // msg: msg
        })
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