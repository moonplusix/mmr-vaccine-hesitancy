import { discGeometry } from './media-geometry.js';
import { mediaLines } from './media-lines.js';
import { mediaAnnotations } from './media-annotations.js';

const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const lines = (copy,x,y,size=28,extra='') => `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${copy.map((line,i)=>`<tspan x="${x}" dy="${i?size*1.5:0}">${escape(line)}</tspan>`).join('')}</text>`;
const depthLines = (copy,x,y,size=28,className='',extra='') => `<g transform="translate(${x} ${y})">${lines(copy,0,0,size,`class="board-depth-text ${className}" ${extra}`)}</g>`;
const half = (r,lower=false) => `M${-r} 0A${r} ${r} 0 0 ${lower?0:1} ${r} 0`;
const anchors = [[477.774,1571.053],[734.525,1428.632],[1188.123,1228.073],[1674.906,1061.948],[2000.183,932.804],[2324.811,898.296],[2815.097,717.025]];

function retractionTitle(index,copy){
  const p=discGeometry[index].filter(part=>!part.lower).sort((a,b)=>b.r-a.r)[0],scale=(p.r+20)/p.r;
  const point=([x,y])=>[p.cx+(x-p.cx)*scale,p.cy+(y-p.cy)*scale].join(' ');
  const d=`M${point(p.curves[0][0])}${p.curves.map(curve=>'C'+curve.slice(1).map(point).join(' ')).join('')}`;
  return `<defs><path id="retraction-arc-${index}" d="${d}"/></defs><text class="board-retraction-title" font-size="27" text-anchor="middle"><textPath href="#retraction-arc-${index}" startOffset="50%">${copy}</textPath></text>`;
}

function edgeNarrative(){
  const tags=[[315,'场'],[800,'文'],[855,'图'],[1330,'事']];
  const labels=[[355,'新闻发布会'],[865,'媒体放大'],[1390,'公众恐慌与信任危机'],[2330,'麻疹病情暴发'],[3100,'社媒加速']];
  return `<g class="board-edge-narrative" aria-label="新闻发布会、媒体放大、公众恐慌与信任危机、麻疹病情暴发、社媒加速">
    <defs><marker id="narrative-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7L2 3.5Z" fill="#d7e4f5"/></marker></defs>
    <path d="M145 350H3190V315M477 350V330" fill="none" stroke="#d7e4f5" stroke-opacity=".6"/>
    ${[[550,800],[1045,1320],[1770,2300],[2580,3065]].map(([a,b])=>`<path d="M${a} 315H${b}" stroke="#d7e4f5" marker-end="url(#narrative-arrow)"/>`).join('')}
    ${tags.map(([x,t])=>`<circle cx="${x}" cy="270" r="30" fill="#fff"/><text x="${x}" y="280" text-anchor="middle" style="fill:#00206a" font-size="28" font-weight="800">${t}</text>`).join('')}
    ${labels.map(([x,t])=>lines([t],x,323,29,'font-weight="650"')).join('')}
  </g>`;
}

function edgeParticipants(){
  const drop='M-35.24 0L0-50.76L35.24 0A35.24 35.24 0 1 1-35.24 0Z';
  return `<g class="board-edge-participants">
    ${[[146.274,'媒体','middle'],[422.362,'政府','middle'],[466,'安德鲁·韦克菲尔德','start'],[1245.822,'布莱恩·迪尔','middle']].map(([x,t,align])=>lines([t],x,2198,29,`text-anchor="${align}" font-weight="650"`)).join('')}
    ${[146.142,422.369].map(x=>`<path d="${drop}" transform="translate(${x} 2273.45)" fill="#fff"/>`).join('')}
    <g transform="translate(146.142 2273.45)" fill="none" stroke="#52617b" stroke-width="2"><rect x="-14" y="-11" width="24" height="27"/><path d="M-8-5H5M-8 0H5M-8 5H5M-8 10H0M10-5H16V16H10"/></g>
    <g transform="translate(422.369 2273.45)" fill="none" stroke="#52617b" stroke-width="2"><path d="M-16-3L0-15L16-3ZM-15 15H15M-11 12V0M-4 12V0M4 12V0M11 12V0"/></g>
    <defs><clipPath id="participant-wakefield"><rect x="478.557" y="2251.501" width="36" height="36"/></clipPath><clipPath id="participant-deer"><rect x="1223.512" y="2253.259" width="36" height="36"/></clipPath></defs>
    <circle cx="496.557" cy="2269.501" r="35.238" fill="#83698b"/><image href="./assets/wakefield.png" x="478.557" y="2251.501" width="36" height="36" preserveAspectRatio="xMidYMid slice" clip-path="url(#participant-wakefield)"/>
    <circle cx="1241.512" cy="2271.259" r="35.433" fill="#ddf1f4"/><image href="./assets/deer.png" x="1223.512" y="2253.259" width="36" height="36" preserveAspectRatio="xMidYMid slice" clip-path="url(#participant-deer)"/>
    <circle cx="3235.338" cy="2273.45" r="35.433" fill="#fff"/><text x="3235.338" y="2283.45" text-anchor="middle" style="fill:#00206a" font-size="28" font-weight="800">事</text>
  </g>`;
}

export function renderDisc(index, period, total) {
  const parts = discGeometry[index];
  return `<g class="board-disc" data-atlas="${index}" tabindex="0" role="button" aria-label="${period}，参考半圆构成；核验样本 ${total} 篇，查看详情">
    <title>${period} · 参考造型；核验样本 ${total} 篇。参考图形面积不对应更新样本的逐值编码。</title>
    ${parts.map(p=>{const d=`M${p.curves[0][0].join(' ')}${p.curves.map(c=>'C'+c.slice(1).flat().join(' ')).join('')}`;return `<g class="board-semicircle ${p.fill?'is-filled':''}">${p.fill?`<path d="${d}Z" fill="${p.fill}" fill-opacity="${p.fillOpacity}" stroke="none"/>`:''}${p.stroke?`<path d="${d}" fill="none" stroke="${p.stroke}" stroke-opacity="${p.strokeOpacity}" stroke-width="${p.strokeWidth}"/>`:''}</g>`;}).join('')}
  </g>`;
}

function photo(asset,label,x,y,width,height){
  return `<g class="board-photo" data-board-photo="${asset}" data-photo-label="${escape(label)}" tabindex="0" role="button" aria-label="放大照片：${escape(label)}"><image href="./assets/${asset}" x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet"/><rect x="${x}" y="${y}" width="${width}" height="${height}" class="component-hit"/></g>`;
}

function referenceDrops(){
  return `<g class="board-drops">${mediaLines.drops.map(p=>`<path class="reference-drop" d="${p.d}" fill="${p.fill}"/>`).join('')}</g>`;
}
function referenceNews(){
  const blocks=[
    [0,415,1110,['提出麻腮风联合疫苗','可能与部分儿童的行','为和发育变化有关；','同期，在论文发布记','者会上表达对联合疫','苗安全性的担忧，并','建议使用单价疫苗。']],
    [2,1180,615,['2004年，10名共同','作者撤回论文中关','于MMR与自闭症可','能存在因果关联的','解释，韦克菲尔德','未签署撤回声明。']],
    [3,1669,461,['2010年全文撤稿','后，强调原论文未','确认疫苗与自闭症','的关联；2011年，','重申单价疫苗','建议。']],
    [5,2238,568,['2016年，在采访','中明确声称疫苗与','自闭症存在关联，','同时继续否认研究','欺诈指控。']]
  ];
  return `${blocks.map(([i,x,y,copy])=>`<g class="board-news-summary" transform="translate(${x} ${y})" data-board-news="${i}" tabindex="0" role="button" aria-label="${escape(copy.join(''))}，查看资料">${lines(copy,0,0,i===2||i===3?16:17.4,'class="board-depth-text board-news-copy"')}<rect x="-2" y="-20" width="145" height="${copy.length*(i===2||i===3?24:26.1)}" class="component-hit"/></g>`).join('')}
    ${mediaLines.photos.map(p=>`<g transform="${p.transform}">${photo(p.asset,p.asset.includes('1998')?'1998 年新闻发布会':p.asset.includes('2016')?'2016 年采访画面':'新闻资料照片',0,0,p.width,p.height)}</g>`).join('')}
    ${[[415,1404,'《英国医学杂志》1998'],[1180,871,'Getty Images News 2007'],[1669,718,'Getty Images News 2010'],[2238,824,'Violent Metaphors 2016']].map(([x,y,t])=>depthLines([t],x,y,17,'board-muted board-photo-credit')).join('')}
    ${retractionTitle(2,'第一次论文撤稿')}${retractionTitle(3,'第二次论文撤稿')}`;
}

function institutions(stages){
  const original=[
    [0,430,1930,'英国卫生部',['建议接种 MMR，开展专','家审查。卫生部公开资','料，反对单价疫苗替代。'],'回应接种率下降及疫苗争议。'],
    [1,930,1730,'英国下议院',['2001 年首相拒答','儿子的接种情况，','引发接种猜疑。'],''],
    [2,1380,1580,'英国卫生部',['调整儿童免疫安排，','提供疫苗接种指导。'],'证据不支持关联；卫生部启动MMR补种。'],
    [4,1880,1380,'英格兰公共卫生署',['启动青少年','MMR补种，公布','补种成效。'],''],
    [5,2520,1190,'英格兰公共卫生署',['PHE 发布麻疹与','风疹消除战略，','提出 95% 接种','覆盖率目标。'],''],
    [6,3010,970,'英国卫生安全局',['警示错误信息','长期影响。'],'']
  ];
  return original.map(([i,x,y,title,copy,note])=>`<g class="board-institution" transform="translate(${x} ${y})">
    ${depthLines([title],-1.71,-4.70,25,'board-institution-title','font-weight="650"')}
    <g class="board-building" data-board-institution="${i}" role="button" tabindex="0" aria-label="${title}，${copy.join('')}，查看机构资料"><image href="./assets/${stages[i].institution.asset}" x="0" y="${i===0?-15:15}" width="${i===0?206:i===6?100:170}" height="${i===0?183:170}" preserveAspectRatio="xMidYMin meet"/><rect x="-5" y="${i===0?-20:10}" width="${i===0?216:i===6?110:180}" height="${i===0?193:180}" class="component-hit"/></g>
    ${depthLines(copy,({0:640,1:1185.6,2:1593.06,4:2089.05,5:2733.62,6:3121.16})[i]-x,({0:1934,1:1737,2:1587,4:1397,5:1160,6:1025})[i]-y,17.4,'board-institution-copy')}${note?depthLines(i===0?['回应接种率下降及疫苗争议。']:['证据不支持关联；','卫生部启动MMR补种。'],(i===0?630.81:1593.06)-x,(i===0?2130:1795)-y,17.4,'board-institution-note'):''}
  </g>`).join('');
}
function referenceDocuments(){
  return mediaLines.documents.map(p=>{const values=p.transform.match(/-?[.\d]+/g).map(Number),x=values[4],i=x<1000?0:x<1230?1:x<1600?2:x<1850?3:x<2300?4:x<3000?5:6;return `<g class="board-document" transform="${p.transform}" data-board-institution="${i}" tabindex="0" role="button" aria-label="独立文献资料，查看 ${['1998—2000','2001—2003','2004—2009','2010—2011','2012—2014','2015—2019','2020—2026'][i]} 时期资料"><image href="./assets/${p.asset}" width="${p.width}" height="${p.height}"/><rect width="${p.width}" height="${p.height}" class="component-hit"/></g>`;}).join('');
}

export function renderMediaBoard(stages,mediaStages){
  return `<svg class="media-board-art" viewBox="80 220 3210 2140" preserveAspectRatio="xMidYMid meet" aria-labelledby="board-title board-description">
    <title id="board-title">1998—2026 年 MMR 报道与证据时间画布</title><desc id="board-description">可操作的七阶段半圆、文字图例、报道水滴，以及独立照片、建筑与资料图像。圆盘与水滴呈现报道结构，核验样本计数见详情。</desc>
    <image href="./assets/british-isles.svg" x="450" y="-140" width="2400" height="2500" opacity=".55"/>
    ${edgeNarrative()}
    <g class="board-participant-lines" fill="none" stroke="#fff" stroke-width="1">
      <path d="M146.274 355.471V748.153M146.274 884.267V1771.829M146.274 1778.358V2165.406M422.362 1922.114V2165.406M480.474 1838.228V1880.454M480.474 2097.557V2164.479M480.539 1369.992V1421.317M1245.822 1318.128V1359.502M1245.822 1384.369V1414.549M1245.822 1436.866V1702.490M1245.822 1981.787V2164.479"/>
      <path d="M622.406 2028.949V2203.248M467.640 2204.165L625.171 2204.587M1179.116 1822.318V1998.676M1585.515 1668.549V1850.740M2078.023 1491.554V1672.708M2723.818 1267.280V1437.469M3114.566 1123.101V1295.946" stroke="#f6edf9" stroke-dasharray=".01 5" stroke-linecap="round"/>
    </g>
    <path class="board-ribbon" d="${mediaLines.ribbon.d}" fill="${mediaLines.ribbon.fill}" fill-opacity="${mediaLines.ribbon.opacity}"/>
    ${mediaLines.guides.map(line=>`<path class="board-guide" d="${line.d}" fill="none" stroke="${line.stroke}" stroke-width="${line.width}" stroke-opacity="${line.opacity}" stroke-dasharray="${line.dash}" stroke-linecap="${line.cap}"/>`).join('')}
    <image href="./assets/media-legend.svg" x="100" y="610" width="830" height="400" aria-label="1998—2026年MMR争议媒体报道的立场与内容分布：半圆面积与文章篇数成正比；支持、中立、反对；明确说明证据不足、报道调查监管、将可能写为肯定相关、引用研究等否定关联、提及可能关联。"/>
    <g id="atlas-stops">${stages.map((s,i)=>renderDisc(i,s.period,mediaStages[i].counts.total)).join('')}</g>
    <defs><clipPath id="board-veil-0"><path d="M0 0H1800V1775.984L0 2431.13Z"/></clipPath><clipPath id="board-veil-1"><path d="M0 0H3370V1204.551L0 2431.13Z"/></clipPath></defs>
    ${mediaLines.veils.map((v,i)=>`<path class="board-reference-veil" d="${i===0?v.d.replace('1331.115478515625 538.739013671875L1061.99755859375 637.6630249023438','1331.115478515625 483.739013671875L1061.99755859375 582.6630249023438'):v.d}" fill="${v.fill}" fill-opacity="${v.opacity}" clip-path="url(#board-veil-${i})"/>`).join('')}
    ${anchors.map(([x,y],i)=>{const left=x-(i===2?110:40),baseline=1769.05-.36397*left+45;return `<circle cx="${x}" cy="${y}" r="5.6693" class="board-anchor"/>${depthLines([stages[i].period],left,baseline,25,'board-period','font-weight="650"')}`;}).join('')}
    ${referenceDrops()}
    ${mediaAnnotations.map(a=>`<g class="board-reference-annotation" role="img" aria-label="${escape(a.label)}"><title>${escape(a.label)}</title><path d="${a.d}" fill="${a.fill}" stroke="none"/></g>`).join('')}
    ${referenceNews()}
    <a class="board-film" href="https://briandeer.com/wakefield/mmr-what-they-didnt-tell-you.htm" target="_blank" rel="noopener noreferrer" aria-label="查看相关调查纪录片 MMR: What They Didn’t Tell You，2004 年，打开外部网页"><g transform="${mediaLines.film.transform}"><image href="./assets/media-screen.webp" width="${mediaLines.film.width}" height="${mediaLines.film.height}"/>${lines(['纪录片中回顾调查经过 ↗'],540,360,55)}</g><title>打开相关调查纪录片《MMR: What They Didn’t Tell You》网页，2004 年。</title></a>
    <g class="board-drop-key" transform="translate(110 1720)" aria-label="报道总数；报道倾向，每滴表示报道篇数。支持：明确说明证据不足、引用研究等否定关联；中立：报道调查监管、提及可能关联。">
      ${depthLines(['报道总数'],0,0,25,'board-legend-text')}${depthLines(['报道倾向'],0,67,25,'board-legend-text')}
      <path d="M132 34C130 39 124 44 124 49A7 7 0 0 0 138 49C138 44 135 38 132 34Z" fill="#ddf1f4" transform="translate(-6 -20) rotate(-20 132 49)"/>
      ${depthLines(['报道篇数'],144,20,20,'board-legend-text')}${depthLines(['支持'],55,100,22,'board-legend-text')}${depthLines(['明确说明证据不足'],128,74,20,'board-legend-text')}${depthLines(['引用研究等否定关联'],190,100,20,'board-legend-text')}
      ${depthLines(['中立'],168,148,22,'board-legend-text')}${depthLines(['报道调查监管'],247,117,20,'board-legend-text')}${depthLines(['提及可能关联'],300,139,20,'board-legend-text')}
    </g>
    ${institutions(stages)}
    ${referenceDocuments()}
    ${edgeParticipants()}
  </svg>`;
}
