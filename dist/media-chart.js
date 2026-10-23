export const mediaMetrics = {
  total: { label: "报道总量", level: "total" },
  support: { label: "支持", level: "stance" },
  neutral: { label: "中立", level: "stance" },
  opposition: { label: "因果表述（表中误导方）", level: "stance" },
  insufficient: { label: "明确说明证据不足", level: "content", parent: "support" },
  research: { label: "引用研究或专家意见否定关联", level: "content", parent: "support" },
  investigation: { label: "报道伦理、利益或监管调查", level: "content", parent: "neutral" },
  possible: { label: "提及 MMR—自闭症可能关联", level: "content", parent: "neutral" },
  causal: { label: "将可能关联写成因果关系", level: "content", parent: "opposition" },
  pending: { label: "待核验", level: "stance" }
};

export function describeMediaMetric(stage, key) {
  const metric = mediaMetrics[key], count = stage.counts[key];
  const denominator = metric.level === "content" ? stage.counts[metric.parent] : stage.counts.total;
  const base = metric.level === "content" ? `${mediaMetrics[metric.parent].label} ${denominator} 篇` : `阶段全部样本 ${denominator} 篇`;
  const percentage = denominator ? `${(count/denominator*100).toFixed(1)}%` : "不适用（所属立场 0 篇）";
  return { count, denominator, base, percentage, label: metric.label };
}
