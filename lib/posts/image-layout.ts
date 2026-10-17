import { z } from "zod";

// 使用原图的相对坐标保存无损裁剪；不重传原文件，也不信任任意 CSS 或像素坐标。
export const imageCropSchema = z
  .strictObject({
    left: z.number().min(0).max(1),
    top: z.number().min(0).max(1),
    width: z.number().min(0.01).max(1),
    height: z.number().min(0.01).max(1),
  })
  .refine((crop) => crop.left + crop.width <= 1.000001 && crop.top + crop.height <= 1.000001);

export type ImageCrop = z.infer<typeof imageCropSchema>;
export const fullImageCrop: ImageCrop = { left: 0, top: 0, width: 1, height: 1 };
export const IMAGE_ACTION_META = "article-image-action";
export const IMAGE_UI_META = "article-image-ui";

export function imageCrop(value: unknown): ImageCrop | null {
  const parsed = imageCropSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function boundedImageSize(width: number, height: number) {
  const scale = Math.min(1, 10_000 / width, 10_000 / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function croppedImageStyle(crop: ImageCrop | null) {
  return crop
    ? {
        width: `${100 / crop.width}%`,
        height: `${100 / crop.height}%`,
        left: `${(-100 * crop.left) / crop.width}%`,
        top: `${(-100 * crop.top) / crop.height}%`,
      }
    : { width: "100%", height: "100%", left: "0", top: "0" };
}
