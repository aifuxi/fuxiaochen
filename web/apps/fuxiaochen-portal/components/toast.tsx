"use client";

import { toast } from "sonner";

import { Toaster } from "@/components/ui/sonner";

export const showSuccessToast = toast.success;

export const showInfoToast = toast.info;
export const showWarningToast = toast.warning;
export const showErrorToast = toast.error;
export const showLoadingToast = toast.loading;

export const hideToast = toast.dismiss;

export const ToasterComponent = Toaster;
