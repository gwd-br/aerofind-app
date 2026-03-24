<template>
  <Card>
    <CardHeader
      class="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 border-b pb-6"
    >
      <div class="space-y-1.5">
        <CardTitle>Ingressos</CardTitle>
        <CardDescription>
          Ingressos vinculados a este evento. Crie, edite ou exclua ingressos.
        </CardDescription>
      </div>
      <Button size="sm" @click="openCreateDialog"> Novo ingresso </Button>
    </CardHeader>

    <CardContent>
      <div>
        <p v-if="pending" class="text-muted-foreground text-sm">
          Carregando ingressos...
        </p>
        <p v-else-if="error" class="text-destructive text-sm">
          Erro ao carregar ingressos.
        </p>
        <template v-else>
          <p
            v-if="(ingressos?.data?.length ?? 0) === 0"
            class="text-muted-foreground text-sm"
          >
            Nenhum ingresso vinculado a este evento.
          </p>
          <template v-else>
            <div class="w-full border rounded-lg border-gray-200">
              <Table class="w-full table-auto">
                <TableHeader>
                  <TableRow>
                    <TableHead>Código / Barcode</TableHead>
                    <TableHead>Tipo ingresso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Dt. compra</TableHead>
                    <TableHead>Dt. venda</TableHead>
                    <TableHead>Enviado acesso</TableHead>
                    <TableHead>Portador</TableHead>
                    <TableHead class="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow
                    v-for="ingresso in ingressos?.data"
                    :key="ingresso.id"
                  >
                    <TableCell class="align-middle py-2">
                      <span class="text-sm font-medium">{{
                        ingresso.barcode ?? ingresso.num_pedido ?? "—"
                      }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2">
                      <span class="text-sm">{{
                        ingresso.tipo_ingresso || "—"
                      }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2">
                      <Badge
                        :variant="ingresso.status ? 'default' : 'secondary'"
                      >
                        {{ ingresso.status || "—" }}
                      </Badge>
                    </TableCell>
                    <TableCell class="align-middle py-2">
                      <span class="text-sm">{{
                        nomeSetor(ingresso.setores_fk)
                      }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2">
                      <span class="text-sm">{{
                        formatDate(ingresso.dt_compra)
                      }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2">
                      <span class="text-sm">{{
                        formatDate(ingresso.dt_venda)
                      }}</span>
                    </TableCell>
                    <TableCell class="align-middle py-2">
                      <Badge
                        :variant="
                          ingresso.enviado_acesso ? 'default' : 'secondary'
                        "
                      >
                        {{ ingresso.enviado_acesso ? "Sim" : "Não" }}
                      </Badge>
                    </TableCell>
                    <TableCell class="align-middle py-2">
                      <div
                        v-if="ingresso.portador"
                        class="flex items-center justify-between text-sm"
                      >
                        <div class="flex flex-col gap-1">
                          <span class="font-medium">
                            {{ ingresso.portador.nome }}
                          </span>
                          <span class="text-xs text-muted-foreground">
                            CPF: {{ formatCpf(ingresso.portador.cpf) }}
                          </span>
                          <div class="mt-1 flex items-center gap-1 text-xs">
                            <UserCircle2
                              class="h-4 w-4"
                              :class="
                                ingresso.portador.face_url
                                  ? 'text-emerald-500'
                                  : 'text-red-500'
                              "
                            />
                            <span class="text-muted-foreground">
                              {{
                                ingresso.portador.face_url
                                  ? "Face capturada"
                                  : "Face não capturada"
                              }}
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button variant="outline" size="sm" class="gap-1">
                              Portador
                              <ChevronDown class="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              @select="openPortadorDialog(ingresso)"
                            >
                              Editar Portador
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              @select="openFaceCapture(ingresso)"
                            >
                              Capturar Face
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Button
                        v-else
                        variant="outline"
                        size="sm"
                        class="gap-1"
                        @click="openPortadorDialog(ingresso)"
                        >Vincular Portador</Button
                      >
                    </TableCell>
                    <TableCell class="align-middle py-2 text-right">
                      <div class="flex justify-end gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger as-child>
                            <Button variant="outline" size="sm" class="gap-1">
                              Ações
                              <ChevronDown class="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem @select="openEdit(ingresso)">
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              class="text-destructive focus:text-destructive"
                              @select="openDeleteConfirm(ingresso)"
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </template>
        </template>
      </div>
    </CardContent>

    <CardFooter
      v-if="!pending && (ingressos?.total ?? 0) > 0"
      class="flex flex-wrap items-center justify-between gap-4 border-t pt-6"
    >
      <UiPagination
        v-model:page="page"
        v-model:perPage="perPage"
        :total="ingressos?.total ?? 0"
        :meta="ingressos ?? null"
        :per-page-options="[5, 10, 25, 50]"
        :disabled="pending"
      />
    </CardFooter>
  </Card>

  <AlertDialog v-model:open="deleteDialogOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Excluir ingresso</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir o ingresso (código
          {{ ingressoToDelete?.barcode ?? ingressoToDelete?.id }})? Esta ação
          não pode ser desfeita.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancelar</AlertDialogCancel>
        <AlertDialogAction
          class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          @click="confirmDelete"
        >
          Excluir
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <EventoIngressoCreateDialog
    :open="createDialogOpen"
    :evento-id="eventoId"
    :setores="setoresList"
    @update:open="createDialogOpen = $event"
    @saved="onSaved"
  />

  <EventoIngressoEditDialog
    :open="editDialogOpen"
    :ingresso="selectedIngresso"
    :evento-id="eventoId"
    :setores="setoresList"
    @update:open="editDialogOpen = $event"
    @saved="onSaved"
  />

  <EventoIngressoFaceCaptureButton
    v-if="selectedIngresso"
    :open="faceCaptureDialogOpen"
    :ingresso="selectedIngresso"
    @update:open="faceCaptureDialogOpen = $event"
    @updated="refresh"
  />

  <EventoIngressoPortadorDialog
    :open="portadorDialogOpen"
    :ingresso="selectedIngresso"
    @update:open="portadorDialogOpen = $event"
    @updated="refresh"
  />
</template>

<script setup lang="ts">
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Ingresso } from "@/types/ingresso";
import type { Setor } from "@/types/setor";
import type { PaginatedResponse } from "@/types/common";
import { useIngressoService } from "@/services/ingresso";
import { useSetorService } from "@/services/setor";
import EventoIngressoCreateDialog from "@/components/evento/EventoIngressoCreateDialog.vue";
import EventoIngressoEditDialog from "@/components/evento/EventoIngressoEditDialog.vue";
import EventoIngressoFaceCaptureButton from "@/components/evento/EventoIngressoFaceCaptureButton.vue";
import EventoIngressoPortadorDialog from "@/components/evento/EventoIngressoPortadorDialog.vue";
import UiPagination from "@/components/ui/pagination/UiPagination.vue";
import { toast } from "vue-sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, UserCircle2 } from "lucide-vue-next";

const props = defineProps<{
  eventoId: number;
}>();

const { list: listIngressos, remove: removeIngresso } = useIngressoService();
const { list: listSetores } = useSetorService();

const page = ref(1);
const perPage = ref(10);
const createDialogOpen = ref(false);
const editDialogOpen = ref(false);
const portadorDialogOpen = ref(false);
const faceCaptureDialogOpen = ref(false);
const selectedIngresso = ref<Ingresso | null>(null);
const deleteDialogOpen = ref(false);
const ingressoToDelete = ref<Ingresso | null>(null);

const { data: setoresData } = await useAsyncData<PaginatedResponse<Setor>>(
  () => ["evento-setores-list", props.eventoId].join(":"),
  () => listSetores({ eventos_fk: props.eventoId, per_page: 500 }),
  { watch: [() => props.eventoId] },
);
const setoresList = computed<Setor[]>(
  () => (setoresData.value as any)?.data ?? [],
);

const {
  data: ingressos,
  pending,
  error,
  refresh,
} = await useAsyncData<PaginatedResponse<Ingresso>>(
  () =>
    ["evento-ingressos", props.eventoId, page.value, perPage.value].join(":"),
  () =>
    listIngressos({
      evento_fk: props.eventoId,
      page: page.value,
      per_page: perPage.value,
    }),
  { watch: [page, perPage, () => props.eventoId] },
);

function nomeSetor(setorId: number | null | undefined): string {
  if (setorId == null) return "—";
  const s = setoresList.value.find((x: Setor) => x.id === setorId);
  return s?.nome_setor ?? String(setorId);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleDateString("pt-BR");
}

function formatCpf(value: string | null | undefined): string {
  if (!value) return "—";
  const digits = String(value).replace(/\D/g, "").slice(0, 11);
  if (digits.length !== 11) return value;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(
    6,
    9,
  )}-${digits.slice(9)}`;
}

function openCreateDialog() {
  createDialogOpen.value = true;
}

function openEdit(ingresso: Ingresso) {
  selectedIngresso.value = ingresso;
  editDialogOpen.value = true;
}

function openPortadorDialog(ingresso: Ingresso) {
  selectedIngresso.value = ingresso;
  portadorDialogOpen.value = true;
}

function openFaceCapture(ingresso: Ingresso) {
  selectedIngresso.value = ingresso;
  faceCaptureDialogOpen.value = true;
}

function openDeleteConfirm(ingresso: Ingresso) {
  ingressoToDelete.value = ingresso;
  deleteDialogOpen.value = true;
}

async function confirmDelete() {
  if (!ingressoToDelete.value) return;
  await handleDelete(ingressoToDelete.value.id);
  deleteDialogOpen.value = false;
  ingressoToDelete.value = null;
}

async function handleDelete(id: number) {
  try {
    await removeIngresso(id);
    await refresh();
    toast.success("Ingresso excluído com sucesso.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir ingresso.";
    toast.error(msg);
  }
}

function onSaved() {
  refresh();
}
</script>
