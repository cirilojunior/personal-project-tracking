import { Suspense } from "react";

import { Carregando } from "@/components/estados";
import { ClienteDetalhe } from "./cliente-detalhe";

export default function ClientePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Carregando />
        </div>
      }
    >
      <ClienteDetalhe />
    </Suspense>
  );
}
