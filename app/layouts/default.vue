<script setup lang="ts">
import AppSidebar from "@/components/AppSidebar.vue";
// import NotificationSheet from "@/components/NotificationSheet.vue";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-vue-next";
import { useBreadcrumbs } from "@/composables/useBreadcrumbs";
import { useAuthStore } from "@/stores/auth";
import { Toaster } from "@/components/ui/sonner";

const { items } = useBreadcrumbs();
const auth = useAuthStore();
const notificationOpen = ref(false);

onMounted(() => {
  auth.hydrate();
});
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator
            orientation="vertical"
            class="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <template v-for="(c, i) in items" :key="`${c.label}-${i}`">
                <BreadcrumbItem v-if="c.href">
                  <BreadcrumbLink as-child>
                    <NuxtLink :to="c.href">{{ c.label }}</NuxtLink>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbItem v-else>
                  <BreadcrumbPage
                    :aria-current="c.isCurrent ? 'page' : undefined"
                  >
                    {{ c.label }}
                  </BreadcrumbPage>
                </BreadcrumbItem>
                <BreadcrumbSeparator v-if="i < items.length - 1" />
              </template>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div class="ml-auto flex items-center gap-1 px-4">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Abrir notificações"
            @click="notificationOpen = true"
          >
            <Bell class="size-5" />
          </Button>
        </div>
      </header>
      <slot />
      <!-- <NotificationSheet v-model:open="notificationOpen" /> -->
      <Toaster />
    </SidebarInset>
  </SidebarProvider>
</template>
