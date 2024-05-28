import { NODE_ENV } from "@/config";

export const isProduction = () => NODE_ENV === "production";

export const isDevelopment = () => NODE_ENV === "development";
