# ⬛ QR Studio (QrFun)

<p align="center">
  <img src="public/favicon.svg" alt="QR Studio Logo" width="96" height="96" />
</p>

<h3 align="center">Procedural 3D Voxel QR Engine & Interactive Terrain Generator</h3>

<p align="center">
  Transform standard 2D QR codes into stunning, interactive 3D voxel islands with procedural terrain heightmaps, fluid wave dynamics, real-time ISO/IEC 18004 scannability validation, and smooth spherical camera orbital controls.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Three.js-0.186-black?style=flat-square&logo=three.js" alt="Three.js" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Styled--Components-6-db7093?style=flat-square&logo=styled-components" alt="Styled Components" />
  <img src="https://img.shields.io/badge/Oxlint-Clean-green?style=flat-square" alt="Oxlint Clean" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT License" />
</p>

---

## ✨ Features

### 🧊 Procedural 3D Voxel Engine
- **Instant Matrix Synthesis**: Dynamically converts any text or URL payload into an optimized QR matrix using `qrcode`.
- **Procedural Heightmap & Biomes**: Applies a 2-pass $3\times3$ box blur over the QR matrix combined with radial height cones and Perlin-style jitter to sculpt natural terrain out of digital data.
- **InstancedMesh Architecture**: Renders hundreds of animated voxels in a single draw call via Three.js `InstancedMesh` with dynamic matrix transformation and per-instance color buffers.
- **Fluid Wave & Ripple Dynamics**: Interactive ripple waves propagate across the voxels on click, with idle sinusoidal wave motion simulating sea-level water voxels.

### 🎯 ISO/IEC 18004 Scannability Radar
- **Real-Time Computer Vision**: Leverages `jsQR` to continuously scan and validate that the generated 3D QR matrix remains 100% scannable by smartphone cameras.
- **Beacon Status Badge**: Animated neo-brutalist beacon indicator displays live verification status:
  - 🟢 **Scannable**: Verified scannable by barcode readers.
  - 🔴 **Compromised**: Alerts if excessive terrain elevation or low contrast impairs scanner readability.

### 🎥 Spherical Camera Orbital Alignment
- **"Align 2D Straight" Engine**: Smoothly animates the camera from any misaligned 3D rotation, pitch, or tilt back to a perfectly orthogonal, top-down view.
- **Shortest Angular Path ($\theta$)**: Computes shortest-arc azimuth interpolation without wild spinning or gimbal-lock singularities.
- **Damping Velocity Sync**: Seamlessly coordinates with `OrbitControls`, disabling input during cubic-eased transitions and resetting velocity to eliminate snapping.

### 🎨 Retro-Pop Neo-Brutalist Interface
- **Tactile Neo-Brutalist Design**: Solid 2px black borders, warm `#fffdeb` cream cards, vibrant `#bae6fd` pastel containers, and hard $4\text{px}$ offset drop shadows (`box-shadow: 4px 4px 0px #000`).
- **6 Curated Biomes**:
  - 🌿 **Meadow**: Lush greens, warm sand, and vibrant spring floral modules.
  - 🏜️ **Desert**: Golden dunes, sun-baked clay, and turquoise oasis waters.
  - ❄️ **Arctic**: Crisp glaciers, ice sheets, and frost-blue streams.
  - 🌅 **Sunset**: Warm coral, dusk amber, and deep dusk-purple accents.
  - ⚡ **Cyberpunk**: High-contrast neon magenta and electric cyan highlights.
  - 🌑 **Obsidian**: Volcanic dark modules paired with crisp contrast.
- **Adjustable Sea Level**: Real-time slider submerges lower modules underwater while keeping critical finder patterns elevated and readable.

### 📸 Studio 4K PNG Export
- Exports pixel-perfect, crisp square images composited against custom background palettes for digital publishing or physical printing.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Component architecture and state management |
| **Three.js & @react-three/fiber** | WebGL 3D rendering pipeline and scene graph |
| **@react-three/drei** | Camera controls and 3D utility helpers |
| **styled-components 6** | Neo-Brutalist CSS-in-JS component system |
| **Framer Motion** | Fluid layout transitions and entry micro-animations |
| **jsQR & qrcode** | Barcode encoding and real-time computer vision decoding |
| **Lucide React** | Clean, minimalist SVG iconography |
| **Vite 8 & Oxlint** | Lightning-fast HMR bundler and high-performance linter |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.0.0` or higher
- **Package Manager**: `npm`, `pnpm`, or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AzizReja10/QrFun.git
   cd QrFun
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📜 Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite dev server with Hot Module Replacement (HMR) |
| `npm run build` | Builds optimized production bundle into `dist/` |
| `npm run preview` | Locally previews the production build |
| `npm run lint` | Runs `oxlint` to check for syntax and React hook issues |

---

## 📂 Project Structure

```text
qr-studio/
├── public/
│   ├── favicon.svg             # Neo-Brutalist 3D QR Voxel favicon
│   └── icons.svg               # SVG sprite definitions
├── src/
│   ├── components/
│   │   ├── Align2DButton.jsx   # Dedicated "Align 2D Straight" tactile button
│   │   ├── DownloadButton.jsx  # Neo-brutalist PNG download button
│   │   ├── ElevateButton.jsx   # "Reveal 3D / Flatten" morph toggle
│   │   ├── Header.jsx          # Neo-brutalist card header with scannable badge
│   │   ├── ScannableBadge.jsx  # Live ISO/IEC 18004 scannability radar
│   │   └── StudioControls.jsx  # Neo-brutalist right-side controls panel
│   ├── App.css                 # Studio layout and global responsive rules
│   ├── App.jsx                 # Application entry, state & export pipeline
│   ├── index.css               # Core CSS reset and typography
│   ├── main.jsx                # React root mount
│   ├── QRScene.jsx             # Three.js Canvas, Voxels & CameraController
│   ├── qrUtils.js              # Matrix generator, biomes & terrain synthesis
│   └── scanCheck.js            # Real-time jsQR validation engine
├── index.html                  # HTML5 entry with metadata
├── package.json                # Project dependencies and build scripts
└── vite.config.js              # Vite configuration
```

---

## 🧠 How the Procedural Voxel Engine Works

1. **Matrix Encoding**:
   The input string is passed through `qrcode.create()` with Error Correction Level **H** (30% redundancy) or **M** to maximize scan reliability when voxels are elevated.

2. **Terrain Synthesis**:
   A 2D array representation of the matrix is smoothed using two passes of a $3\times3$ box blur:
   $$\bar{V}_{r,c} = \frac{1}{|N|} \sum_{(i,j) \in N(r,c)} V_{i,j}$$
   A center-weighted radial cone equation elevates modules toward the middle of the island while preserving flat water at sea level.

3. **Spherical Flight Dynamics**:
   When re-aligning the camera to 2D, the engine computes:
   $$\Delta\theta = ((\theta_{\text{target}} - \theta_{\text{current}} + \pi) \pmod{2\pi}) - \pi$$
   This ensures the camera always takes the shortest orbital arc back to $0^\circ$ azimuth and $0.001\text{ rad}$ polar tilt, landing without gimbal lock or axis flipping.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).
