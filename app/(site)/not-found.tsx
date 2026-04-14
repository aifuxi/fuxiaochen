import { ErrorView } from "@/components/ui/error-view";

export default function NotFound() {
  return (
    <ErrorView
      code="404"
      title="页面未找到"
      message="这个地址可能已经被移动，或者它从一开始就不在这里。"
    />
  );
}
