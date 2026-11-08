"use client";

import { KanbanBoard } from "@/components/delivery/kanban-board";
import { PageHeader } from "@/components/page-header";

export default function BoardPage() {
  return (
    <>
      <PageHeader
        titulo="Board de Delivery"
        descricao="Todos os itens de trabalho, de todos os projetos. Para criar itens, abra o projeto."
      />
      <div className="min-w-0 p-4 md:p-6">
        <KanbanBoard />
      </div>
    </>
  );
}
