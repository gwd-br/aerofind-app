<template>
  <div class="w-full p-4">
    <div class="mb-6">
      <NuxtLink to="/eventos" class="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
        <ArrowLeft class="w-4 h-4" />
        Voltar para eventos
      </NuxtLink>
      <h1 class="text-2xl font-semibold mt-2">Novo evento</h1>
      <p class="text-sm text-muted-foreground">Preencha os dados do evento.</p>
    </div>

    <form
      class="flex flex-col gap-6 max-w-2xl"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-col gap-2">
        <Label for="nome_evento">Nome do evento *</Label>
        <Input
          id="nome_evento"
          v-model.trim="form.nome_evento"
          :disabled="submitting"
          required
        />
        <p v-if="errors.nome_evento" class="text-red-500 text-sm">
          {{ errors.nome_evento }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="data_evento">Data do evento</Label>
        <Input
          id="data_evento"
          :model-value="form.data_evento ?? ''"
          type="date"
          :disabled="submitting"
          @update:model-value="form.data_evento = ($event as string) || null"
        />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="id_local">Local</Label>
        <Select
          v-model="idLocalSelectValue"
          :disabled="submitting"
        >
          <SelectTrigger id="id_local">
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
          <Label for="nome_venue">Nome do venue</Label>
          <Input
            id="nome_venue"
            :model-value="form.nome_venue ?? ''"
            :disabled="submitting"
            @update:model-value="form.nome_venue = (($event as string)?.trim()) || null"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="id_venue">ID do venue</Label>
          <Input
            id="id_venue"
            :model-value="form.id_venue ?? ''"
            :disabled="submitting"
            @update:model-value="form.id_venue = (($event as string)?.trim()) || null"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label for="nome_serie_evento">Nome da série</Label>
          <Input
            id="nome_serie_evento"
            :model-value="form.nome_serie_evento ?? ''"
            :disabled="submitting"
            @update:model-value="form.nome_serie_evento = (($event as string)?.trim()) || null"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="id_serie_evento">ID da série</Label>
          <Input
            id="id_serie_evento"
            :model-value="form.id_serie_evento ?? ''"
            :disabled="submitting"
            @update:model-value="form.id_serie_evento = (($event as string)?.trim()) || null"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="inventario">Inventário</Label>
        <Input
          id="inventario"
          :model-value="form.inventario ?? ''"
          :disabled="submitting"
          @update:model-value="form.inventario = (($event as string)?.trim()) || null"
        />
      </div>

      <div class="flex items-center gap-2">
        <Switch
          id="sync_active"
          :checked="form.sync_active"
          @update:checked="(v: boolean) => (form.sync_active = v)"
        />
        <Label for="sync_active">Sincronização ativa</Label>
      </div>

      <div class="flex gap-2">
        <Button type="submit" :disabled="submitting">
          {{ submitting ? "Salvando…" : "Criar evento" }}
        </Button>
        <NuxtLink to="/eventos">
          <Button type="button" variant="secondary" :disabled="submitting">
            Cancelar
          </Button>
        </NuxtLink>
      </div>
    </form>
  </div>
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
import { ArrowLeft } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { reactive, ref } from "vue";
import type { CreateEventoDTO } from "@/types/evento";
import { useEventoService } from "@/services/evento";
import { useLocalService } from "@/services/local";

useHead({ title: "Novo evento" });

definePageMeta({
  title: "Eventos",
  breadcrumb: "Novo evento",
});

const { create } = useEventoService();
const submitting = ref(false);

const form = reactive<CreateEventoDTO>({
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
const { data: locaisData } = await useAsyncData("locais-create", () =>
  listLocais({ per_page: 500 }),
);
const locais = computed(() => locaisData.value?.data ?? []);

const idLocalSelectValue = computed({
  get: () => (form.id_local != null ? String(form.id_local) : "__none__"),
  set: (v: string) => {
    form.id_local = v === "__none__" || v === "" ? null : Number(v);
  },
});

function validate(): boolean {
  errors.nome_evento = !form.nome_evento?.trim()
    ? "Informe o nome do evento."
    : undefined;
  return !errors.nome_evento;
}

async function handleSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    const evento = await create({
      ...form,
      nome_evento: form.nome_evento!,
      data_evento: form.data_evento || null,
      nome_venue: form.nome_venue || null,
      id_venue: form.id_venue || null,
      nome_serie_evento: form.nome_serie_evento || null,
      id_serie_evento: form.id_serie_evento || null,
      inventario: form.inventario || null,
      sync_active: form.sync_active ?? false,
      id_local: form.id_local ?? null,
    });
    toast.success("Evento criado com sucesso.");
    await navigateTo(`/eventos/${evento.id}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.";
    toast.error(msg);
    errors.nome_evento = msg;
  } finally {
    submitting.value = false;
  }
}
</script>
