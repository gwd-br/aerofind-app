<template>
  <div class="min-h-screen grid place-items-center p-4">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl">Esqueci minha senha</CardTitle>
        <CardDescription>
          Informe seu e-mail para receber o link de recuperação.
        </CardDescription>
      </CardHeader>

      <CardContent class="grid gap-4">
        <div class="grid gap-2">
          <Label for="email">E-mail</Label>
          <div class="relative">
            <Mail
              class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            />
            <Input
              id="email"
              type="email"
              class="pl-9"
              placeholder="voce@exemplo.com"
              v-model="form.email"
              :disabled="loading"
              required
            />
          </div>
        </div>

        <Alert v-if="success" class="border-green-600/40">
          <AlertTitle>Solicitação enviada</AlertTitle>
          <AlertDescription>{{ success }}</AlertDescription>
        </Alert>

        <Alert v-if="errorMsg" variant="destructive">
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{{ errorMsg }}</AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter class="flex flex-col gap-2">
        <Button class="w-full" :disabled="loading" @click="submit">
          {{ loading ? "Enviando..." : "Enviar link" }}
        </Button>
        <Button
          variant="outline"
          class="w-full"
          :disabled="loading"
          @click="goToLogin"
        >
          Voltar ao login
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

definePageMeta({ title: "Esqueci minha senha", layout: "auth" });

const form = ref({ email: "" });
const loading = ref(false);
const success = ref("");
const errorMsg = ref("");

const submit = async () => {
  loading.value = true;
  try {
    await auth.forgotPassword(form.value.email);
    success.value = "Link de recuperação enviado com sucesso!";
  } catch (error) {
    errorMsg.value = "Erro ao enviar link de recuperação.";
  } finally {
    loading.value = false;
  }
};

const goToLogin = () => {
  navigateTo("/login");
};
</script>
