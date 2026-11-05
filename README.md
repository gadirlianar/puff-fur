<div align="center">

# 🐾 Mochi-Puff — Real-Time 3D GPU Fur & Hair Simulation

[![Three.js](https://img.shields.io/badge/Three.js-r169-black?logo=three.js)](https://threejs.org/)
[![WebGL2 / GPGPU](https://img.shields.io/badge/WebGL2-GPGPU%20Physics-blue)](https://www.khronos.org/webgl/)
[![GLSL](https://img.shields.io/badge/GLSL-Custom%20Shaders-orange)](https://www.khronos.org/opengl/wiki/OpenGL_Shading_Language)
[![Vite](https://img.shields.io/badge/Vite-Bundler-646CFF?logo=vite)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An interactive, high-performance **3D WebGL2 / GPGPU Fur Physics** and **Marschner Physical Hair Shading** simulation engineered for modern web browsers. Features procedural soft-body creature anatomy, hybrid dual-pipeline fur rendering, GPU-driven spring dynamics, interactive grooming/booping, and an augmented reality (AR) camera view with real-time lighting estimation.

[**Live Demo**](https://puff-fur.vercel.app/) · [**Report Issue**](https://github.com/gadirlianar/puff-fur/issues)

</div>

---

## 🌟 Highlights & Technical Overview

### 1. 🧵 Hybrid Dual-Pipeline Fur Rendering
- **64 Volumetric Shell Layers:** Mesh normal extrusion using hardware instancing for dense, soft, and velvety under-fur volume (32 shells in fallback mode).
- **60,000 Instanced 3D Hair Strands:** 20-segment hair ribbons dynamically oriented toward the camera (cylindrical billboarding) with procedural root-to-tip tapering.
- **Procedural Clumping & Grooming:** 420 surface clump centroids generating realistic tufts, combined with a continuous head-to-body grooming vector flow.

### 2. 💎 Marschner & Kajiya-Kay Physical Hair BSDF
- **Dual Specular Lobes (R & TRT):** Cuticle surface reflection shifted toward hair roots (-0.16 rad) alongside internal pigment reflection shifted toward tips (+0.24 rad).
- **Forward Subsurface Transmission (TT):** Backlit rim scattering and deep translucency based on optical strand thickness.
- **Beer-Lambert Self-Shadowing:** Volumetric light attenuation through dense fur coats with follicle ambient occlusion (AO).

### 3. ⚡ GPGPU Ping-Pong Verlet Physics
- **128×128 (16,384 patches) Parallel GPU Simulation:** Real-time spring-damper physics computed via ping-pong render targets (`GPUComputationRenderer`).
- **Wind Turbulence & Inertia:** 3D pseudo-curl wind gusts paired with linear and rotational body inertia follow-through.
- **Interactive Force Fields:** Cursor raycasting generates local grooming/parting impulses and elastic "boop" radial shockwave ripples.
- **Graceful WebGL Fallback:** Automatic switch to analytical spring dynamics on devices with limited floating-point texture support.

### 4. 🪞 Procedural Anatomical Creature ("Mochi-Puff")
- Procedural spherical sculpting with organic pear silhouette, perky ears, stubby limbs, and recessed eye sockets.
- Multi-layered physical cornea/iris with smooth saccadic eye tracking toward the user's cursor.
- Rhythmic breathing animations and elastic squash-and-stretch bounce dynamics.

### 5. 📷 Multi-Environment & Live AR Camera
- **Studio:** High-contrast 3-point lighting setup with soft PCF shadows and an infinite dark cyclorama.
- **Cloud Sky:** 360° blue sky with procedural volumetric cloud sea.
- **Cozy Desk:** Tilt-shift miniature scale setup with warm dusk interior lighting.
- **AR View:** Live camera stream (`MediaDevices.getUserMedia`) with surface plane detection, hit-testing, and dynamic ambient color temperature estimation.

### 6. 🌾 Bonus: GPU Grass Painter (`grass.html`)
- An interactive 100,000-blade GPU instanced grass field with real-time deformable terrain brushing and wind simulation.

---

## 🎮 Interactive Controls

| Action | Control | Description |
| :--- | :--- | :--- |
| **Pet & Comb** | `Left-click & Drag across body` | Parts fur and grooms strands along drag trajectory |
| **Boop Creature** | `Click creature body` | Triggers an elastic squash bounce and radial fur shockwave |
| **Orbit Camera** | `Drag on background` | 360° camera orbit with smooth damping |
| **Zoom** | `Mouse Wheel / Pinch` | Smooth zoom in and out |
| **Fur Styling** | `Side Glassmorphic Panel` | Real-time control of length, density, clumping, curliness, roughness, specular, and base/tip colors |
| **Presets** | `Top Presets Menu` | Instant switching between *Sakura Mochi*, *Golden Fluff*, *Midnight Velvet*, and *Matcha Puff* |
| **AR Placement** | `Tap detected surface (AR Mode)` | Places Mochi-Puff at estimated depth and surface plane |

---

## 🛠️ Tech Stack & Architecture

- **Core Engine:** [Three.js](https://threejs.org/) (r169)
- **Graphics Pipeline:** WebGL2, GPGPU Ping-Pong Render Targets, Custom GLSL Shaders
- **Build Tool:** [Vite](https://vitejs.dev/)
- **UI Architecture:** Glassmorphic pure safe DOM components with CSS backdrop filters
- **Language:** JavaScript (ESNext), GLSL, TypeScript definitions

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- `npm` or `yarn` / `pnpm` / `bun`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/gadirlianar/puff-fur.git
   cd puff-fur
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Available Scripts

- `npm run dev` — Starts the Vite local development server on port 3000.
- `npm run build` — Compiles production-optimized bundles into `dist/`.
- `npm run preview` — Previews the production build locally.
- `npm start` — Runs the bundled Node.js static server (`server.js`).

---

## 📦 Deployment

### Deploy with Vercel
Deploying to Vercel requires zero configuration thanks to the included `vercel.json`:
```bash
npx vercel --prod
```
Official Live Demo: [https://puff-fur.vercel.app](https://puff-fur.vercel.app/)

### Deploy with Docker
```bash
# Build Docker image
docker build -t puff-fur .

# Run container on port 3000
docker run -p 3000:3000 puff-fur
```

### Run with Node.js Server
```bash
npm run build
npm start
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Anar Gadirli**
- GitHub: [@gadirlianar](https://github.com/gadirlianar)
- Project Repository: [puff-fur](https://github.com/gadirlianar/puff-fur)
