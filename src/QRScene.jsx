import { useCallback, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import {
  moduleColor,
  jitter,
  buildTerrain,
  terrainHeight,
  terrainColor,
  FLAT,
  MAX_H,
  sceneBg,
} from './qrUtils'

const DURATION = 1.6 // seconds for a full morph
const SPREAD = 0.6 // how staggered the ripple is (0 = all at once)
const RIPPLE_SPEED = 12 // world units per second
const RIPPLE_AMP = 1.4 // how high the ring lifts cubes
const RIPPLE_LIFE = 3.5 // seconds before a ripple is dropped
const TWEEN_TIME = 0.45 // seconds for sea level / theme changes to ease in
const HOVER_AMP = 1.3 // how high the hovered cubes lift

const LIGHT = {
  day: {
    ambient: 0.7,
    ambientColor: '#ffffff',
    sun: 1.2,
    sunColor: '#ffffff',
    pos: [10, 30, 10],
  },
  night: {
    ambient: 0.35,
    ambientColor: '#7f94ff',
    sun: 0.7,
    sunColor: '#b8c7ff',
    pos: [-15, 25, -10],
  },
}

function Voxels({ matrix, expanded, sea, theme, onToggle }) {
  const ref = useRef()
  const progress = useRef(0)
  const drawn = useRef(-1)
  const timeRef = useRef(0)
  const ripples = useRef([])
  const hover = useRef({ x: 0, z: 0, tx: 0, tz: 0, s: 0, on: false })
  const tw = useRef({
    t: 1,
    fromH: null,
    fromC: null,
    toH: null,
    toC: null,
    shownH: null,
    shownC: null,
  })
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const color = useMemo(() => new THREE.Color(), [])
  const size = matrix.length
  const count = size * size

  const terrain = useMemo(() => buildTerrain(matrix), [matrix])

  const cells = useMemo(() => {
    const out = []
    const maxD = (size / 2) * Math.SQRT2
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const dx = c - size / 2 + 0.5
        const dz = r - size / 2 + 0.5
        const t = terrain[r][c]
        out.push({
          x: dx,
          z: dz,
          h: terrainHeight(t, sea),
          water: t < sea,
          delay: Math.sqrt(dx * dx + dz * dz) / maxD,
          c0: new THREE.Color(moduleColor(r, c, size, matrix[r][c], theme)),
          c1: new THREE.Color(terrainColor(t, sea, jitter(r, c), theme)),
        })
      }
    }
    return out
  }, [matrix, terrain, size, sea, theme])

  // NEW (1/3): a new URL replays the rise from flat
  useLayoutEffect(() => {
    progress.current = 0
  }, [matrix])

  // NEW (2/3): when heights/colours change, ease from what's on screen to the new values
  useLayoutEffect(() => {
    const T = tw.current
    const toH = new Float32Array(count)
    const toC = new Float32Array(count * 3)
    cells.forEach((cell, i) => {
      toH[i] = cell.h
      toC[i * 3] = cell.c1.r
      toC[i * 3 + 1] = cell.c1.g
      toC[i * 3 + 2] = cell.c1.b
    })
    if (!T.shownH || T.shownH.length !== count) {
      T.shownH = toH.slice() // first render or new grid size: no tween
      T.shownC = toC.slice()
      T.t = 1
    } else {
      T.fromH = T.shownH.slice()
      T.fromC = T.shownC.slice()
      T.t = 0
    }
    T.toH = toH
    T.toC = toC
  }, [cells, count])

  const draw = useCallback(
    (p, time, withColor) => {
      const mesh = ref.current
      const T = tw.current
      const hv = hover.current
      const live = ripples.current
      mesh.boundingSphere = null

      for (let i = 0; i < count; i++) {
        const cell = cells[i]
        const local = THREE.MathUtils.clamp(
          p * (1 + SPREAD) - cell.delay * SPREAD,
          0,
          1,
        )
        const e = local * local * (3 - 2 * local)
        let h = FLAT + (T.shownH[i] - FLAT) * e

        if (cell.water) {
          h += Math.sin(time * 1.8 + cell.x * 0.6 + cell.z * 0.45) * 0.22 * e
        }

        for (let k = 0; k < live.length; k++) {
          const age = time - live[k].t0
          const d = Math.hypot(cell.x - live[k].x, cell.z - live[k].z)
          const off = d - age * RIPPLE_SPEED
          h += Math.exp(-(off * off) / 3) * Math.exp(-age * 1.1) * RIPPLE_AMP
        }

        // NEW (3/3): hover lift
        if (hv.s > 0.001) {
          const dx = cell.x - hv.x
          const dz = cell.z - hv.z
          h += Math.exp(-(dx * dx + dz * dz) / 5) * HOVER_AMP * hv.s
        }

        dummy.position.set(cell.x, h / 2, cell.z)
        dummy.scale.set(1, h, 1)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)

        if (withColor) {
          const k = i * 3
          color.setRGB(
            cell.c0.r + (T.shownC[k] - cell.c0.r) * e,
            cell.c0.g + (T.shownC[k + 1] - cell.c0.g) * e,
            cell.c0.b + (T.shownC[k + 2] - cell.c0.b) * e,
          )
          mesh.setColorAt(i, color)
        }

      }
      mesh.instanceMatrix.needsUpdate = true
      if (withColor) mesh.instanceColor.needsUpdate = true
    },
    [cells, count, dummy, color],
  )

  useLayoutEffect(() => {
    draw(progress.current, timeRef.current, true)
    drawn.current = progress.current
  }, [draw])

  useFrame((_, delta) => {
    timeRef.current += delta
    const time = timeRef.current
    const target = expanded ? 1 : 0
    const morphing = progress.current !== target

    if (morphing) {
      const step = delta / DURATION
      progress.current =
        target > progress.current
          ? Math.min(target, progress.current + step)
          : Math.max(target, progress.current - step)
    }

    // ease the "shown" heights/colours toward the new targets
    const T = tw.current
    const tweening = T.t < 1
    if (tweening) {
      T.t = Math.min(1, T.t + delta / TWEEN_TIME)
      const e = T.t * T.t * (3 - 2 * T.t)
      for (let i = 0; i < count; i++) {
        T.shownH[i] = T.fromH[i] + (T.toH[i] - T.fromH[i]) * e
      }
      for (let k = 0; k < count * 3; k++) {
        T.shownC[k] = T.fromC[k] + (T.toC[k] - T.fromC[k]) * e
      }
    }

    // hover glides toward the pointer and fades in/out
    const hv = hover.current
    const hadHover = hv.on || hv.s > 0
    hv.x += (hv.tx - hv.x) * Math.min(1, delta * 12)
    hv.z += (hv.tz - hv.z) * Math.min(1, delta * 12)
    hv.s += ((hv.on ? 1 : 0) - hv.s) * Math.min(1, delta * 8)
    if (!hv.on && hv.s < 0.001) hv.s = 0

    const hadRipples = ripples.current.length > 0
    ripples.current = ripples.current.filter((rp) => time - rp.t0 < RIPPLE_LIFE)

    const animating = progress.current > 0 || hadRipples || hadHover
    if (
      !animating &&
      !morphing &&
      !tweening &&
      drawn.current === progress.current
    )
      return

    draw(progress.current, time, morphing || tweening)
    drawn.current = progress.current
  })

  return (
    <instancedMesh
      key={count}
      ref={ref}
      args={[null, null, count]}
      frustumCulled={false}
      onPointerMove={(e) => {
        const cell = cells[e.instanceId]
        if (!cell) return
        const hv = hover.current
        hv.tx = cell.x
        hv.tz = cell.z
        if (!hv.on) {
          hv.x = cell.x
          hv.z = cell.z
        } // no sliding in from the old spot
        hv.on = true
      }}
      onPointerOut={() => {
        hover.current.on = false
      }}
      onClick={(e) => {
        if (e.delta > 4) return
        e.stopPropagation()
        const cell = cells[e.instanceId]
        if (cell) {
          ripples.current.push({ x: cell.x, z: cell.z, t0: timeRef.current })
          if (ripples.current.length > 4) ripples.current.shift()
        }
        onToggle()
      }}
    >
      <boxGeometry args={[0.95, 1, 0.95]} />
      <meshStandardMaterial />
    </instancedMesh>
  )
}

function CameraRig({ size }) {
  const camera = useThree((s) => s.camera)
  const controls = useThree((s) => s.controls)
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))

  useLayoutEffect(() => {
    const target = new THREE.Vector3(0, MAX_H * 0.3, 0)

    // how far back the camera must sit so a sphere around the scene fits
    const vHalf = THREE.MathUtils.degToRad(camera.fov) / 2
    const hHalf = Math.atan(Math.tan(vHalf) * aspect)
    const radius = Math.hypot((size / 2) * Math.SQRT2, MAX_H / 2) * 1.1
    const dist = radius / Math.sin(Math.min(vHalf, hHalf))

    // keep whatever angle the camera is already at, just change the distance
    const dir = camera.position.clone().sub(target).normalize()
    camera.position.copy(target).addScaledVector(dir, dist)
    camera.lookAt(target)

    if (controls) {
      controls.target.copy(target)
      Object.assign(controls, {
        minDistance: dist * 0.5,
        maxDistance: dist * 1.6,
      })
      controls.update()
    }

  }, [size, aspect, camera, controls])

  return null
}


export default function QRScene({
  matrix,
  expanded,
  sea,
  theme,
  night,
  onToggle,
}) {
  const L = night ? LIGHT.night : LIGHT.day
  return (
    <Canvas
      camera={{ fov: 35, position: [30, 26, 30] }}
      gl={{ preserveDrawingBuffer: true }}
    >
      <color attach="background" args={[sceneBg(theme, night)]} />
      <ambientLight intensity={L.ambient} color={L.ambientColor} />
      <directionalLight position={L.pos} intensity={L.sun} color={L.sunColor} />
      <Voxels
        matrix={matrix}
        expanded={expanded}
        sea={sea}
        theme={theme}
        onToggle={onToggle}
      />
      <OrbitControls
        makeDefault
        enableDamping
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={expanded}
        autoRotateSpeed={0.8}
      />
      <CameraRig size={matrix.length} />
    </Canvas>
  )
}
