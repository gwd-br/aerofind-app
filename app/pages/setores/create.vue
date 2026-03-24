<template>
  <div class="w-full p-4">
    <div class="mb-6">
      <NuxtLink
        to="/setores"
        class="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
      >
        <ArrowLeft class="w-4 h-4" />
        Voltar para setores
      </NuxtLink>
      <h1 class="text-2xl font-semibold mt-2">Novo setor</h1>
      <p class="text-sm text-muted-foreground">Preencha os dados do setor.</p>
    </div>

    <form
      class="flex flex-col gap-6 max-w-2xl"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-col gap-2">
        <Label for="nome">Nome *</Label>
        <Input
          id="nome"
          v-model.trim="form.nome"
          :disabled="submitting"
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
          :disabled="submitting"
        />
      </div>

      <div class="flex flex-col gap-2">
        <Label for="evento_id">ID do evento</Label>
        <Input
          id="evento_id"
          v-model.trim="eventoIdInput"
          type="number"
          placeholder="Opcional"
          :disabled="submitting"
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
        <Button type="submit" :disabled="submitting">
          {{ submitting ? "Salvando…" : "Criar setor" }}
        </Button>
        <NuxtLink to="/setores">
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
import { ArrowLeft } from "lucide-vue-next";
import { toast } from "vue-sonner";
import { reactive, ref } from "vue";
import type { CreateSetorDTO } from "@/types/setor";
import { useSetorService } from "@/services/setor";

useHead({ title: "Novo setor" });

definePageMeta({
  title: "Setores",
  breadcrumb: "Novo setor",
});

const { create } = useSetorService();
const submitting = ref(false);

const form = reactive<CreateSetorDTO>({
  nome: "",
  descricao: null,
  evento_id: null,
  ativo: true,
});

const eventoIdInput = ref("");

const errors = reactive<{ nome?: string }>({});

function validate(): boolean {
  errors.nome = !form.nome?.trim() ? "Informe o nome do setor." : undefined;
  return !errors.nome;
}

async function handleSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    const eventoId = eventoIdInput.value.trim()
      ? Number(eventoIdInput.value)
      : null;
    const setor = await create({
      nome: form.nome!,
      descricao: form.descricao || null,
      evento_id: Number.isFinite(eventoId) ? eventoId : null,
      ativo: form.ativo ?? true,
    });
    toast.success("Setor criado com sucesso.");
    await navigateTo(`/setores/${setor.id}`);
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
