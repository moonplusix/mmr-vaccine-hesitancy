export const stages = [
  {
    id: "stage-0",
    period: "1998—2000",
    title: "主张进入公共视野",
    synopsis: "论文发表与新闻发布会让一个谨慎的病例观察进入更广的公共讨论；随后的人群研究开始检验关联。",
    tone: "source",
    asset: "asset-21.png",
    institution: { label: "英国卫生部", asset: "asset-01.png", caption: "海报中的公共卫生机构剪影" },
    events: [
      { date: "1998-02-28", title: "The Lancet 发表病例系列论文", summary: "论文记录 12 名儿童的病例观察。网页把论文文本与后来的公共解释分开呈现。", note: "论文中的观察不等同于已证实的因果关系。", source: "https://doi.org/10.1016/S0140-6736(97)11096-0", status: "已核验来源", kind: "source" },
      { date: "1998-02-26", title: "新闻发布会提出分开接种", summary: "公开表述扩大了媒体关注的议题范围。", note: "该节点说明公开传播语境，不单独证明其造成了后续行为变化。", source: "https://www.bmj.com/content/342/bmj.c7452", status: "已核验来源", kind: "source" },
      { date: "1999-06-12", title: "人群研究未发现关联", summary: "研究以人群数据检验 MMR 接种时间与自闭症诊断之间的关系。", note: "研究结论是对科学命题的检验，不是对公众信念的测量。", source: "https://doi.org/10.1016/S0140-6736(99)01239-8", status: "已核验来源", kind: "correction" }
    ]
  },
  {
    id: "stage-1",
    period: "2001—2003",
    title: "讨论扩大，证据复核继续",
    synopsis: "争议进入更广的公共和议会讨论；国际疫苗安全机构继续评估流行病学证据。",
    tone: "context",
    asset: "asset-19.png",
    institution: { label: "英国下议院", asset: "parliament-clean.svg", caption: "2001 年议会公共卫生辩论", source: "https://hansard.parliament.uk/Commons/2001-01-24/debates/f7b0f743-79c4-498f-8dbd-dd40874ed42e/PublicHealth" },
    events: [
      { date: "2003", title: "WHO / GACVS 复核 MMR 与自闭症证据", summary: "全球疫苗安全咨询委员会审阅相关流行病学证据并发布判断。", note: "机构更新是持续证据复核的一部分，不被呈现为终止讨论的单一时点。", source: "https://www.who.int/groups/global-advisory-committee-on-vaccine-safety/topics/mmr-vaccines-and-autism", status: "已核验来源", kind: "correction" }
    ]
  },
  {
    id: "stage-2",
    period: "2004—2009",
    title: "部分撤回与监管程序",
    synopsis: "作者撤回因果解释，监管听证启动；公共卫生系统同时记录长期覆盖缺口与麻疹传播背景。",
    tone: "provisional",
    asset: "asset-11.png",
    institution: { label: "英国卫生部", asset: "asset-04.png", caption: "海报中的公共卫生机构剪影" },
    events: [
      { date: "2004-03-06", title: "十名作者撤回结果解释", summary: "十名作者撤回论文中关于 MMR 与自闭症因果关联的解释部分。", note: "这是部分撤回，与 2010 年全文撤稿是两个不同节点。", source: "https://doi.org/10.1016/S0140-6736(04)15715-2", status: "已核验来源", kind: "correction" },
      { date: "2007-07-16", title: "GMC 执业适宜性听证开始", summary: "英国专业监管机构启动与研究相关的长期监管程序。", note: "听证属于监管过程，不等同于媒体报道事件。", source: "https://www.bmj.com/content/340/bmj.c593", status: "已核验来源", kind: "context" },
      { date: "2008", title: "英国公共卫生记录持续麻疹传播", summary: "公共卫生资料把疾病传播作为覆盖缺口下的背景记录。", note: "健康事件与传播材料共享时间轴，但不归因于单篇论文或单篇报道。", source: "https://www.gov.uk/government/collections/measles-guidance-data-and-analysis", status: "已核验来源", kind: "context" }
    ]
  },
  {
    id: "stage-3",
    period: "2010—2011",
    title: "全文撤稿与调查报道",
    synopsis: "监管结论、全文撤稿与调查报道在相近年份出现，形成可定位但职责不同的纠错记录。",
    tone: "correction",
    asset: "asset-13.png",
    institution: { label: "监管与期刊文件", asset: "asset-15.png", caption: "2010 年全文撤稿记录", source: "https://doi.org/10.1016/S0140-6736(10)60175-4" },
    events: [
      { date: "2010-01-28", title: "GMC 公布严重失当认定", summary: "监管小组公布与研究行为有关的事实认定。", note: "该节点连接监管记录，不从时间先后推断额外关系。", source: "https://www.bmj.com/content/340/bmj.c593", status: "已核验来源", kind: "correction" },
      { date: "2010-02-02", title: "The Lancet 全文撤稿", summary: "期刊撤回 1998 年论文全文。", note: "全文撤稿是明确的纠错节点，但不意味着后续提及立即消失。", source: "https://doi.org/10.1016/S0140-6736(10)60175-4", status: "已核验来源", kind: "correction" },
      { date: "2011-01-05", title: "BMJ 发布调查系列首篇", summary: "Brian Deer 的调查报道检视研究记录与论文之间的差异。", note: "Brian Deer 在这里作为媒体层的调查记者呈现。", source: "https://www.bmj.com/content/342/bmj.c5347", status: "已核验来源", kind: "source" }
    ]
  },
  {
    id: "stage-4",
    period: "2012—2014",
    title: "疾病监测与补种行动",
    synopsis: "英格兰麻疹监测出现后续高峰，公共卫生机构开展补种行动。两者属于健康监测和制度行动层。",
    tone: "context",
    asset: "asset-16.png",
    institution: { label: "英格兰公共卫生署", asset: "asset-05.png", caption: "2013 年 MMR 补种行动", source: "https://www.gov.uk/government/news/national-mmr-vaccination-catch-up-programme-announced-in-response-to-increase-in-measles-cases" },
    events: [
      { date: "2012", title: "英格兰记录显著麻疹病例高峰", summary: "官方资料记录后期麻疹监测背景。", note: "2012 年前后的病例统计存在口径变化，网页不把不同序列直接拼接比较。", source: "https://www.gov.uk/government/publications/measles-historic-confirmed-cases-notifications-and-deaths", status: "已核验来源", kind: "context" },
      { date: "2013-04-25", title: "国家 MMR 补种行动", summary: "2013 年官方宣布面向未接种或仅部分接种儿童的补种行动，以回应麻疹病例增加。", note: "这是公共卫生行动与监测背景之间的明确联系，不说明任何单一媒体内容的效果。", source: "https://www.gov.uk/government/news/national-mmr-vaccination-catch-up-programme-announced-in-response-to-increase-in-measles-cases", status: "已核验来源", kind: "context" }
    ]
  },
  {
    id: "stage-5",
    period: "2015—2019",
    title: "大型研究继续累积证据",
    synopsis: "争议延续的同时，更大规模的人群研究继续检验 MMR 与自闭症风险。",
    tone: "correction",
    asset: "asset-20.png",
    institution: { label: "英格兰公共卫生署", asset: "asset-06.png", caption: "2019 年麻疹与风疹消除战略", source: "https://www.gov.uk/government/publications/measles-and-rubella-elimination-uk-strategy" },
    events: [
      { date: "2019-03-05", title: "丹麦全国队列研究发布", summary: "大型全国队列研究报告 MMR 接种后没有增加自闭症风险。", note: "后来的研究增加证据权重，但不等同于测量或消除先前的公共记忆。", source: "https://doi.org/10.7326/M18-2101", status: "已核验来源", kind: "correction" }
    ]
  },
  {
    id: "stage-6",
    period: "2020—2026",
    title: "长期回响与进行中监测",
    synopsis: "争议相关表述仍会在新渠道出现；公共卫生部门继续发布麻疹监测与接种行动资料。",
    tone: "provisional",
    asset: "asset-18.png",
    institution: { label: "英国卫生安全局", asset: "asset-07.png", caption: "持续更新的麻疹监测", source: "https://ukhsa-dashboard.data.gov.uk/vaccine-preventable-diseases/measles" },
    events: [
      { date: "2024", title: "UKHSA 记录重要年度监测背景", summary: "官方仪表盘持续更新英格兰麻疹监测数据。", note: "当前监测是独立的证据层，不归因于某一篇论文或媒体内容。", source: "https://ukhsa-dashboard.data.gov.uk/vaccine-preventable-diseases/measles", status: "已核验来源", kind: "context" },
      { date: "2026", title: "当前年度监测仍在更新", summary: "2026 年资料属于进行中统计，后续可能修订。", note: "本阶段只标示临时状态，不给出全年总量或趋势结论。", source: "https://ukhsa-dashboard.data.gov.uk/vaccine-preventable-diseases/measles", status: "临时资料", kind: "provisional" }
    ]
  }
];
