/** Setor conforme schema Laravel (tabela setores) */
export type Setor = {
  id: number;
  eventos_fk: number;
  nome_setor: string;
  categoria: string | null;
  area: string | null;
  entrada: string | null;
  inventario: string | null;
  facial: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CreateSetorDTO = {
  eventos_fk: number;
  nome_setor: string;
  categoria?: string | null;
  area?: string | null;
  entrada?: string | null;
  inventario?: string | null;
  facial?: boolean;
};

export type UpdateSetorDTO = Partial<Omit<CreateSetorDTO, "eventos_fk">>;
