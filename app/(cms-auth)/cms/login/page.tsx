import { LoginForm } from "@/components/features/cms/auth/login-form";
import { AuthShell } from "@/components/layouts/auth-shell";

export default function CmsLoginPage() {
  return (
    <AuthShell
      description="Authentication pages now have their own route group and shell instead of sharing the CMS chrome."
      title="Sign In"
    >
      <LoginForm />
    </AuthShell>
  );
}
