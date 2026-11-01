/**
 * 新手航线的全部静态内容。
 * 文案在这里改，不用动数据库。
 */

export type KnowledgeCard = {
  question: string;
  answer: string;
  tip?: string;
};

export type JourneyTask = {
  key: string;
  title: string;
  hint?: string;
  card: KnowledgeCard;
};

export type JourneyDay = {
  day: number;
  title: string;
  mood: string;
  tasks: JourneyTask[];
};

export const JOURNEY_DAYS: JourneyDay[] = [
  {
    day: 1,
    title: "把家变安全",
    mood: "今天只做一件事：让它住进来之前，家里没有能伤到它的东西。",
    tasks: [
      {
        key: "day1-window",
        title: "封窗",
        hint: "装金刚网，或者把窗户限位在 10cm 以内",
        card: {
          question: "猫会从纱窗缝里钻出去吗？",
          answer: "会。普通纱窗一撞就破，高层开窗不封网是最常见的事故原因。",
          tip: "「就开了一会儿」是坠猫事故里出现最多的一句话。",
        },
      },
      {
        key: "day1-wire",
        title: "收电线",
        hint: "插线板、充电线收进线管或带盖的柜子",
        card: {
          question: "猫为什么专咬电线？",
          answer: "线细、会动、像猎物。带电的咬下去不是调皮，是电击伤。",
        },
      },
      {
        key: "day1-poison",
        title: "清点危险物",
        hint: "百合、绿萝、葡萄、药品、清洁剂",
        card: {
          question: "哪些植物对猫是致命的？",
          answer: "百合最狠，连花粉和花瓶水都能让猫急性肾衰。绿萝、滴水观音、葡萄、洋葱也都不行。",
          tip: "收进柜子不算完，它会把柜门学会打开。",
        },
      },
    ],
  },
  {
    day: 2,
    title: "把厕所安排好",
    mood: "猫砂盆的位置，决定了它会不会在你床上解决问题。",
    tasks: [
      {
        key: "day2-litter",
        title: "买一个够大的猫砂盆",
        hint: "长度约等于猫身长的 1.5 倍，开放式比封闭式更好上手",
        card: {
          question: "猫砂盆要多大才算够？",
          answer: "猫能整只进去、转身不碰壁。宁大勿小，小猫长大后还得换。",
        },
      },
      {
        key: "day2-sand",
        title: "选无香猫砂",
        hint: "豆腐砂或膨润土，先别买带香味的",
        card: {
          question: "为什么不要香味猫砂？",
          answer: "猫的鼻子比人灵敏十几倍，香味对它是折磨，很多乱尿是从这里开始的。",
        },
      },
      {
        key: "day2-place",
        title: "定好位置",
        hint: "安静、通风、远离食盆，最好有两个方向能进出",
        card: {
          question: "猫砂盆放哪最合适？",
          answer: "远离食盆水碗，避开洗衣机、门口这些会突然响的地方。它上厕所时不想被堵住。",
        },
      },
    ],
  },
  {
    day: 3,
    title: "吃饭喝水",
    mood: "水喝够的猫，肾脏能多陪你好几年。",
    tasks: [
      {
        key: "day3-water",
        title: "水碗换个位置",
        hint: "远离猫砂盆，可以试试流动饮水机",
        card: {
          question: "猫为什么不爱喝水？",
          answer: "猫的祖先是沙漠动物，渴感本来就弱。水放在食物旁边、离砂盆太近，它就更不喝。",
          tip: "多放几个水点，比买昂贵饮水机有用。",
        },
      },
      {
        key: "day3-schedule",
        title: "固定喂食时间",
        hint: "成猫 2 顿，幼猫 3-4 顿，别长期放着任吃",
        card: {
          question: "自由采食有什么问题？",
          answer: "容易吃过量，也不利于你观察食欲——食欲是最早的病信号。",
        },
      },
      {
        key: "day3-transition",
        title: "换粮用 7 天过渡",
        hint: "从旧粮 7 : 新粮 3 开始，逐日加新粮比例",
        card: {
          question: "突然换粮会怎样？",
          answer: "软便、呕吐，严重的会拒食。7 天过渡是让肠道菌群慢慢跟上。",
        },
      },
    ],
  },
  {
    day: 4,
    title: "建立作息",
    mood: "不是你迁就它，是你们一起找到一个都能睡的节奏。",
    tasks: [
      {
        key: "day4-play",
        title: "固定玩耍时间",
        hint: "每天 2 次、每次 15 分钟，睡前那次最重要",
        card: {
          question: "为什么睡前要陪玩？",
          answer: "猫的作息是「捕猎—进食—睡觉」。睡前玩到累再喂一顿，凌晨跑酷会明显减少。",
        },
      },
      {
        key: "day4-feed",
        title: "睡前喂一顿",
        hint: "把一天里最后一餐放在睡前 30 分钟",
        card: {
          question: "猫为什么凌晨叫你？",
          answer: "多数是饿，或者无聊。睡前加一餐、玩累它，比吼它有效得多。",
        },
      },
      {
        key: "day4-hide",
        title: "留一个可以躲的地方",
        hint: "纸箱、猫窝、柜子留个缝，它躲进去别硬抱出来",
        card: {
          question: "猫躲起来是不亲人吗？",
          answer: "不是，是它需要一个确定安全的地方。能随时躲的猫，反而更快敢出来。",
        },
      },
    ],
  },
  {
    day: 5,
    title: "第一次体检",
    mood: "第一次去医院，你要比它更镇定。",
    tasks: [
      {
        key: "day5-clinic",
        title: "选一家医院",
        hint: "猫专科，或有猫友好候诊区的，先电话问清项目和价格",
        card: {
          question: "第一次体检该查什么？",
          answer: "体重、体温、口腔、皮肤、粪便检查、传染病筛查。别一进门就打疫苗，先确认健康。",
        },
      },
      {
        key: "day5-sample",
        title: "带上便便样本",
        hint: "2 小时内的新鲜样本，装密封袋或小瓶",
        card: {
          question: "为什么一定要带便便？",
          answer: "寄生虫和球虫只有粪便检查能查出来，很多猫带虫但看起来完全正常。",
        },
      },
      {
        key: "day5-carrier",
        title: "提前让猫熟悉猫包",
        hint: "猫包平时就敞开放在家里，垫上它睡过的布",
        card: {
          question: "怎么让猫不抗拒进猫包？",
          answer: "把猫包变成日常家具，别只在去医院时才出现。临时抓进去会让它怕一辈子。",
        },
      },
    ],
  },
  {
    day: 6,
    title: "磨爪与垂直空间",
    mood: "抓沙发不是坏，是它没别的选择。",
    tasks: [
      {
        key: "day6-scratcher",
        title: "放一块猫抓板",
        hint: "剑麻或瓦楞纸，放在它已经在抓的那个位置",
        card: {
          question: "猫抓板买了它不用怎么办？",
          answer: "位置错了。猫喜欢睡醒后、进门处抓两下，把板放在那里，而不是阳台角落。",
        },
      },
      {
        key: "day6-tower",
        title: "给它一个高处",
        hint: "猫爬架，或者清空一个柜顶",
        card: {
          question: "小房子养猫够吗？",
          answer: "够。猫要的是垂直面积不是地面面积，一面墙的层板比多十平米更有用。",
        },
      },
      {
        key: "day6-trim",
        title: "学会剪指甲",
        hint: "只剪透明的尖端，避开粉色的血线",
        card: {
          question: "剪到血线会怎样？",
          answer: "会出血、会疼，然后它再也不会让你碰爪子。一次剪两三个，剪不完就算了。",
        },
      },
    ],
  },
  {
    day: 7,
    title: "建立信任",
    mood: "不追、不抱、不盯，让它先来找你。",
    tasks: [
      {
        key: "day7-let",
        title: "让它主动靠近",
        hint: "坐在地上做自己的事，等它过来闻你",
        card: {
          question: "为什么不能主动抱它？",
          answer: "陌生的手从上方伸过来，在猫看来像捕食者。它主动蹭你，才是真的接受你。",
        },
      },
      {
        key: "day7-wand",
        title: "用逗猫棒代替手逗",
        hint: "手不是玩具，被咬一次会养成一辈子习惯",
        card: {
          question: "小猫咬手很可爱，要不要紧？",
          answer: "要紧。3 个月时咬不疼，1 岁后同样力度就是流血。现在就用逗猫棒替代。",
        },
      },
      {
        key: "day7-note",
        title: "记下第一次主动蹭你",
        hint: "写一句就好，一年后你会想回看",
        card: {
          question: "信任要多久建立？",
          answer: "快的三天，慢的三个月。判断标准不是它让你摸，是它在你旁边睡着。",
        },
      },
    ],
  },
];

export const ALL_TASK_KEYS = JOURNEY_DAYS.flatMap((day) => day.tasks.map((task) => task.key));

export function findDay(day: number): JourneyDay | undefined {
  return JOURNEY_DAYS.find((item) => item.day === day);
}

/* ─────────────────────────────────────────────
   养宠适配测试
   ───────────────────────────────────────────── */

export type QuizDimension = "time" | "money" | "space" | "commitment";

export type QuizOption = {
  value: string;
  label: string;
  score: number; // 0 - 3
};

export type QuizQuestion = {
  id: string;
  dimension: QuizDimension;
  prompt: string;
  options: QuizOption[];
};

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    dimension: "time",
    prompt: "工作日，你每天能专心陪它玩多久？",
    options: [
      { value: "a", label: "不到 30 分钟", score: 0 },
      { value: "b", label: "30 分钟到 1 小时", score: 1 },
      { value: "c", label: "1 到 2 小时", score: 2 },
      { value: "d", label: "2 小时以上", score: 3 },
    ],
  },
  {
    id: "q2",
    dimension: "money",
    prompt: "每个月能稳定留给猫的预算大概是多少？",
    options: [
      { value: "a", label: "300 元以下", score: 0 },
      { value: "b", label: "300 - 600 元", score: 1 },
      { value: "c", label: "600 - 1200 元", score: 2 },
      { value: "d", label: "1200 元以上", score: 3 },
    ],
  },
  {
    id: "q3",
    dimension: "space",
    prompt: "你现在住的地方是？",
    options: [
      { value: "a", label: "合租的单间", score: 1 },
      { value: "b", label: "整租的一居", score: 2 },
      { value: "c", label: "和家人或室友同住", score: 2 },
      { value: "d", label: "独立住房", score: 3 },
    ],
  },
  {
    id: "q4",
    dimension: "space",
    prompt: "房东和同住的人同意养猫吗？",
    options: [
      { value: "a", label: "都确认同意了", score: 3 },
      { value: "b", label: "还没问过", score: 1 },
      { value: "c", label: "有人明确不同意", score: 0 },
    ],
  },
  {
    id: "q5",
    dimension: "commitment",
    prompt: "家里有人对猫毛过敏吗？",
    options: [
      { value: "a", label: "没有", score: 3 },
      { value: "b", label: "不确定", score: 1 },
      { value: "c", label: "有人过敏", score: 0 },
    ],
  },
  {
    id: "q6",
    dimension: "time",
    prompt: "出差或旅行的频率？",
    options: [
      { value: "a", label: "几乎不出远门", score: 3 },
      { value: "b", label: "每月几天", score: 2 },
      { value: "c", label: "经常一周以上", score: 0 },
    ],
  },
  {
    id: "q7",
    dimension: "commitment",
    prompt: "掉毛、半夜跑酷、抓坏沙发，你能接受吗？",
    options: [
      { value: "a", label: "都能接受", score: 3 },
      { value: "b", label: "大部分能", score: 2 },
      { value: "c", label: "会觉得很烦", score: 0 },
    ],
  },
  {
    id: "q8",
    dimension: "commitment",
    prompt: "未来 3 年会搬家、换城市、结婚或生孩子吗？",
    options: [
      { value: "a", label: "都不太会", score: 3 },
      { value: "b", label: "可能会", score: 1 },
      { value: "c", label: "肯定会", score: 0 },
    ],
  },
  {
    id: "q9",
    dimension: "money",
    prompt: "猫一次生病可能花 3000 元以上，你的准备是？",
    options: [
      { value: "a", label: "有存款或买了保险", score: 3 },
      { value: "b", label: "临时能凑出来", score: 1 },
      { value: "c", label: "基本没有准备", score: 0 },
    ],
  },
  {
    id: "q10",
    dimension: "commitment",
    prompt: "如果它尿床、抓伤你、需要长期照顾，你会？",
    options: [
      { value: "a", label: "一起想办法解决", score: 3 },
      { value: "b", label: "看情况", score: 1 },
      { value: "c", label: "可能会送走", score: 0 },
    ],
  },
];

export const DIMENSION_LABEL: Record<QuizDimension, string> = {
  time: "时间",
  money: "预算",
  space: "居住条件",
  commitment: "长期承诺",
};

export const DIMENSION_ADVICE: Record<QuizDimension, string> = {
  time: "每天留 30 分钟专心陪玩，睡前那次比早上重要。实在忙，两只猫互相作伴比一只孤独强。",
  money: "先攒出三个月生活费，再加一次急诊的 3000 元，再接它回家。",
  space: "封窗、划出砂盆和食盆的位置，比房子多大更重要。",
  commitment: "这是一件大约 15 年的事。搬家、结婚、生病，都不该成为送走它的理由。",
};

export const VERDICTS: Array<{ min: number; title: string; body: string }> = [
  {
    min: 80,
    title: "可以开始准备了",
    body: "时间、预算、心态都够。接下来把 7 日航线走一遍，把家改好再接它回来。",
  },
  {
    min: 60,
    title: "基本可以，先补两个短板",
    body: "整体没问题，但下面这两件事没解决之前，先别急着接猫。",
  },
  {
    min: 40,
    title: "还差一点",
    body: "不是不让你养，是现在接回来，你和它都会难受。先把下面的事补上。",
  },
  {
    min: 0,
    title: "现在还不是时候",
    body: "这份测试不是给你判死刑，是提醒你：先把自己的生活安顿好，再谈照顾另一个生命。",
  },
];

/* ─────────────────────────────────────────────
   预算参考价（人民币，2026 年城市常见区间）
   ───────────────────────────────────────────── */

export type BudgetGroup = "once" | "monthly" | "yearly";

export type BudgetItem = {
  key: string;
  label: string;
  group: BudgetGroup;
  amount: number;
  included: boolean;
};

export const BUDGET_GROUP_LABEL: Record<BudgetGroup, string> = {
  once: "接它回家的一次性支出",
  monthly: "每个月固定要花",
  yearly: "每年一次",
};

export const DEFAULT_BUDGET: BudgetItem[] = [
  { key: "litter-box", label: "猫砂盆", group: "once", amount: 120, included: true },
  { key: "scoop", label: "猫砂铲 + 落砂垫", group: "once", amount: 50, included: true },
  { key: "carrier", label: "猫包 / 航空箱", group: "once", amount: 110, included: true },
  { key: "scratcher", label: "猫抓板", group: "once", amount: 50, included: true },
  { key: "tower", label: "猫爬架", group: "once", amount: 220, included: true },
  { key: "bowls", label: "食盆 + 水碗", group: "once", amount: 70, included: true },
  { key: "grooming", label: "指甲剪 + 梳子", group: "once", amount: 60, included: true },
  { key: "vaccine", label: "首年疫苗（3 针）", group: "once", amount: 360, included: true },
  { key: "rabies", label: "狂犬疫苗", group: "once", amount: 80, included: true },
  { key: "neuter", label: "绝育", group: "once", amount: 800, included: true },
  { key: "first-vet", label: "首次体检 + 驱虫", group: "once", amount: 200, included: true },

  { key: "food", label: "猫粮", group: "monthly", amount: 200, included: true },
  { key: "litter", label: "猫砂", group: "monthly", amount: 80, included: true },
  { key: "deworm", label: "体内外驱虫", group: "monthly", amount: 45, included: true },
  { key: "snack", label: "零食 + 玩具", group: "monthly", amount: 50, included: true },

  { key: "checkup", label: "年度体检", group: "yearly", amount: 400, included: true },
  { key: "booster", label: "疫苗加强", group: "yearly", amount: 200, included: true },
  { key: "insurance", label: "宠物保险（可选）", group: "yearly", amount: 300, included: false },
];
