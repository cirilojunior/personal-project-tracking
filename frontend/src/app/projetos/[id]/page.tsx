import { Suspense } from "react";

import { Carregando } from "@/components/estados";
import { ProjetoDetalhe } from "./projeto-detalhe";

export default function ProjetoPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <Carregando />
        </div>
      }
    >
      <ProjetoDetalhe />
    </Suspense>
  );
}
