<template>
  <Card>
    <CardHeader
      class="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 border-b pb-6"
    >
      <div class="space-y-1.5">
        <CardTitle>Informações do evento</CardTitle>
        <CardDescription>
          Dados gerais do evento. Altere e salve quando necessário.
        </CardDescription>
      </div>
    </CardHeader>

    <CardContent class="pt-6">
      <form
        class="flex flex-col gap-6 max-w-2xl"
        @submit.prevent="handleSubmit"
      >
        <div class="flex flex-col gap-2">
          <Label for="info-nome_evento">Nome do evento *</Label>
          <Input
            id="info-nome_evento"
            v-model.trim="form.nome_evento"
            :disabled="submitting || disabled"
            required
          />
          <p v-if="errors.nome_evento" class="text-red-500 text-sm">
            {{ errors.nome_evento }}
          </p>
        </div>

        <div class="flex flex-col gap-2">
          <Label for="info-data_evento">Data do evento</Label>
          <Input
            id="info-data_evento"
            v-model="form.data_evento"
            type="date"
            :disabled="submitting || disabled"
          />
        </div>

        <div class="flex flex-col gap-2">
          <Label for="info-id_local">Local</Label>
          <Select
            v-model="idLocalSelectValue"
            :disabled="submitting || disabled"
          >
            <SelectTrigger id="info-id_local">
              <SelectValue placeholder="Selecione o local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Nenhum</SelectItem>
              <SelectItem
                v-for="loc in locais"
                :key="loc.id"
                :value="String(loc.id)"
              >
                {{ loc.nome }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <Label for="info-nome_venue">Nome do venue</Label>
            <Input
              id="info-nome_venue"
              v-model.trim="form.nome_venue"
              :disabled="submitting || disabled"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="info-id_venue">ID do venue</Label>
            <Input
              id="info-id_venue"
              v-model.trim="form.id_venue"
              :disabled="submitting || disabled"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div class="flex flex-col gap-2">
            <Label for="info-nome_serie_evento">Nome da série</Label>
            <Input
              id="info-nome_serie_evento"
              v-model.trim="form.nome_serie_evento"
              :disabled="submitting || disabled"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="info-id_serie_evento">ID da série</Label>
            <Input
              id="info-id_serie_evento"
              v-model.trim="form.id_serie_evento"
              :disabled="submitting || disabled"
            />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <Label for="info-inventario">Inventário</Label>
          <Input
            id="info-inventario"
            v-model.trim="form.inventario"
            :disabled="submitting || disabled"
          />
        </div>

        <div class="flex items-center gap-2">
          <Switch
            id="info-sync_active"
            :checked="form.sync_active"
            @update:checked="(v: boolean) => (form.sync_active = v)"
          />
          <Label for="info-sync_active">Sincronização ativa</Label>
        </div>

        <CardFooter class="flex gap-2 border-t pt-6">
          <Button type="submit" :disabled="isDisabled">
            {{ submitting ? "Salvando…" : "Salvar alterações" }}
          </Button>
          <Button
            type="button"
            variant="secondary"
            :disabled="submitting || disabled"
            @click="resetForm"
          >
            Reverter
          </Button>
        </CardFooter>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "vue-sonner";
import { reactive, ref, computed, watchEffect } from "vue";
import type { Evento, UpdateEventoDTO } from "@/types/evento";
import { useEventoService } from "@/services/evento";
import { useLocalService } from "@/services/local";

const props = withDefaults(
  defineProps<{
    evento: Evento | null;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  (e: "saved"): void;
}>();

const { update } = useEventoService();
const submitting = ref(false);

const form = reactive<UpdateEventoDTO & { id_local?: number | null }>({
  nome_evento: "",
  data_evento: null,
  nome_venue: null,
  id_venue: null,
  nome_serie_evento: null,
  id_serie_evento: null,
  inventario: null,
  sync_active: false,
  id_local: null,
});

const errors = reactive<{ nome_evento?: string }>({});

const { list: listLocais } = useLocalService();
const { data: locaisData } = await useAsyncData("locais", () =>
  listLocais({ per_page: 500 }),
);
const locais = computed(() => locaisData.value?.data ?? []);

const idLocalSelectValue = computed({
  get: () => (form.id_local != null ? String(form.id_local) : "__none__"),
  set: (v: string) => {
    form.id_local = v === "__none__" || v === "" ? null : Number(v);
  },
});

watchEffect(() => {
  if (props.evento) {
    form.nome_evento = props.evento.nome_evento ?? "";
    form.data_evento = props.evento.data_evento
      ? String(props.evento.data_evento).slice(0, 10)
      : null;
    form.nome_venue = props.evento.nome_venue ?? null;
    form.id_venue = props.evento.id_venue ?? null;
    form.nome_serie_evento = props.evento.nome_serie_evento ?? null;
    form.id_serie_evento = props.evento.id_serie_evento ?? null;
    form.inventario = props.evento.inventario ?? null;
    form.sync_active = props.evento.sync_active ?? false;
    form.id_local = props.evento.id_local ?? null;
  }
});

const isDisabled = computed(
  () =>
    submitting.value ||
    props.disabled ||
    !props.evento ||
    !(form.nome_evento ?? "").trim(),
);

function validate(): boolean {
  errors.nome_evento = !form.nome_evento?.trim()
    ? "Informe o nome do evento."
    : undefined;
  return !errors.nome_evento;
}

function resetForm() {
  if (!props.evento) return;
  form.nome_evento = props.evento.nome_evento ?? "";
  form.data_evento = props.evento.data_evento
    ? String(props.evento.data_evento).slice(0, 10)
    : null;
  form.nome_venue = props.evento.nome_venue ?? null;
  form.id_venue = props.evento.id_venue ?? null;
  form.nome_serie_evento = props.evento.nome_serie_evento ?? null;
  form.id_serie_evento = props.evento.id_serie_evento ?? null;
  form.inventario = props.evento.inventario ?? null;
  form.sync_active = props.evento.sync_active ?? false;
  form.id_local = props.evento.id_local ?? null;
  errors.nome_evento = undefined;
}

async function handleSubmit() {
  if (!validate() || !props.evento) return;
  submitting.value = true;
  try {
    await update(props.evento.id, {
      nome_evento: form.nome_evento,
      data_evento: form.data_evento || null,
      nome_venue: form.nome_venue || null,
      id_venue: form.id_venue || null,
      nome_serie_evento: form.nome_serie_evento || null,
      id_serie_evento: form.id_serie_evento || null,
      inventario: form.inventario || null,
      sync_active: form.sync_active ?? false,
      id_local: form.id_local ?? null,
    });
    toast.success("Evento atualizado com sucesso.");
    emit("saved");
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.";
    toast.error(msg);
    errors.nome_evento = msg;
  } finally {
    submitting.value = false;
  }
}
</script>
