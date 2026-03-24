<template>
  <div class="w-full p-4">
    <div class="mb-6">
      <NuxtLink
        to="/locais"
        class="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
      >
        <ArrowLeft class="w-4 h-4" />
        Voltar para locais
      </NuxtLink>
      <h1 class="text-2xl font-semibold mt-2">Novo local</h1>
      <p class="text-sm text-muted-foreground">Preencha os dados do local.</p>
    </div>

    <form class="flex flex-col gap-6 max-w-2xl" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-2">
        <Label for="nome">Nome *</Label>
        <Input
          id="nome"
          v-model.trim="form.nome"
          :disabled="submitting"
          required
        />
        <p v-if="errors.nome" class="text-red-500 text-sm">{{ errors.nome }}</p>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="descricao">Descrição</Label>
        <Input
          id="descricao"
          v-model.trim="form.descricao"
          :disabled="submitting"
        />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="logradouro">Logradouro</Label>
        <Input
          id="logradouro"
          v-model.trim="form.logradouro"
          :disabled="submitting"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label for="numero">Número</Label>
          <Input
            id="numero"
            v-model.trim="form.numero"
            :disabled="submitting"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="complemento">Complemento</Label>
          <Input
            id="complemento"
            v-model.trim="form.complemento"
            :disabled="submitting"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="bairro">Bairro</Label>
        <Input
          id="bairro"
          v-model.trim="form.bairro"
          :disabled="submitting"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label for="cidade">Cidade</Label>
          <Input
            id="cidade"
            v-model.trim="form.cidade"
            :disabled="submitting"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="estado">Estado (UF)</Label>
          <Input
            id="estado"
            v-model.trim="form.estado"
            maxlength="2"
            placeholder="Ex: SP"
            :disabled="submitting"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="cep">CEP</Label>
        <Input
          id="cep"
          v-model.trim="form.cep"
          placeholder="00000-000"
          :disabled="submitting"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label for="latitude">Latitude</Label>
          <Input
            id="latitude"
            v-model.trim="latitudeInput"
            type="text"
            inputmode="decimal"
            placeholder="Ex: -23.550520"
            :disabled="submitting"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="longitude">Longitude</Label>
          <Input
            id="longitude"
            v-model.trim="longitudeInput"
            type="text"
            inputmode="decimal"
            placeholder="Ex: -46.633308"
            :disabled="submitting"
          />
        </div>
      </div>

      <div class="flex gap-2">
        <Button type="submit" :disabled="submitting">
          {{ submitting ? "Salvando…" : "Criar local" }}
        </Button>
        <NuxtLink to="/locais">
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
import { ArrowLeft } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { reactive, ref } from "vue";
import type { CreateLocalDTO } from "@/types/local";
import { useLocalService } from "@/services/local";

useHead({ title: "Novo local" });

definePageMeta({
  title: "Locais",
  breadcrumb: "Novo local",
});

const { create } = useLocalService();
const submitting = ref(false);

const form = reactive<CreateLocalDTO>({
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

const latitudeInput = ref("");
const longitudeInput = ref("");
const errors = reactive<{ nome?: string }>({});

function parseDecimal(s: string): number | null {
  const n = Number(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function validate(): boolean {
  errors.nome = !form.nome?.trim() ? "Informe o nome do local." : undefined;
  return !errors.nome;
}

async function handleSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    const payload: CreateLocalDTO = {
      nome: form.nome!,
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
    };
    const local = await create(payload);
    toast.success("Local criado com sucesso.");
    await navigateTo(`/locais/${local.id}`);
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
