<template>
  <div class="w-full p-4">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-semibold mt-2">Editar local</h1>
        <p class="text-sm text-muted-foreground">Altere os dados do local.</p>
      </div>
      <NuxtLink
        to="/locais"
        class="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
      >
        <ArrowLeft class="w-4 h-4" />
        Voltar para locais
      </NuxtLink>
    </div>

    <div v-if="pending" class="py-4">Carregando...</div>
    <Alert v-else-if="error" variant="destructive">
      <AlertCircle class="w-4 h-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>
        Local não encontrado ou erro ao carregar.
      </AlertDescription>
    </Alert>
    <template v-else-if="local">
      <Tabs default-value="info" class="w-full">
        <TabsList class="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="info">Informações do Local</TabsTrigger>
          <TabsTrigger value="acessos">Locais de Acesso</TabsTrigger>
        </TabsList>
        <TabsContent value="info" class="mt-4">
          <LocalInfoTab
            :local="local"
            :disabled="pending"
            @saved="refresh"
          />
        </TabsContent>
        <TabsContent value="acessos" class="mt-4">
          <LocalAcessosTab :local-id="local.id" />
        </TabsContent>
      </Tabs>
    </template>
  </div>
</template>

<script setup lang="ts">
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, AlertCircle } from "lucide-vue-next";
import type { Local } from "@/types/local";
import { useLocalService } from "@/services/local";
import LocalInfoTab from "@/components/local/LocalInfoTab.vue";
import LocalAcessosTab from "@/components/local/LocalAcessosTab.vue";

const route = useRoute();
const id = route.params.id as string;

useHead({ title: "Editar local" });

definePageMeta({
  title: "Locais",
  breadcrumb: "Editar local",
});

const { get } = useLocalService();

const {
  data: local,
  pending,
  error,
  refresh,
} = await useAsyncData<Local>(
  () => ["local", id].join(":"),
  () => get(id),
  { immediate: true },
);
</script>
