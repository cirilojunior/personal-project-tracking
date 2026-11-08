"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";

/** Dialog com formulário: título, campos e rodapé com Cancelar/Salvar. */
export function FormDialog({
  aberto,
  onAberto,
  gatilho,
  titulo,
  descricao,
  onSubmit,
  salvando,
  children,
  largura = "sm:max-w-lg",
}: {
  aberto: boolean;
  onAberto: (v: boolean) => void;
  gatilho?: React.ReactNode;
  titulo: string;
  descricao?: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  salvando?: boolean;
  children: React.ReactNode;
  largura?: string;
}) {
  return (
    <Dialog open={aberto} onOpenChange={onAberto}>
      {gatilho && <DialogTrigger asChild>{gatilho}</DialogTrigger>}
      <DialogContent className={largura}>
        <form onSubmit={onSubmit} noValidate className="flex max-h-[85vh] flex-col gap-4">
          <DialogHeader>
            <DialogTitle>{titulo}</DialogTitle>
            {descricao && <DialogDescription>{descricao}</DialogDescription>}
          </DialogHeader>
          <FieldGroup className="overflow-y-auto px-0.5 py-1">{children}</FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onAberto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={salvando}>
              {salvando ? "Salvando…" : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
