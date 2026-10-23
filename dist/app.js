import {describeContentRow} from './media-content-review.js';
import { renderMediaBoard } from "./media-board.js?v=39";
import { stages } from "./data.js?v=22";
import { mediaStages, mediaSource } from "./media-data.js";
import { mediaMetrics, describeMediaMetric } from "./media-chart.js?v=25";

const timeline = document.querySelector("#timeline");
const scroller = document.querySelector("#timeline-scroll");
const tabs = [...document.querySelectorAll(".stage-tab")];
const detailDialog = document.querySelector("#detail-dialog");
const guideDialog = document.querySelector("#guide-dialog");
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const narrowScreen = matchMedia("(max-width: 760px)");

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

function evidenceCard(event, stageIndex, eventIndex) {
  return `
    <button class="evidence-card kind-${event.kind}" type="button" data-stage-index="${stageIndex}" data-event-index="${eventIndex}">
      <span>${escapeHtml(event.date)}</span>
      <strong>${escapeHtml(event.title)}</strong>
      <small>${escapeHtml(event.status)} · 查看证据</small>
    </button>`;
}

function stageTemplate(stage, index) {
  const media = mediaStages[index];
  const drops = media.articles.map(article => `<i class="sample-drop stance-${article.stance}" aria-hidden="true"></i>`).join("");
  const total = media.counts.total;
  return `
    <article id="${stage.id}" class="stage tone-${stage.tone}" data-index="${index}" tabindex="-1" aria-labelledby="${stage.id}-title">
      <div class="stage-visual">
        <div class="stage-media">
          <button class="stage-media-total" type="button" data-media="${index}" aria-label="${stage.period}：报道样本 ${total} 篇，查看完整统计">${total} 篇报道</button>
          <div class="media-stance-controls">${["support","neutral","opposition"].map(key=>`<button type="button" data-media-index="${index}" data-media-metric="${key}" aria-label="${mediaMetrics[key].label} ${media.counts[key]} 篇，查看统计与原文">${key==="opposition"?"因果表述（误导方）":mediaMetrics[key].label} <b>${media.counts[key]}</b></button>`).join("")}</div>
          <small>${media.counts.pending} 篇待核验 · 未分配立场</small>
        </div>
      </div>
      <div class="stage-copy">
        <p class="period">${stage.period}</p>
        <h3 id="${stage.id}-title">${stage.title}</h3>
        <p>${stage.synopsis}</p>
      </div>
      <img class="stage-asset" src="./assets/${stage.asset}" alt="" loading="lazy" />
      <div class="evidence-list">${stage.events.map((event, eventIndex) => evidenceCard(event, index, eventIndex)).join("")}</div>
    </article>`;
}

timeline.innerHTML = stages.map(stageTemplate).join("");
document.querySelector("#media-board").innerHTML=renderMediaBoard(stages,mediaStages);
const atlas = document.querySelector("#atlas-stops");
atlas.addEventListener("click", event => {
  const stop = event.target.closest("[data-atlas]");
  if (stop) { const index=Number(stop.dataset.atlas); setActiveStage(index); openMedia(index,"total"); }
});

function setActiveStage(index) {
  tabs.forEach((tab, tabIndex) => {
    tab.classList.toggle("is-active", tabIndex === index);
    if (tabIndex === index) tab.setAttribute("aria-current", "step");
    else tab.removeAttribute("aria-current");
  });
  document.querySelectorAll(".stage").forEach((node, nodeIndex) => node.classList.toggle("is-focused", nodeIndex === index));
  atlas.querySelectorAll("[data-atlas]").forEach((stop, stopIndex) => {
    stop.classList.toggle("is-active", stopIndex === index);
    if (stopIndex === index) stop.setAttribute("aria-current", "step");
    else stop.removeAttribute("aria-current");
  });
}

function activateStage(index, moveFocus = false) {
  if (!document.querySelector("#media-evidence").open) { setActiveStage(index); openMedia(index,"total"); return; }
  const stage = document.querySelector(`#${stages[index].id}`);
  setActiveStage(index);
  stage.scrollIntoView({ behavior: prefersReducedMotion.matches ? "auto" : "smooth", block: narrowScreen.matches ? "start" : "nearest", inline: "center" });
  if (moveFocus) stage.focus({ preventScroll: true });
}

tabs.forEach((tab, index) => tab.addEventListener("click", () => activateStage(index, true)));

const stageNodes = [...document.querySelectorAll(".stage")];
let stageFrame;
function updateStageFromScroll() {
  if (!document.querySelector("#media-evidence").open) return;
  if (stageFrame) return;
  stageFrame = requestAnimationFrame(() => {
    stageFrame = null;
    const target = narrowScreen.matches ? innerHeight * .35 : scroller.getBoundingClientRect().left + scroller.clientWidth / 2;
    const closest = stageNodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return { node, distance: Math.abs((narrowScreen.matches ? rect.top : rect.left + rect.width / 2) - target) };
    }).sort((a, b) => a.distance - b.distance)[0];
    if (closest) setActiveStage(Number(closest.node.dataset.index));
  });
}
scroller.addEventListener("scroll", updateStageFromScroll, { passive: true });
window.addEventListener("scroll", () => {
  if (narrowScreen.matches) updateStageFromScroll();
}, { passive: true });

function openEvent(stageIndex, eventIndex) {
  const event = stages[stageIndex].events[eventIndex];
  document.querySelector("#dialog-status").textContent = event.status;
  document.querySelector("#dialog-title").textContent = event.title;
  document.querySelector("#dialog-date").textContent = `${event.date} · ${stages[stageIndex].period}`;
  document.querySelector("#dialog-summary").textContent = event.summary;
  document.querySelector("#dialog-note").textContent = event.note;
  const sourceLink = document.querySelector("#dialog-source");
  sourceLink.href = event.source;
  sourceLink.textContent = "打开原始来源 ↗";
  detailDialog.showModal();
}

timeline.addEventListener("click", (event) => {
  const metric = event.target.closest("[data-media-metric]");
  if (metric) { openMedia(Number(metric.dataset.mediaIndex),metric.dataset.mediaMetric); return; }
  const media = event.target.closest("[data-media]");
  if (media) { openMedia(Number(media.dataset.media),"total"); return; }
  const card = event.target.closest(".evidence-card");
  if (card) openEvent(Number(card.dataset.stageIndex), Number(card.dataset.eventIndex));
});

const mediaDetail = document.querySelector("#media-detail-content");
const mediaReadout = document.querySelector("#media-readout");
const stanceNames = {support:"支持",neutral:"中立",opposition:"反对（误导方）",pending:"待核验"};
const corpus = mediaStages.reduce((sum,stage)=>{
  for(const key of ["total","support","neutral","opposition","pending"])sum[key]=(sum[key]||0)+stage.counts[key];
  return sum;
},{});
document.querySelector("#media-corpus-note").textContent=`本地样本 ${corpus.total} 篇：支持 ${corpus.support}，中立 ${corpus.neutral}，因果表述（误导方）${corpus.opposition}，待核验 ${corpus.pending}。0 篇仅表示本表当前没有归入该类的记录。`;
function hideMediaReadout(){mediaReadout.hidden=true;}
function showMediaReadout(index,key,anchor,event){
  const stage=mediaStages[index], value=describeMediaMetric(stage,key);
  mediaReadout.innerHTML=`<strong>核验补充 · ${stage.period} · ${value.label}</strong><span>${value.count} 篇 · ${value.percentage}</span><small>分母：${value.base}</small>${key==="total"?`<small>支持 ${stage.counts.support} · 中立 ${stage.counts.neutral} · 反对 ${stage.counts.opposition} · 待核验 ${stage.counts.pending}</small>`:""}`;
  const rect=anchor.getBoundingClientRect();
  const x=event?.clientX??rect.left+rect.width/2,y=event?.clientY??rect.bottom;
  mediaReadout.style.left=`${Math.max(12,Math.min(x+12,innerWidth-310))}px`;
  mediaReadout.style.top=`${Math.max(12,Math.min(y+14,innerHeight-160))}px`;
  mediaReadout.hidden=false;
}
function openMedia(index,key){
  const stage=mediaStages[index], value=describeMediaMetric(stage,key);
  hideMediaReadout();
  document.querySelector("#dialog-status").textContent=mediaSource.label;
  document.querySelector("#dialog-title").textContent=`${stage.period} · ${value.label}`;
  document.querySelector("#dialog-date").textContent=`${stage.counts.total} 篇样本 · ${stage.counts.total-stage.counts.pending} 篇已分类 · ${stage.counts.pending} 篇待核验`;
  document.querySelector("#dialog-summary").textContent=`${value.count} 篇；分母为${value.base}，占比${value.percentage}。`;
  document.querySelector("#dialog-note").textContent="一级立场互斥；二级内容标签可多选，不能相加。海报视觉与核验样本采用独立的数据范围；本表篇数以逐篇核验记录为准。“反对”位置对应本表“误导方”，仅指将可能关联写成因果关系。待核验不分配立场。样本不能代表全英国报道。";
  const matches=stage.articles.filter(article=>key==="total"||article.stance===key||article.indicators.includes(key));
  mediaDetail.innerHTML=`<h3>逐篇分类记录 · 立场内分母</h3><div class="media-table-scroll"><table><thead><tr><th>指标</th><th>篇数</th><th>分母</th><th>占比</th></tr></thead><tbody>${Object.keys(mediaMetrics).filter(metric=>metric!=="total").map(metric=>{const v=describeMediaMetric(stage,metric);return `<tr class="${key===metric?"is-selected":""}"><th><button type="button" data-dialog-media-index="${index}" data-dialog-media-key="${metric}">${escapeHtml(v.label)}</button></th><td>${v.count}</td><td>${v.denominator}</td><td>${v.denominator?v.percentage:"不适用"}</td></tr>`;}).join("")}</tbody></table></div><h3>对应原文 · ${matches.length} 篇</h3>${matches.length?`<ol class="media-record-list">${matches.map(article=>`<li><a href="${escapeHtml(article.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(article.title)} ↗</a><small>${article.date} · ${escapeHtml(article.outlet)} · 编码记录 ${article.id}</small><p>${escapeHtml(article.reason)}</p></li>`).join("")}</ol>`:"<p>本阶段当前没有归入该项的样本。</p>"}`;
  mediaDetail.hidden=false;
  document.querySelector("#dialog-source").href=stage.articles[0]?.url||"#explore";
  document.querySelector("#dialog-source").textContent="阅读本阶段报道原文 ↗";
  if(!detailDialog.open)detailDialog.showModal();
}
mediaDetail.addEventListener("click",event=>{const button=event.target.closest("[data-dialog-media-key]");if(button)openMedia(Number(button.dataset.dialogMediaIndex),button.dataset.dialogMediaKey);});
detailDialog.addEventListener("close",()=>{mediaDetail.hidden=true;hideMediaReadout();});
document.querySelectorAll("[data-media-metric]").forEach(mark=>{
  const display=event=>showMediaReadout(Number(mark.dataset.mediaIndex),mark.dataset.mediaMetric,mark,event);
  mark.addEventListener("pointerenter",display);
  mark.addEventListener("pointerleave",hideMediaReadout);
  mark.addEventListener("focus",()=>{if(mark.matches(":focus-visible"))display();});
  mark.addEventListener("blur",hideMediaReadout);
  if(mark.tagName.toLowerCase()==="g")mark.addEventListener("keydown",event=>{if(["Enter"," "].includes(event.key)){event.preventDefault();openMedia(Number(mark.dataset.mediaIndex),mark.dataset.mediaMetric);}});
});
atlas.querySelectorAll("[data-atlas]").forEach(stop=>{
  stop.addEventListener("pointerenter",event=>showMediaReadout(Number(stop.dataset.atlas),"total",stop,event));
  stop.addEventListener("pointerleave",hideMediaReadout);
  stop.addEventListener("focus",()=>{if(stop.matches(":focus-visible"))showMediaReadout(Number(stop.dataset.atlas),"total",stop);});
  stop.addEventListener("blur",hideMediaReadout);
  stop.addEventListener("click",hideMediaReadout);
});
window.addEventListener("scroll",hideMediaReadout,{passive:true});
scroller.addEventListener("scroll",hideMediaReadout,{passive:true});
document.addEventListener("keydown",event=>{if(event.key==="Escape")hideMediaReadout();});
atlas.addEventListener("keydown",event=>{
  const stop=event.target.closest("[data-atlas]");
  if(stop&&["Enter"," "].includes(event.key)){event.preventDefault();const index=Number(stop.dataset.atlas);setActiveStage(index);openMedia(index,"total");}
});
function handleBoardAction(target){
  const photo=target.closest("[data-board-photo]");
  if(photo){
    document.querySelector("#original-figure-title").textContent=photo.dataset.photoLabel;
    const image=document.querySelector("#original-figure-image");image.hidden=false;document.querySelector("#cohort-zoom")?.remove();image.src=`./assets/${photo.dataset.boardPhoto}`;image.alt=photo.dataset.photoLabel;image.style.width="1100px";
    document.querySelector("#original-figure-note").textContent="独立照片部件；可横向查看，按 Escape 关闭。";
    document.querySelector("#original-figure-dialog").showModal();return;
  }
  const originalNews=target.closest('[data-board-news]');
  if(originalNews){
    const index=Number(originalNews.dataset.boardNews);
    document.querySelector('#dialog-status').textContent='人物发言与文件记录';
    document.querySelector('#dialog-title').textContent=['1998 年新闻发布会','','2004 年撤回解释','2010—2011 年撤稿后的表述','','2016 年采访'][index];
    document.querySelector('#dialog-date').textContent=stages[index].period;
    document.querySelector('#dialog-summary').textContent=originalNews.textContent;
    document.querySelector('#dialog-note').textContent='这里记录的是人物在公共讨论中的表述。2004 年十位作者撤回结果解释；2010 年期刊撤回论文全文。人物主张、研究证据和期刊行动分别记录。';
    const sources={0:'https://doi.org/10.1016/S0140-6736(97)11096-0',2:'https://doi.org/10.1016/S0140-6736(04)15715-2',3:'https://doi.org/10.1016/S0140-6736(10)60175-4',5:'https://violentmetaphors.com/2016/02/15/an-interview-with-andrew-wakefield/'};
    document.querySelector('#dialog-source').href=sources[index];document.querySelector('#dialog-source').textContent=index===5?'阅读 2016 年采访原文 ↗':'阅读相关原始文件 ↗';detailDialog.showModal();return;
  }
  const news=target.closest("[data-board-event]");
  if(news){const index=Number(news.dataset.boardEvent);openEvent(index,news.dataset.eventIndex!==undefined?Number(news.dataset.eventIndex):index===3?1:0);return;}
  const institution=target.closest("[data-board-institution]");
  if(institution){const index=Number(institution.dataset.boardInstitution),item=stages[index].institution;
    document.querySelector("#dialog-status").textContent="机构与公共资料";
    document.querySelector("#dialog-title").textContent=item.label;
    document.querySelector("#dialog-date").textContent=stages[index].period;
    document.querySelector("#dialog-summary").textContent=item.caption;
    document.querySelector("#dialog-note").textContent="机构与相邻时期的资料并列呈现，不据此推断单一因果关系。";
    const link=document.querySelector("#dialog-source");link.href=item.source||stages[index].events[0].source;link.textContent=item.source?"查看机构资料 ↗":"查看相邻时期资料 ↗";detailDialog.showModal();
  }
}
document.querySelector("#media-board").addEventListener("click",event=>handleBoardAction(event.target));
document.querySelector("#media-board").addEventListener("keydown",event=>{
  if(event.target.closest("[data-board-event],[data-board-news],[data-board-institution],[data-board-photo]")&&["Enter"," "].includes(event.key)){event.preventDefault();handleBoardAction(event.target);}
});
const mediaBoardDialog=document.querySelector("#media-board-dialog"),overlayContent=document.querySelector("#media-board-overlay-content");
function openMediaBoardOverlay(){
  const clone=document.querySelector("#media-board .media-board-art").cloneNode(true),ids=new Map();
  clone.querySelectorAll("[id]").forEach(node=>{const old=node.id,next=`overlay-${old}`;ids.set(old,next);node.id=next;});
  clone.querySelectorAll("*").forEach(node=>[...node.attributes].forEach(attr=>{let value=attr.value;for(const [old,next] of ids){value=value.replaceAll(`url(#${old})`,`url(#${next})`).replaceAll(`href=\"#${old}\"`,`href=\"#${next}\"`);if(attr.name==="href"&&value===`#${old}`)value=`#${next}`;}if(value!==attr.value)node.setAttribute(attr.name,value);}));
  overlayContent.replaceChildren(clone);
  clone.addEventListener("click",event=>{const stop=event.target.closest("[data-atlas]");if(stop){const index=Number(stop.dataset.atlas);setActiveStage(index);openMedia(index,"total");return;}handleBoardAction(event.target);});
  clone.addEventListener("keydown",event=>{if(event.target.closest("[data-board-event],[data-board-news],[data-board-institution],[data-board-photo],[data-atlas]")&&["Enter"," "].includes(event.key)){event.preventDefault();const stop=event.target.closest("[data-atlas]");if(stop){const index=Number(stop.dataset.atlas);setActiveStage(index);openMedia(index,"total");}else handleBoardAction(event.target);}});
  mediaBoardDialog.showModal();
}
document.querySelector("#board-zoom").addEventListener("click",openMediaBoardOverlay);
document.querySelector("[data-close-media-board]").addEventListener("click",()=>mediaBoardDialog.close());

document.querySelector("#guide-button").addEventListener("click", () => guideDialog.showModal());
let lockedScroll = null;
function syncDialogScroll(){
  const open = document.querySelector('dialog[open]');
  if(open && lockedScroll === null){
    lockedScroll = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScroll}px`;
    document.body.style.width = '100%';
    document.documentElement.classList.add('dialog-is-open');
  }else if(!open && lockedScroll !== null){
    const y = lockedScroll;
    lockedScroll = null;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.documentElement.classList.remove('dialog-is-open');
    window.scrollTo({top:y,behavior:'instant'});
  }
}
document.querySelectorAll('dialog').forEach(dialog=>{
  const edges = dialog.id === 'detail-dialog' ? ['left'] : ['left','right'];
  for(const edge of edges){
    const handle=document.createElement('div');
    handle.className=`dialog-resize-edge is-${edge}`;
    handle.setAttribute('role','slider');handle.setAttribute('tabindex','0');
    handle.setAttribute('aria-label',`${edge==='left'?'左':'右'}侧拖动以调整面板宽度`);
    handle.setAttribute('aria-valuemin','35');handle.setAttribute('aria-valuemax','94');
    handle.title='左右拖动调整面板宽度';handle.innerHTML='<span aria-hidden="true">↔</span>';
    handle.setAttribute('aria-valuenow',String(Math.round(dialog.getBoundingClientRect().width/innerWidth*100)));
    let drag=null;
    const setWidth=value=>{
      const percent=Math.max(35,Math.min(94,value));
      dialog.style.setProperty('--panel-width',`${percent}vw`);
      handle.setAttribute('aria-valuenow',String(Math.round(percent)));
    };
    handle.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      event.preventDefault();handle.setPointerCapture(event.pointerId);
      drag={x:event.clientX,width:dialog.getBoundingClientRect().width/innerWidth*100};
    });
    handle.addEventListener('pointermove',event=>{
      if(!drag)return;
      const delta=(event.clientX-drag.x)/innerWidth*100*(edge==='left'?-1:1);
      setWidth(drag.width+delta);
    });
    const stop=()=>{drag=null;};
    handle.addEventListener('pointerup',stop);handle.addEventListener('pointercancel',stop);
    handle.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      const current=dialog.getBoundingClientRect().width/innerWidth*100;
      setWidth(event.key==='Home'?35:event.key==='End'?94:current+(event.key==='ArrowRight'?2:-2));
    });
    dialog.append(handle);
  }
  new MutationObserver(syncDialogScroll).observe(dialog,{attributes:true,attributeFilter:['open']});
  dialog.addEventListener('close',syncDialogScroll);
});
document.querySelectorAll(".dialog-close").forEach((button) => button.addEventListener("click", () => button.closest("dialog").close()));
document.querySelectorAll("dialog").forEach((dialog) => dialog.addEventListener("click", (event) => {
  if (event.target === dialog) { const box=dialog.getBoundingClientRect(); if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close(); }
}));

scroller.addEventListener("keydown", (event) => {
  if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
  event.preventDefault();
  const active = tabs.findIndex((tab) => tab.classList.contains("is-active"));
  const next = Math.max(0, Math.min(stages.length - 1, active + (event.key === "ArrowRight" ? 1 : -1)));
  activateStage(next, true);
});

setActiveStage(0);

const surveyRows = [...document.querySelectorAll(".survey-row, .survey-uptake")];
const surveyDetails = [
  { title: "他人鼓励", text: "家长是否感到他人鼓励其为孩子接种。", values: [["不同意", "2.8%", "14 人"], ["某种程度同意", "53.1%", "270 人"], ["同意", "44.1%", "224 人"]], answered: "该项共 508 人作答。" },
  { title: "疾病严重程度", text: "家长对麻疹、腮腺炎和风疹严重程度的看法。", values: [["不同意", "0.8%", "4 人"], ["某种程度同意", "13.4%", "68 人"], ["同意", "85.9%", "437 人"]], answered: "该项共 509 人作答。" },
  { title: "决策后果担忧", text: "家长是否担心接种决定可能产生的不良后果。", values: [["不同意", "2.7%", "14 人"], ["某种程度同意", "13.4%", "68 人"], ["同意", "83.9%", "428 人"]], answered: "该项共 510 人作答。" },
  { title: "相关经历", text: "家长过去是否接触过与疫苗或疾病有关的问题。", values: [["不同意", "47.6%", "243 人"], ["某种程度同意", "47.1%", "240 人"], ["同意", "5.3%", "27 人"]], answered: "该项共 510 人作答。" },
  { title: "认为接种不健康", text: "家长对“接种不健康”等陈述的综合回答。调整后的回归结果中，该题与两岁时接种呈负向相关：OR 0.48，95% CI 0.29—0.77；这是观察性关联，不是因果效应。", values: [["不同意", "49.5%", "253 人"], ["某种程度同意", "42.3%", "216 人"], ["同意", "8.0%", "41 人"]], answered: "该项共 510 人作答。" },
  { title: "对医疗界的信任", text: "家长对医生及医疗建议的综合态度。调整后的回归结果中，该题与两岁时接种相关：OR 1.78，95% CI 1.11—2.87；这是观察性关联。", values: [["不同意", "16.6%", "85 人"], ["某种程度同意", "56.2%", "287 人"], ["同意", "26.8%", "137 人"]], answered: "该项共 509 人作答。" },
  { title: "对媒体的信任", text: "家长对健康信息媒体的综合态度，不等于对某一篇 MMR 报道的评价。调整后的回归结果中，该题与两岁时接种相关：OR 2.37，95% CI 1.28—4.38；这是观察性关联。", values: [["不同意", "71.7%", "364 人"], ["某种程度同意", "28.2%", "144 人"], ["同意", "0%", "0 人"]], answered: "该项共 508 人作答。" },
  { title: "孩子 2 岁时 MMR 接种结果", text: "研究从儿童健康记录取得随访结果，这一项不是家长态度题。既往按时接种与该结果相关：调整后 OR 4.24，95% CI 2.22—8.09；这是观察性关联。", values: [["已接种", "77.7%", "397 人"], ["未接种", "22.3%", "114 人"]], answered: "511 份有效问卷对应的儿童。" }
];

function selectSurvey(index) {
  const item = surveyDetails[index];
  surveyRows.forEach((row, rowIndex) => row.setAttribute("aria-pressed", String(rowIndex === index)));
  document.querySelector("#survey-detail-title").textContent = item.title;
  document.querySelector("#survey-detail-text").textContent = item.text;
  document.querySelector("#survey-detail-values").innerHTML = item.values.map(([label, percent, count]) =>
    `<div><dt>${label}</dt><dd><strong>${percent}</strong><span>${count}</span></dd></div>`).join("");
  document.querySelector("#survey-detail-sample").textContent = item.answered;
}
surveyRows.forEach((row, index) => row.addEventListener("click", () => { document.querySelector("#survey").dataset.expanded = "true"; selectSurvey(index); }));
selectSurvey(0);
