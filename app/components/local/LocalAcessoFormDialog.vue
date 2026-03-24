<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Editar local de acesso' : 'Novo local de acesso' }}</DialogTitle>
        <DialogDescription>
          {{ isEdit ? 'Altere os dados do local de acesso.' : 'Preencha os dados do novo local de acesso.' }}
        </DialogDescription>
      </DialogHeader>
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <div class="flex flex-col gap-2">
          <Label for="acesso-nome">Nome *</Label>
          <Input
            id="acesso-nome"
            v-model.trim="form.nome"
            :disabled="submitting"
            required
          />
          <p v-if="errors.nome" class="text-red-500 text-sm">{{ errors.nome }}</p>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="acesso-descricao">Descrição</Label>
          <Input
            id="acesso-descricao"
            v-model.trim="form.descricao"
            :disabled="submitting"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="acesso-andar">Andar</Label>
          <Input
            id="acesso-andar"
            v-model.trim="form.andar"
            :disabled="submitting"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <Label for="acesso-latitude">Latitude</Label>
            <Input
              id="acesso-latitude"
              v-model.trim="latitudeInput"
              type="text"
              inputmode="decimal"
              :disabled="submitting"
            />
          </div>
          <div class="flex flex-col gap-2">
            <Label for="acesso-longitude">Longitude</Label>
            <Input
              id="acesso-longitude"
              v-model.trim="longitudeInput"
              type="text"
              inputmode="decimal"
              :disabled="submitting"
            />
          </div>
        </div>
        <DialogFooter class="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            :disabled="submitting"
            @click="emit('update:open', false)"
          >
            Cancelar
          </Button>
          <Button type="submit" :disabled="submitting">
            {{ submitting ? "Salvando…" : isEdit ? "Salvar" : "Criar" }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "vue-sonner";
import { reactive, ref, watch, computed } from "vue";
import type { LocalAcesso, UpdateLocalAcessoDTO } from "@/types/local-acesso";
import { useLocalAcessoService } from "@/services/local-acesso";

const props = defineProps<{
  open: boolean;
  localId: number;
  acesso: LocalAcesso | null;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "saved"): void;
}>();

const { create, update } = useLocalAcessoService();
const submitting = ref(false);
const latitudeInput = ref("");
const longitudeInput = ref("");

const form = reactive<{
  nome: string;
  descricao: string | null;
  andar: string | null;
  latitude: number | null;
  longitude: number | null;
}>({
  nome: "",
  descricao: null,
  andar: null,
  latitude: null,
  longitude: null,
});
const errors = reactive<{ nome?: string }>({});

const isEdit = computed(() => !!props.acesso?.id);

function parseDecimal(s: string): number | null {
  const n = Number(String(s).replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

watch(
  () => [props.open, props.acesso] as const,
  ([open, acesso]) => {
    if (open) {
      if (acesso) {
        form.nome = acesso.nome ?? "";
        form.descricao = acesso.descricao ?? null;
        form.andar = acesso.andar ?? null;
        form.latitude = acesso.latitude ?? null;
        form.longitude = acesso.longitude ?? null;
        latitudeInput.value = acesso.latitude != null ? String(acesso.latitude) : "";
        longitudeInput.value = acesso.longitude != null ? String(acesso.longitude) : "";
      } else {
        form.nome = "";
        form.descricao = null;
        form.andar = null;
        form.latitude = null;
        form.longitude = null;
        latitudeInput.value = "";
        longitudeInput.value = "";
      }
      errors.nome = undefined;
    }
  },
  { immediate: true },
);

function onOpenChange(value: boolean) {
  emit("update:open", value);
}

function validate(): boolean {
  errors.nome = !form.nome?.trim() ? "Informe o nome." : undefined;
  return !errors.nome;
}

async function handleSubmit() {
  if (!validate()) return;
  submitting.value = true;
  try {
    const lat = parseDecimal(latitudeInput.value);
    const lng = parseDecimal(longitudeInput.value);
    const payload: UpdateLocalAcessoDTO = {
      nome: form.nome,
      descricao: form.descricao || null,
      andar: form.andar || null,
      latitude: lat ?? null,
      longitude: lng ?? null,
    };
    if (props.acesso?.id) {
      await update(props.acesso.id, payload);
      toast.success("Local de acesso atualizado com sucesso.");
    } else {
      await create(props.localId, {
        nome: form.nome,
        descricao: form.descricao || null,
        andar: form.andar || null,
        latitude: lat ?? null,
        longitude: lng ?? null,
      });
      toast.success("Local de acesso criado com sucesso.");
    }
    emit("update:open", false);
    emit("saved");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao salvar. Tente novamente.";
    toast.error(msg);
    errors.nome = msg;
  } finally {
    submitting.value = false;
  }
}
</script>
