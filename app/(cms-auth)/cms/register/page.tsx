import { RegisterForm } from "@/components/features/cms/auth/register-form";
import { AuthShell } from "@/components/layouts/auth-shell";

export default function CmsRegisterPage() {
  return (
    <AuthShell
      description="Registration is scaffolded separately so auth flows stay isolated from dashboard layout concerns."
      title="Create Account"
    >
      <RegisterForm />
    </AuthShell>
  );
}
