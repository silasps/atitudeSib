import {
  parseNecessidadeRichContent,
  type NecessidadeRichContent,
} from "@/lib/voluntariado-necessidade-content";

export type NecessidadePublicaRecord = {
  id: number;
  titulo_publico: string;
  descricao: string | null;
  quantidade_total: number;
  quantidade_aprovada: number;
  data_limite_inscricao_em: string | null;
  status: string;
  exibir_publicamente: boolean;
};

export type NecessidadePublicaView = NecessidadePublicaRecord & {
  vagasRestantes: number;
  content: NecessidadeRichContent;
};

export function getVagasRestantes(item: {
  quantidade_total: number;
  quantidade_aprovada: number;
}) {
  return Math.max(
    Number(item.quantidade_total ?? 0) - Number(item.quantidade_aprovada ?? 0),
    0
  );
}

export function isNecessidadePublicamenteDisponivel(
  item: NecessidadePublicaRecord,
  now = new Date()
) {
  const vagasRestantes = getVagasRestantes(item);
  const dentroDoPrazo =
    !item.data_limite_inscricao_em ||
    new Date(item.data_limite_inscricao_em) > now;

  return (
    item.status === "aberta" &&
    item.exibir_publicamente === true &&
    vagasRestantes > 0 &&
    dentroDoPrazo
  );
}

export function toNecessidadePublicaView(
  item: NecessidadePublicaRecord
): NecessidadePublicaView {
  return {
    ...item,
    vagasRestantes: getVagasRestantes(item),
    content: parseNecessidadeRichContent(item.descricao),
  };
}

