import { ErrorView } from "@/components/ui/error-view";

export default function NotFound() {
  return (
    <ErrorView
      code="404"
      title="Page Not Found"
      message="The page you are looking for does not exist."
    />
  );
}
