/** Evento conforme retornado pela API (schema Evento) */
export type Evento = {
  id: number;
  nome_evento: string;
  data_evento: string;
  nome_serie_evento?: string | null;
  nome_venue?: string | null;
  sync_active: boolean;
  id_venue?: string | null;
  id_serie_evento?: string | null;
  inventario?: string | null;
  id_local?: number | null;
};

export type UpdateEventoDTO = {
  nome_evento?: string;
  data_evento?: string | null;
  nome_venue?: string | null;
  id_venue?: string | null;
  nome_serie_evento?: string | null;
  id_serie_evento?: string | null;
  inventario?: string | null;
  sync_active?: boolean;
  id_local?: number | null;
};

export type CreateEventoDTO = {
  nome_evento: string;
  data_evento?: string | null;
  nome_venue?: string | null;
  id_venue?: string | null;
  nome_serie_evento?: string | null;
  id_serie_evento?: string | null;
  inventario?: string | null;
  sync_active?: boolean;
  id_local?: number | null;
};
