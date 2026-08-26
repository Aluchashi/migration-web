import { register } from "@/app/actions/auth";
import { AuthForm } from "@/components/Page2-Authpage/auth-form";

export default function RegisterPage() {
  return <AuthForm action={register} mode="register" />;
}
