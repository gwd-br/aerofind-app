<template>
  <div class="w-full p-4">
    <div class="mb-6 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <h1 class="text-2xl font-semibold mt-2">Editar evento</h1>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/eventos"
          class="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft class="w-4 h-4" />
          Voltar para eventos
        </NuxtLink>
        <AcoesEvento v-if="evento" :evento="evento" />
      </div>
    </div>

    <div v-if="pending" class="py-4">Carregando...</div>
    <Alert v-else-if="error" variant="destructive">
      <AlertCircle class="w-4 h-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        Evento não encontrado ou erro ao carregar.
      </AlertDescription>
    </Alert>
    <template v-else-if="evento">
      <Tabs default-value="info" class="w-full">
        <TabsList class="flex w-full max-w-md flex-wrap gap-2">
          <TabsTrigger value="info">Informações do evento</TabsTrigger>
          <TabsTrigger value="setores">Setores</TabsTrigger>
          <TabsTrigger value="ingressos">Ingressos</TabsTrigger>
        </TabsList>
        <TabsContent value="info" class="mt-4">
          <EventoInfoTab
            :evento="evento"
            :disabled="pending"
            @saved="refresh"
          />
        </TabsContent>
        <TabsContent value="setores" class="mt-4">
          <EventoSetoresTab :evento-id="evento.id" />
        </TabsContent>
        <TabsContent value="ingressos" class="mt-4">
          <EventoIngressosTab :evento-id="evento.id" />
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, AlertCircle } from "lucide-vue-next";
import type { Evento } from "@/types/evento";
import { useEventoService } from "@/services/evento";
import AcoesEvento from "@/components/evento/AcoesEvento.vue";
import EventoInfoTab from "@/components/evento/EventoInfoTab.vue";
import EventoSetoresTab from "@/components/evento/EventoSetoresTab.vue";
import EventoIngressosTab from "@/components/evento/EventoIngressosTab.vue";

const route = useRoute();
const id = route.params.id as string;

useHead({ title: "Editar evento" });

definePageMeta({
  title: "Eventos",
  breadcrumb: "Editar evento",
});

const { get } = useEventoService();

const {
  data: evento,
  pending,
  error,
  refresh,
} = await useAsyncData<Evento>(
  () => ["evento", id].join(":"),
  () => get(id),
  { immediate: true },
);
</script>
