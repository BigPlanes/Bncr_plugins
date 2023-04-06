/**作者
 * @author 薛定谔的大灰机
 * @name 买家秀
 * @origin 大灰机
 * @version 1.0.0
 * @description 发送淘宝买家秀
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule ^(买家秀|mjx)
 * @admin false
 * @disable false
 */

const axios = require('axios')

module.exports = async s => {
    let num = 10            // 数量
    let time = 3            // 轮换时间
    let delVideo = true     // 是否删除最后一条
    let msg = ``            // 标题
    main()
    async function main() {
        for (let i = 0; i < num; i++) {
            url = `https://api.uomg.com/api/rand.img3?format=json`;
            if ((data = (await get(url)).data).code != 1) {
                (await s.reply(`错误`))
                return
            }
            image_url = encodeURI(String(data.imgurl))
            if (i === 0) {
                await s.delMsg(s.getMsgId())
                if (s.getFrom() === 'HumanTG') {
                    if (!(msgid = await s.reply({
                        type: 'image',
                        path: image_url,
                        msg: msg
                    }))) return await main()
                } else {
                    await s.reply({
                        type: 'image',
                        path: video_url,
                        // msg: msg
                    })
                    return
                }
            } else if (i > 0 && s.getFrom() === 'HumanTG') {
                edit = await s.Bridge.editImage({
                    type: 'video',
                    path: image_url,
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