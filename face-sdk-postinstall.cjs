const fs = require("fs");
const path = require("path");

// Diretório do projeto (raiz)
const rootDir = __dirname;

// Copia arquivos do onnxruntime-web para a pasta public/
let srcFolder = path.join(rootDir, "node_modules", "onnxruntime-web", "dist");
let destFolder = path.join(rootDir, "public");

if (!fs.existsSync(destFolder)) {
  fs.mkdirSync(destFolder);
}

const ortFiles = [
  "ort-wasm.wasm",
  "ort-wasm-simd.wasm",
  "ort-wasm-threaded.wasm",
  "ort-wasm-simd-threaded.wasm",
  "ort-wasm-simd-threaded.jsep.wasm",
  "ort-wasm-simd-threaded.jsep.mjs",
  "ort.min.js",
];

for (const file of ortFiles) {
  const src = path.join(srcFolder, file);
  const dest = path.join(destFolder, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// Cria pasta public/js se não existir
destFolder = path.join(rootDir, "public", "js");
if (!fs.existsSync(destFolder)) {
  fs.mkdirSync(destFolder, { recursive: true });
}

// Copia modelos do kby-face para public/model
srcFolder = path.join(rootDir, "node_modules", "kby-face", "model");
destFolder = path.join(rootDir, "public", "model");
if (!fs.existsSync(destFolder)) {
  fs.mkdirSync(destFolder, { recursive: true });
}

const modelFiles = [
  "fr_pose.onnx",
  "fr_detect.onnx",
  "fr_expression.onnx",
  "fr_eye.onnx",
  "fr_landmark.onnx",
  "fr_liveness.onnx",
  "fr_feature.onnx",
  "fr_age.onnx",
  "fr_gender.onnx",
];

for (const file of modelFiles) {
  const src = path.join(srcFolder, file);
  const dest = path.join(destFolder, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

// Copia scripts JS do kby-face (OpenCV, etc.) para public/js
srcFolder = path.join(rootDir, "node_modules", "kby-face", "js");
destFolder = path.join(rootDir, "public", "js");

const jsFiles = ["opencv.js", "opencv_js.js", "opencv_js.wasm"];

for (const file of jsFiles) {
  const src = path.join(srcFolder, file);
  const dest = path.join(destFolder, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
}

