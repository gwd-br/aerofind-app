<template>
  <div
    class="relative min-h-screen grid place-items-center overflow-hidden bg-gradient-to-tr from-blue-900 via-sky-800 to-indigo-900"
  >
    <!-- fundo com partículas -->
    <BackgroundParticles class="pointer-events-none absolute inset-0" />

    <!-- conteúdo do layout -->
    <div class="relative z-10 w-full max-w-sm md:max-w-3xl">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import BackgroundParticles from "@/components/BackgroundParticles.vue";
</script>
