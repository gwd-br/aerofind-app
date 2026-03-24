<template>
  <form class="flex flex-col gap-6 max-w-2xl" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-2">
      <Label for="local-info-nome">Nome *</Label>
      <Input
        id="local-info-nome"
        v-model.trim="form.nome"
        :disabled="submitting || disabled"
        required
      />
      <p v-if="errors.nome" class="text-red-500 text-sm">{{ errors.nome }}</p>
    </div>

    <div class="flex flex-col gap-2">
      <Label for="local-info-descricao">Descrição</Label>
      <Input
        id="local-info-descricao"
        v-model.trim="form.descricao"
        :disabled="submitting || disabled"
      />
    </div>

    <div class="flex flex-col gap-2">
      <Label for="local-info-logradouro">Logradouro</Label>
      <Input
        id="local-info-logradouro"
        v-model.trim="form.logradouro"
        :disabled="submitting || disabled"
      />
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div class="flex flex-col gap-2">
        <Label for="local-info-numero">Número</Label>
        <Input
          id="local-info-numero"
          v-model.trim="form.numero"
          :disabled="submitting || disabled"
        />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="local-info-complemento">Complemento</Label>
        <Input
          id="local-info-complemento"
          v-model.trim="form.complemento"
          :disabled="submitting || disabled"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <Label for="local-info-bairro">Bairro</Label>
      <Input
        id="local-info-bairro"
        v-model.trim="form.bairro"
        :disabled="submitting || disabled"
      />
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div class="flex flex-col gap-2">
        <Label for="local-info-cidade">Cidade</Label>
        <Input
          id="local-info-cidade"
          v-model.trim="form.cidade"
          :disabled="submitting || disabled"
        />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="local-info-estado">Estado (UF)</Label>
        <Input
          id="local-info-estado"
          v-model.trim="form.estado"
          maxlength="2"
          placeholder="Ex: SP"
          :disabled="submitting || disabled"
        />
      </div>
    </div>

    <div class="flex flex-col gap-2">
      <Label for="local-info-cep">CEP</Label>
      <Input
        id="local-info-cep"
        v-model.trim="form.cep"
        placeholder="00000-000"
        :disabled="submitting || disabled"
      />
    </div>

    <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div class="flex flex-col gap-2">
        <Label for="local-info-latitude">Latitude</Label>
        <Input
          id="local-info-latitude"
          v-model.trim="latitudeInput"
          type="text"
          inputmode="decimal"
          :disabled="submitting || disabled"
        />
      </div>
      <div class="flex flex-col gap-2">
        <Label for="local-info-longitude">Longitude</Label>
        <Input
          id="local-info-longitude"
          v-model.trim="longitudeInput"
          type="text"
          inputmode="decimal"
          :disabled="submitting || disabled"
        />
      </div>
    </div>

    <div class="flex gap-2">
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
    </div>
  </form>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "vue-sonner";
import { reactive, ref, computed, watchEffect } from "vue";
import type { Local, UpdateLocalDTO } from "@/types/local";
import { useLocalService } from "@/services/local";

const props = withDefaults(
  defineProps<{
    local: Local | null;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{
  (e: "saved"): void;
}>();

const { update } = useLocalService();
const submitting = ref(false);
const latitudeInput = ref("");
const longitudeInput = ref("");

const form = reactive<UpdateLocalDTO>({
  nome: "",
  descricao: null,
  logradouro: null,
  numero: null,
  complemento: null,
  bairro: null,
  cidade: null,
  estado: null,
  cep: null,
  latitude: null,
  longitude: null,
});

const errors = reactive<{ nome?: string }>({});

function parseDecimal(s: string): number | null {
  const n = Number(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

watchEffect(() => {
  if (props.local) {
    form.nome = props.local.nome ?? "";
    form.descricao = props.local.descricao ?? null;
    form.logradouro = props.local.logradouro ?? null;
    form.numero = props.local.numero ?? null;
    form.complemento = props.local.complemento ?? null;
    form.bairro = props.local.bairro ?? null;
    form.cidade = props.local.cidade ?? null;
    form.estado = props.local.estado ?? null;
    form.cep = props.local.cep ?? null;
    form.latitude = props.local.latitude ?? null;
    form.longitude = props.local.longitude ?? null;
    latitudeInput.value = props.local.latitude != null ? String(props.local.latitude) : "";
    longitudeInput.value = props.local.longitude != null ? String(props.local.longitude) : "";
  }
});

const isDisabled = computed(
  () =>
    submitting.value ||
    props.disabled ||
    !props.local ||
    !(form.nome ?? "").trim(),
);

function validate(): boolean {
  errors.nome = !form.nome?.trim() ? "Informe o nome do local." : undefined;
  return !errors.nome;
}

function resetForm() {
  if (!props.local) return;
  form.nome = props.local.nome ?? "";
  form.descricao = props.local.descricao ?? null;
  form.logradouro = props.local.logradouro ?? null;
  form.numero = props.local.numero ?? null;
  form.complemento = props.local.complemento ?? null;
  form.bairro = props.local.bairro ?? null;
  form.cidade = props.local.cidade ?? null;
  form.estado = props.local.estado ?? null;
  form.cep = props.local.cep ?? null;
  form.latitude = props.local.latitude ?? null;
  form.longitude = props.local.longitude ?? null;
  latitudeInput.value = props.local.latitude != null ? String(props.local.latitude) : "";
  longitudeInput.value = props.local.longitude != null ? String(props.local.longitude) : "";
  errors.nome = undefined;
}

async function handleSubmit() {
  if (!validate() || !props.local) return;
  submitting.value = true;
  try {
    await update(props.local.id, {
      nome: form.nome,
      descricao: form.descricao || null,
      logradouro: form.logradouro || null,
      numero: form.numero || null,
      complemento: form.complemento || null,
      bairro: form.bairro || null,
      cidade: form.cidade || null,
      estado: form.estado || null,
      cep: form.cep || null,
      latitude: parseDecimal(latitudeInput.value) ?? null,
      longitude: parseDecimal(longitudeInput.value) ?? null,
    });
    toast.success("Local atualizado com sucesso.");
    emit("saved");
  } catch (e) {
    const msg =
      e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.";
    toast.error(msg);
    errors.nome = msg;
  } finally {
    submitting.value = false;
  }
}
</script>
