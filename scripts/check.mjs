import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { renderMediaBoard } from "../dist/media-board.js";
import { discGeometry } from "../dist/media-geometry.js";
import { mediaLines } from "../dist/media-lines.js";
import { contentSizes, contentMetrics, contentPercentage, describeContentRow } from "../dist/media-content-review.js";
import { stages } from "../dist/data.js";
import { mediaStages } from "../dist/media-data.js";
import { describeMediaMetric } from "../dist/media-chart.js";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const dist = resolve(root, "dist");
for (const file of ["index.html", "favicon.svg", "styles.css", "poster.css", "app.js", "upper.js", "data.js"]) await access(resolve(dist, file));
const [html, css, posterCss, js, upperJs, data, requirements] = await Promise.all([
  readFile(resolve(dist, "index.html"), "utf8"),
  readFile(resolve(dist, "styles.css"), "utf8"),
  readFile(resolve(dist, "poster.css"), "utf8"),
  readFile(resolve(dist, "app.js"), "utf8"),
  readFile(resolve(dist, "upper.js"), "utf8"),
  readFile(resolve(dist, "data.js"), "utf8"),
  readFile(resolve(root, "ASSET_AND_DATA_REQUIREMENTS.md"), "utf8")
]);
for (const needle of ["#00206a", "hesitancy", "explore", "actor-rail", "survey-insight", "2026 数据进行中", "detail-dialog", "timeline-sample-note"]) {
  if (!html.toLowerCase().includes(needle.toLowerCase())) throw new Error(`Missing ${needle}`);
}
if ((html.match(/data-stage="/g) || []).length !== 7) throw new Error("Expected seven stage navigation buttons");
if ((data.match(/period:/g) || []).length !== 7) throw new Error("Expected seven stage data records");
if (html.includes("阶段报道样本</h3>") || html.includes("主图</a>") || html.includes("副图</a>")) throw new Error("Found the former split-page or standalone sample UI");
for (const value of ["88.3%", "79.9%", "6,193", "England and Wales", "103", "511", "72.8", "OR 4.24", "coverage-mmr1-5y"]) if (!`${html}${data}${requirements}${upperJs}${js}`.includes(value)) throw new Error(`Missing checked value ${value}`);
if (!js.includes("stage-media") || !upperJs.includes("poster-weave") || !upperJs.includes("case-death")) throw new Error("Missing integrated samples or checked data layers");
for (const name of ["poster-background", "poster-weave", "poster-actors", "poster-birth-cohorts", "poster-age-range"]) {
  const vector = await readFile(resolve(dist, "assets", `${name}.svg`), "utf8");
  const ids = new Set([...vector.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
  for (const match of vector.matchAll(/(?:href="#|url\(#)([^"\)]+)/g)) {
    if (!ids.has(match[1])) throw new Error(`${name}: missing SVG reference ${match[1]}`);
  }
}
if (html.includes('id="age-chart"') || html.includes("catchup-steps") || (html.match(/class="survey-row/g) || []).length !== 7) throw new Error("Unexpected age panel, remaining catch-up panel, or missing survey table");
if (!html.includes('id="media-board"') || !js.includes('renderMediaBoard')) throw new Error("Missing complete stage atlas or coded semicircles");
const codedTotals = mediaStages.reduce((totals,stage)=>{
  for(const key of Object.keys(stage.counts))totals[key]=(totals[key]||0)+stage.counts[key];
  if(stage.counts.support+stage.counts.neutral+stage.counts.opposition+stage.counts.pending!==stage.counts.total)throw new Error("Stance counts do not reconcile");
  return totals;
},{});
for(const [key,value] of Object.entries({total:103,support:53,neutral:36,opposition:0,pending:14,insufficient:45,research:44,investigation:26,possible:36,causal:0}))if(codedTotals[key]!==value)throw new Error(`Coding workbook mismatch: ${key}`);
const board=renderMediaBoard(stages,mediaStages);
if(contentSizes.reduce((a,b)=>a+b,0)!==103 || contentMetrics.length!==5)throw new Error("Content review sample totals or excluded metric mismatch");
for(const metric of contentMetrics)metric.counts.forEach((n,i)=>{if(contentSizes[i]===0?n!==null:!Number.isInteger(n)||n<0||n>contentSizes[i])throw new Error("Invalid stage content count");});
if(contentPercentage(8,14)!=="57.1%" || contentPercentage(17,26)!=="65.4%" || describeContentRow(6,0).percentage!=="14.3%")throw new Error("Incorrect ratio or no-sample representation");
if((mediaLines.ribbon.d.match(/C/g)||[]).length!==6 || mediaLines.guides.length!==7)throw new Error("Missing original ribbon curves or guide lines");
if(!posterCss.includes('.media-board{width:100%;max-width:none;margin:0;aspect-ratio:3210/2140}') || board.includes('disc-halo'))throw new Error("Media canvas must retain full width and original geometry");
if(html.includes("poster-media.svg") || board.includes("poster-media.svg") || js.includes("originalDiscBounds"))throw new Error("A complete poster must not be embedded in the media canvas");
if((board.match(/class="board-semicircle /g)||[]).length!==75 || discGeometry.length!==7)throw new Error("Expected seven independently rendered semicircle groups");
if((board.match(/class="reference-drop"/g)||[]).length!==140 || board.includes("board-survey") || board.includes('五项可重叠'))throw new Error("Missing original article marks or duplicated survey chart");
if((board.match(/class="board-document"/g)||[]).length!==23 || (board.match(/data-board-photo=/g)||[]).length!==6)throw new Error("Missing independent document or photo components");
if(/feishu|zv38|项目总表/i.test(html+js+board))throw new Error("Personal project links must not be exposed");
if(!upperJs.includes('renderCohortChart') || !board.includes('2016年，在采访') || !board.includes('mmr-what-they-didnt-tell-you.htm'))throw new Error("Missing coded cohort charts, original text or documentary link");
for(const match of board.matchAll(/href="\.\/assets\/([^"]+)"/g))await access(resolve(dist,"assets",match[1]));
if(describeMediaMetric(mediaStages[4],"insufficient").percentage!=="65.2%" || describeMediaMetric(mediaStages[5],"possible").denominator!==0)throw new Error("Incorrect content denominator or missing zero-parent handling");
if (!`${css}${posterCss}`.includes("prefers-reduced-motion")) throw new Error("Missing reduced motion support");
if (!js.includes("updateStageFromScroll") || !upperJs.includes("openPosterDetail")) throw new Error("Missing interactive scroll or detail behavior");
console.log("Validated the long-form interactive poster, seven stages, evidence details, data notes, and motion fallback.");
