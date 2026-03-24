<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline" size="sm" class="gap-1">
        Ações
        <ChevronDown class="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="start">
      <DropdownMenuLabel>Ações</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="text-destructive focus:text-destructive"
        @select="openDeleteDialog"
      >
        <Trash2 class="mr-2 h-4 w-4" />
        Excluir
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <AlertDialog v-model:open="deleteDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir evento</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir o evento &quot;{{ evento?.nome_evento }}&quot;?
          Esta ação não pode ser desfeita. Digite sua senha para confirmar.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="delete-password">Sua senha</Label>
          <Input
            id="delete-password"
            v-model="deletePassword"
            type="password"
            autocomplete="current-password"
            placeholder="Digite sua senha"
            class="w-full"
            @keydown.enter.prevent="handleConfirmDelete"
          />
        </div>
      </div>
      <AlertDialogFooter>
        <AlertDialogCancel @click="deletePassword = ''">Cancelar</AlertDialogCancel>
        <Button
          variant="destructive"
          :disabled="deleteInProgress || !deletePassword?.trim()"
          @click="handleConfirmDelete"
        >
          {{ deleteInProgress ? "Excluindo..." : "Excluir" }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, Trash2 } from "lucide-vue-next";
import type { Evento } from "@/types/evento";
import { useEventoService } from "@/services/evento";
import { toast } from "vue-sonner";

const props = defineProps<{
  evento: Evento | null;
}>();

const { remove } = useEventoService();

const deleteDialogOpen = ref(false);
const deletePassword = ref("");
const deleteInProgress = ref(false);

function openDeleteDialog() {
  deletePassword.value = "";
  deleteDialogOpen.value = true;
}

/** Extrai mensagem de erro da resposta da API (ex.: 422 com message ou errors.password). */
function getApiErrorMessage(e: unknown): string {
  const fallback = "Erro ao excluir evento.";
  if (e && typeof e === "object" && "data" in e) {
    const data = (e as { data?: Record<string, unknown> }).data;
    if (data?.message && typeof data.message === "string") return data.message;
    const errPassword = data?.errors as Record<string, string[] | undefined> | undefined;
    if (Array.isArray(errPassword?.password) && errPassword.password[0])
      return errPassword.password[0];
    if (Array.isArray(data?.password) && typeof data.password[0] === "string")
      return data.password[0];
  }
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

async function handleConfirmDelete() {
  const senha = deletePassword.value?.trim();
  if (!senha) {
    toast.error("Digite sua senha para confirmar a exclusão.");
    return;
  }
  if (!props.evento?.id) return;
  deleteInProgress.value = true;
  try {
    await remove(props.evento.id, { password: senha });
    toast.success("Evento excluído com sucesso.");
    deleteDialogOpen.value = false;
    await navigateTo("/eventos");
  } catch (e: unknown) {
    const msg = getApiErrorMessage(e);
    toast.error(msg);
  } finally {
    deleteInProgress.value = false;
  }
}
</script>
