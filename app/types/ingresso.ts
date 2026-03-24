/** Ingresso conforme retornado pela API (tabela ingressos) */
export type Ingresso = {
  id: number;
  evaXML_row_id?: string | null;
  num_pedido?: string | null;
  control_sync?: string | null;
  barcode?: string | null;
  tipo_ingresso?: string | null;
  tipo_entrega?: string | null;
  tipo_venda?: string | null;
  status?: string | null;
  razao_status?: string | null;
  dt_status?: string | null;
  cat_name?: string | null;
  entry_text?: string | null;
  area_text?: string | null;
  tipo_preco?: string | null;
  dt_compra?: string | null;
  dt_venda?: string | null;
  setores_fk?: number | null;
  cliente_fk?: number | null;
  portador_fk?: number | null;
  evento_fk?: number | null;
  enviado_acesso?: boolean;
  url_onboarding?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  portador?: Portador;
};
export type Portador = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cpf: string;
  face_url: string;
};

export type CreateIngressoDTO = {
  evaXML_row_id?: string | null;
  num_pedido?: string | null;
  control_sync?: string | null;
  barcode?: string | null;
  tipo_ingresso?: string | null;
  tipo_entrega?: string | null;
  tipo_venda?: string | null;
  status?: string | null;
  razao_status?: string | null;
  dt_status?: string | null;
  cat_name?: string | null;
  entry_text?: string | null;
  area_text?: string | null;
  tipo_preco?: string | null;
  dt_compra?: string | null;
  dt_venda?: string | null;
  setores_fk?: number | null;
  cliente_fk?: number | null;
  portador_fk?: number | null;
  evento_fk?: number | null;
  enviado_acesso?: boolean;
  url_onboarding?: string | null;
};

export type UpdateIngressoDTO = Partial<CreateIngressoDTO>;
