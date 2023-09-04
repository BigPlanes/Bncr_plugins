/**作者
 * @author 哈尼,薛定谔的大灰机
 * @name 摸鱼
 * @origin 大灰机
 * @version 1.0.2
 * @description 🐟每天都是摸鱼人。      (改自原傻妞插件)
 * @rule ^摸鱼
 * @admin false
 * @disable false
 * @cron 0 0 9,16 * * *
 */

const mo = require('./mod/subassembly')      // 此脚本依赖仓库模块，请拉取全部文件

// 是否联网摸鱼，失败会自动使用离线版本
const isOnline = true

// 推送群白名单
const PushList = [
    {
        groupId: '25214210457',         // 群id
        platform: 'wxXyo'            // 平台
    }
]
// 示例：
// const PushList = [
//     {
//         groupId: 'xxxxxxxx',         // 群id
//         platform: 'wxXyo'            // 平台
//     },
//     {
//         groupId: 'xxxxxxxxxxxx',     // 用户id
//         platform: 'wxXyo'            // 平台
//     }
// ]


// 黄历群白名单（置空则都展示）
const whiteList = [-1001779339863, 18843026371]
// 摸鱼表情包，随机展示
const fishPic = [
    "https://s2.loli.net/2022/02/24/SG5svAxd1eXwVDK.jpg",
    "https://s2.loli.net/2022/02/24/St2w79Qq5eDABiH.jpg",
    "https://s2.loli.net/2022/02/24/UQhuHPlIAnSY4fw.jpg",
    "https://s2.loli.net/2022/02/24/5S2DBWdz4nciIp6.jpg",
    "https://s2.loli.net/2022/02/24/SRLnuJQscvxzTlV.jpg",
    "https://s2.loli.net/2022/02/24/FjANmSHr4lYkPXL.jpg",
    "https://s2.loli.net/2022/02/24/qxhrKHpGmQzluao.jpg",
    "https://s2.loli.net/2022/02/24/thvwPN1VCesn9FK.jpg",
    "https://s2.loli.net/2022/02/24/eDM18l5tbwNkXCS.jpg",
    "https://s2.loli.net/2022/02/24/iVUOzxqIBNTA5v4.jpg"
]

module.exports = async s => {

    //require('Math')
    const fishMan = new Date();
    let year = fishMan.getFullYear();
    const month = fishMan.getMonth() + 1;
    const day = fishMan.getDate();
    const hour = fishMan.getHours();
    const item = fishMan.getDay()
    // const si = fishMan.getSeconds()//获取当前秒

    if (!Array.indexOf) {
        Array.prototype.indexOf = function (obj) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == obj) {
                    return i;
                }
            }
            return -1;
        }
    }

    Date.prototype.format = function (formatStr) {
        var str = formatStr;
        var Week = ['日', '一', '二', '三', '四', '五', '六'];
        str = str.replace(/yyyy|YYYY/, this.getFullYear());
        str = str.replace(/MM/, (this.getMonth() + 1) > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
        str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
        return str;
    }
    // console.log(fishMan)
    // console.log(si)
    s.delMsg(s.getMsgId())
    festivals = new Array();
    msg = '';
    try {
        if (isOnline != true) {
            throw "500";
        }
        msg += request("https://vps.gamehook.top/api/face/my").replace("！", "！\n").replace(",", "，").replace("?", "").replace(/:/g, "").replace("自己的", "自己的。\n").replace("上班是", "\n上班是").replace(/<br\/>/g, "\n").replace("...", "！")
    } catch (e) {
        headInfo();
        weekend();

        addYangFestival('元旦', 1, 1);
        addYinFestival('春节', 1, 1);
        addYinFestival('元宵节', 1, 15);
        addQingming('清明节');
        addYangFestival('劳动节', 5, 1);
        addYinFestival('端午节', 5, 5);
        addYinFestival('中秋节', 8, 15);
        addYangFestival('国庆节', 10, 1);
        addYangFestival('春节', 1, 21);
        newFestival();

        lastInfo();
    }

    if (whiteList.length == 0 || whiteList.indexOf(s.getGroupId()) >= 0 || (s.getUserId() ? "是" : "不是")) {
        await dateApi();
    }
    if (fishPic.length != 0) {
        image = fishPic[Math.floor(Math.random() * fishPic.length)]
    }
    if (s.getFrom() == `cron` && PushList.length > 0) {
        console.log(`定时任务运行了`);
        for (let i = 0; i < PushList.length; i++) {
            await sysMethod.push({
                type: 'text',
                platform: PushList[i].platform,
                groupId: PushList[i].groupId,
                userId: PushList[i].userId,
                msg: msg,
            });
            if (!['HumanTG'].includes(s.getFrom())) {
                await sysMethod.push({
                    type: 'image',
                    platform: PushList[i].platform,
                    groupId: PushList[i].groupId,
                    userId: PushList[i].userId,
                    path: image
                })
            }
        }
    } else {
        mo.reply(s, {
            type: 'image',
            msg: msg,
            path: {
                path: image,
                suffix: 'jpg'
            },
            suffix: `jpg`,
            dontEdit: true,
        })
    }

    function getQinMingJieDate(fullYear) {
        //清明节的日期是不固定的，规律是：闰年开始的前2年是4月4日，闰年开始的第3年和第4年是4月5日
        if (isLeapYear(fullYear) || isLeapYear(fullYear - 1)) {
            return new Date(fullYear, 3, 4);
        } else {
            return new Date(fullYear, 3, 5);
        }
    }
    //判断是否是闰年
    function isLeapYear(Year) {
        if (((Year % 4) == 0) && ((Year % 100) != 0) || ((Year % 400) == 0)) {
            return (true);
        } else { return (false); }
    }

    function newFestival() {
        festivals.sort(fSort);
        for (var i = 0; i < festivals.length; ++i) {
            if (festivals[i].days == 0) {
                msg += "今天就是" + festivals[i].festival + "，好好享受！\n";
                continue;
            }
            msg += "距离" + festivals[i].festival + "还有不到" + festivals[i].days + "天\n"
        }
    }

    function fSort(a, b) {
        return a.days - b.days;
    }

    function addFestival(ff, startDate, endDate) {
        // s.reply(ff + startDate + endDate);
        var days = Math.round((endDate - startDate) / (1 * 24 * 60 * 60 * 1000));
        festivals.push({
            'festival': ff,
            'days': days
        })
    }

    function addQingming(ff) {
        var startDate = new Date(year, month - 1, day);
        var endDate = getQinMingJieDate(year);
        if (endDate < startDate) {
            endDate = getQinMingJieDate(year + 1);
        }
        addFestival(ff, startDate, endDate);
    }

    function addYinFestival(ff, mm, dd) {
        var startDate = new Date(year, month - 1, day);
        var nongli = calendar.lunar2solar(year, mm, dd);
        var endDate = new Date(nongli.cYear, nongli.cMonth - 1, nongli.cDay);
        if (endDate < startDate) {
            nongli = calendar.lunar2solar(year + 1, mm, dd);
            endDate = new Date(nongli.cYear, nongli.cMonth - 1, nongli.cDay);
        }
        addFestival(ff, startDate, endDate);
    }

    function addYangFestival(ff, mm, dd) {
        var startDate = new Date(year, month - 1, day);
        var endDate = Date.parse(new Date(year, mm - 1, dd));
        if (endDate < startDate) {
            endDate = Date.parse(new Date(year + 1, mm - 1, dd));
        }
        addFestival(ff, startDate, endDate);
    }

    async function dateApi() {
        dateUrl = "https://tool.bitefu.net/jiari/?info=1&d=" + fishMan.format("yyyyMMdd")
        try {
            req = await mo.request({
                url: dateUrl,
            })
            msg += "\n————  ┑(￣Д ￣)┍  ————"
            msg += "\n【今日黄历】" + req.data["yearname"] + "年 " + req.data["nonglicn"] + " " + req.data["jieqi"]
            msg += "\n「宜」" + req.data["suit"].replace(/\./g, "·")
            msg += "\n「忌」" + req.data["avoid"].replace(/\./g, "·")
        } catch (e) {
            console.log(`黄历获取失败`);
        }
    }

    function headInfo() {
        var mae = ''
        if (hour >= 6 && hour < 12) {
            mae = '上午'
        } else if (hour >= 12 && hour < 18) {
            mae = '下午'
        } else if ((hour >= 18 && hour < 24) || hour < 6) {
            mae = '晚上'
        }
        var info = "【摸鱼办】提醒您：" + month + "月" + day + "日" + mae + "好，摸鱼人！\n工作再累，一定不要忘记摸鱼哦！有事没事起身去茶水间、去厕所、去廊道走走，别老在工位上坐着，钱是老板的，但命是自己的！\n"
        msg += info
        return info
    }

    function lastInfo() {
        var info = "为了放假加油吧！\n上班是帮老板赚钱，摸鱼是赚老板的钱！\n最后，祝愿天下所有摸鱼人，都能愉快的渡过每一天！"
        msg += info
        return info
    }

    function weekend() {
        var item = fishMan.getDay()
        var info = ""
        if (item > 0 && item <= 5) {
            item = 6 - item
            info = "距离周末还有不到" + item + "天\n";
        } else {
            info = '好好享受周末吧\n';
        }
        msg += info
        return info
    }

    function festival(chinese, fmonth, fday) {
        var startDate = Date.parse(fishMan);
        var info = "";
        var endDate = Date.parse(new Date(year, fmonth - 1, fday));
        if (endDate < startDate) {
            endDate = Date.parse(new Date(year + 1, fmonth - 1, fday));
        }
        var days = Math.round((endDate - startDate) / (1 * 24 * 60 * 60 * 1000));
        if (month == fmonth && day == fday) {
            info = "今天就是" + chinese + "节，好好享受！\n"
        } else {
            info = "距离" + chinese + "还有" + days + "天\n"
        }
        msg += info
        return info
    }
}

/**
* @1900-2100区间内的公历、农历互转
* @charset UTF-8
* @Author Jea杨(JJonline@JJonline.Cn)
* @Time  2014-7-21
* @Time  2016-8-13 Fixed 2033hex、Attribution Annals
* @Time  2016-9-25 Fixed lunar LeapMonth Param Bug
* @Version 1.0.2
* @公历转农历：calendar.solar2lunar(1987,11,01); //[you can ignore params of prefix 0]
* @农历转公历：calendar.lunar2solar(1987,09,10); //[you can ignore params of prefix 0]
*/
let calendar = {
    /**
     * 农历1900-2100的润大小信息表
     * @Array Of Property
     * @return Hex
     */
    lunarInfo: [0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,//1900-1909
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,//1910-1919
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,//1920-1929
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,//1930-1939
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,//1940-1949
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,//1950-1959
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,//1960-1969
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,//1970-1979
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,//1980-1989
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,//1990-1999
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,//2000-2009
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,//2010-2019
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,//2020-2029
        0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,//2030-2039
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,//2040-2049
        /**Add By JJonline@JJonline.Cn**/
        0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,//2050-2059
        0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,//2060-2069
        0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,//2070-2079
        0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,//2080-2089
        0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,//2090-2099
        0x0d520],//2100
    /**
     * 公历每个月份的天数普通表
     * @Array Of Property
     * @return Number
     */
    solarMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
    /**
     * 天干地支之天干速查表
     * @Array Of Property trans["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"]
     * @return Cn string
     */
    Gan: ["\u7532", "\u4e59", "\u4e19", "\u4e01", "\u620a", "\u5df1", "\u5e9a", "\u8f9b", "\u58ec", "\u7678"],
    /**
     * 天干地支之地支速查表
     * @Array Of Property
     * @trans["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"]
     * @return Cn string
     */
    Zhi: ["\u5b50", "\u4e11", "\u5bc5", "\u536f", "\u8fb0", "\u5df3", "\u5348", "\u672a", "\u7533", "\u9149", "\u620c", "\u4ea5"],
    /**
     * 天干地支之地支速查表<=>生肖
     * @Array Of Property
     * @trans["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"]
     * @return Cn string
     */
    Animals: ["\u9f20", "\u725b", "\u864e", "\u5154", "\u9f99", "\u86c7", "\u9a6c", "\u7f8a", "\u7334", "\u9e21", "\u72d7", "\u732a"],
    /**
     * 24节气速查表
     * @Array Of Property
     * @trans["小寒","大寒","立春","雨水","惊蛰","春分","清明","谷雨","立夏","小满","芒种","夏至","小暑","大暑","立秋","处暑","白露","秋分","寒露","霜降","立冬","小雪","大雪","冬至"]
     * @return Cn string
     */
    solarTerm: ["\u5c0f\u5bd2", "\u5927\u5bd2", "\u7acb\u6625", "\u96e8\u6c34", "\u60ca\u86f0", "\u6625\u5206", "\u6e05\u660e", "\u8c37\u96e8", "\u7acb\u590f", "\u5c0f\u6ee1", "\u8292\u79cd", "\u590f\u81f3", "\u5c0f\u6691", "\u5927\u6691", "\u7acb\u79cb", "\u5904\u6691", "\u767d\u9732", "\u79cb\u5206", "\u5bd2\u9732", "\u971c\u964d", "\u7acb\u51ac", "\u5c0f\u96ea", "\u5927\u96ea", "\u51ac\u81f3"],
    /**
     * 1900-2100各年的24节气日期速查表
     * @Array Of Property
     * @return 0x string For splice
     */
    sTermInfo: ['9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf97c3598082c95f8c965cc920f',
        '97bd0b06bdb0722c965ce1cfcc920f', 'b027097bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c359801ec95f8c965cc920f', '97bd0b06bdb0722c965ce1cfcc920f', 'b027097bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f', '97bd0b06bdb0722c965ce1cfcc920f',
        'b027097bd097c36b0b6fc9274c91aa', '9778397bd19801ec9210c965cc920e', '97b6b97bd19801ec95f8c965cc920f',
        '97bd09801d98082c95f8e1cfcc920f', '97bd097bd097c36b0b6fc9210c8dc2', '9778397bd197c36c9210c9274c91aa',
        '97b6b97bd19801ec95f8c965cc920e', '97bd09801d98082c95f8e1cfcc920f', '97bd097bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec95f8c965cc920e', '97bcf97c3598082c95f8e1cfcc920f',
        '97bd097bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c3598082c95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e', '97bcf97c3598082c95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f',
        '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf97c359801ec95f8c965cc920f', '97bd097bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e', '97bcf97c359801ec95f8c965cc920f', '97bd097bd07f595b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9210c8dc2', '9778397bd19801ec9210c9274c920e', '97b6b97bd19801ec95f8c965cc920f',
        '97bd07f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c920e',
        '97b6b97bd19801ec95f8c965cc920f', '97bd07f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36c9210c9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bd07f1487f595b0b0bc920fb0722',
        '7f0e397bd097c36b0b6fc9210c8dc2', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf7f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c965cc920e', '97bcf7f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e', '97bcf7f1487f531b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b97bd19801ec9210c965cc920e',
        '97bcf7f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b97bd19801ec9210c9274c920e', '97bcf7f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
        '9778397bd097c36b0b6fc9210c91aa', '97b6b97bd197c36c9210c9274c920e', '97bcf7f0e47f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9210c8dc2', '9778397bd097c36c9210c9274c920e',
        '97b6b7f0e47f531b0723b0b6fb0722', '7f0e37f5307f595b0b0bc920fb0722', '7f0e397bd097c36b0b6fc9210c8dc2',
        '9778397bd097c36b0b70c9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721', '7f0e37f1487f595b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc9210c8dc2', '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f595b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
        '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc920fb0722', '9778397bd097c36b0b6fc9274c91aa', '97b6b7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9274c91aa',
        '97b6b7f0e47f531b0723b0787b0721', '7f0e27f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
        '9778397bd097c36b0b6fc9210c91aa', '97b6b7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722', '9778397bd097c36b0b6fc9210c8dc2', '977837f0e37f149b0723b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f5307f595b0b0bc920fb0722', '7f0e397bd097c35b0b6fc9210c8dc2',
        '977837f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e37f1487f595b0b0bb0b6fb0722',
        '7f0e397bd097c35b0b6fc9210c8dc2', '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722', '977837f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd097c35b0b6fc920fb0722',
        '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14998082b0787b06bd',
        '7f07e7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0b0bb0b6fb0722', '7f0e397bd07f595b0b0bc920fb0722',
        '977837f0e37f14998082b0723b06bd', '7f07e7f0e37f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
        '7f0e397bd07f595b0b0bc920fb0722', '977837f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f1487f595b0b0bb0b6fb0722', '7f0e37f0e37f14898082b0723b02d5',
        '7ec967f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0722', '7f0e37f1487f531b0b0bb0b6fb0722',
        '7f0e37f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e37f1487f531b0b0bb0b6fb0722', '7f0e37f0e37f14898082b072297c35', '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e37f0e37f14898082b072297c35',
        '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722',
        '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f149b0723b0787b0721',
        '7f0e27f1487f531b0b0bb0b6fb0722', '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14998082b0723b06bd',
        '7f07e7f0e47f149b0723b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722', '7f0e37f0e366aa89801eb072297c35',
        '7ec967f0e37f14998082b0723b06bd', '7f07e7f0e37f14998083b0787b0721', '7f0e27f0e47f531b0723b0b6fb0722',
        '7f0e37f0e366aa89801eb072297c35', '7ec967f0e37f14898082b0723b02d5', '7f07e7f0e37f14998082b0787b0721',
        '7f07e7f0e47f531b0723b0b6fb0722', '7f0e36665b66aa89801e9808297c35', '665f67f0e37f14898082b0723b02d5',
        '7ec967f0e37f14998082b0787b0721', '7f07e7f0e47f531b0723b0b6fb0722', '7f0e36665b66a449801e9808297c35',
        '665f67f0e37f14898082b0723b02d5', '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721',
        '7f0e36665b66a449801e9808297c35', '665f67f0e37f14898082b072297c35', '7ec967f0e37f14998082b0787b06bd',
        '7f07e7f0e47f531b0723b0b6fb0721', '7f0e26665b66a449801e9808297c35', '665f67f0e37f1489801eb072297c35',
        '7ec967f0e37f14998082b0787b06bd', '7f07e7f0e47f531b0723b0b6fb0721', '7f0e27f1487f531b0b0bb0b6fb0722'],
    /**
     * 数字转中文速查表
     * @Array Of Property
     * @trans ['日','一','二','三','四','五','六','七','八','九','十']
     * @return Cn string
     */
    nStr1: ["\u65e5", "\u4e00", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d", "\u4e03", "\u516b", "\u4e5d", "\u5341"],
    /**
     * 日期转农历称呼速查表
     * @Array Of Property
     * @trans ['初','十','廿','卅']
     * @return Cn string
     */
    nStr2: ["\u521d", "\u5341", "\u5eff", "\u5345"],
    /**
     * 月份转农历称呼速查表
     * @Array Of Property
     * @trans ['正','一','二','三','四','五','六','七','八','九','十','冬','腊']
     * @return Cn string
     */
    nStr3: ["\u6b63", "\u4e8c", "\u4e09", "\u56db", "\u4e94", "\u516d", "\u4e03", "\u516b", "\u4e5d", "\u5341", "\u51ac", "\u814a"],
    /**
     * 返回农历y年一整年的总天数
     * @param lunar Year
     * @return Number
     * @eg:var count = calendar.lYearDays(1987) ;//count=387
     */
    lYearDays: function (y) {
        var i, sum = 348;
        for (i = 0x8000; i > 0x8; i >>= 1) { sum += (calendar.lunarInfo[y - 1900] & i) ? 1 : 0; }
        return (sum + calendar.leapDays(y));
    },
    /**
     * 返回农历y年闰月是哪个月；若y年没有闰月 则返回0
     * @param lunar Year
     * @return Number (0-12)
     * @eg:var leapMonth = calendar.leapMonth(1987) ;//leapMonth=6
     */
    leapMonth: function (y) { //闰字编码 \u95f0
        return (calendar.lunarInfo[y - 1900] & 0xf);
    },
    /**
     * 返回农历y年闰月的天数 若该年没有闰月则返回0
     * @param lunar Year
     * @return Number (0、29、30)
     * @eg:var leapMonthDay = calendar.leapDays(1987) ;//leapMonthDay=29
     */
    leapDays: function (y) {
        if (calendar.leapMonth(y)) {
            return ((calendar.lunarInfo[y - 1900] & 0x10000) ? 30 : 29);
        }
        return (0);
    },
    /**
     * 返回农历y年m月（非闰月）的总天数，计算m为闰月时的天数请使用leapDays方法
     * @param lunar Year
     * @return Number (-1、29、30)
     * @eg:var MonthDay = calendar.monthDays(1987,9) ;//MonthDay=29
     */
    monthDays: function (y, m) {
        if (m > 12 || m < 1) { return -1 }//月份参数从1至12，参数错误返回-1
        return ((calendar.lunarInfo[y - 1900] & (0x10000 >> m)) ? 30 : 29);
    },
    /**
     * 返回公历(!)y年m月的天数
     * @param solar Year
     * @return Number (-1、28、29、30、31)
     * @eg:var solarMonthDay = calendar.leapDays(1987) ;//solarMonthDay=30
     */
    solarDays: function (y, m) {
        if (m > 12 || m < 1) { return -1 } //若参数错误 返回-1
        var ms = m - 1;
        if (ms == 1) { //2月份的闰平规律测算后确认返回28或29
            return (((y % 4 == 0) && (y % 100 != 0) || (y % 400 == 0)) ? 29 : 28);
        } else {
            return (calendar.solarMonth[ms]);
        }
    },
    /**
     * 农历年份转换为干支纪年
     * @param lYear 农历年的年份数
     * @return Cn string
     */
    toGanZhiYear: function (lYear) {
        var ganKey = (lYear - 3) % 10;
        var zhiKey = (lYear - 3) % 12;
        if (ganKey == 0) ganKey = 10;//如果余数为0则为最后一个天干
        if (zhiKey == 0) zhiKey = 12;//如果余数为0则为最后一个地支
        return calendar.Gan[ganKey - 1] + calendar.Zhi[zhiKey - 1];
    },
    /**
     * 公历月、日判断所属星座
     * @param cMonth [description]
     * @param cDay [description]
     * @return Cn string
     */
    toAstro: function (cMonth, cDay) {
        var s = "\u9b54\u7faf\u6c34\u74f6\u53cc\u9c7c\u767d\u7f8a\u91d1\u725b\u53cc\u5b50\u5de8\u87f9\u72ee\u5b50\u5904\u5973\u5929\u79e4\u5929\u874e\u5c04\u624b\u9b54\u7faf";
        var arr = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22];
        return s.substr(cMonth * 2 - (cDay < arr[cMonth - 1] ? 2 : 0), 2) + "\u5ea7";//座
    },
    /**
     * 传入offset偏移量返回干支
     * @param offset 相对甲子的偏移量
     * @return Cn string
     */
    toGanZhi: function (offset) {
        return calendar.Gan[offset % 10] + calendar.Zhi[offset % 12];
    },
    /**
     * 传入公历(!)y年获得该年第n个节气的公历日期
     * @param y公历年(1900-2100)；n二十四节气中的第几个节气(1~24)；从n=1(小寒)算起
     * @return day Number
     * @eg:var _24 = calendar.getTerm(1987,3) ;//_24=4;意即1987年2月4日立春
     */
    getTerm: function (y, n) {
        if (y < 1900 || y > 2100) { return -1; }
        if (n < 1 || n > 24) { return -1; }
        var _table = calendar.sTermInfo[y - 1900];
        var _info = [
            parseInt('0x' + _table.substr(0, 5)).toString(),
            parseInt('0x' + _table.substr(5, 5)).toString(),
            parseInt('0x' + _table.substr(10, 5)).toString(),
            parseInt('0x' + _table.substr(15, 5)).toString(),
            parseInt('0x' + _table.substr(20, 5)).toString(),
            parseInt('0x' + _table.substr(25, 5)).toString()
        ];
        var _calday = [
            _info[0].substr(0, 1),
            _info[0].substr(1, 2),
            _info[0].substr(3, 1),
            _info[0].substr(4, 2),
            _info[1].substr(0, 1),
            _info[1].substr(1, 2),
            _info[1].substr(3, 1),
            _info[1].substr(4, 2),
            _info[2].substr(0, 1),
            _info[2].substr(1, 2),
            _info[2].substr(3, 1),
            _info[2].substr(4, 2),
            _info[3].substr(0, 1),
            _info[3].substr(1, 2),
            _info[3].substr(3, 1),
            _info[3].substr(4, 2),
            _info[4].substr(0, 1),
            _info[4].substr(1, 2),
            _info[4].substr(3, 1),
            _info[4].substr(4, 2),
            _info[5].substr(0, 1),
            _info[5].substr(1, 2),
            _info[5].substr(3, 1),
            _info[5].substr(4, 2),
        ];
        return parseInt(_calday[n - 1]);
    },
    /**
     * 传入农历数字月份返回汉语通俗表示法
     * @param lunar month
     * @return Cn string
     * @eg:var cnMonth = calendar.toChinaMonth(12) ;//cnMonth='腊月'
     */
    toChinaMonth: function (m) { // 月 => \u6708
        if (m > 12 || m < 1) { return -1 } //若参数错误 返回-1
        var s = calendar.nStr3[m - 1];
        s += "\u6708";//加上月字
        return s;
    },
    /**
     * 传入农历日期数字返回汉字表示法
     * @param lunar day
     * @return Cn string
     * @eg:var cnDay = calendar.toChinaDay(21) ;//cnMonth='廿一'
     */
    toChinaDay: function (d) { //日 => \u65e5
        var s;
        switch (d) {
            case 10:
                s = '\u521d\u5341'; break;
            case 20:
                s = '\u4e8c\u5341'; break;
                break;
            case 30:
                s = '\u4e09\u5341'; break;
                break;
            default:
                s = calendar.nStr2[Math.floor(d / 10)];
                s += calendar.nStr1[d % 10];
        }
        return (s);
    },
    /**
     * 年份转生肖[!仅能大致转换] => 精确划分生肖分界线是“立春”
     * @param y year
     * @return Cn string
     * @eg:var animal = calendar.getAnimal(1987) ;//animal='兔'
     */
    getAnimal: function (y) {
        return calendar.Animals[(y - 4) % 12]
    },
    /**
     * 传入阳历年月日获得详细的公历、农历object信息 <=>JSON
     * @param y solar year
     * @param m solar month
     * @param d solar day
     * @return JSON object
     * @eg:console.log(calendar.solar2lunar(1987,11,01));
     */
    solar2lunar: function (y, m, d) { //参数区间1900.1.31~2100.12.31
        if (y < 1900 || y > 2100) { return -1; }//年份限定、上限
        if (y == 1900 && m == 1 && d < 31) { return -1; }//下限
        if (!y) { //未传参 获得当天
            var objDate = new Date();
        } else {
            var objDate = new Date(y, parseInt(m) - 1, d)
        }
        var i, leap = 0, temp = 0;
        //修正ymd参数
        var y = objDate.getFullYear(), m = objDate.getMonth() + 1, d = objDate.getDate();
        var offset = (Date.UTC(objDate.getFullYear(), objDate.getMonth(), objDate.getDate()) - Date.UTC(1900, 0, 31)) / 86400000;
        for (i = 1900; i < 2101 && offset > 0; i++) { temp = calendar.lYearDays(i); offset -= temp; }
        if (offset < 0) { offset += temp; i--; }
        //是否今天
        var isTodayObj = new Date(), isToday = false;
        if (isTodayObj.getFullYear() == y && isTodayObj.getMonth() + 1 == m && isTodayObj.getDate() == d) {
            isToday = true;
        }
        //星期几
        var nWeek = objDate.getDay(), cWeek = calendar.nStr1[nWeek];
        if (nWeek == 0) { nWeek = 7; }//数字表示周几顺应天朝周一开始的惯例
        //农历年
        var year = i;
        var leap = calendar.leapMonth(i); //闰哪个月
        var isLeap = false;
        //效验闰月
        for (i = 1; i < 13 && offset > 0; i++) {
            //闰月
            if (leap > 0 && i == (leap + 1) && isLeap == false) {
                --i;
                isLeap = true; temp = calendar.leapDays(year); //计算农历闰月天数
            }
            else {
                temp = calendar.monthDays(year, i);//计算农历普通月天数
            }
            //解除闰月
            if (isLeap == true && i == (leap + 1)) { isLeap = false; }
            offset -= temp;
        }
        if (offset == 0 && leap > 0 && i == leap + 1)
            if (isLeap) {
                isLeap = false;
            } else {
                isLeap = true; --i;
            }
        if (offset < 0) { offset += temp; --i; }
        //农历月
        var month = i;
        //农历日
        var day = offset + 1;
        //天干地支处理
        var sm = m - 1;
        var gzY = calendar.toGanZhiYear(year);
        //月柱 1900年1月小寒以前为 丙子月(60进制12)
        var firstNode = calendar.getTerm(year, (m * 2 - 1));//返回当月「节」为几日开始
        var secondNode = calendar.getTerm(year, (m * 2));//返回当月「节」为几日开始
        //依据12节气修正干支月
        var gzM = calendar.toGanZhi((y - 1900) * 12 + m + 11);
        if (d >= firstNode) {
            gzM = calendar.toGanZhi((y - 1900) * 12 + m + 12);
        }
        //传入的日期的节气与否
        var isTerm = false;
        var Term = null;
        if (firstNode == d) {
            isTerm = true;
            Term = calendar.solarTerm[m * 2 - 2];
        }
        if (secondNode == d) {
            isTerm = true;
            Term = calendar.solarTerm[m * 2 - 1];
        }
        //日柱 当月一日与 1900/1/1 相差天数
        var dayCyclical = Date.UTC(y, sm, 1, 0, 0, 0, 0) / 86400000 + 25567 + 10;
        var gzD = calendar.toGanZhi(dayCyclical + d - 1);
        //该日期所属的星座
        var astro = calendar.toAstro(m, d);
        return { 'lYear': year, 'lMonth': month, 'lDay': day, 'Animal': calendar.getAnimal(year), 'IMonthCn': (isLeap ? "\u95f0" : '') + calendar.toChinaMonth(month), 'IDayCn': calendar.toChinaDay(day), 'cYear': y, 'cMonth': m, 'cDay': d, 'gzYear': gzY, 'gzMonth': gzM, 'gzDay': gzD, 'isToday': isToday, 'isLeap': isLeap, 'nWeek': nWeek, 'ncWeek': "\u661f\u671f" + cWeek, 'isTerm': isTerm, 'Term': Term, 'astro': astro };
    },
    /**
     * 传入农历年月日以及传入的月份是否闰月获得详细的公历、农历object信息 <=>JSON
     * @param y lunar year
     * @param m lunar month
     * @param d lunar day
     * @param isLeapMonth lunar month is leap or not.[如果是农历闰月第四个参数赋值true即可]
     * @return JSON object
     * @eg:console.log(calendar.lunar2solar(1987,9,10));
     */
    lunar2solar: function (y, m, d, isLeapMonth) {  //参数区间1900.1.31~2100.12.1
        var isLeapMonth = !!isLeapMonth;
        var leapOffset = 0;
        var leapMonth = calendar.leapMonth(y);
        var leapDay = calendar.leapDays(y);
        if (isLeapMonth && (leapMonth != m)) { return -1; }//传参要求计算该闰月公历 但该年得出的闰月与传参的月份并不同
        if (y == 2100 && m == 12 && d > 1 || y == 1900 && m == 1 && d < 31) { return -1; }//超出了最大极限值
        var day = calendar.monthDays(y, m);
        var _day = day;
        //bugFix 2016-9-25
        //if month is leap, _day use leapDays method
        if (isLeapMonth) {
            _day = calendar.leapDays(y, m);
        }
        if (y < 1900 || y > 2100 || d > _day) { return -1; }//参数合法性效验
        //计算农历的时间差
        var offset = 0;
        for (var i = 1900; i < y; i++) {
            offset += calendar.lYearDays(i);
        }
        var leap = 0, isAdd = false;
        for (var i = 1; i < m; i++) {
            leap = calendar.leapMonth(y);
            if (!isAdd) {//处理闰月
                if (leap <= i && leap > 0) {
                    offset += calendar.leapDays(y); isAdd = true;
                }
            }
            offset += calendar.monthDays(y, i);
        }
        //转换闰月农历 需补充该年闰月的前一个月的时差
        if (isLeapMonth) { offset += day; }
        //1900年农历正月一日的公历时间为1900年1月30日0时0分0秒(该时间也是本农历的最开始起始点)
        var stmap = Date.UTC(1900, 1, 30, 0, 0, 0);
        var calObj = new Date((offset + d - 31) * 86400000 + stmap);
        var cY = calObj.getUTCFullYear();
        var cM = calObj.getUTCMonth() + 1;
        var cD = calObj.getUTCDate();
        return calendar.solar2lunar(cY, cM, cD);
    }
};
