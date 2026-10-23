import { cohortGeometry as geometry } from './cohort-geometry.js';

const label=(text,x,y,extra='')=>`<text x="${x}" y="${y}" ${extra}>${text}</text>`;
export function renderCohortChart(kind){
  if(kind==='birth')return `<svg class="coded-cohort-chart" viewBox="850 1910 1040 380" role="group" aria-label="按出生年份的确诊病例分布">
    <image href="./assets/british-isles.svg" x="1050" y="1800" width="700" height="800" opacity=".35"/>
    ${label('麻疹确诊病例数（按出生年份划分）',862,1941,'font-weight="650"')}
    ${Array.from({length:8},(_,i)=>{const y=2191.115-i*30.7847;return `<path d="M903.705 ${y}H1855.031" class="cohort-grid"/>${label(i*10,870,y+5)}`;}).join('')}
    <path d="${geometry.birthArea}" fill="#d7cef4" fill-opacity=".7"/>
    ${geometry.birthPoints.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="4.3" fill="${p.hollow?'#00206a':'#d7cef4'}" stroke="#d7cef4"/>`).join('')}
    ${geometry.birthPoints.map((p,i)=>{const count=Math.max(0,Math.round((2191.115-p.y)/30.7847*10));return `<g class="cohort-mark" tabindex="0" role="button" data-cohort-point="${i}" aria-label="${p.year} 年出生，${count} 例，数字化读数"><rect x="${p.x-7}" y="1974" width="14" height="220" fill="transparent"/></g>`;}).join('')}
    ${Array.from({length:15},(_,i)=>{const year=1958+i*4,x=940.594+(year-1958)/56*(1855.031-940.594);return label(year,x,2226,`text-anchor="middle" transform="rotate(-30 ${x} 2226)"`);}).join('')}
    ${label('出生年份',1370,2274,'text-anchor="middle" font-weight="650"')}
  </svg>`;
  return `<svg class="coded-cohort-chart" viewBox="2430 1910 415 380" role="group" aria-label="年龄范围与中位年龄，图表数字化">
    ${label('年龄（岁）',2444,1943,'font-weight="650"')}
    ${Array.from({length:7},(_,i)=>{const y=2192.511-i*36.1295;return `<path d="M2471.676 ${y}H2814.282" class="${i===0||i===6?'cohort-axis':'cohort-grid'}"/>${label(i*10,2444,y+5)}`;}).join('')}
    ${geometry.age.map((p,i)=>{const y=[2138.317,2143.067,2157.797,2122.75][i];return `<g class="cohort-mark" tabindex="0" role="button" data-cohort-age="${i}" aria-label="${p.year} 年，年龄 ${p.minApprox}—${p.maxApprox} 岁，中位年龄 ${p.median} 岁，数字化读数"><path d="M${p.x} ${p.top}V${p.bottom}M${p.x-9} ${p.top}H${p.x+9}M${p.x-9} ${p.bottom}H${p.x+9}" class="cohort-range"/><circle cx="${p.x}" cy="${y}" r="6" fill="#00206a" stroke="#d7cef4"/>${label(p.median,p.x+10,y-5)}<rect x="${p.x-17}" y="1985" width="34" height="210" fill="transparent"/></g>`;}).join('')}
    ${[2014,2015,2016,2017,2018].map((year,i)=>{const x=2510.525+i*64.37;return label(year,x,2226,`text-anchor="middle" transform="rotate(-30 ${x} 2226)"`);}).join('')}
    ${label('━ 最小—最大年龄　○ 年龄中位数',2445,2270,'font-size="16"')}
  </svg>`;
}

export function cohortReadout(element){
  if(element.dataset.cohortAge!==undefined){
    const p=geometry.age[Number(element.dataset.cohortAge)];
    return `${p.year} 年｜最小年龄 ${p.minApprox} 岁；最大年龄 ${p.maxApprox} 岁；年龄中位数 ${p.median} 岁。数据方式：图表数字化，整数显示。`;
  }
  const p=geometry.birthPoints[Number(element.dataset.cohortPoint)],count=Math.max(0,Math.round((2191.115-p.y)/30.7847*10));
  return `出生年份 ${p.year} 年｜确诊病例 ${count} 例。横轴表示出生年份；数据方式：图表数字化，整数显示。`;
}
