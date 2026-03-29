import { Suspense } from "react";
import CadastroVoluntarioClient from "./CadastroVoluntarioClient";

export default function CadastroVoluntarioPage() {
  return (
    <Suspense fallback={<div className="p-6">Carregando...</div>}>
      <CadastroVoluntarioClient />
    </Suspense>
  );
}