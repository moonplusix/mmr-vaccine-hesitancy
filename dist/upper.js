import {renderCohortChart,cohortReadout} from './cohort-charts.js?v=27';
// year, England MMR1 at 24 months, England and Wales notifications, deaths registered.
// 1999 onward uses the single-source NAO 2019 Figure 6 coverage series, rounded to one decimal.
const years = [[1998,88.3,3728,3],[1999,87.6,2438,3],[2000,87.4,2378,1],[2001,84.1,2250,1],[2002,81.8,3232,1],[2003,79.9,2488,0],[2004,80.9,2356,1],[2005,84.1,2089,0],[2006,85.2,3705,1],[2007,84.6,3670,1],[2008,84.9,5088,2],[2009,88.2,5191,1],[2010,89.1,2235,0],[2011,91.2,2355,1],[2012,92.3,4211,1],[2013,92.7,6193,1],[2014,92.3,1850,0],[2015,91.9,1193,0]];
const coverageSeries = [[1999,87.6,93,76],[2000,87.4,92,75],[2001,84.1,91,74],[2002,81.8,90.4,74.9],[2003,79.9,90.2,74.9],[2004,80.9,88.6,73.3],[2005,84.1,87.3,73.6],[2006,85.2,85.9,72.8],[2007,84.6,87,74.6],[2008,84.9,88.9,78],[2009,88.2,91,82.7],[2010,89.1,91.9,84.2],[2011,91.2,92.9,86],[2012,92.3,93.9,87.7],[2013,92.7,94.1,88.3],[2014,92.3,94.4,88.6],[2015,91.9,94.8,88.2],[2016,91.6,95,87.6],[2017,91.2,94.9,87.2],[2018,90.3,94.5,86.4]];
const coverageByYear = new Map(coverageSeries.map(row=>[row[0],row]));
// MMR2 at the fifth birthday; 1998-99 was not collected.
const mmr2 = new Map(coverageSeries.filter(([year])=>year<=2015).map(([year,,,value])=>[year,value]));
const caseSource = "https://www.gov.uk/government/publications/measles-historic-confirmed-cases-notifications-and-deaths/measles-historic-confirmed-cases-notifications-and-deaths";
const details = {
  paper:["1998 年病例系列论文","已核验来源","1998-02-28","《柳叶刀》发表记录 12 名儿童观察的病例系列论文。病例系列本身不能证明 MMR 与自闭症的因果关系。","论文文本与随后公开传播的表述分别呈现。","https://doi.org/10.1016/S0140-6736(97)11096-0"],
  population:["1999 年人群研究","已核验来源","1999","人群研究检验 MMR 接种时间与自闭症诊断之间的关系，未发现关联。","研究结论不等于公众信念的测量。","https://doi.org/10.1016/S0140-6736(99)01239-8"],
  withdrawal:["十位作者撤回解释","已核验来源","2004-03-06","十位作者撤回论文中关于 MMR 与自闭症因果关联的解释。","这是部分撤回，区别于 2010 年的全文撤稿。","https://doi.org/10.1016/S0140-6736(04)15715-2"],
  retraction:["《柳叶刀》全文撤稿","已核验来源","2010-02-02","期刊撤回 1998 年论文全文。","全文撤稿发生在 2010 年 2 月 2 日；2011 年 1 月，BMJ 发表调查报道。","https://doi.org/10.1016/S0140-6736(10)60175-4"],
  gmc:["英国医学总会监管程序","已核验来源","2007—2010","GMC 的执业适宜性程序和结论属于正式监管记录。","监管、报道和病例监测在画面中并置，不等于相互因果。","https://www.bmj.com/content/340/bmj.c593"],
  investigation:["BMJ 调查报道","已核验来源","2011-01-05","Brian Deer 的调查报道检视研究记录与论文之间的差异。","该节点属于报道资料层。","https://www.bmj.com/content/342/bmj.c5347"],
  catchup:["国家 MMR 补种行动","已核验来源","2013-04-25","官方宣布面向未接种或仅部分接种儿童和青少年的补种行动。","该行动回应麻疹病例增加；不归因于单篇媒体报道。","https://www.gov.uk/government/news/national-mmr-vaccination-catch-up-programme-announced-in-response-to-increase-in-measles-cases"],
  wakefield:["安德鲁·韦克菲尔德","可追溯人物记录","1998","1998 年论文的第一作者，也是相关公开表述中的人物。","连线表示作者、论文和后续文件关系。","https://doi.org/10.1016/S0140-6736(97)11096-0"],
  coauthors2:["2 位共同作者","共同作者记录","2004","2 位共同作者未签署 2004 年撤回解释声明；另有 10 位共同作者签署该声明。","以原始共同署名文件核对签署情况；图上连线表示文件与人物关系，不推断未签署的动机。","https://doi.org/10.1016/S0140-6736(04)15715-2"],
  birthCohort:["2013 年确诊病例的年龄构成","UKHSA / England","2013","英格兰实验室确诊麻疹 1,414 例；10—19 岁共 511 例，占 36.1%。","年龄组按监测记录统计；病例构成不能直接解释为各年龄组的感染风险。",caseSource],
  coauthors:["十位共同作者","共同署名记录","2004","十位共同作者签署撤回因果解释的声明。","不推断作者之间的立场或后续行为。","https://doi.org/10.1016/S0140-6736(04)15715-2"],
  deer:["布莱恩·迪尔","调查报道","2011","调查记者 Brian Deer 撰写 BMJ 系列报道。","此处只呈现可定位的报道与研究文件关系。","https://www.bmj.com/content/342/bmj.c5347"],
  godlee:["菲奥娜·戈德利","期刊编辑记录","2011","Fiona Godlee 担任 BMJ 主编期间，该刊发表了 Brian Deer 的调查系列与编辑评论。","人物连线依其期刊职责呈现；不据此推定个人健康影响。","https://www.bmj.com/content/342/bmj.c7452"],
  horton:["理查德·霍顿","期刊编辑记录","1998—2010","Richard Horton 为《柳叶刀》主编；期刊刊载 1998 年论文、2004 年撤回解释声明及 2010 年全文撤稿。","连线表示期刊与文件记录，三次文件行动须分别阅读。","https://doi.org/10.1016/S0140-6736(10)60175-4"],
  bmj:["《英国医学杂志》","期刊报道记录","2011","BMJ 刊载 Brian Deer 对原始研究记录的调查报道。","该连线只标出作者与刊载报道的关系。","https://www.bmj.com/content/342/bmj.c5347"],
  lancet:["《柳叶刀》","期刊记录","1998—2010","期刊发表了原论文，2004 年刊载部分撤回，2010 年全文撤稿。","三个文件节点的法律和科学含义不同。","https://doi.org/10.1016/S0140-6736(10)60175-4"]
};
function openPosterDetail(item) {
  const [title,status,date,summary,note,source] = item;
  document.querySelector("#dialog-title").textContent = title;
  document.querySelector("#dialog-status").textContent = status;
  document.querySelector("#dialog-date").textContent = date;
  document.querySelector("#dialog-summary").textContent = summary;
  document.querySelector("#dialog-note").textContent = note;
  document.querySelector("#dialog-source").href = source;
  document.querySelector("#dialog-source").textContent = "打开原始来源 ↗";
  document.querySelector("#detail-dialog").showModal();
}
document.querySelectorAll("[data-upper]").forEach(button => button.addEventListener("click", () => openPosterDetail(details[button.dataset.upper])));
const byYear = new Map(years.map(row => [row[0], row]));
const formatPct = value => `${Number(value).toFixed(1)}%`;
const weaveSvg = document.querySelector("#weave-chart");
const originalRows = [
  {years:[1998,1999,2000,2001,2002,2003,2004],x:[413,721,1028,1335,1642,1950,2257],y:838},
  {years:[2005,2006,2007,2008,2009,2010],x:[2257,1925,1593,1261,929,597],y:1407},
  {years:[2011,2012,2013,2014,2015],x:[597,1013,1429,1845,2261],y:1890}
];
document.querySelector("#original-year-hotspots").innerHTML = originalRows.flatMap(row=>row.years.map((year,index)=>`<button type="button" data-year="${year}" style="left:${(row.x[index]-80)/2830*100}%;top:${(row.y-430)/1475*100}%" aria-label="${year} 年：查看核验补充"><span class="sr-only">${year}</span></button>`)).join("");
const yearSelect = document.querySelector("#weave-year-select");
yearSelect.innerHTML = years.map(([year])=>`<option value="${year}">${year}</option>`).join("");
const weave = document.querySelector(".weave-poster");
const weaveReadout = document.querySelector("#weave-readout");
function showWeaveYear(year, anchor) {
  const [,mmr1,cases,deaths] = byYear.get(year);
  const notes=[];
  if(year===2000) notes.push("NAO 2019 同源序列为 75.0%；NHS 2011—12 历史表显示 74.8%。主图采用 NAO 版本。");
  if(year===2002) notes.push("官方表注：该死亡登记例已知并非麻疹感染。");
  weaveReadout.innerHTML = `<strong>${year} 年 · 年度统计</strong><span>接种覆盖 / England / ${year}–${String(year+1).slice(2)} 财年</span><span>MMR1 24 月龄 ${formatPct(mmr1)} · MMR2 5 岁 ${mmr2.has(year)?formatPct(mmr2.get(year)):"未收集"}</span><span>麻疹监测 / England and Wales / ${year} 历年</span><span>通知 ${cases.toLocaleString()} 例 · 死亡登记 ${deaths} 例</span>${notes.map(note=>`<small>＊${note}</small>`).join("")}`;
  const bounds = weave.getBoundingClientRect();
  const rect = anchor.getBoundingClientRect();
  weaveReadout.style.left = `${Math.max(8,Math.min(rect.left-bounds.left,bounds.width-306))}px`;
  weaveReadout.style.top = `${Math.max(8,rect.top-bounds.top-195)}px`;
  weaveReadout.classList.add("is-visible");
  document.querySelectorAll("#original-year-hotspots [data-year]").forEach(button=>button.classList.toggle("is-selected",Number(button.dataset.year)===year));
}
function hideWeaveReadout() {
  weaveReadout.classList.remove("is-visible");
  document.querySelectorAll("[data-year].is-selected").forEach(button=>button.classList.remove("is-selected"));
}
document.querySelectorAll("[data-year]").forEach(button=>{
  const display = () => showWeaveYear(Number(button.dataset.year),button);
  button.addEventListener("pointerenter",display);
  button.addEventListener("pointerleave",hideWeaveReadout);
  button.addEventListener("focus",()=>{if(button.matches(":focus-visible"))display();});
  button.addEventListener("blur",hideWeaveReadout);
  button.addEventListener("click",display);
});
weave.addEventListener("pointerleave",hideWeaveReadout);
document.addEventListener("keydown",event=>{if(event.key==="Escape"){hideWeaveReadout();if(cohortTooltip)cohortTooltip.hidden=true;}});
yearSelect.addEventListener("change",()=>showWeaveYear(Number(yearSelect.value),yearSelect));
yearSelect.addEventListener("blur",hideWeaveReadout);
document.querySelector("[data-spike-link]").addEventListener("click",()=>document.querySelector("#spike-explainer").scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"}));
const seriesButtons = [...document.querySelectorAll("[data-series]")];
const allSeriesButton = document.querySelector("[data-series-all]");
const posterRoot=document.querySelector('.upper-poster');
function alignActorRail(){
  const key=document.querySelector('.upper-key').getBoundingClientRect(),layout=document.querySelector('.upper-layout').getBoundingClientRect();
  posterRoot.style.setProperty('--actor-rise',`${key.top-layout.top}px`);
}
new ResizeObserver(alignActorRail).observe(posterRoot);
window.addEventListener('resize',alignActorRail);
document.fonts.ready.then(alignActorRail);
function updateSeriesSelection() {
  const selected = seriesButtons.filter(button=>button.getAttribute("aria-pressed")==="true");
  allSeriesButton.setAttribute("aria-pressed",String(selected.length===seriesButtons.length));
  document.querySelectorAll(".weave-series").forEach(group=>group.classList.toggle("is-muted",!selected.some(button=>group.classList.contains(`series-${button.dataset.series}`))));
}
seriesButtons.forEach(button=>button.addEventListener("click",()=>{
  button.setAttribute("aria-pressed",String(button.getAttribute("aria-pressed")!=="true"));
  updateSeriesSelection();
  hideWeaveReadout();
}));
allSeriesButton.addEventListener("click",()=>{
  seriesButtons.forEach(button=>button.setAttribute("aria-pressed","true"));
  updateSeriesSelection();
});
updateSeriesSelection();

const svg = document.querySelector("#coverage-chart");
const px = year => 40 + (year - 1999) * (550 / 19);
const py = value => 170 - (value - 70) * 5.2;
function showCoverage(year) {
  const [,mmr1,mmr1Five,second] = coverageByYear.get(year);
  svg.dataset.year = String(year);
  svg.innerHTML = `<g class="coverage-grid">${[70,80,90].map(v=>`<line x1="40" x2="590" y1="${py(v)}" y2="${py(v)}"/><text x="5" y="${py(v)+4}">${v}%</text>`).join("")}</g><line class="coverage-threshold" x1="40" x2="590" y1="${py(95)}" y2="${py(95)}"/><text class="coverage-threshold-label" x="414" y="${py(95)-5}">≥95% 消除策略参考阈值</text><line class="coverage-cursor" x1="${px(year)}" x2="${px(year)}" y1="30" y2="175"/><path class="coverage-mmr1" d="M${coverageSeries.map(([y,v])=>`${px(y)} ${py(v)}`).join(" L")}"/><path class="coverage-mmr1-5y" d="M${coverageSeries.map(([y,,v])=>`${px(y)} ${py(v)}`).join(" L")}"/><path class="coverage-mmr2" d="M${coverageSeries.map(([y,,,v])=>`${px(y)} ${py(v)}`).join(" L")}"/>${coverageSeries.map(([y,v,five,secondDose])=>`<circle class="coverage-point-mmr1" cx="${px(y)}" cy="${py(v)}" r="${y===year?5:2.5}"/><circle class="coverage-point-mmr1-5y" cx="${px(y)}" cy="${py(five)}" r="${y===year?5:2.5}"/><circle class="coverage-point-mmr2" cx="${px(y)}" cy="${py(secondDose)}" r="${y===year?5:2.5}"/>`).join("")}<g class="coverage-years"><text x="32" y="196">1999</text><text x="177" y="196">2004</text><text x="322" y="196">2009</text><text x="466" y="196">2014</text><text x="574" y="196">18</text></g>`;
  document.querySelector("#coverage-readout").textContent = `${year}–${String(year+1).slice(2)} · MMR1 24 月龄 ${formatPct(mmr1)} · MMR1 5 岁 ${formatPct(mmr1Five)} · MMR2 5 岁 ${formatPct(second)} · England，财政年度${year===2000?" · MMR2 采用 NAO 75.0%，较早 NHS 表为 74.8%":""}`;
}
const selectCoverageFromPointer = event => {
  const rect=svg.getBoundingClientRect();
  showCoverage(Math.max(1999,Math.min(2018,1999+Math.round((((event.clientX-rect.left)/rect.width*620)-40)/(550/19)))));
};
svg.addEventListener("pointermove",selectCoverageFromPointer);
svg.addEventListener("pointerdown",selectCoverageFromPointer);
svg.addEventListener("keydown",event=>{
  if (!["ArrowLeft","ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  const current=Number(svg.dataset.year||1999);
  const next=Math.max(1999,Math.min(2018,current+(event.key==="ArrowRight"?1:-1)));
  svg.dataset.year=String(next);
  showCoverage(next);
});
showCoverage(1999);
const clearCoverageReadout=()=>{document.querySelector("#coverage-readout").textContent="悬停曲线，或聚焦后用左右方向键查看核验数值。";};
svg.addEventListener("pointerleave",clearCoverageReadout);
svg.addEventListener("blur",clearCoverageReadout);
clearCoverageReadout();

const caseChart = document.querySelector("#case-chart");
const caseX = index => 52 + index * 38;
const caseY = count => 153 - count / 6500 * 125;
const casePoints = years.map(([, , count], index) => `${caseX(index)},${caseY(count).toFixed(1)}`);
const caseArea = `M${caseX(0)} 153 L${casePoints.join(" L")} L${caseX(years.length-1)} 153 Z`;
caseChart.innerHTML = `<svg viewBox="0 0 750 252" aria-hidden="true" preserveAspectRatio="none">
  <defs><linearGradient id="case-fill" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#d7c8ef" stop-opacity=".65"/><stop offset="1" stop-color="#d7c8ef" stop-opacity=".08"/></linearGradient></defs>
  ${[0,2000,4000,6000].map(value=>`<g><path class="case-grid" d="M52 ${caseY(value)}H698"/><text class="case-axis" x="42" y="${caseY(value)+4}" text-anchor="end">${value===0?"0":`${value/1000}k`}</text></g>`).join("")}
  <path d="${caseArea}" fill="url(#case-fill)"/><polyline class="case-line" points="${casePoints.join(" ")}"/>
  ${years.map(([year,,count,deaths],index)=>`<g><circle class="case-point" cx="${caseX(index)}" cy="${caseY(count)}" r="3.7"/>${Array.from({length:deaths},(_,dot)=>`<circle class="case-death" cx="${caseX(index)}" cy="${187-dot*10}" r="3.7"/>`).join("")}${index%3===0||index===17?`<text class="case-year" x="${caseX(index)}" y="239" text-anchor="middle">${year}</text>`:""}</g>`).join("")}
  <path class="case-death-baseline" d="M52 200H698"/><g class="case-key"><circle class="case-death" cx="584" cy="13" r="3.7"/><text class="case-lane-label" x="698" y="17">死亡登记 · 每点 1 例</text></g>
</svg>${years.map(([year,,count,deaths],index)=>`<button type="button" data-case="${year}" style="left:${(caseX(index)-19)/750*100}%;width:${38/750*100}%" aria-label="${year} 年 England and Wales 麻疹通知数 ${count.toLocaleString()}，死亡登记数 ${deaths}，查看来源"></button>`).join("")}`;
function showCases(year) {
  const [, , count, deaths] = byYear.get(year);
  caseChart.querySelectorAll("[data-case]").forEach(button=>button.classList.toggle("is-active",Number(button.dataset.case)===year));
  document.querySelector("#case-readout").textContent = `${year} · 通知数 ${count.toLocaleString()} 例 · 死亡登记数 ${deaths} 例${year===2002?"（官方表注：该例已知并非麻疹感染）":""} · England and Wales，日历年度`;
}
caseChart.addEventListener("pointerover",event=>{const button=event.target.closest("[data-case]");if(button)showCases(Number(button.dataset.case));});
caseChart.addEventListener("focusin",event=>{const button=event.target.closest("[data-case]");if(button?.matches(":focus-visible"))showCases(Number(button.dataset.case));});
caseChart.addEventListener("click", event => {
  const button = event.target.closest("[data-case]");
  if (!button) return;
  const [year,,count,deaths] = byYear.get(Number(button.dataset.case));
  openPosterDetail([`${year} 年麻疹监测`,`官方历史序列 / England and Wales`,String(year),`通知数 ${count.toLocaleString()} 例；死亡登记数 ${deaths} 例。`,`两者单位和统计定义不同；通知数也并非实验室确诊数。${year===2002?"官方表注明：2002 年登记的 1 例已知并非麻疹感染。":""}`,caseSource]);
});
showCases(1998);
const clearCaseReadout=()=>{caseChart.querySelectorAll("[data-case]").forEach(button=>button.classList.remove("is-active"));document.querySelector("#case-readout").textContent="悬停或聚焦年份查看通知数与死亡登记数；点击查看统计定义。";};
caseChart.addEventListener("pointerleave",clearCaseReadout);
caseChart.addEventListener("focusout",event=>{if(!caseChart.contains(event.relatedTarget))clearCaseReadout();});
clearCaseReadout();

// The four subfigures retain the original PDF geometry and local SVG glyphs.
const originalFigures = {
  "poster-weave": ["1998—2015 时间织带", 1400],
  "poster-actors": ["疫苗争议中的关键角色", 548],
  "poster-birth-cohorts": ["出生队列分布", 1040],
  "poster-age-range": ["年龄范围与中位数", 415]
};
const originalDialog = document.querySelector("#original-figure-dialog");
document.querySelectorAll("[data-figure-zoom]").forEach(button=>button.addEventListener("click",()=>{
  const key = button.dataset.figureZoom;
  if(key==='poster-birth-cohorts'||key==='poster-age-range'){
    const scroll=originalDialog.querySelector('.original-zoom-scroll');
    scroll.querySelector('#cohort-zoom')?.remove();
    const box=document.createElement('div');box.id='cohort-zoom';box.innerHTML=renderCohortChart(key==='poster-birth-cohorts'?'birth':'age');scroll.append(box);
    document.querySelector('#original-figure-image').hidden=true;
    document.querySelector('#original-figure-title').textContent=originalFigures[key][0];
    document.querySelector('#original-figure-note').textContent='悬停或聚焦查看病例数、年龄范围与中位数。数据方式：图表数字化，整数显示。';
    bindCohortMarks(box);originalDialog.showModal();return;
  }
  originalDialog.querySelector('#cohort-zoom')?.remove();
  document.querySelector('#original-figure-image').hidden=false;
  document.querySelector("#original-figure-title").textContent=originalFigures[key][0];
  const image=document.querySelector("#original-figure-image");
  image.src=`./assets/${key}.svg`;
  image.alt=originalFigures[key][0];
  image.style.width=`${originalFigures[key][1]}px`;
  document.querySelector("#original-figure-note").textContent="按原始矢量比例显示；窄屏可横向查看。按 Escape 关闭。";
  originalDialog.showModal();
}));
document.querySelector("#close-original-figure").addEventListener("click",()=>originalDialog.close());
const cohortTooltip=document.querySelector('#original-age-readout');
cohortTooltip.classList.add('cohort-readout');
function bindCohortMarks(root){
  root.querySelectorAll('.cohort-mark').forEach(mark=>{
    const show=event=>{
      cohortTooltip.textContent=cohortReadout(mark);cohortTooltip.hidden=false;
      if(originalDialog.open)originalDialog.append(cohortTooltip);else document.querySelector('#spike-explainer').append(cohortTooltip);
      const box=mark.getBoundingClientRect(),x=event?.clientX??box.x,y=event?.clientY??box.y;
      cohortTooltip.style.left=`${Math.max(12,Math.min(x+14,innerWidth-360))}px`;
      cohortTooltip.style.top=`${Math.max(12,Math.min(y+18,innerHeight-260))}px`;
    };
    const hide=()=>{cohortTooltip.hidden=true;};
    mark.addEventListener('pointerenter',show);mark.addEventListener('pointerleave',hide);
    mark.addEventListener('focus',()=>show());mark.addEventListener('blur',hide);
    mark.addEventListener('click',show);
    mark.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();show();}if(event.key==='Escape')hide();});
  });
}
for(const [name,kind] of [['poster-birth-cohorts','birth'],['poster-age-range','age']]){
  const root=document.querySelector(`[data-original-figure="${name}"]`);root.innerHTML=renderCohortChart(kind);bindCohortMarks(root);
}
window.addEventListener('scroll',()=>{
  const active=document.activeElement;
  if(active?.matches('.cohort-mark:focus-visible')){
    const box=active.getBoundingClientRect();
    cohortTooltip.style.top=`${Math.max(12,Math.min(box.y+18,innerHeight-260))}px`;
    cohortTooltip.hidden=box.bottom<60||box.top>innerHeight;
  }else cohortTooltip.hidden=true;
},{passive:true});
originalDialog.addEventListener('close',()=>{cohortTooltip.hidden=true;document.querySelector('#spike-explainer').append(cohortTooltip);});
async function mountOriginalVector(name, target) {
  const response=await fetch(`./assets/${name}.svg`);
  if(!response.ok)throw new Error(`Unable to load ${name}`);
  const documentSvg=new DOMParser().parseFromString(await response.text(),"image/svg+xml").documentElement;
  if(name==="poster-weave") {
    target.innerHTML=documentSvg.innerHTML;
    updateSeriesSelection();
  } else {
    documentSvg.setAttribute("aria-hidden","true");
    documentSvg.removeAttribute("width");documentSvg.removeAttribute("height");
    target.querySelector("img").replaceWith(document.importNode(documentSvg,true));
  }
}
Promise.all([mountOriginalVector("poster-weave",weaveSvg),mountOriginalVector("poster-actors",document.querySelector('[data-original-figure="poster-actors"]'))]).catch(error=>console.error(error));
