<template>
  <div class="w-full p-4">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold mt-2">Editar ingresso</h1>
        <p class="text-sm text-muted-foreground">Altere os dados do ingresso.</p>
      </div>
      <NuxtLink
        to="/ingressos"
        class="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
      >
        <ArrowLeft class="w-4 h-4" />
        Voltar para ingressos
      </NuxtLink>
    </div>

    <div v-if="pending" class="py-4">Carregando...</div>
    <Alert v-else-if="error" variant="destructive">
      <AlertCircle class="w-4 h-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        Ingresso não encontrado ou erro ao carregar.
      </AlertDescription>
    </Alert>
    <form
      v-else-if="ingresso"
      class="flex flex-col gap-6 max-w-2xl"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-col gap-2">
        <Label for="nome">Nome *</Label>
        <Input
          id="nome"
          v-model.trim="form.nome"
          :disabled="submitting || pending"
          required
        />
        <p v-if="errors.nome" class="text-red-500 text-sm">
          {{ errors.nome }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label for="valor">Valor (R$)</Label>
          <Input
            id="valor"
            v-model.trim="valorInput"
            type="number"
            step="0.01"
            min="0"
            placeholder="0,00"
            :disabled="submitting || pending"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="quantidade">Quantidade</Label>
          <Input
            id="quantidade"
            v-model.trim="quantidadeInput"
            type="number"
            min="0"
            placeholder="Opcional"
            :disabled="submitting || pending"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div class="flex flex-col gap-2">
          <Label for="setor_id">ID do setor</Label>
          <Input
            id="setor_id"
            v-model.trim="setorIdInput"
            type="number"
            placeholder="Opcional"
            :disabled="submitting || pending"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="evento_id">ID do evento</Label>
          <Input
            id="evento_id"
            v-model.trim="eventoIdInput"
            type="number"
            placeholder="Opcional"
            :disabled="submitting || pending"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <Label for="tipo">Tipo</Label>
        <Input
          id="tipo"
          v-model.trim="form.tipo"
          placeholder="Ex: Inteira, Meia..."
          :disabled="submitting || pending"
        />
      </div>

      <div class="flex items-center gap-2">
        <Switch
          id="ativo"
          :checked="form.ativo !== false"
          @update:checked="(v: boolean) => (form.ativo = v)"
        />
        <Label for="ativo">Ativo</Label>
      </div>

      <div class="flex gap-2">
        <Button type="submit" :disabled="isDisabled">
          {{ submitting ? "Salvando…" : "Salvar alterações" }}
        </Button>
        <Button
          type="button"
          variant="secondary"
          :disabled="submitting || pending"
          @click="resetForm"
        >
          Reverter
        </Button>
        <NuxtLink to="/ingressos">
          <Button type="button" variant="outline" :disabled="submitting">
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, AlertCircle } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { reactive, ref, computed, watchEffect } from "vue";
import type { Ingresso, UpdateIngressoDTO } from "@/types/ingresso";
import { useIngressoService } from "@/services/ingresso";

const route = useRoute();
const id = route.params.id as string;

useHead({ title: "Editar ingresso" });

definePageMeta({
  title: "Ingressos",
  breadcrumb: "Editar ingresso",
});

const { get, update } = useIngressoService();
const submitting = ref(false);

const {
  data: ingresso,
  pending,
  error,
  refresh,
} = await useAsyncData<Ingresso>(
  () => ["ingresso", id].join(":"),
  () => get(id),
  { immediate: true },
);

const form = reactive<UpdateIngressoDTO>({
  nome: "",
  valor: null,
  quantidade: null,
  setor_id: null,
  evento_id: null,
  tipo: null,
  ativo: true,
});

const valorInput = ref("");
const quantidadeInput = ref("");
const setorIdInput = ref("");
const eventoIdInput = ref("");

const errors = reactive<{ nome?: string }>({});

watchEffect(() => {
  if (ingresso.value) {
    form.nome = ingresso.value.nome ?? "";
    form.valor = ingresso.value.valor ?? null;
    form.quantidade = ingresso.value.quantidade ?? null;
    form.setor_id = ingresso.value.setor_id ?? null;
    form.evento_id = ingresso.value.evento_id ?? null;
    form.tipo = ingresso.value.tipo ?? null;
    form.ativo = ingresso.value.ativo ?? true;
    valorInput.value = ingresso.value.valor != null ? String(ingresso.value.valor) : "";
    quantidadeInput.value = ingresso.value.quantidade != null ? String(ingresso.value.quantidade) : "";
    setorIdInput.value = ingresso.value.setor_id != null ? String(ingresso.value.setor_id) : "";
    eventoIdInput.value = ingresso.value.evento_id != null ? String(ingresso.value.evento_id) : "";
  }
});

const isDisabled = computed(
  () =>
    submitting.value ||
    pending.value ||
    !!error.value ||
    !ingresso.value ||
    !(form.nome ?? "").trim(),
);

function parseNum(s: string): number | null {
  const n = Number(s?.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function validate(): boolean {
  errors.nome = !form.nome?.trim() ? "Informe o nome do ingresso." : undefined;
  return !errors.nome;
}

function resetForm() {
  if (!ingresso.value) return;
  form.nome = ingresso.value.nome ?? "";
  form.valor = ingresso.value.valor ?? null;
  form.quantidade = ingresso.value.quantidade ?? null;
  form.setor_id = ingresso.value.setor_id ?? null;
  form.evento_id = ingresso.value.evento_id ?? null;
  form.tipo = ingresso.value.tipo ?? null;
  form.ativo = ingresso.value.ativo ?? true;
  valorInput.value = ingresso.value.valor != null ? String(ingresso.value.valor) : "";
  quantidadeInput.value = ingresso.value.quantidade != null ? String(ingresso.value.quantidade) : "";
  setorIdInput.value = ingresso.value.setor_id != null ? String(ingresso.value.setor_id) : "";
  eventoIdInput.value = ingresso.value.evento_id != null ? String(ingresso.value.evento_id) : "";
  errors.nome = undefined;
}

async function handleSubmit() {
  if (!validate() || !ingresso.value) return;
  submitting.value = true;
  try {
    const valor = parseNum(valorInput.value);
    const quantidade = parseNum(quantidadeInput.value);
    const setorId = setorIdInput.value.trim() ? parseNum(setorIdInput.value) : null;
    const eventoId = eventoIdInput.value.trim() ? parseNum(eventoIdInput.value) : null;
    await update(id, {
      nome: form.nome,
      valor: valor ?? null,
      quantidade: quantidade ?? null,
      setor_id: setorId ?? null,
      evento_id: eventoId ?? null,
      tipo: form.tipo?.trim() || null,
      ativo: form.ativo ?? true,
    });
    await refresh();
    toast.success("Ingresso atualizado com sucesso.");
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
