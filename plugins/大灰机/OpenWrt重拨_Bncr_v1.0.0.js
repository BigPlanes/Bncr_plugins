/**作者
 * @author 薛定谔的大灰机
 * @name OpenWrt
 * @origin 大灰机
 * @version 1.0.0
 * @description OpenWrt重拨
 * @platform tgBot qq ssh HumanTG wxQianxun wxXyo
 * @rule op重拨
 * @admin true
 * @disable false
 */

sysMethod.testModule(['ssh2'], { install: true });
const Client = require('ssh2').Client;
// SSH参数
const host = '10.0.0.1'
const port = 22
const username = ''
const password = ''
const command = '/sbin/ifdown wan;sleep 1s;ifup wan'    // 执行命令

module.exports = async s => {
    try {
        output = await sshExecCommand(host, port, username, password, command);
        console.log("重拨结果:" + ":" + output.replace("\n", "").replace("Done", "成功"));
        await s.reply("重拨结果:" + ":" + output.replace("\n", "").replace("Done", "成功"));
    } catch (error) {
        console.error(error);
        await s.reply(error);
    }
}

async function sshExecCommand(host, port, username, password, command) {
    return new Promise((resolve, reject) => {
        conn = new Client();
        conn.on('ready', () => {
            conn.exec(command, (err, stream) => {
                if (err) {
                    reject(err);
                    return;
                }
                let output = '';
                stream.on('close', (code, signal) => {
                    conn.end();
                    resolve(output);
                }).on('data', (data) => {
                    output += data.toString();
                }).stderr.on('data', (data) => {
                    console.error('STDERR: ' + data);
                });
            });
        }).connect({
            host: host,
            port: port,
            username: username,
            password: password
        });
    });
}