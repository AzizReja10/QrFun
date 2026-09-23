import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
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
} from './qrUtils'

const DURATION = 1.6 // seconds for a full morph
const SPREAD = 0.6 // how staggered the ripple is (0 = all at once)
const RIPPLE_SPEED = 12 // world units per second
const RIPPLE_AMP = 1.4 // how high the ring lifts cubes
const RIPPLE_LIFE = 3.5 // seconds before a ripple is dropped
const TWEEN_TIME = 0.45 // seconds for sea level / theme changes to ease in
const HOVER_AMP = 1.3 // how high the hovered cubes lift

const LIGHT = {
  ambient: 0.7,
  ambientColor: '#ffffff',
  sun: 1.2,
  sunColor: '#ffffff',
  pos: [10, 30, 10],
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

function shortestAngleDiff(from, to) {
  const twoPi = Math.PI * 2
  let diff = (to - from) % twoPi
  if (diff > Math.PI) diff -= twoPi
  if (diff < -Math.PI) diff += twoPi
  return diff
}

function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function CameraController({
  worldSize,
  expanded,
  align2DTrigger,
  controlsRef,
  margin = 1.18,
}) {
  const camera = useThree((s) => s.camera)
  const viewport = useThree((s) => s.size)
  const prevExpanded = useRef(expanded)
  const animRef = useRef(null)
  const initialFitDone = useRef(false)

  // Calculate straight 2D distance so the QR code fits the viewport with margin
  const getTopDownDistance = useCallback(() => {
    const aspect = viewport.width / Math.max(1, viewport.height)
    const fov = (camera.fov * Math.PI) / 180
    const half = (worldSize / 2) * margin
    const distH = half / Math.tan(fov / 2)
    const distW = half / (Math.tan(fov / 2) * aspect)
    return Math.max(distH, distW)
  }, [camera.fov, viewport.width, viewport.height, worldSize, margin])

  // Calculate 3D perspective distance
  const get3DDistance = useCallback(() => {
    const aspect = viewport.width / Math.max(1, viewport.height)
    const fov = (camera.fov * Math.PI) / 180
    const radius = (worldSize * Math.SQRT2 * margin * 1.05) / 2
    const distH = radius / Math.tan(fov / 2)
    const distW = radius / (Math.tan(fov / 2) * aspect)
    return Math.max(distH, distW)
  }, [camera.fov, viewport.width, viewport.height, worldSize, margin])

  const snapOrAnimateTo2D = useCallback(
    (animate = true) => {
      const dist = getTopDownDistance()
      const targetRadius = dist
      const targetPhi = 0.001 // tiny angle from Y-axis so cross(up, lookAt) never degenerates
      const targetTheta = 0
      const targetLook = new THREE.Vector3(0, 0, 0)

      if (!animate) {
        const targetSpherical = new THREE.Spherical(targetRadius, targetPhi, targetTheta)
        const targetOffset = new THREE.Vector3().setFromSpherical(targetSpherical)
        camera.position.copy(targetLook).add(targetOffset)
        camera.up.set(0, 1, 0)
        camera.lookAt(targetLook)
        camera.updateProjectionMatrix()
        if (controlsRef.current) {
          controlsRef.current.target.copy(targetLook)
          if (controlsRef.current._sphericalDelta) {
            controlsRef.current._sphericalDelta.set(0, 0, 0)
          }
          controlsRef.current.enabled = true
          controlsRef.current.update()
        }
        return
      }

      const startTarget = controlsRef.current
        ? controlsRef.current.target.clone()
        : new THREE.Vector3(0, 0, 0)

      // Calculate current offset from target in spherical coordinates
      const startOffset = new THREE.Vector3().copy(camera.position).sub(startTarget)
      const startSpherical = new THREE.Spherical().setFromVector3(startOffset)
      startSpherical.phi = Math.max(0.0005, startSpherical.phi)

      const dTheta = shortestAngleDiff(startSpherical.theta, targetTheta)
      const dPhi = targetPhi - startSpherical.phi
      const dRadius = targetRadius - startSpherical.radius

      // Temporarily disable OrbitControls to avoid fighting/jitter during flight
      if (controlsRef.current) {
        controlsRef.current.enabled = false
      }

      animRef.current = {
        startSpherical,
        dTheta,
        dPhi,
        dRadius,
        targetTheta,
        targetPhi,
        targetRadius,
        startTarget,
        targetLook,
        startTime: performance.now(),
        duration: 700,
      }
    },
    [camera, getTopDownDistance, controlsRef],
  )

  const snapOrAnimateTo3D = useCallback(() => {
    const dist = get3DDistance()
    const targetRadius = dist
    const targetPhi = Math.PI / 4 // 45 degrees elevation
    const targetTheta = 0
    const targetLook = new THREE.Vector3(0, 0, 0)

    const startTarget = controlsRef.current
      ? controlsRef.current.target.clone()
      : new THREE.Vector3(0, 0, 0)

    const startOffset = new THREE.Vector3().copy(camera.position).sub(startTarget)
    const startSpherical = new THREE.Spherical().setFromVector3(startOffset)
    startSpherical.phi = Math.max(0.0005, startSpherical.phi)

    const dTheta = shortestAngleDiff(startSpherical.theta, targetTheta)
    const dPhi = targetPhi - startSpherical.phi
    const dRadius = targetRadius - startSpherical.radius

    if (controlsRef.current) {
      controlsRef.current.enabled = false
    }

    animRef.current = {
      startSpherical,
      dTheta,
      dPhi,
      dRadius,
      targetTheta,
      targetPhi,
      targetRadius,
      startTarget,
      targetLook,
      startTime: performance.now(),
      duration: 750,
    }
  }, [camera, get3DDistance, controlsRef])

  // Initial setup: start straight aligned in 2D
  useEffect(() => {
    if (!initialFitDone.current) {
      initialFitDone.current = true
      if (!expanded) {
        snapOrAnimateTo2D(false)
      } else {
        const dist = get3DDistance()
        const targetSpherical = new THREE.Spherical(dist, Math.PI / 4, 0)
        camera.position.setFromSpherical(targetSpherical)
        camera.up.set(0, 1, 0)
        camera.lookAt(0, 0, 0)
        camera.updateProjectionMatrix()
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0)
          controlsRef.current.update()
        }
      }
    }
  }, [expanded, snapOrAnimateTo2D, get3DDistance, camera, controlsRef])

  // Explicit align 2D button clicked
  useEffect(() => {
    if (align2DTrigger) {
      snapOrAnimateTo2D(true)
    }
  }, [align2DTrigger, snapOrAnimateTo2D])

  // Expanded toggled (reveal / flatten)
  useEffect(() => {
    if (prevExpanded.current !== expanded) {
      prevExpanded.current = expanded
      if (!expanded) {
        snapOrAnimateTo2D(true)
      } else {
        snapOrAnimateTo3D()
      }
    }
  }, [expanded, snapOrAnimateTo2D, snapOrAnimateTo3D])

  // Smooth camera flight
  useFrame(() => {
    if (animRef.current) {
      const anim = animRef.current
      const elapsed = performance.now() - anim.startTime
      const progress = Math.min(1, elapsed / anim.duration)
      const t = easeInOutCubic(progress)

      const curTheta = anim.startSpherical.theta + anim.dTheta * t
      const curPhi = Math.max(0.0005, anim.startSpherical.phi + anim.dPhi * t)
      const curRadius = anim.startSpherical.radius + anim.dRadius * t

      const curSpherical = new THREE.Spherical(curRadius, curPhi, curTheta)
      const curOffset = new THREE.Vector3().setFromSpherical(curSpherical)
      const curTarget = new THREE.Vector3().lerpVectors(anim.startTarget, anim.targetLook, t)

      camera.position.copy(curTarget).add(curOffset)
      camera.up.set(0, 1, 0)
      camera.lookAt(curTarget)

      if (controlsRef.current) {
        controlsRef.current.target.copy(curTarget)
      }

      if (progress >= 1) {
        const finalSpherical = new THREE.Spherical(
          anim.targetRadius,
          anim.targetPhi,
          anim.targetTheta,
        )
        const finalOffset = new THREE.Vector3().setFromSpherical(finalSpherical)
        camera.position.copy(anim.targetLook).add(finalOffset)
        camera.up.set(0, 1, 0)
        camera.lookAt(anim.targetLook)
        camera.updateProjectionMatrix()

        if (controlsRef.current) {
          controlsRef.current.target.copy(anim.targetLook)
          if (controlsRef.current._sphericalDelta) {
            controlsRef.current._sphericalDelta.set(0, 0, 0)
          }
          controlsRef.current.enabled = true
          controlsRef.current.update()
        }
        animRef.current = null
      }
    }
  })

  // Ensure controls re-enabled if unmounted
  useEffect(() => {
    const controls = controlsRef.current
    return () => {
      if (controls) {
        controls.enabled = true
      }
    }
  }, [controlsRef])

  return null
}

export default function QRScene({
  matrix,
  expanded,
  sea,
  theme,
  onToggle,
  align2DTrigger = 0,
}) {
  const controlsRef = useRef()
  const moduleCount = matrix.length
  const cellSize = 1

  return (
    <Canvas
      camera={{ position: [0, 10, 10], fov: 45 }}
      gl={{ preserveDrawingBuffer: true, alpha: true }}
    >
      <color attach="background" args={[theme?.bg || '#f3efe4']} />
      <ambientLight intensity={LIGHT.ambient} color={LIGHT.ambientColor} />
      <directionalLight position={LIGHT.pos} intensity={LIGHT.sun} color={LIGHT.sunColor} />
      <Voxels
        matrix={matrix}
        expanded={expanded}
        sea={sea}
        theme={theme}
        onToggle={onToggle}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        maxPolarAngle={Math.PI / 2.1}
        autoRotate={expanded}
        autoRotateSpeed={0.8}
      />
      <CameraController
        worldSize={moduleCount * cellSize}
        expanded={expanded}
        align2DTrigger={align2DTrigger}
        controlsRef={controlsRef}
      />
    </Canvas>
  )
}
