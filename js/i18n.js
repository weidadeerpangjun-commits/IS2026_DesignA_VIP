(function () {
  const STORAGE_KEY = "si-lang";
  const SCOPE_KEY = "si-scope";

  const scopeCardDefs = [
    {
      scope: "v1",
      dateKey: "scope.v1.title",
      itemKeys: ["scope.v1.i1", "scope.v1.i2", "scope.v1.i3"],
      muted: false,
    },
    {
      scope: "v2",
      dateKey: "scope.v2.title",
      itemKeys: ["scope.v2.i1", "scope.v2.i2", "scope.v2.i3"],
      muted: false,
    },
  ];

  const messages = {
    zh: {
      "meta.title": "2026 暑期培训",
      "menu.metaTitle": "菜单 · 2026 Summer Institute",
      "a11y.skip": "跳到主内容",
      "header.langLabel": "中文→EN",
      "header.langAria": "切换到英文界面",
      "hero.title": "Summer Institute 2026",
      "hero.logoAria": "Summer Institute 2026",
      "hero.subtitleZh": "中国 • 贝赛思国际/双语学校",
      "hero.subtitleEn": "BASIS INTERNATIONAL & BILINGUAL SCHOOLS • CHINA",
      "hero.titleZh": "暑期培训",
      "hero.dateEn": "August 3rd–7th, 2026",
      "hero.dateZh": "2026年8月3日–7日",
      "hero.addressEn":
        "BASIS International School Shenzhen No. 198, Yanshan Road, Nanshan District, Shenzhen, Guangdong, China",
      "hero.addressZh": "深圳贝赛思国际学校广东省深圳市南山区沿山路198号",
      "section.titleZh": "参训范围及时间",
      "section.titleEn": "Attendees & Participation Days",
      "section.hint": "请选择您的分组",
      "abbr.metaTitle": "缩略语对照表 · 2026 暑期培训",
      "abbr.pageTitle": "缩略语对照表",
      "abbr.indexLink": "缩略语表",
      "footer.copyright":
        "Copyright © 2026 Teknova (Shenzhen) Education Technology Co., Limited. All Rights Reserved",
      "footer.icp": "ICP备案号：粤ICP备19153114号",
      "abbr.backLink": "← 返回首页",
      "abbr.l01": "CEHOS Office: Chief Executive Head of School Office",
      "abbr.l02": "ECE: Early Childhood Education",
      "abbr.l03": "PS: Primary School",
      "abbr.l04": "MS: Middle School",
      "abbr.l05": "HS: High School",
      "abbr.l06": "BISZ: BASIS International School Shenzhen",
      "abbr.l07": "BIGZ: BASIS International School Guangzhou",
      "abbr.l08": "BIHZ: BASIS International School Hangzhou",
      "abbr.l09": "BIPH: BASIS International School Park Lane Harbour",
      "abbr.l10": "BINJ: BASIS International School Nanjing",
      "abbr.l11": "BBSZ: BASIS Bilingual School Shenzhen",
      "abbr.l12": "BIBCD: BASIS International & Bilingual Schools Chengdu",
      "abbr.l13": "BIBWH: BASIS International & Bilingual Schools Wuhan",
      "abbr.l14": "BKNS: BASIS Bilingual Kindergarten Nanshan",
      "abbr.l15": "BKFT: BASIS Bilingual Kindergarten Futian",
      "abbr.l16": "BBGM: BASIS Bilingual School Guangming Shenzhen",
      "abbr.l17": "BBBJ: BASIS Bilingual School Beijing",
      "abbr.l18": "BBGZ: BASIS Bilingual School Guangzhou",
      "abbr.l19": "HOS: Head of School",
      "abbr.l20": "VHOS: Vice Head of School",
      "abbr.l21": "HOD: Head of Division",
      "abbr.l22": "VHOD: Vice Head of Division",
      "abbr.l23": "DAP: Director of Academic Programs",
      "abbr.l24": "CAD: Course Advisor",
      "abbr.l25": "CC: Curriculum Coordinator",
      "abbr.l26": "LET: Learning Enhancement Teacher",
      "abbr.l27": "SET: Subject Expert Teacher",
      "abbr.l28": "RT: Round Table",
      "abbr.l29": "ELL: English Language Learning",
      "abbr.l30": "ICT&CS: Information & Communications Technology and Computer Science",
      "abbr.l31": "DCA: Director of College Admissions",
      "abbr.l32": "CAC: College Admissions Coordinator",
      "abbr.l33": "CCD: Course Curriculum Document",
      "abbr.l34": "COT: Course Outline Template",
      "scope.v1.title": "8月5日–7日",
      "scope.v1.i1": "中方四级及以上高层",
      "scope.v1.i2": "成都校区副校务长、广州双语校区助理校务长",
      "scope.v1.i3": "南贝幼/福贝幼常务副总经理、福贝幼副总经理",
      "scope.v2.title": "8月3日–7日",
      "scope.v2.i1": "CEHOS",
      "scope.v2.i2": "Senior CIO/CIO",
      "scope.v2.i3": "HOS",
      "menu.schedule": "日程安排",
      "menu.scheduleDb": "日程数据录入",
      "schdb.metaTitle": "日程数据录入 · 2026 Summer Institute",
      "schdb.title": "日程数据录入",
      "schdb.lead":
        "按分组与日期录入场次。编辑内容会短时自动写入本机草稿；点击「保存到日程」会写入当前草稿并新增一条可回溯的 JSON 版本。可用导出/导入备份；部署前台时请更新 data/si-schedule-db.json 等流程。",
      "schdb.scopesHeading": "分组",
      "schdb.scopesFoldTitle": "点击收起各分组下所有日期的日程",
      "schdb.scopesFoldAria": "收起各分组下全部日期",
      "schdb.scope.v1": "8月5–7日 · 中方四级及以上高层；成都校区副校务长、广州双语校区助理校务长；南贝幼/福贝幼常务副总经理、福贝幼副总经理",
      "schdb.scope.v2": "8月3–7日 · CEHOS；Senior CIO/CIO；HOS",
      "schdb.dayPrefix": "日期",
      "schdb.addRow": "添加场次",
      "schdb.removeRow": "删除",
      "schdb.saveToSchedule": "保存到日程",
      "schdb.export": "导出 JSON",
      "schdb.importPick": "选择 JSON 文件",
      "schdb.saved": "已保存到本机",
      "schdb.saveIdle": "有未保存修改时将自动保存",
      "schdb.importOk": "导入成功",
      "schdb.importErr": "导入失败：文件格式不正确",
      "schdb.importReplace": "导入将覆盖当前所有已录入数据，是否继续？",
      "schdb.fieldTime": "时间段",
      "schdb.fieldTopic": "Session / 主题",
      "schdb.fieldIntro": "简介",
      "schdb.fieldLoc": "地点（选填）",
      "schdb.fieldDetail": "详情（选填，展示页可展开显示）",
      "schdb.fieldGroupMatrix": "分组表（Excel 粘贴）",
      "schdb.groupPasteHint":
        "从 Excel 复制后粘贴到下方：第一行为表头，列之间为 Tab。中文表与英文表列数与行数宜一致；可只填一侧。下方实时预览。",
      "schdb.subZh": "中文",
      "schdb.subEn": "English",
      "schdb.edit": "编辑",
      "schdb.delete": "删除",
      "schdb.doneEdit": "完成编辑",
      "schdb.cancelEdit": "取消",
      "schdb.emptyDay": "暂无场次。请点击「添加场次」开始录入。",
      "schdb.versionSaved": "已保存 JSON 版本并写入本机草稿",
      "schdb.versionsHeading": "已保存的 JSON 版本",
      "schdb.versionsHint":
        "每次点击「保存到日程」会按时间新增一条快照（最多保留 50 条）。可下载任意版本，或使用「还原」将整条草稿恢复为该版本（当前未保存的编辑将丢失）。",
      "schdb.versionsEmpty": "尚无已保存版本；点击「保存到日程」创建第一条。",
      "schdb.versionRowMeta": "· 共 {n} 条场次",
      "schdb.versionDownload": "下载",
      "schdb.versionRestore": "还原",
      "schdb.versionRestoreConfirm": "用该版本覆盖当前草稿？未自动保存的修改将丢失。",
      "schdb.versionsSaveErr": "无法写入版本列表（存储空间或权限不足）。",
      "schdb.syncToFront": "同步所有日程到前台",
      "schdb.syncToFrontDone":
        "已将当前录入的全部日程同步到本机前台；请打开或刷新「日程安排」页面查看（与服务器上的 si-schedule-db.json 无关，仅本浏览器）。",
      "schdb.actorPrompt": "请输入姓名（将记录为发布人/更新人）",
      "schdb.actorRequired": "请填写姓名后再同步。",
      "schdb.publishSaveErr": "无法写入浏览器存储，请检查空间或权限后重试。",
      "schdb.frontUnpublished": "尚未同步到前台日程页。",
      "schdb.frontSlotNote":
        "前台按「日期 + 场次序号」应用本条；若不同分组在同一天、同一场次序号下分别同步，后同步的会覆盖先同步的内容。",
      "schdb.statusPublished": "已发布",
      "schdb.statusUpdated": "已更新",
      "menu.hotel": "酒店信息",
      "menu.transportation": "交通安排",
      "menu.wifi": "无线网络、打印与帮助",
      "menu.photo": "照片直播",
      "menu.dress": "着装与合影",
      "menu.reselect": "参训范围及时间",
      "menu.navAria": "培训信息与工具",
      "detail.back": "返回菜单",
      "detail.sectionHeading": "页面内容",
      "detail.placeholder":
        "此处为结构占位。不同参训范围将加载对应的日程、酒店、交通等内容（后续接入数据或 CMS）。",
      "scopeChip.v1": "当前选择：8月5–7日 · 中方四级及以上高层等",
      "scopeChip.v2": "当前选择：8月3–7日 · CEHOS / Senior CIO / HOS",
      "schedule.menu": "菜单",
      "schedule.tablistAria": "按日期切换日程",
      "schedule.expand": "展开详细日程",
      "schedule.collapse": "收起详细日程",
      "schedule.tableAria": "分会场与地点安排",
      "schedule.logoAlt": "2026 Summer Institute 标识",
      "hotel.brandHeading": "酒店品牌",
      "hotel.rafflesAlt": "莱佛士酒店标识",
      "hotel.hotelName": "深圳鹏瑞莱佛士酒店",
      "hotel.subAddress": "地址",
      "hotel.addressFull": "广东省深圳市南山区科苑南路2600号",
      "hotel.viewRoute": "查看路线",
      "hotel.chooseMap": "选择地图应用",
      "hotel.mapAmap": "高德地图",
      "hotel.mapApple": "苹果地图",
      "hotel.mapBaidu": "百度地图",
      "hotel.mapCancel": "取消",
      "hotel.subTel": "酒店电话",
      "hotel.phone": "0755-86261234",
      "hotel.subBreakfast": "早餐",
      "hotel.breakfastTime": "6:30AM-10:30AM",
      "hotel.breakfastVenue": "酒店6楼润公馆",
      "hotel.subNotice": "酒店入住须知",
      "hotel.notice1": "入住时间：15:00后",
      "hotel.notice2": "退房时间：12:00前",
      "hotel.notice2detail":
        "若在8月7日返程，请在早上前往蛇口校区培训前须办理好退房手续，并带上行李，行李集中存放在校区指定地点。",
      "hotel.notice3": "如在入住期间需要帮助，请及时联系集团行政事务中心或各校行政人事部。",
      "hotel.notice4": "酒店上车/下车点：",
      "hotel.pickupPointImgAlt": "酒店上车与下车点示意图",
      "hotel.viewLargeImage": "查看大图",
      "hotel.closeLargeImage": "关闭",
      "transport.docNavAria": "培训交通文档",
      "transport.tile1": "校区聚餐车辆安排",
      "transport.tile2": "接驳班车安排表",
      "transport.backLink": "← 返回交通安排",
      "transport.timetableLead":
        "为方便培训期间的通勤，集团统一安排了酒店往返校区的穿梭巴士，请您合理安排时间，至少提前10分钟到达上车点，巴士将准时发车。",
      "transport.panel1Label": "住宿地点：",
      "transport.panel1Name": "安达仕酒店",
      "transport.panel2Label": "住宿地点：",
      "transport.panel2Name": "蛇口校区公寓",
      "transport.panel3Label": "住宿地点：",
      "transport.panel3Name": "其他",
      "transport.dinnerScope": "仅限8月6日校区聚餐",
      "transport.shuttleTableAlt":
        "接驳班车安排表：按住宿类别分三表，均为日期、发车时间与路线；如有调整以现场公布为准。",
      "transport.shuttleCaption": "班车安排（仅适用于 8 月 7 日校区聚餐）",
      "transport.shuttleAddr1Title": "住宿地点：安达仕酒店",
      "transport.shuttleAddr2Title": "住宿地点：蛇口校区公寓",
      "transport.shuttleAddr3Title": "其他住家领导",
      "transport.scheduleColDate": "日期",
      "transport.scheduleColDepart": "发车时间",
      "transport.scheduleColRoute": "路线",
      "transport.andazDate5": "8月5日 (周三)",
      "transport.andaz5t1": "7:20",
      "transport.andaz5r1": "酒店 → 南贝幼校区",
      "transport.andaz5t2": "17:30",
      "transport.andaz5r2": "南贝幼校区 → 晚宴餐厅（南山香格里拉酒店）",
      "transport.andaz5t3": "20:30",
      "transport.andaz5r3": "晚宴餐厅（南山香格里拉酒店）→ 酒店",
      "transport.andazDate6": "8月6日 (周四)",
      "transport.andaz6t1": "7:40",
      "transport.andaz6r1": "酒店 → 蛇口校区",
      "transport.andaz6t2": "17:30",
      "transport.andaz6r2": "蛇口校区 → 各校自定餐厅",
      "transport.andaz6t3": "20:30",
      "transport.andaz6r3": "各校自定餐厅 → 酒店（校区行政安排）",
      "transport.andazDate7": "8月7日 (周五)",
      "transport.andaz7t1": "7:40",
      "transport.andaz7r1": "酒店 → 蛇口校区",
      "transport.andaz7t2": "17:30",
      "transport.andaz7r2": "蛇口校区 → 机场/归校",
      "transport.apartmentDate5": "8月5日 (周三)",
      "transport.apt5t1": "7:40",
      "transport.apt5r1": "蛇口校区 → 南贝幼校区",
      "transport.apt5t2": "17:30",
      "transport.apt5r2": "南贝幼校区 → 晚宴餐厅（南山香格里拉酒店）",
      "transport.apt5t3": "20:30",
      "transport.apt5r3": "酒店 → 蛇口校区",
      "transport.apartmentDate6": "8月6日 (周四)",
      "transport.apt6t1": "17:30",
      "transport.apt6r1": "蛇口校区 → 各校自定餐厅",
      "transport.apt6t2": "20:30",
      "transport.apt6r2": "各校自定餐厅 → 蛇口校区（校区行政安排）",
      "transport.leadersDate5": "8月5日 (周三)",
      "transport.lr5t1": "另行通知",
      "transport.lr5r1": "家 → 南贝幼校区",
      "transport.lr5t2": "17:30",
      "transport.lr5r2": "南贝幼校区 → 晚宴餐厅（南山香格里拉酒店）",
      "transport.lr5t3": "20:30",
      "transport.lr5r3": "酒店 → 家",
      "transport.leadersDate6": "8月6日 (周四)",
      "transport.lr6t1": "自行安排",
      "transport.lr6r1": "家 → 蛇口校区",
      "transport.lr6t2": "17:30",
      "transport.lr6r2": "蛇口校区 → 各校自定餐厅",
      "transport.lr6t3": "20:30",
      "transport.lr6r3": "各校自定餐厅 → 家（校区行政安排）",
      "transport.leadersDate7": "8月7日 (周五)",
      "transport.lr7t1": "自行安排",
      "transport.lr7r1": "家 ⇌ 蛇口校区",
      "transport.dinnerLead":
        "8月6日晚餐为各校区在校外餐厅聚餐，届时请各校区按车辆安排中指定车辆编号上车前往自定餐厅，用餐结束后返程用车由各校行政同事安排。",
      "transport.dinnerBusCaption": "8月6日校区聚餐车辆与编号对照表",
      "transport.dinnerBusColPersonnel": "人员",
      "transport.dinnerBusColVehicle": "车辆编号",
      "transport.dinnerBusR1p": "蛇口校区/总校办/BOES",
      "transport.dinnerBusR1v": "1,2,3",
      "transport.dinnerBusR2p": "广州校区/武汉校区",
      "transport.dinnerBusR2v": "4,5,6",
      "transport.dinnerBusR3p": "杭州校区",
      "transport.dinnerBusR3v": "7,8",
      "transport.dinnerBusR4p": "小径湾校区",
      "transport.dinnerBusR4v": "9",
      "transport.dinnerBusR5p": "南京校区/北京校区",
      "transport.dinnerBusR5v": "10,11,12,13",
      "transport.dinnerBusR6p": "福田校区",
      "transport.dinnerBusR6v": "A,B",
      "transport.dinnerBusR7p": "成都校区",
      "transport.dinnerBusR7v": "14",
      "transport.dinnerBusR8p": "南贝幼校区/福贝幼校区",
      "transport.dinnerBusR8v": "15",
      "transport.dinnerBusR9p": "光明校区",
      "transport.dinnerBusR9v": "16",
      "transport.dinnerBusR10p": "广州双语校区",
      "transport.dinnerBusR10v": "17,18",
      "transport.reminderTitle": "温馨提示：",
      "transport.remTip1":
        "为方便培训期间的通勤，集团统一安排了酒店往返校区的穿梭巴士，请您合理安排时间，至少提前10分钟到达上车点，巴士将准时发车。",
      "transport.remTip2":
        "8月6日晚餐为各校区在校外餐厅聚餐，届时请各校区按车辆安排中指定车辆编号上车前往自定餐厅，用餐结束后返程用车由各校行政同事安排。",
      "wifi.biszTitle": "BISZ 校园 Wi‑Fi",
      "wifi.biszAccountLabel": "账号",
      "wifi.biszAccountValue": "BISZ Visitor",
      "wifi.biszPasswordLabel": "密码",
      "wifi.biszPasswordValue": "skbss,123",
      "wifi.printTitle": "打印服务",
      "wifi.printIntro": "培训期间，如您有打印需求，可前往以下位置：",
      "wifi.printColRoom": "课室",
      "wifi.printRoom536": "536",
      "wifi.printRoom423": "423",
      "wifi.printRoom319": "319",
      "wifi.printRoom201": "201",
      "wifi.printRoom109": "109",
      "wifi.printRoomDesk": "一楼信息咨询处",
      "wifi.deskHelpTitle": "信息咨询处 & 校医室",
      "wifi.deskHelpIntro":
        "培训期间，我们在一楼大厅设有信息咨询处、二楼223设有校医室，为您提供综合咨询、IT技术支持、校医服务。",
      "wifi.deskHelpColRole": "服务",
      "wifi.deskHelpColContact": "联系人",
      "wifi.deskHelpColTel": "联系电话",
      "wifi.deskHelpR1role": "IT 技术支持",
      "wifi.deskHelpR1contact": "黄靖",
      "wifi.deskHelpR1tel": "17328731934",
      "wifi.deskHelpR2role": "综合咨询",
      "wifi.deskHelpR2contact": "刘佩舒",
      "wifi.deskHelpR2tel": "15602283503",
      "wifi.deskHelpR3role": "教学岗培训日程咨询",
      "wifi.deskHelpR3contact": "王慧",
      "wifi.deskHelpR3tel": "13616712324",
      "wifi.deskHelpR4role": "校医",
      "wifi.deskHelpR4contact": "蒋畅",
      "wifi.deskHelpR4tel": "15926409987",
      "dress.pageTitle": "着装要求",
      "dress.intro": "请按要求穿着统一定制服装。",
      "dress.colDate": "日期",
      "dress.colReq": "要求",
      "dress.d1": "8月3日（周一）",
      "dress.a1": "自由着装",
      "dress.d2": "8月4日（周二）",
      "dress.a2": "浅灰色POLO衫",
      "dress.d3": "8月5日（周三）",
      "dress.a3": "自由着装",
      "dress.d4": "8月6日（周四）",
      "dress.a4": "浅灰色POLO衫",
      "dress.d5": "8月7日（周五）",
      "dress.a5": "咖色POLO衫",
      "dress.photoTitle": "校区合影时间",
      "dress.photoColDate": "日期",
      "dress.photoColTime": "时间",
      "dress.photoColCampus": "校区",
      "dress.photoDate6": "8月6日（周四）",
      "dress.photo6t1": "12:05",
      "dress.photo6c1": "BIHZ",
      "dress.photo6t2": "12:15",
      "dress.photo6c2": "BIPH",
      "dress.photo6t3": "13:00",
      "dress.photo6c3": "BINJ",
      "dress.photo6t4": "13:10",
      "dress.photo6c4": "BBBJ",
      "dress.photo6t5": "17:05",
      "dress.photo6c5": "BIGZ",
      "dress.photo6t6": "17:15",
      "dress.photo6c6": "BIBWH",
      "dress.photoDate7": "8月7日（周五）",
      "dress.photo7t1": "12:05",
      "dress.photo7c1": "BBSZ",
      "dress.photo7t2": "12:15",
      "dress.photo7c2": "BIBCD",
      "dress.photo7t3": "13:00",
      "dress.photo7c3": "BBGM",
      "dress.photo7t4": "13:10",
      "dress.photo7c4": "BBGZ",
      "dress.photo7t5": "17:05",
      "dress.photo7c5": "BKFT",
      "dress.photo7t6": "17:15",
      "dress.photo7c6": "BKNS",
      "dress.photo7t7": "17:25",
      "dress.photo7c7": "BISZ",
    },
    en: {
      "meta.title": "Summer Institute 2026",
      "menu.metaTitle": "Menu · 2026 Summer Institute",
      "a11y.skip": "Skip to main content",
      "header.langLabel": "EN→中文",
      "header.langAria": "Switch to Chinese",
      "hero.title": "Summer Institute 2026",
      "hero.logoAria": "Summer Institute 2026",
      "hero.subtitleZh": "中国 • 贝赛思国际/双语学校",
      "hero.subtitleEn": "BASIS INTERNATIONAL & BILINGUAL SCHOOLS • CHINA",
      "hero.titleZh": "暑期培训",
      "hero.dateEn": "August 3rd–7th, 2026",
      "hero.dateZh": "2026年8月3日–7日",
      "hero.addressEn":
        "BASIS International School Shenzhen No. 198, Yanshan Road, Nanshan District, Shenzhen, Guangdong, China",
      "hero.addressZh": "深圳贝赛思国际学校广东省深圳市南山区沿山路198号",
      "section.titleZh": "参训范围及时间",
      "section.titleEn": "Attendees & Participation Days",
      "section.hint": "Please choose your scope",
      "abbr.metaTitle": "Abbreviation List · 2026 Summer Institute",
      "abbr.pageTitle": "Abbreviation List",
      "abbr.indexLink": "Abbreviation list",
      "footer.copyright":
        "Copyright © 2026 Teknova (Shenzhen) Education Technology Co., Limited. All Rights Reserved",
      "footer.icp": "ICP备案号：粤ICP备19153114号",
      "abbr.backLink": "← Back to home",
      "abbr.l01": "CEHOS Office: Chief Executive Head of School Office",
      "abbr.l02": "ECE: Early Childhood Education",
      "abbr.l03": "PS: Primary School",
      "abbr.l04": "MS: Middle School",
      "abbr.l05": "HS: High School",
      "abbr.l06": "BISZ: BASIS International School Shenzhen",
      "abbr.l07": "BIGZ: BASIS International School Guangzhou",
      "abbr.l08": "BIHZ: BASIS International School Hangzhou",
      "abbr.l09": "BIPH: BASIS International School Park Lane Harbour",
      "abbr.l10": "BINJ: BASIS International School Nanjing",
      "abbr.l11": "BBSZ: BASIS Bilingual School Shenzhen",
      "abbr.l12": "BIBCD: BASIS International & Bilingual Schools Chengdu",
      "abbr.l13": "BIBWH: BASIS International & Bilingual Schools Wuhan",
      "abbr.l14": "BKNS: BASIS Bilingual Kindergarten Nanshan",
      "abbr.l15": "BKFT: BASIS Bilingual Kindergarten Futian",
      "abbr.l16": "BBGM: BASIS Bilingual School Guangming Shenzhen",
      "abbr.l17": "BBBJ: BASIS Bilingual School Beijing",
      "abbr.l18": "BBGZ: BASIS Bilingual School Guangzhou",
      "abbr.l19": "HOS: Head of School",
      "abbr.l20": "VHOS: Vice Head of School",
      "abbr.l21": "HOD: Head of Division",
      "abbr.l22": "VHOD: Vice Head of Division",
      "abbr.l23": "DAP: Director of Academic Programs",
      "abbr.l24": "CAD: Course Advisor",
      "abbr.l25": "CC: Curriculum Coordinator",
      "abbr.l26": "LET: Learning Enhancement Teacher",
      "abbr.l27": "SET: Subject Expert Teacher",
      "abbr.l28": "RT: Round Table",
      "abbr.l29": "ELL: English Language Learning",
      "abbr.l30": "ICT&CS: Information & Communications Technology and Computer Science",
      "abbr.l31": "DCA: Director of College Admissions",
      "abbr.l32": "CAC: College Admissions Coordinator",
      "abbr.l33": "CCD: Course Curriculum Document",
      "abbr.l34": "COT: Course Outline Template",
      "scope.v1.title": "August 5th–7th",
      "scope.v1.i1": "Chinese-side Tier 4+ senior leadership",
      "scope.v1.i2":
        "Deputy Head of School Operations, Chengdu campus; Assistant Head of School Operations, Guangzhou Bilingual campus",
      "scope.v1.i3":
        "Executive Deputy General Manager, Nanbay / Youfu ECE; Deputy General Manager, Youfu ECE",
      "scope.v2.title": "August 3rd–7th",
      "scope.v2.i1": "CEHOS",
      "scope.v2.i2": "Senior CIO/CIO",
      "scope.v2.i3": "HOS",
      "menu.schedule": "Schedule",
      "menu.scheduleDb": "Schedule data entry",
      "schdb.metaTitle": "Schedule data entry · 2026 Summer Institute",
      "schdb.title": "Schedule data entry",
      "schdb.lead":
        "Enter sessions by group and date. Draft edits auto-save to this browser; click Save to schedule to snapshot the current draft as a new JSON version (see list below). Export/import for backup; deploy updates via your usual si-schedule-db.json workflow.",
      "schdb.scopesHeading": "Groups",
      "schdb.scopesFoldTitle": "Click to collapse all dates under each group",
      "schdb.scopesFoldAria": "Collapse all dates under each group",
      "schdb.scope.v1":
        "Aug 5–7 · Chinese-side Tier 4+ senior leadership; DHOS Chengdu; Assistant HOS Guangzhou Bilingual; Exec. / Deputy DGM Nanbay / Youfu ECE",
      "schdb.scope.v2": "Aug 3–7 · CEHOS; Senior CIO/CIO; HOS",
      "schdb.dayPrefix": "Date",
      "schdb.addRow": "Add session",
      "schdb.removeRow": "Remove",
      "schdb.saveToSchedule": "Save to schedule",
      "schdb.export": "Export JSON",
      "schdb.importPick": "Choose JSON file",
      "schdb.saved": "Saved locally",
      "schdb.saveIdle": "Edits are auto-saved shortly after you stop typing",
      "schdb.importOk": "Import completed",
      "schdb.importErr": "Import failed: invalid file",
      "schdb.importReplace": "Import will replace all current entries. Continue?",
      "schdb.fieldTime": "Time slot",
      "schdb.fieldTopic": "Session / topic",
      "schdb.fieldIntro": "Introduction",
      "schdb.fieldLoc": "Location (optional)",
      "schdb.fieldDetail": "Details (optional; expandable on the schedule view)",
      "schdb.fieldGroupMatrix": "Breakout / groups (Excel paste)",
      "schdb.groupPasteHint":
        "Copy from Excel and paste below: first row is headers; use tabs between columns. Zh and En grids should align when both are used. Preview updates as you type.",
      "schdb.subZh": "Chinese",
      "schdb.subEn": "English",
      "schdb.edit": "Edit",
      "schdb.delete": "Delete",
      "schdb.doneEdit": "Save edits",
      "schdb.cancelEdit": "Cancel",
      "schdb.emptyDay": "No sessions yet. Use Add session to start.",
      "schdb.versionSaved": "JSON version saved; draft updated locally",
      "schdb.versionsHeading": "Saved JSON versions",
      "schdb.versionsHint":
        "Each Save to schedule appends a timestamped snapshot (up to 50 kept). Download any version, or Restore to replace your current draft with that snapshot (unsaved edits are lost).",
      "schdb.versionsEmpty": "No saved versions yet. Click Save to schedule to create the first one.",
      "schdb.versionRowMeta": "· {n} session rows",
      "schdb.versionDownload": "Download",
      "schdb.versionRestore": "Restore",
      "schdb.versionRestoreConfirm": "Replace the current draft with this version? Unsaved changes will be lost.",
      "schdb.versionsSaveErr": "Could not save the version list (storage quota or permissions).",
      "schdb.syncToFront": "Sync all sessions to the schedule page",
      "schdb.syncToFrontDone":
        "All entered sessions are now synced to this browser’s schedule view. Open or refresh the Schedule page to see them (local only; not the server JSON file).",
      "schdb.actorPrompt": "Your name (stored as publisher / updater)",
      "schdb.actorRequired": "Enter a name before syncing.",
      "schdb.publishSaveErr": "Could not save to browser storage. Check quota or permissions and try again.",
      "schdb.frontUnpublished": "Not yet synced to the public schedule page.",
      "schdb.frontSlotNote":
        "The public page applies this by date + session order. If two groups sync the same day and the same session index, the later sync overwrites the earlier one.",
      "schdb.statusPublished": "Published",
      "schdb.statusUpdated": "Updated",
      "menu.hotel": "Hotel Information",
      "menu.transportation": "Transportation Arrangement",
      "menu.wifi": "WIFI & Printing & HELP",
      "menu.photo": "Photo Live Streaming",
      "menu.dress": "Attire & Group Photo",
      "menu.reselect": "Attendees & Participation Days",
      "menu.navAria": "Institute resources",
      "detail.back": "Back to menu",
      "detail.sectionHeading": "Page content",
      "detail.placeholder":
        "Structured placeholder. Schedule, hotel, transportation, and other modules will vary by the selected attendance scope (to be wired to data or CMS).",
      "scopeChip.v1": "Selected: Aug 5–7 · Chinese-side senior leadership, etc.",
      "scopeChip.v2": "Selected: Aug 3–7 · CEHOS / Senior CIO / HOS",
      "schedule.menu": "Menu",
      "schedule.tablistAria": "Select schedule day",
      "schedule.expand": "Expand session details",
      "schedule.collapse": "Collapse session details",
      "schedule.tableAria": "Breakout locations by audience",
      "schedule.logoAlt": "2026 Summer Institute logo",
      "hotel.brandHeading": "Hotel brand",
      "hotel.rafflesAlt": "Raffles hotel logo",
      "hotel.hotelName": "Raffles Shenzhen Bay",
      "hotel.subAddress": "Address",
      "hotel.addressFull": "No. 2600 Keyuan South Road, Nanshan District, Shenzhen, Guangdong, China",
      "hotel.viewRoute": "View route",
      "hotel.chooseMap": "Choose a maps app",
      "hotel.mapAmap": "Amap",
      "hotel.mapApple": "Apple Maps",
      "hotel.mapBaidu": "Baidu Maps",
      "hotel.mapCancel": "Cancel",
      "hotel.subTel": "Hotel phone",
      "hotel.phone": "0755-86261234",
      "hotel.subBreakfast": "Breakfast",
      "hotel.breakfastTime": "6:30 AM – 10:30 AM",
      "hotel.breakfastVenue": "Run Mansion, 6th floor",
      "hotel.subNotice": "Hotel stay notice",
      "hotel.notice1": "Check-in: after 3:00 PM",
      "hotel.notice2": "Check-out: before 12:00 PM",
      "hotel.notice2detail":
        "If you depart on August 7, complete check-out with your luggage before the morning session at the Shekou campus. Luggage will be stored at a designated spot on campus.",
      "hotel.notice3":
        "If you need assistance during your stay, contact the Group Administration Center or your campus Administration & Human Resources.",
      "hotel.notice4": "Hotel pick-up / drop-off point:",
      "hotel.pickupPointImgAlt": "Illustration of hotel pick-up and drop-off point",
      "hotel.viewLargeImage": "View full image",
      "hotel.closeLargeImage": "Close",
      "transport.docNavAria": "Transportation documents",
      "transport.tile1": "Bus for Campus Dinner",
      "transport.tile2": "Shuttle Schedule",
      "transport.backLink": "← Back to Transportation",
      "transport.timetableLead":
        "To make commuting easier during the training, the Group provides shuttle buses between the hotel and the campus. Please plan your time and arrive at the pick-up point at least 10 minutes before departure; buses leave on schedule.",
      "transport.panel1Label": "Accommodation:",
      "transport.panel1Name": "Andaz Hotel",
      "transport.panel2Label": "For Accommodation:",
      "transport.panel2Name": "Shekou Apartment",
      "transport.panel3Label": "For Accommodation:",
      "transport.panel3Name": "Others",
      "transport.dinnerScope": "August 6 campus dinner only",
      "transport.shuttleTableAlt":
        "Three shuttle schedule tables by accommodation type, each with date, departure time, and route.",
      "transport.shuttleCaption": "Bus Arrangement (only for campus banquet on August 7)",
      "transport.shuttleAddr1Title": "Accommodation: Andaz Hotel",
      "transport.shuttleAddr2Title": "Accommodation: Shekou campus apartments",
      "transport.shuttleAddr3Title": "Other leaders staying at home",
      "transport.scheduleColDate": "Date",
      "transport.scheduleColDepart": "Departure time",
      "transport.scheduleColRoute": "Route",
      "transport.andazDate5": "August 5th (Wed)",
      "transport.andaz5t1": "7:20",
      "transport.andaz5r1": "Hotel → Nanbei Kindergarten campus",
      "transport.andaz5t2": "17:30",
      "transport.andaz5r2": "Nanbei Kindergarten campus → Dinner venue (Shangri-La Hotel, Nanshan)",
      "transport.andaz5t3": "20:30",
      "transport.andaz5r3": "Dinner venue (Shangri-La Hotel, Nanshan) → Hotel",
      "transport.andazDate6": "August 6th (Thu)",
      "transport.andaz6t1": "7:40",
      "transport.andaz6r1": "Hotel → Shekou campus",
      "transport.andaz6t2": "17:30",
      "transport.andaz6r2": "Shekou campus → Each campus’s designated restaurant",
      "transport.andaz6t3": "20:30",
      "transport.andaz6r3": "Each campus’s designated restaurant → Hotel (return arranged by campus administration)",
      "transport.andazDate7": "August 7th (Fri)",
      "transport.andaz7t1": "7:40",
      "transport.andaz7r1": "Hotel → Shekou campus",
      "transport.andaz7t2": "17:30",
      "transport.andaz7r2": "Shekou campus → Airport / return to school",
      "transport.apartmentDate5": "August 5th (Wed)",
      "transport.apt5t1": "7:40",
      "transport.apt5r1": "Shekou campus → Nanbei Kindergarten campus",
      "transport.apt5t2": "17:30",
      "transport.apt5r2": "Nanbei Kindergarten campus → Dinner venue (Shangri-La Hotel, Nanshan)",
      "transport.apt5t3": "20:30",
      "transport.apt5r3": "Hotel → Shekou campus",
      "transport.apartmentDate6": "August 6th (Thu)",
      "transport.apt6t1": "17:30",
      "transport.apt6r1": "Shekou campus → Each campus’s designated restaurant",
      "transport.apt6t2": "20:30",
      "transport.apt6r2": "Each campus’s designated restaurant → Shekou campus (arranged by campus administration)",
      "transport.leadersDate5": "August 5th (Wed)",
      "transport.lr5t1": "To be notified separately",
      "transport.lr5r1": "Home → Nanbei Kindergarten campus",
      "transport.lr5t2": "17:30",
      "transport.lr5r2": "Nanbei Kindergarten campus → Dinner venue (Shangri-La Hotel, Nanshan)",
      "transport.lr5t3": "20:30",
      "transport.lr5r3": "Hotel → Home",
      "transport.leadersDate6": "August 6th (Thu)",
      "transport.lr6t1": "Self-arranged",
      "transport.lr6r1": "Home → Shekou campus",
      "transport.lr6t2": "17:30",
      "transport.lr6r2": "Shekou campus → Each campus’s designated restaurant",
      "transport.lr6t3": "20:30",
      "transport.lr6r3": "Each campus’s designated restaurant → Home (arranged by campus administration)",
      "transport.leadersDate7": "August 7th (Fri)",
      "transport.lr7t1": "Self-arranged",
      "transport.lr7r1": "Home ⇄ Shekou campus",
      "transport.dinnerLead":
        "On August 6, each campus will hold its off-campus dinner. Please board the bus number specified in the vehicle arrangement to go to your assigned restaurant. After dinner, return transportation will be arranged by your campus administrative colleagues.",
      "transport.dinnerBusCaption": "August 6 campus dinner: personnel and vehicle numbers",
      "transport.dinnerBusColPersonnel": "Personnel",
      "transport.dinnerBusColVehicle": "Vehicle no.",
      "transport.dinnerBusR1p": "Shekou campus / Head Office / BOES",
      "transport.dinnerBusR1v": "1, 2, 3",
      "transport.dinnerBusR2p": "Guangzhou campus / Wuhan campus",
      "transport.dinnerBusR2v": "4, 5, 6",
      "transport.dinnerBusR3p": "Hangzhou campus",
      "transport.dinnerBusR3v": "7, 8",
      "transport.dinnerBusR4p": "Xiaojing Bay campus",
      "transport.dinnerBusR4v": "9",
      "transport.dinnerBusR5p": "Nanjing campus / Beijing campus",
      "transport.dinnerBusR5v": "10, 11, 12, 13",
      "transport.dinnerBusR6p": "Futian campus",
      "transport.dinnerBusR6v": "A, B",
      "transport.dinnerBusR7p": "Chengdu campus",
      "transport.dinnerBusR7v": "14",
      "transport.dinnerBusR8p": "Nanbei Kindergarten campus / Futian Kindergarten campus",
      "transport.dinnerBusR8v": "15",
      "transport.dinnerBusR9p": "Guangming campus",
      "transport.dinnerBusR9v": "16",
      "transport.dinnerBusR10p": "Guangzhou bilingual campus",
      "transport.dinnerBusR10v": "17, 18",
      "transport.reminderTitle": "Friendly reminder:",
      "transport.remTip1":
        "To make commuting easier during the training, the Group provides shuttle buses between the hotel and the campus. Please plan your time and arrive at the pick-up point at least 10 minutes before departure; buses leave on schedule.",
      "transport.remTip2":
        "On August 6, each campus will hold its off-campus dinner. Please board the bus number specified in the vehicle arrangement to go to your assigned restaurant. After dinner, return transportation will be arranged by your campus administrative colleagues.",
      "wifi.biszTitle": "BISZ Campus WIFI",
      "wifi.biszAccountLabel": "Account",
      "wifi.biszAccountValue": "BISZ Visitor",
      "wifi.biszPasswordLabel": "Password",
      "wifi.biszPasswordValue": "skbss,123",
      "wifi.printTitle": "Printing",
      "wifi.printIntro": "If needed, you may print materials in the following rooms:",
      "wifi.printColRoom": "Room No.",
      "wifi.printRoom536": "536",
      "wifi.printRoom423": "423",
      "wifi.printRoom319": "319",
      "wifi.printRoom201": "201",
      "wifi.printRoom109": "109",
      "wifi.printRoomDesk": "Information Desk on 1st Floor",
      "wifi.deskHelpTitle": "Information Desk & HELP",
      "wifi.deskHelpIntro":
        "During the training, there will be an information desk in the lobby of 1st floor and an infirmary (Room 223) on 2nd floor. We will provide you with IT technical support, comprehensive consulting, school doctor and other services.",
      "wifi.deskHelpColRole": "Service",
      "wifi.deskHelpColContact": "Contact",
      "wifi.deskHelpColTel": "Tel",
      "wifi.deskHelpR1role": "IT Support",
      "wifi.deskHelpR1contact": "Danny Huang",
      "wifi.deskHelpR1tel": "17328731934",
      "wifi.deskHelpR2role": "General Consulting",
      "wifi.deskHelpR2contact": "Joanne Liu",
      "wifi.deskHelpR2tel": "15602283503",
      "wifi.deskHelpR3role": "Schedule Consulting (Educational Side)",
      "wifi.deskHelpR3contact": "Dinah Wang",
      "wifi.deskHelpR3tel": "13616712324",
      "wifi.deskHelpR4role": "School Nurse",
      "wifi.deskHelpR4contact": "Ms. Jiang",
      "wifi.deskHelpR4tel": "15926409987",
      "dress.pageTitle": "Dress Code",
      "dress.intro": "Please dress according to the dress code below.",
      "dress.colDate": "Date",
      "dress.colReq": "Requirement",
      "dress.d1": "August 3 (Mon.)",
      "dress.a1": "No Requirement",
      "dress.d2": "August 4 (Tues.)",
      "dress.a2": "Light Gray Polo",
      "dress.d3": "August 5 (Wed.)",
      "dress.a3": "No Requirement",
      "dress.d4": "August 6 (Thur.)",
      "dress.a4": "Light Gray Polo",
      "dress.d5": "August 7 (Fri.)",
      "dress.a5": "Brown Polo",
      "dress.photoTitle": "Group Photo Time",
      "dress.photoColDate": "Date",
      "dress.photoColTime": "Time",
      "dress.photoColCampus": "Campus",
      "dress.photoDate6": "August 6 (Thur.)",
      "dress.photo6t1": "12:05",
      "dress.photo6c1": "BIHZ",
      "dress.photo6t2": "12:15",
      "dress.photo6c2": "BIPH",
      "dress.photo6t3": "13:00",
      "dress.photo6c3": "BINJ",
      "dress.photo6t4": "13:10",
      "dress.photo6c4": "BBBJ",
      "dress.photo6t5": "17:05",
      "dress.photo6c5": "BIGZ",
      "dress.photo6t6": "17:15",
      "dress.photo6c6": "BIBWH",
      "dress.photoDate7": "August 7 (Fri.)",
      "dress.photo7t1": "12:05",
      "dress.photo7c1": "BBSZ",
      "dress.photo7t2": "12:15",
      "dress.photo7c2": "BIBCD",
      "dress.photo7t3": "13:00",
      "dress.photo7c3": "BBGM",
      "dress.photo7t4": "13:10",
      "dress.photo7c4": "BBGZ",
      "dress.photo7t5": "17:05",
      "dress.photo7c5": "BKFT",
      "dress.photo7t6": "17:15",
      "dress.photo7c6": "BKNS",
      "dress.photo7t7": "17:25",
      "dress.photo7c7": "BISZ",
    },
  };

  function getStoredLang() {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === "zh" || v === "en") return v;
    } catch {
      /* ignore */
    }
    const nav = navigator.language || "";
    return nav.toLowerCase().startsWith("zh") ? "zh" : "en";
  }

  function getScope() {
    try {
      return localStorage.getItem(SCOPE_KEY);
    } catch {
      return null;
    }
  }

  function setScope(value) {
    try {
      localStorage.setItem(SCOPE_KEY, value);
    } catch {
      /* ignore */
    }
  }

  function t(lang, key) {
    const dict = messages[lang];
    return dict && dict[key] != null ? dict[key] : key;
  }

  function getLang() {
    return document.documentElement.getAttribute("data-si-lang") || getStoredLang();
  }

  function renderScopeCards(lang) {
    const panel = document.getElementById("panel-scopes");
    if (!panel) return;
    panel.innerHTML = "";
    scopeCardDefs.forEach((def) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "si-scope" + (def.muted ? " si-scope--muted" : "");
      btn.dataset.scope = def.scope;
      const body = document.createElement("div");
      body.className = "si-scope__body";
      const title = document.createElement("h3");
      title.className = "si-scope__title";
      title.textContent = t(lang, def.dateKey);
      const ul = document.createElement("ul");
      ul.className = "si-scope__list";
      def.itemKeys.forEach((ik) => {
        const li = document.createElement("li");
        li.textContent = t(lang, ik);
        ul.appendChild(li);
      });
      body.appendChild(title);
      body.appendChild(ul);
      const arrow = document.createElement("span");
      arrow.className = "si-scope__arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M17.84 15.4679C18.14 14.8679 18.44 14.3279 18.74 13.8479C19.06 13.3679 19.38 12.9379 19.7 12.5579H2V11.5379H19.7C19.38 11.1579 19.06 10.7279 18.74 10.2479C18.44 9.76793 18.14 9.22793 17.84 8.62793H18.65C19.89 10.0479 21.2 11.1279 22.58 11.8679V12.2279C21.2 12.9479 19.89 14.0279 18.65 15.4679H17.84Z" fill="currentColor"/></svg>';
      btn.appendChild(body);
      btn.appendChild(arrow);
      panel.appendChild(btn);
    });
  }

  function bindScopePanelDelegation() {
    const panel = document.getElementById("panel-scopes");
    if (!panel || panel.dataset.delegation === "1") return;
    panel.dataset.delegation = "1";
    panel.addEventListener("click", (e) => {
      const btn = e.target && e.target.closest && e.target.closest(".si-scope[data-scope]");
      if (!btn) return;
      const id = btn.getAttribute("data-scope");
      if (!id) return;
      setScope(id);
      window.location.href = "menu.html";
    });
  }

  function migrateStaleScope() {
    try {
      const s = localStorage.getItem(SCOPE_KEY);
      if (s && !["v1", "v2"].includes(s)) {
        localStorage.removeItem(SCOPE_KEY);
      }
      if (s === "v3" || s === "admin" || s === "teaching") {
        localStorage.removeItem(SCOPE_KEY);
      }
    } catch {
      /* ignore */
    }
  }

  function updateScopeChip() {
    const el = document.getElementById("scope-chip");
    if (!el) return;
    const scope = getScope();
    const lang = getLang();
    if (!scope || !messages[lang]["scopeChip." + scope]) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = t(lang, "scopeChip." + scope);
  }

  function updateDetailPage() {
    if (document.body.dataset.page !== "detail") return;
    const lang = getLang();
    const scope = getScope();
    const scopeEl = document.getElementById("detail-scope");
    if (scopeEl) {
      scopeEl.textContent =
        scope && messages[lang]["scopeChip." + scope] ? t(lang, "scopeChip." + scope) : "";
    }
    const ph = document.getElementById("detail-placeholder");
    if (ph) {
      ph.textContent = t(lang, "detail.placeholder");
    }
  }

  function applyLang(lang) {
    const dict = messages[lang];
    if (!dict) return;

    document.documentElement.setAttribute("data-si-lang", lang);
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key || dict[key] == null) return;
      el.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      if (!key || dict[key] == null) return;
      el.setAttribute("alt", dict[key]);
    });

    document.querySelectorAll("[data-i18n-aria-label]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria-label");
      if (!key || dict[key] == null) return;
      el.setAttribute("aria-label", dict[key]);
    });

    const langBtn = document.getElementById("lang-toggle");
    if (langBtn && dict["header.langAria"]) {
      langBtn.setAttribute("aria-label", dict["header.langAria"]);
    }

    const menuNav = document.getElementById("menu-nav");
    if (menuNav && dict["menu.navAria"]) {
      menuNav.setAttribute("aria-label", dict["menu.navAria"]);
    }

    const scheduleTabs = document.getElementById("schedule-date-tabs");
    if (scheduleTabs && dict["schedule.tablistAria"]) {
      scheduleTabs.setAttribute("aria-label", dict["schedule.tablistAria"]);
    }

    if (document.getElementById("panel-scopes")) {
      renderScopeCards(lang);
    }

    updateScopeChip();
    updateDetailPage();

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }

    document.dispatchEvent(new CustomEvent("si-lang-applied", { detail: { lang } }));
  }

  function toggleLang() {
    const next = getLang() === "zh" ? "en" : "zh";
    applyLang(next);
  }

  function bindLangToggle() {
    const btn = document.getElementById("lang-toggle");
    if (!btn || btn.dataset.bound === "1") return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", toggleLang);
  }

  function initHome() {
    bindLangToggle();
    applyLang(getStoredLang());
    bindScopePanelDelegation();
  }

  function initMenu() {
    migrateStaleScope();
    if (!getScope()) {
      window.location.replace("index.html");
      return;
    }
    bindLangToggle();
    applyLang(getStoredLang());
  }

  function initDetail() {
    migrateStaleScope();
    if (!getScope()) {
      window.location.replace("index.html");
      return;
    }
    bindLangToggle();
    applyLang(getStoredLang());
  }

  function initSchedule() {
    migrateStaleScope();
    if (!getScope()) {
      window.location.replace("index.html");
      return;
    }
    bindLangToggle();
    applyLang(getStoredLang());
    if (typeof window.__siScheduleInit === "function") {
      window.__siScheduleInit();
    }
  }

  function initInner() {
    migrateStaleScope();
    if (!getScope()) {
      window.location.replace("index.html");
      return;
    }
    bindLangToggle();
    applyLang(getStoredLang());
  }

  function initSchdb() {
    migrateStaleScope();
    bindLangToggle();
    applyLang(getStoredLang());
  }

  window.SI_I18N = {
    t: (key) => t(getLang(), key),
    getLang,
  };

  const page = document.body.dataset.page || "home";
  if (page === "menu") {
    initMenu();
  } else if (page === "detail") {
    initDetail();
  } else if (page === "schedule") {
    initSchedule();
  } else if (page === "schdb") {
    initSchdb();
  } else if (page === "inner") {
    initInner();
  } else {
    initHome();
  }
})();
