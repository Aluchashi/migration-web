import { register } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
      <AuthForm action={register} mode="register" />
    </main>
  );
}
