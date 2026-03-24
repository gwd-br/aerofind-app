<script setup lang="ts">
import { onMounted } from "vue";

const props = withDefaults(
  defineProps<{
    id?: string;
  }>(),
  {
    id: "particles-background",
  },
);

const loadParticlesScript = () =>
  new Promise<void>((resolve, reject) => {
    if (!process.client) {
      resolve();
      return;
    }

    // evita carregar o script mais de uma vez
    if (document.querySelector('script[data-particles-js="true"]')) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js";
    script.async = false;
    script.dataset.particlesJs = "true";

    script.onload = () => resolve();
    script.onerror = (error) => reject(error);

    document.body.appendChild(script);
  });

onMounted(async () => {
  if (!process.client) return;

  try {
    await loadParticlesScript();

    const particlesJS =
      (window as any).particlesJS || (window as any).particlesjs;

    if (!particlesJS) {
      console.error("particles.js não disponível no window");
      return;
    }

    particlesJS(props.id, {
      particles: {
        number: { value: 60, density: { enable: true, value_area: 800 } },
        color: { value: "#99a3f4" },
        shape: { type: "circle" },
        opacity: { value: 0.4, random: true },
        size: { value: 3, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#99a3f4",
          opacity: 0.3,
          width: 1,
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
          bounce: false,
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          repulse: { distance: 100, duration: 0.4 },
          push: { particles_nb: 4 },
        },
      },
      retina_detect: true,
    });
  } catch (error) {
    console.error("Erro ao carregar script particles.js:", error);
  }
});
</script>

<template>
  <div
    :id="props.id"
    v-bind="$attrs"
  />
</template>

