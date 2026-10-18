// 飞书预览以视口的 90% 适配图片，工具栏悬浮在画布上，不挤占图片布局。
export function previewFitScale(
  width: number,
  height: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  if (!width || !height || !viewportWidth || !viewportHeight) return 1;
  return Math.max(
    0.01,
    Math.min(1, (viewportWidth * 0.9) / width, (viewportHeight * 0.9) / height),
  );
}

export function previewZoomScale(scale: number) {
  // 用整数百分比消除连续加减的浮点误差，保证 100% 切换与边界状态稳定。
  return Math.max(0.1, Math.min(5, Math.round(scale * 100) / 100));
}
