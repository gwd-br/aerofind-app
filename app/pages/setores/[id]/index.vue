<template>
  <div class="w-full p-4">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold mt-2">Editar setor</h1>
        <p class="text-sm text-muted-foreground">Altere os dados do setor.</p>
      </div>
      <NuxtLink
        to="/setores"
        class="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
      >
        <ArrowLeft class="w-4 h-4" />
        Voltar para setores
      </NuxtLink>
    </div>

    <div v-if="pending" class="py-4">Carregando...</div>
    <Alert v-else-if="error" variant="destructive">
      <AlertCircle class="w-4 h-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        Setor não encontrado ou erro ao carregar.
      </AlertDescription>
    </Alert>
    <form
      v-else-if="setor"
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

      <div class="flex flex-col gap-2">
        <Label for="descricao">Descrição</Label>
        <Input
          id="descricao"
          v-model.trim="form.descricao"
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
        <NuxtLink to="/setores">
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
import type { Setor, UpdateSetorDTO } from "@/types/setor";
import { useSetorService } from "@/services/setor";

const route = useRoute();
const id = route.params.id as string;

useHead({ title: "Editar setor" });

definePageMeta({
  title: "Setores",
  breadcrumb: "Editar setor",
});

const { get, update } = useSetorService();
const submitting = ref(false);

const {
  data: setor,
  pending,
  error,
  refresh,
} = await useAsyncData<Setor>(
  () => ["setor", id].join(":"),
  () => get(id),
  { immediate: true },
);

const form = reactive<UpdateSetorDTO>({
  nome: "",
  descricao: null,
  evento_id: null,
  ativo: true,
});

const eventoIdInput = ref("");

const errors = reactive<{ nome?: string }>({});

watchEffect(() => {
  if (setor.value) {
    form.nome = setor.value.nome ?? "";
    form.descricao = setor.value.descricao ?? null;
    form.evento_id = setor.value.evento_id ?? null;
    form.ativo = setor.value.ativo ?? true;
    eventoIdInput.value = setor.value.evento_id != null ? String(setor.value.evento_id) : "";
  }
});

const isDisabled = computed(
  () =>
    submitting.value ||
    pending.value ||
    !!error.value ||
    !setor.value ||
    !(form.nome ?? "").trim(),
);

function validate(): boolean {
  errors.nome = !form.nome?.trim() ? "Informe o nome do setor." : undefined;
  return !errors.nome;
}

function resetForm() {
  if (!setor.value) return;
  form.nome = setor.value.nome ?? "";
  form.descricao = setor.value.descricao ?? null;
  form.evento_id = setor.value.evento_id ?? null;
  form.ativo = setor.value.ativo ?? true;
  eventoIdInput.value = setor.value.evento_id != null ? String(setor.value.evento_id) : "";
  errors.nome = undefined;
}

async function handleSubmit() {
  if (!validate() || !setor.value) return;
  submitting.value = true;
  try {
    const eventoId = eventoIdInput.value.trim()
      ? Number(eventoIdInput.value)
      : null;
    await update(id, {
      nome: form.nome,
      descricao: form.descricao || null,
      evento_id: Number.isFinite(eventoId) ? eventoId : null,
      ativo: form.ativo ?? true,
    });
    await refresh();
    toast.success("Setor atualizado com sucesso.");
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
