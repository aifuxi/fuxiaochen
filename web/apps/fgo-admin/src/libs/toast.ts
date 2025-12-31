import { Toast } from "@douyinfe/semi-ui-19";

type ToastOpts =
  | string
  | Omit<React.ComponentProps<typeof Toast.create>, "type">;

export function showSuccessToast(opts: ToastOpts) {
  Toast.success(opts);
}

export function showInfoToast(opts: ToastOpts) {
  Toast.info(opts);
}

export function showErrorToast(opts: ToastOpts) {
  Toast.error(opts);
}

export function showWarningToast(opts: ToastOpts) {
  Toast.warning(opts);
}
