<script setup lang="ts">
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Building2,
  BarChart3,
  Wrench,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";

definePageMeta({
  title: "Início",
});

const { user } = useAuthStore();

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
});

const firstName = computed(() => {
  if (!user?.name) return "";
  return user.name.split(" ")[0];
});

const quickLinks = [
  {
    title: "Eventos",
    description: "Gerencie seus eventos",
    icon: FileText,
    href: "/eventos",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Setores",
    description: "Gerencie seus setores",
    icon: Building2,
    href: "/setores",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    title: "Ingressos",
    description: "Gerencie seus ingressos",
    icon: BarChart3,
    href: "/ingressos",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    title: "Usuários",
    description: "Gerencie seus usuários",
    icon: Wrench,
    href: "/users",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
];
</script>

<template>
  <div class="w-full min-h-[calc(100vh-4rem)] flex flex-col">
    <!-- Hero Section -->
    <div
      class="w-full px-8 py-12 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent"
    >
      <div class="max-w-4xl">
        <Badge variant="secondary" class="mb-4">
          <Sparkles class="w-3 h-3 mr-1" />
          Novo Ambiente
        </Badge>
        <h1 class="text-4xl font-bold text-gray-900 mb-2">
          {{ greeting }}<span v-if="firstName">, {{ firstName }}</span
          >!
        </h1>
        <p class="text-xl text-muted-foreground mb-6">
          Bem-vindo ao novo sistema da Eventim.
        </p>
      </div>
    </div>

    <!-- Quick Links -->
    <div class="w-full px-8 py-8 flex-1">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Acesso Rápido</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <NuxtLink
          v-for="link in quickLinks"
          :key="link.href"
          :to="link.href"
          class="group"
        >
          <Card
            class="h-full transition-all hover:shadow-md hover:border-primary/20"
          >
            <CardHeader class="pb-2">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center mb-2"
                :class="link.bgColor"
              >
                <component
                  :is="link.icon"
                  class="w-5 h-5"
                  :class="link.color"
                />
              </div>
              <CardTitle
                class="text-base group-hover:text-primary transition-colors"
              >
                {{ link.title }}
              </CardTitle>
              <CardDescription>{{ link.description }}</CardDescription>
            </CardHeader>
            <CardContent class="pt-0">
              <div
                class="flex items-center text-sm text-muted-foreground group-hover:text-primary transition-colors"
              >
                <span>Acessar</span>
                <ArrowRight
                  class="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1"
                />
              </div>
            </CardContent>
          </Card>
        </NuxtLink>
      </div>
    </div>

    <!-- Footer Info -->
    <div class="w-full px-8 py-6 border-t bg-muted/30">
      <div
        class="flex items-center justify-between text-sm text-muted-foreground"
      >
        <p>Eventim</p>
        <p>Versão 1.0</p>
      </div>
    </div>
  </div>
</template>
