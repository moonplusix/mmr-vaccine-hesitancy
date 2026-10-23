// Stage-level content coding supplied for the 103-article corpus.
export const contentPeriods=['1998—2000','2001—2003','2004—2009','2010—2011','2012—2014','2015—2019','2020—2022','2023—2026'];
export const contentSizes=[5,14,22,24,26,5,0,7];
export const contentMetrics=[
  {label:'提及 MMR—自闭症可能关联',counts:[5,8,22,21,10,3,null,1]},
  {label:'将可能关联写成因果相关',counts:[3,12,16,21,17,4,null,3]},
  {label:'明确说明证据不足',counts:[5,14,22,22,25,5,null,3]},
  {label:'引用研究或专家否定关联',counts:[2,7,12,16,13,4,null,4]},
  {label:'涉及伦理、利益或监管调查',counts:[1,2,18,20,10,1,null,1]}
];
export function contentPercentage(count,n){return n?`${Number((count/n*100).toFixed(1))}%`:'无样本';}
export function describeContentRow(stageIndex,metricIndex){
  const column=stageIndex===6?7:stageIndex,n=contentSizes[column],metric=contentMetrics[metricIndex],count=metric.counts[column];
  return {period:contentPeriods[column],label:metric.label,count,n,percentage:contentPercentage(count,n)};
}
