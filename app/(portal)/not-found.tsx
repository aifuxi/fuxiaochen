import { ErrorView } from "@/components/cyberpunk/error-view";

export default function NotFound() {
  return <ErrorView code="404" title="信号丢失" message="目标坐标无效" />;
}
