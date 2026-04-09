import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 p-6">
          <div className="text-sm text-zinc-500">Carregando...</div>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
