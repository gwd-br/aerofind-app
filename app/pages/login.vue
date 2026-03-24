<!-- pages/login.vue -->
<script setup lang="ts">
definePageMeta({ layout: "auth" });
import LoginForm from "@/components/LoginForm.vue";
import { useAuthStore } from "@/stores/auth";
import { ref } from "vue";

const auth = useAuthStore();
// const { $api } = useNuxtApp();

const errorMessage = ref("");

const loading = ref(false);
async function handleSubmit(submitData: { email: string; password: string }) {
  try {
    loading.value = true;
    await auth.login(submitData.email, submitData.password);
    if (auth.isAuthenticated) {
      navigateTo("/");
    }
  } catch (error) {
    errorMessage.value = "Email ou senha inválidos";
  } finally {
    loading.value = false;
  }
}

// watchEffect(() => {
//   //   if (isAuthenticated.value) router.replace("/");
// });
</script>

<template>
  <div class="w-full">
    <LoginForm
      forgot-href="/forgot-password"
      @submit="handleSubmit"
      :error-message="errorMessage"
      :loading="loading"
    />
  </div>
</template>
