<template>
  <div class="w-full p-4">
    <div class="mb-6">
      <NuxtLink
        to="/ingressos"
        class="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
      >
        <ArrowLeft class="w-4 h-4" />
        Voltar para ingressos
      </NuxtLink>
      <h1 class="text-2xl font-semibold mt-2">Novo ingresso</h1>
      <p class="text-sm text-muted-foreground">Preencha os dados do ingresso.</p>
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
            :disabled="submitting"
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
            :disabled="submitting"
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
      </div>

      <div class="flex flex-col gap-2">
        <Label for="tipo">Tipo</Label>
        <Input
          id="tipo"
          v-model.trim="form.tipo"
          placeholder="Ex: Inteira, Meia..."
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
          {{ submitting ? "Salvando…" : "Criar ingresso" }}
        </Button>
        <NuxtLink to="/ingressos">
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
import type { CreateIngressoDTO } from "@/types/ingresso";
import { useIngressoService } from "@/services/ingresso";

useHead({ title: "Novo ingresso" });

definePageMeta({
  title: "Ingressos",
  breadcrumb: "Novo ingresso",
});

const { create } = useIngressoService();
const submitting = ref(false);

const form = reactive<CreateIngressoDTO>({
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

function parseNum(s: string): number | null {
  const n = Number(s?.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function validate(): boolean {
  errors.nome = !form.nome?.trim() ? "Informe o nome do ingresso." : undefined;
  return !errors.nome;
}

async function handleSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    const valor = parseNum(valorInput.value);
    const quantidade = parseNum(quantidadeInput.value);
    const setorId = setorIdInput.value.trim() ? parseNum(setorIdInput.value) : null;
    const eventoId = eventoIdInput.value.trim() ? parseNum(eventoIdInput.value) : null;
    const ingresso = await create({
      nome: form.nome!,
      valor: valor ?? null,
      quantidade: quantidade ?? null,
      setor_id: setorId ?? null,
      evento_id: eventoId ?? null,
      tipo: form.tipo?.trim() || null,
      ativo: form.ativo ?? true,
    });
    toast.success("Ingresso criado com sucesso.");
    await navigateTo(`/ingressos/${ingresso.id}`);
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
