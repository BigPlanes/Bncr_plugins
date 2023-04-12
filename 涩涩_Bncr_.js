/**作者
 * @author 薛定谔的大灰机
 * @name 涩涩
 * @origin 大灰机
 * @version 1.0.2
 * @description 发送一个轮换的涩涩图片(仅TG)
 * @platform tgBot ssh HumanTG
 * @rule ^涩涩
 * @admin true
 * @disable false
 */

// 编辑消息需要在HumanTG适配器加入以下代码（我在148另起一行粘贴的）

// HumanTG.Bridge = {
//     editImage: async function (replyInfo) {
//         if (Object.prototype.toString.call(replyInfo) === '[object Object]') {
//             let sendID = +replyInfo.groupId || +replyInfo.userId;
//             if (replyInfo.type === 'image') {
//                 /* 编辑消息 */
//                 try {
//                     sendRes = await client.editMessage(sendID, {
//                         message: +replyInfo.msgId,
//                         text: replyInfo.msg,
//                         file: replyInfo.path,
//                         forceDocument: false
//                     });
//                     return (sendRes && `${sendRes.id}`) || '';
//                 } catch (e) {
//                     console.log('编辑失败', e);
//                     return;
//                 }
//             }
//         }
//     }
// };

const axios = require('axios');

module.exports = async s => {
    let tag = ``        // 关键词(留空为随机)
    let num = 10        // 数量(单次上限20)
    let r18 = 0         // R18级别(慎用！！！)
    let time = 5        // 轮换时间(秒)
    let msg = false     // 是否开启标题
    /** Code Encryption Block[419fd178b7a37c9eae7b7426c4a04203c4b1890b24b488f862457b5cde5e33ab39919ec53153d95ee2c40a3b0d772cf82e245e1105dd69b1d0c242262d1e1d75cfbf316ec52a84af6be42e0448a22b454788b6fe832528ba2c4d17d594aa115a46ca7bc18832a772ae420081b6164c5c531f077e5d9004bde80558ae716e21e8d04d97d21009b55e49cb76e699ed26a603f269a74e572b89885b4d3158a99bd580b75e7f9e04b2377f15bc381fbd8b47b7e862b4bc991f48ea72e64444211c4b606b4142f9da4c7aa33dab23200de629aa0ff2cffdaf709dede5bd754b8fd21df2c49a04c938a80fb9a54d39827047c070139ad2049fa8afc85e44faa4a8c2ca41bcc41ed44c8ae78a9e8c1b43f817aadf04df96928cfc45f8b63cfe42b24f57b24bc8b208c33113640cb30e65c25a3e135d0f6ca71db2e8db8f2c8a355cd549025baea6ce8ed650770e7c4a52f61a9371b9428cda32ba1982407bf7dd2db232e0083d46438184fc28f54b99021b743b6ee8034ef907d69b5d0e03b925d2ac0896ca5590c672432c56a916f4ce540fd90e16ed54a669307208ec7924b35b853c243e5b4c84b30d9d8341b8f30dc9b2ca143a98559e99a22d9f53cff31eb557a3f3dd60dd6bd2fa8ecfd014df73b00d394fcce26713adda3bcddddf9246471787d307b2564f5b407e4faf230ea2addb7179d2e72ce6d6e40f37a32e65ca0ffa79df2b2202680841112a04ee79a5d224caeb9923dcf258f0a6628c94d2570684efb92cddb3243ce041af838da14c6a4018b8d1de8394544671cc4c335dd43b62150eb0e02cc08d8d5eb9f6bed1bb2f5bdef769d0622f74afa8c1d64b51dfa034f36522fffe64b1e6d09f5fb09f8067127cf68394b20ab97922024be147b93603a65c66a7ceb55192eb804bd451bb2ba399478e92d1cf8582f06722c6653149afd12be2ace7e9cc9831cbe1c10db6d259a035908fa52e51e01af37c160c7c54717cd8d73435574f3905c490c7f3f45f1c9e3e68f70e53702dcc408290c99b1c5c765b2f881b6cd9114a2fc40e5f17806467b7f9ea9c78400c4154cb4f3b48fcf429753f12ab1a38e059cf2b6cc222800922b0c17be2040c27ee7c09b6e21f78593f86c5a0b9ef26de4512fcf1f428231f6753a828440b0742c1d0bad91c52c11aead2526df0e126d0066dd5dbd5c60a195f5320b64fad48b4d4f33b136a23a28ae1dac24629ed71f79a896f08c337525d68b37773d3f862354688d5f028fd58b60f1d122aeaa5ae6dd49439feb8693646be2b06cf2e1fb101e72a9daf591bb072fb380f59999523ccdfe1eb0cb2d9ade7eaddd59c2577e9368f3b1163360da71f376b10c2f26ddf0bf00993c84d676fe92c5c3409be368ed572a8a885d77e0811fdb57b9da7b65670aa2503d61a20144ed3e8037c8a86e3fc5388ed2fb3fb4cf0b3457dafcbc53c589ce346b1d06160c2344e87e86816a1091714893d892451c07ac45a77352c7757c40ae6585aeb6241193c41562c53144c09138fc2a02e644e89d746f0c935ae03afd7df4659c9b1b1e2e3e3400c654df37e4c34d5cb8c1326106a2b6e0cb0e699297b0317d6b17b96a19a1130c2d74def962d05b736fe42662ed20586e1c5d5c289f85c554668422e709cd90a13a728eade24ec5d413c78c7a2ad8fa1d91f885fcbf80526fd92c7a1a6dd9149eafdb46160714fb5d37184383c5a7cecf09726b54b026d2b25d712b670a8dc5cef343a2efb2670ec0dca923a29f329cc23866d0296ab08b9e7539948b038d1a80cfc57a9eb3728c77cd2b0e88c9051896c5f09adab9f886f25e1c2c9879546b7233e2e2fec6ac855b7197041f95194310f3a452c1c9faa9214088af02600aeeeb48663e505b63dfd55b9132aa3ceaaad0ebae09b4ee37bb371b34e4e61be17b4df0e600dae2de500d5f09feadcfb5cb5fa3f7c11ac47e20ac289f2bac0a019db745e940dbe4a0d71d38c8a0a4f9254b9b85a6c8cbe6e15da52ea594054b8d3951f74a269153005f00a26cd48b4742a56ade5addba8bcb0ba3a6be26c91f266e883206d99281ff6c30f322b45dceffd795a57eda0623ccdc3a97aa0e3f6da96d2f6bdabfe1a617624217bd5c1c81c147f7a13a97ad848a4ec30b9bb32cceeadcb143fb638744e7b13452b9ca74e53afe25bd9666a2e6d9f4fa82276951bfad992cee24b2203ec1ed3de899c1f2850544e49ef6dc8d8740f9ef6a382332aba8aa89986642f648adc292fd526d3855064199779137a06d71e30ff3062302e872bf78f1a6aaa5abcbdb4cb5b029124] */
}