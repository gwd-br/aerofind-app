<template>
  <!-- <div class="flex items-center"> -->
  <!-- <Button
      type="button"
      size="sm"
      variant="outline"
      :class="ingresso.portador?.face_url ? 'bg-green-200 text-green-700' : ''"
      @click="open = true"
    >
      {{ ingresso.portador?.face_url ? "Face capturada" : "Capturar face" }}
    </Button> -->

  <Dialog :open="open" @update:open="onOpenChange">
    <DialogContent class="sm:max-w-md" :show-close-button="true">
      <DialogHeader>
        <DialogTitle>Capturar face</DialogTitle>
        <DialogDescription>
          Posicione seu rosto no círculo e toque em "Continuar".
        </DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4">
        <!-- Área da câmera com moldura oval -->
        <div
          class="relative w-full overflow-hidden rounded-lg bg-black"
          style="aspect-ratio: 3/4; max-height: 420px"
        >
          <div
            v-if="!isClient"
            class="absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-muted-foreground"
          >
            A captura de face só está disponível no navegador.
          </div>

          <template v-else>
            <!-- Vídeo ao vivo -->
            <video
              ref="videoRef"
              id="face-live-video"
              autoplay
              playsinline
              muted
              class="absolute inset-0 h-full w-full object-cover"
            />
            <!-- Canvas oculto para detecção -->
            <canvas
              ref="canvasRef"
              id="face-live-canvas"
              width="640"
              height="480"
              class="pointer-events-none absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 object-cover opacity-0"
              style="
                max-width: none;
                max-height: none;
                width: 640px;
                height: 480px;
              "
            />
            <!-- Overlay escuro com recorte oval -->
            <div
              class="absolute inset-0"
              style="
                background: rgba(0, 0, 0, 0.45);
                mask-image: radial-gradient(
                  ellipse 42% 52% at 50% 50%,
                  transparent 100%,
                  black 100%
                );
                -webkit-mask-image: radial-gradient(
                  ellipse 42% 52% at 50% 50%,
                  transparent 100%,
                  black 100%
                );
                mask-size: 100% 100%;
                -webkit-mask-size: 100% 100%;
              "
            />
            <!-- Borda oval azul (guia) -->
            <svg
              class="absolute inset-0 h-full w-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <ellipse
                cx="50"
                cy="50"
                rx="42"
                ry="52"
                fill="none"
                stroke="rgb(59, 130, 246)"
                stroke-width="0.8"
              />
            </svg>
            <!-- Balão de instrução dinâmica -->
            <div
              v-if="isCameraStarted && instructionMessage"
              class="absolute left-1/2 top-[18%] z-10 -translate-x-1/2 px-3 py-2 rounded-lg bg-gray-800/95 text-white text-sm font-medium shadow-lg whitespace-nowrap"
            >
              {{ instructionMessage }}
            </div>
          </template>
        </div>

        <!-- Botão Continuar -->
        <Button
          type="button"
          class="w-full"
          :disabled="!isFramed || !isCameraStarted || loadingModels"
          @click="captureAndClose"
        >
          Continuar
        </Button>

        <!-- Estado quando câmera não iniciou -->
        <p
          v-if="!isCameraStarted && isClient"
          class="text-center text-xs text-muted-foreground"
        >
          <span v-if="loadingModels">Carregando modelos…</span>
          <span v-else-if="!modelsLoaded">Aguarde os modelos carregarem.</span>
          <span v-else>
            <button
              type="button"
              class="text-primary underline underline-offset-2"
              @click="startCamera"
            >
              Iniciar câmera
            </button>
            para começar.
          </span>
        </p>
      </div>
    </DialogContent>
  </Dialog>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted, nextTick } from "vue";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Ingresso } from "@/types/ingresso";
import { toast } from "vue-sonner";
import { useNuxtApp } from "#app";

const props = defineProps<{
  open: boolean;
  ingresso: Ingresso;
}>();

const emit = defineEmits<{
  (e: "update:open", value: boolean): void;
  (e: "updated"): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isCameraStarted = ref(false);
const loadingModels = ref(false);
const modelsLoaded = ref(false);
const isClient = typeof window !== "undefined";
const submitting = ref(false);

/** Mensagem exibida no balão (aproximar, afastar, centralizar, etc.) */
const instructionMessage = ref("Posicione seu rosto no círculo");
/** Rosto enquadrado corretamente — habilita "Continuar" */
const isFramed = ref(false);

// Parâmetros do oval no canvas (640x480): centro e semi-eixos
const OVAL_CX = 320;
const OVAL_CY = 240;
const OVAL_RX = 128;
const OVAL_RY = 120;
/** Largura mínima do rosto (px) — maior = precisa aproximar mais para preencher o oval */
const FACE_MIN_WIDTH = 280;
const FACE_MAX_WIDTH = 340;
const FRAME_TOLERANCE = 1.15;

let videoStream: MediaStream | null = null;
let faceSDK: any = null;
let detectSession: any = null;
let animationFrameId: number | null = null;
const { $api } = useNuxtApp();

function isInsideEllipse(cx: number, cy: number): boolean {
  const nx = (cx - OVAL_CX) / OVAL_RX;
  const ny = (cy - OVAL_CY) / OVAL_RY;
  return nx * nx + ny * ny <= FRAME_TOLERANCE;
}

function updateInstruction(
  faceW: number,
  centerX: number,
  centerY: number,
): void {
  const inside = isInsideEllipse(centerX, centerY);
  if (faceW < FACE_MIN_WIDTH) {
    instructionMessage.value = "Aproxime-se mais";
    isFramed.value = false;
    return;
  }
  if (faceW > FACE_MAX_WIDTH) {
    instructionMessage.value = "Afaste-se um pouco";
    isFramed.value = false;
    return;
  }
  if (!inside) {
    instructionMessage.value = "Centralize o rosto no círculo";
    isFramed.value = false;
    return;
  }
  instructionMessage.value = "Posição correta";
  isFramed.value = true;
}

async function loadModels() {
  if (!process.client) return;
  if (modelsLoaded.value || loadingModels.value) return;

  loadingModels.value = true;
  try {
    // Garante que OpenCV/kby-face sejam carregados apenas UMA vez
    // mesmo com múltiplas montagens do componente ou HMR.
    const globalAny = window as any;

    if (!globalAny.__kbyFaceLoadPromise) {
      globalAny.__kbyFaceLoadPromise = (async () => {
        const ort = await import("onnxruntime-web");
        const base =
          typeof window !== "undefined" ? window.location.origin + "/" : "/";
        ort.env.wasm.wasmPaths = base;

        const mod = await import("kby-face");

        await mod.load_opencv();
        const session = await mod.loadDetectionModel();

        return { mod, session };
      })();
    }

    const { mod, session } = await globalAny.__kbyFaceLoadPromise;
    faceSDK = mod;
    detectSession = session;
    modelsLoaded.value = true;
  } catch (error) {
    console.error(error);
    toast.error("Erro ao carregar modelos de reconhecimento facial.");
  } finally {
    loadingModels.value = false;
  }
}

async function startCamera() {
  if (!process.client) return;

  await loadModels();
  if (!modelsLoaded.value || !faceSDK || !detectSession) return;

  try {
    if (!navigator?.mediaDevices?.getUserMedia) {
      toast.error("Este navegador não suporta acesso à câmera.");
      return;
    }

    videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = videoRef.value;
    if (!video) return;

    video.srcObject = videoStream;
    await video.play();
    isCameraStarted.value = true;
    instructionMessage.value = "Posicione seu rosto no círculo";
    isFramed.value = false;
    startDetectionLoop();
  } catch (error) {
    console.error(error);
    toast.error("Não foi possível acessar a câmera.");
  }
}

function stopCamera() {
  isCameraStarted.value = false;
  isFramed.value = false;
  instructionMessage.value = "Posicione seu rosto no círculo";

  if (animationFrameId != null && typeof cancelAnimationFrame !== "undefined") {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }

  if (videoStream) {
    videoStream.getTracks().forEach((track) => track.stop());
    videoStream = null;
  }
}

function startDetectionLoop() {
  const loop = async () => {
    if (!isCameraStarted.value) return;

    const video = videoRef.value;
    const canvas = canvasRef.value;
    if (!video || !canvas) {
      animationFrameId = requestAnimationFrame(loop);
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      animationFrameId = requestAnimationFrame(loop);
      return;
    }

    const width = canvas.width;
    const height = canvas.height;
    ctx.drawImage(video, 0, 0, width, height);

    try {
      if (modelsLoaded.value && faceSDK && detectSession) {
        const detectionResult = await faceSDK.detectFace(
          detectSession,
          "face-live-canvas",
        );
        const bbox = detectionResult.bbox;
        const faceCount = bbox.shape[0];
        const bboxSize = bbox.shape[1];

        if (faceCount > 0) {
          const x1 = bbox.data[0];
          const y1 = bbox.data[1];
          const x2 = bbox.data[2];
          const y2 = bbox.data[3];
          const w = Math.abs(x2 - x1);
          const h = Math.abs(y2 - y1);
          const cx = (x1 + x2) / 2;
          const cy = (y1 + y2) / 2;
          updateInstruction(w, cx, cy);
        } else {
          instructionMessage.value = "Posicione seu rosto no círculo";
          isFramed.value = false;
        }
      }
    } catch {
      instructionMessage.value = "Posicione seu rosto no círculo";
      isFramed.value = false;
    }

    animationFrameId = requestAnimationFrame(loop);
  };

  animationFrameId = requestAnimationFrame(loop);
}

function captureAndClose() {
  if (!isFramed.value || !videoRef.value) return;
  if (!props.ingresso.id || !props.ingresso.portador_fk) {
    toast.error("Este ingresso não possui portador vinculado.");
    return;
  }

  const video = videoRef.value;
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  const ctx = tempCanvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(video, 0, 0);
  const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.92);

  tempCanvas.toBlob(
    async (blob) => {
      if (!blob) return;

      const formData = new FormData();
      const file = new File([blob], "face.jpg", { type: "image/jpeg" });
      formData.append("arquivo", file);

      submitting.value = true;
      try {
        await $api(
          `ingressos/${props.ingresso.id}/portadores/${props.ingresso.portador_fk}`,
          {
            method: "POST",
            body: formData,
          },
        );

        emit("update:open", false);
        stopCamera();
        toast.success("Face capturada e enviada com sucesso.");
        emit("updated");
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "Erro ao enviar a face do portador. Tente novamente.";
        toast.error(msg);
      } finally {
        submitting.value = false;
      }
    },
    "image/jpeg",
    0.92,
  );
}

function onOpenChange(value: boolean) {
  if (!value) {
    stopCamera();
    emit("update:open", false);
  } else if (process.client) {
    emit("update:open", true);
    startCamera();
    // nextTick(() => startCamera());
  }
}

onMounted(() => {
  if (!process.client) return;
  loadModels();
});

onBeforeUnmount(() => {
  stopCamera();
});
</script>
