import { ErrorView } from "@/components/cyberpunk/error-view";

export default function NotFound() {
  return (
    <ErrorView
      code="404"
      title="SIGNAL_LOST"
      message="TARGET_COORDINATES_INVALID // 目标坐标无效"
    />
  );
}
