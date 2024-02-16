/**作者
 * @author 薛定谔的大灰机
 * @name 微信好友申请、拉群
 * @origin 大灰机
 * @version 2.0.0
 * @rule 收到好友添加请求
 * @description 
 * @rule ^(加|进)([^ \n]+)群$
 * @platform wxXyo
 * @priority 99999
 * @admin false
 * @disable false
 */

/**     使用说明：
        修改适配器【wxXyo.js】

        1：原文件35行下方"添加"以下内容

           wxXyo.Bridge = {};

        2：原58行注释
        3：原文件83行最后位置"添加"以下内容

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

        4：原文件120-122行"替换"为以下内容

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

const BCS = BncrCreateSchema
const jsonSchema = BCS.object({
	Agree: BCS.boolean().setTitle('同意好友申请开关').setDescription('开启则自动同意同意').setDefault(false),
	Mode: BCS.string().setTitle('邀请进群模式',).setDescription('请选择模式').setEnum(['InviteInGroup','InviteInGroupByLink']).setEnumNames(['直接拉群','发送卡片']).setDefault('InviteInGroupByLink'),
	Agree_keyword: BCS.string().setTitle('关键词同意').setDescription('空则全部同意').setDefault(''),
	AutoReply_keyword: BCS.string().setTitle('自动回复词').setDescription('空则不回复').setDefault(''),
	GroupId_keyword: BCS.array(BCS.string()).setTitle('关键词和群ID').setDescription('关键词和群ID用@隔开').setDefault(['交流@25214210457']),
	});

const ConfigDB = new BncrPluginConfig(jsonSchema);

module.exports = async s => {
	await ConfigDB.get();
	const CDB = ConfigDB.userConfig
    if (!Object.keys(CDB).length) {
    return await s.reply('请先发送"修改无界配置"来完成插件首次配置');
    }
    
    if (s.getMsg() !== '收到好友添加请求') {
        Group()
    } else {
        Friend()
    }
    
    async function Group() {
    	if (CDB.GroupId_keyword.length < 1) {
    		return s.reply('未设置群ID')
    	}
    	for (let i = 0; i < CDB.GroupId_keyword.length; i++) {
    		let Keyword = CDB.GroupId_keyword[i].split("@")[0]
    		let GroupId = CDB.GroupId_keyword[i].split("@")[1]
    		if (Keyword == s.param(2)) {
    			await s.reply({
    				type: 'Group',
    				msg: '邀请入群',
    				api: CDB.Mode,
    				group_wxid: GroupId + '@chatroom',
    				friend_wxid: s.getUserId()
                })
                return
            } else if ((CDB.GroupId_keyword.length - 1) == i) {
            	s.reply("没有这个群哦[汗]")
            }
        }
    }

    async function Friend() {
        const body = s.Bridge.body.content
        if (body && s.getUserId() == 'EventFrieneVerify') {
            console.log(`收到【${body.from_name}】好友申请`)
            await main()
        } else {
            console.log('非真实好友申请，忽略')
        }

        async function main() {
            if (CDB.Agree) {
                await AgreeFriendVerify()
                if (!!CDB.AutoReply_keyword) {
                    await AutoReply()
                }
            }
        }

        async function AgreeFriendVerify() {
            if (CDB.Agree_keyword) {
                if (CDB.Agree_keyword !== body.json_msg.content) {
                    return console.log('暗号错误')
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

        async function AutoReply() {
            if (CDB.AutoReply_keyword) {
                await s.reply({
                    type: 'text',
                    userId: body.from_wxid,
                    msg: CDB.AutoReply_keyword,
                })
            }
        }
    }
}
