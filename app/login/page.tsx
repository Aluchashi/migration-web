import { login } from "@/app/actions/auth";
import { AuthForm } from "@/components/Page2-Authpage/auth-form";

export default function LoginPage() {
  return <AuthForm action={login} mode="login" />;
}
