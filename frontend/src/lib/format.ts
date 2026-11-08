import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function dataHora(iso: string | null | undefined) {
  return iso ? format(parseISO(iso), "dd/MM/yyyy HH:mm", { locale: ptBR }) : "—";
}

export function data(iso: string | null | undefined) {
  return iso ? format(parseISO(iso), "dd/MM/yyyy", { locale: ptBR }) : "—";
}

export function relativo(iso: string | null | undefined) {
  return iso ? formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true }) : "—";
}

export function dias(n: number | null | undefined) {
  if (n == null) return "—";
  return n === 1 ? "1 dia" : `${n} dias`;
}

export function vazioParaNull(v: string | null | undefined) {
  const s = v?.trim();
  return s ? s : null;
}
