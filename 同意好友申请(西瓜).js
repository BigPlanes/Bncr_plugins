/**作者
 * @author 薛定谔的大灰机
 * @name 同意好友申请
 * @origin 大灰机
 * @version 1.0.0
 * @description 
 * @rule 收到好友添加请求
 * @platform wxXyo
 * @priority 99999
 * @admin false
 * @disable false
 */

/**     使用说明：
        修改适配器【wxXyo.js】

        1：21行下方"添加"以下内容

            wxXyo.Bridge = {};

        2：47行注释
        3：72行最后位置"添加"以下内容

             else if (body.Event === 'EventFrieneVerify') {    // 好友申请
                wxXyo.Bridge.body = body;
                msgInfo = {
                    userId: 'EventFrieneVerify',
                    userName: '好友申请通知',
                    groupId: '0',
                    groupName: '',
                    msg: '收到好友添加请求',
                    msgId: '',
                    type: "friend",
                };
            }

        4：130-133行"替换"为以下内容

            case 'friend':
                body = {
                    type: replyInfo.fromType,
                    v1: replyInfo.json_msg.v1,
                    v2: replyInfo.json_msg.v2,
                    api: 'AgreeFriendVerify'
                };
                break;
            default:
                body = replyInfo
                break;

        5：重启无界

 */

const Agree = true              // 是否同意申请
const Agree_keyword = ''        // 关键词同意

const Auto_reply = true         // 自动回复
const Auto_reply_msg = '感谢添加'         // 自动回复

module.exports = async s => {
    const body = s.Bridge.body.content

    if (body && s.getUserId() == 'EventFrieneVerify') {
        console.log(`收到【${body.from_name}】好友申请`)
        await main()
    } else {
        console.log('非真实好友申请，忽略')
    }

    async function main() {
        if (Agree) {
            await AgreeFriendVerify()
            if (Auto_reply) {
                await auto_reply()
            }
        }
    }

    async function AgreeFriendVerify() {
        if (Agree_keyword) {
            if (Agree_keyword !== body.json_msg.content) {
                return console.log('好友申请关键词错误')
            }
        }
        await s.reply({
            type: 'friend',
            msg: '同意好友申请',
            fromType: body.type,
            json_msg: body.json_msg
        })
        console.log('已同意好友申请')
    }

    async function auto_reply() {
        if (Auto_reply_msg) {
            await s.reply({
                type: 'text',
                userId: body.from_wxid,
                msg: Auto_reply_msg,
            })
        }
    }
}
