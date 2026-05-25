import LoginForm from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight text-zinc-900">Welcome back</h1>
      <p className="mb-8 text-sm text-zinc-600">Sign in to access your dashboard.</p>
      <LoginForm />
    </main>
  );
}