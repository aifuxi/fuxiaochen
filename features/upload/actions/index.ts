"use server";

import imageType, { minimumBytes } from "image-type";
import fs from "node:fs";
import path from "node:path";
import { readChunk } from "read-chunk";
import sharp from "sharp";

import { isProduction } from "@/utils/env";

import { ERROR_MESSAGE_MAP } from "@/constants";
import { noAdminPermission } from "@/features/user";
import { aliOSS } from "@/lib/ali-oss";
import { createResp } from "@/lib/common";
import { createCuid } from "@/lib/cuid";

const UPLOAD_DIR = "uploads";
const PUBLIC_DIR = "public";

const getFilePath = (input: string) => {
  return path.join(process.cwd(), PUBLIC_DIR, input);
};

const saveFile = async (file: File) => {
  const fileArrayBuffer = await file.arrayBuffer();
  const fileExtension = path.extname(file.name);
  const fileNameWithouExtension = file.name.replace(fileExtension, "");
  const baseURL = `/${UPLOAD_DIR}/${fileNameWithouExtension}-${createCuid()}${fileExtension}`;
  const filePath = getFilePath(baseURL);

  fs.writeFileSync(filePath, Buffer.from(fileArrayBuffer));

  return baseURL;
};

const deleteFile = async (input: string) => {
  const filePath = getFilePath(input);

  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (error) => {
      if (error) {
        reject(error.message);
      }
      resolve("");
    });
  });
};

const getImageInfo = async (filePath: string) => {
  const buffer = await readChunk(filePath, { length: minimumBytes });

  const typeInfo = await imageType(buffer);

  return {
    info: typeInfo,
    isImage: Boolean(typeInfo),
    isGif: typeInfo ? typeInfo.ext === "gif" : false,
    isWebp: typeInfo ? typeInfo.ext === "webp" : false,
  };
};

// 如果不是图片，原样返回，是图片返回压缩后的图片路径
const compressImage = async (input: string): Promise<string> => {
  const inputFilePath = getFilePath(input);
  const { isGif, isImage, isWebp } = await getImageInfo(inputFilePath);

  if (!isImage || isWebp) {
    return input;
  }
  let animated = false;
  if (isGif) {
    animated = true;
  }

  const fileName = path.basename(inputFilePath);
  const fileExtension = path.extname(fileName);
  const fileNameWithoutExtension = fileName.replace(fileExtension, "");

  const newFileName = `${fileNameWithoutExtension}.webp`;
  const output = `/${UPLOAD_DIR}/${newFileName}`;
  const outputFilePath = getFilePath(output);

  return new Promise((resolve, reject) => {
    // 加载图片
    sharp(inputFilePath, { animated, limitInputPixels: false })
      .webp({ lossless: true })
      .toFile(outputFilePath, (error) => {
        if (error) {
          // TODO: 记录日志
          reject(error.message);
        } else {
          resolve(output);
        }
      });
  });
};

const uploadToOSS = async (input: string) => {
  const inputFilePath = getFilePath(input);
  const fileName = path.basename(inputFilePath);
  const buffer = fs.readFileSync(inputFilePath);
  const { name } = await aliOSS.put(
    `${process.env.OSS_UPLOAD_DIR}/${fileName}`,
    Buffer.from(buffer),
  );
  let url = aliOSS.generateObjectUrl(name);
  if (url) {
    // 阿里云 OSS 上传后返回的链接是默认是http协议的（但实际上它是也支持https），这里手动替换成https
    // 因为线上环境网站是使用https协议的，网站里面所有的链接/请求都应该走https（最佳实践是这样）
    // 要不然浏览器搜索栏会有个小感叹号，不太好看
    url = url.replace(/http:\/\//g, "https://");
  }
  return url;
};

export const uploadFile = async (
  formData: FormData,
): Promise<{ error?: string; url?: string }> => {
  if (await noAdminPermission()) {
    return createResp({ error: ERROR_MESSAGE_MAP.noPermission });
  }
  // Get file from formData
  const file = formData.get("file") as File;

  let url = await saveFile(file);
  const localFileUrl = url;
  url = await compressImage(url);

  if (isProduction()) {
    const ossURL = await uploadToOSS(url);
    // 删除本地的压缩过后的图片文件
    const result = await deleteFile(url);
    if (result) {
      // TODO: 记录日志, 删除文件失败
    }
    return { url: ossURL };
  }

  // 如果是图片且已经被压缩过
  if (localFileUrl !== url) {
    // 删除旧的图片文件
    const result = await deleteFile(localFileUrl);
    if (result) {
      // TODO: 记录日志, 删除文件失败
    }
  }

  return { url };
};
