// app/services/portador.ts

import type { ApiOpts } from "@/shared/http";
import type { Portador } from "@/types/ingresso";

export type SavePortadorForIngressoDTO = {
  nome: string;
  cpf?: string | null;
};

export const usePortadorService = () => {
  const { $api } = useNuxtApp();

  /**
   * Cria ou atualiza o portador vinculado a um ingresso.
   * A rota segue o padrão já utilizado em outras partes do sistema.
   */
  const saveForIngresso = async (
    ingressoId: number | string,
    payload: SavePortadorForIngressoDTO,
    opts?: ApiOpts,
  ): Promise<Portador> => {
    return $api<Portador>(`ingressos/${ingressoId}/portadores`, {
      method: "POST",
      body: payload,
      ...opts,
    });
  };

  return {
    saveForIngresso,
  };
};

