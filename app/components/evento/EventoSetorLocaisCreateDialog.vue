<template>
  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>Adicionar local de acesso</DialogTitle>
        <DialogDescription>
          Selecione um local de acesso do local do evento para vincular ao setor
          &quot;{{ setor?.nome_setor }}&quot;.
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4">
        <p v-if="pendingEvento" class="text-muted-foreground text-sm">
          Carregando evento...
        </p>
        <p v-else-if="!idLocal" class="text-muted-foreground text-sm">
          O evento ainda não possui um local configurado. Configure o local em
          &quot;Informações do evento&quot; para poder vincular locais de acesso
          ao setor.
        </p>
        <p v-else-if="pending" class="text-muted-foreground text-sm">
          Carregando locais de acesso do local...
        </p>
        <p
          v-else-if="available.length === 0"
          class="text-muted-foreground text-sm"
        >
          Não há locais de acesso disponíveis para vincular (o local do evento
          não possui acessos ou todos já estão vinculados a este setor).
        </p>
        <form v-else class="flex flex-col gap-4" @submit.prevent="handleSubmit">
          <RadioGroup v-model="selectedId" class="flex flex-col gap-2">
            <label
              v-for="acesso in available"
              :key="acesso.id"
              class="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
              :class="{ 'opacity-60': submitting }"
            >
              <RadioGroupItem
                :value="String(acesso.id)"
                :disabled="submitting"
              />
              <span class="text-sm font-medium">{{
                acesso.nome ?? `Local #${acesso.id}`
              }}</span>
            </label>
          </RadioGroup>

          <DialogFooter class="gap-2 sm:gap-0">
            <div class="flex justify-between w-full">
              <Button
                type="button"
                variant="outline"
                :disabled="submitting"
                @click="emit('update:open', false)"
              >
                Cancelar
              </Button>
              <Button type="submit" :disabled="submitting || !selectedId">
                {{ submitting ? "Salvando…" : "Adicionar" }}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Setor } from "@/types/setor";
import type { LocalAcesso } from "@/types/local-acesso";
import type { PaginatedResponse } from "@/types/common";
import type { Evento } from "@/types/evento";
import { useSetorAcessoService } from "@/services/setor-acesso";
import { useLocalAcessoService } from "@/services/local-acesso";
import { useEventoService } from "@/services/evento";
import { toast } from "vue-sonner";
import { watch } from "vue";

const props = defineProps<{
  open: boolean;
  setor: Setor | null;
  setorAcessosIds: number[];
  eventoId: number;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "saved"): void;
}>();

const { store } = useSetorAcessoService();
const { listByLocal } = useLocalAcessoService();
const { get: getEvento } = useEventoService();

const selectedId = ref<string>("");
const submitting = ref(false);

const idLocal = ref<number | null>(null);
const pendingEvento = ref(false);

const {
  data: acessosDoLocal,
  pending,
  refresh: refreshAcessos,
} = await useAsyncData<PaginatedResponse<LocalAcesso>>(
  () => ["local-acessos-by-local", idLocal.value, props.open].join(":"),
  () =>
    idLocal.value && props.open
      ? listByLocal(idLocal.value)
      : Promise.resolve({
          data: [],
          total: 0,
          current_page: 1,
          last_page: 1,
          per_page: 100,
        }),
  { watch: [idLocal, () => props.open] },
);

const available = computed(() => {
  const ids = props.setorAcessosIds ?? [];
  const list = acessosDoLocal.value?.data ?? [];
  return list.filter((a) => !ids.includes(a.id));
});

watch(
  () => props.open,
  async (open) => {
    if (!open || !props.eventoId) {
      idLocal.value = null;
      return;
    }
    pendingEvento.value = true;
    try {
      const evento = (await getEvento(props.eventoId)) as Evento;
      idLocal.value = evento?.id_local ?? null;
      if (idLocal.value) await refreshAcessos();
    } finally {
      pendingEvento.value = false;
    }
    if (open) {
      selectedId.value = available.value[0]
        ? String(available.value[0].id)
        : "";
    }
  },
  { immediate: true },
);

watch(
  () => available.value,
  (list) => {
    if (props.open && list.length && !selectedId.value) {
      selectedId.value = String(list[0]!.id);
    }
  },
  { deep: true },
);

function onOpenChange(value: boolean) {
  emit("update:open", value);
}

async function handleSubmit() {
  const id = selectedId.value ? Number(selectedId.value) : 0;
  if (!id || !props.setor) return;
  submitting.value = true;
  try {
    await store(props.setor.id, { local_acesso_id: id });
    toast.success("Local de acesso vinculado ao setor.");
    emit("update:open", false);
    emit("saved");
  } catch (e) {
    toast.error(
      e instanceof Error ? e.message : "Erro ao vincular. Tente novamente.",
    );
  } finally {
    submitting.value = false;
  }
}
</script>
