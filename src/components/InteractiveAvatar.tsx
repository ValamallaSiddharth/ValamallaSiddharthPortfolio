import { useEffect, useRef, useState, useCallback } from 'react'
import { Sparkles, Terminal, Cpu } from 'lucide-react'

// ============================================================================
// Mat4 Matrix Mathematics for Hardware-Accelerated 3D Transforms
// ============================================================================
type Mat4 = Float32Array

function mat4Create(): Mat4 {
  const out = new Float32Array(16)
  out[0] = out[5] = out[10] = out[15] = 1
  return out
}

function mat4Identity(out: Mat4): Mat4 {
  out.fill(0)
  out[0] = out[5] = out[10] = out[15] = 1
  return out
}

function mat4Multiply(out: Mat4, a: Mat4, b: Mat4): Mat4 {
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
  const a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15]

  for (let i = 0; i < 16; i += 4) {
    const b0 = b[i], b1 = b[i + 1], b2 = b[i + 2], b3 = b[i + 3]
    out[i] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[i + 1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[i + 2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[i + 3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
  }
  return out
}

function mat4Perspective(out: Mat4, fovy: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1.0 / Math.tan(fovy / 2), nf = 1 / (near - far)
  out.fill(0)
  out[0] = f / aspect
  out[5] = f
  out[10] = (far + near) * nf
  out[11] = -1
  out[14] = 2 * far * near * nf
  return out
}

function mat4Translate(out: Mat4, a: Mat4, [x, y, z]: [number, number, number]): Mat4 {
  if (out !== a) out.set(a)
  out[12] = a[0] * x + a[4] * y + a[8] * z + a[12]
  out[13] = a[1] * x + a[5] * y + a[9] * z + a[13]
  out[14] = a[2] * x + a[6] * y + a[10] * z + a[14]
  out[15] = a[3] * x + a[7] * y + a[11] * z + a[15]
  return out
}

function mat4RotateX(out: Mat4, a: Mat4, rad: number): Mat4 {
  const s = Math.sin(rad), c = Math.cos(rad)
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
  if (a !== out) out.set(a)
  out[4] = a10 * c + a20 * s; out[5] = a11 * c + a21 * s; out[6] = a12 * c + a22 * s; out[7] = a13 * c + a23 * s
  out[8] = a20 * c - a10 * s; out[9] = a21 * c - a11 * s; out[10] = a22 * c - a12 * s; out[11] = a23 * c - a13 * s
  return out
}

function mat4RotateY(out: Mat4, a: Mat4, rad: number): Mat4 {
  const s = Math.sin(rad), c = Math.cos(rad)
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
  const a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11]
  if (a !== out) out.set(a)
  out[0] = a00 * c - a20 * s; out[1] = a01 * c - a21 * s; out[2] = a02 * c - a22 * s; out[3] = a03 * c - a23 * s
  out[8] = a00 * s + a20 * c; out[9] = a01 * s + a21 * c; out[10] = a02 * s + a22 * c; out[11] = a03 * s + a23 * c
  return out
}

function mat4RotateZ(out: Mat4, a: Mat4, rad: number): Mat4 {
  const s = Math.sin(rad), c = Math.cos(rad)
  const a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3]
  const a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7]
  if (a !== out) out.set(a)
  out[0] = a00 * c + a10 * s; out[1] = a01 * c + a11 * s; out[2] = a02 * c + a12 * s; out[3] = a03 * c + a13 * s
  out[4] = a10 * c - a00 * s; out[5] = a11 * c - a01 * s; out[6] = a12 * c - a02 * s; out[7] = a13 * c - a03 * s
  return out
}

function mat4InvertTranspose(out: Mat4, a: Mat4): Mat4 {
  // 3x3 normal matrix transposed inverse
  const a00 = a[0], a01 = a[1], a02 = a[2]
  const a10 = a[4], a11 = a[5], a12 = a[6]
  const a20 = a[8], a21 = a[9], a22 = a[10]

  const b01 = a22 * a11 - a12 * a21
  const b11 = -a22 * a10 + a12 * a20
  const b21 = a21 * a10 - a11 * a20

  const d = a00 * b01 + a01 * b11 + a02 * b21
  if (!d) return mat4Identity(out)
  const id = 1.0 / d

  out.fill(0)
  out[0] = b01 * id
  out[1] = (-a22 * a01 + a02 * a21) * id
  out[2] = (a12 * a01 - a02 * a11) * id
  out[4] = b11 * id
  out[5] = (a22 * a00 - a02 * a20) * id
  out[6] = (-a12 * a00 + a02 * a10) * id
  out[8] = b21 * id
  out[9] = (-a21 * a00 + a01 * a20) * id
  out[10] = (a11 * a00 - a01 * a10) * id
  out[15] = 1
  return out
}

// ============================================================================
// 3D Procedural Mesh Generators (Low-Poly / Stylized Minimalist Geometry)
// ============================================================================
interface MeshData {
  positions: Float32Array
  normals: Float32Array
  indices: Uint16Array
  count: number
}

function createBox(w: number, h: number, d: number): MeshData {
  const x = w / 2, y = h / 2, z = d / 2
  // 6 faces * 4 vertices = 24
  const pos: number[] = [
    // Front
    -x, -y,  z,   x, -y,  z,   x,  y,  z,  -x,  y,  z,
    // Back
     x, -y, -z,  -x, -y, -z,  -x,  y, -z,   x,  y, -z,
    // Top
    -x,  y,  z,   x,  y,  z,   x,  y, -z,  -x,  y, -z,
    // Bottom
    -x, -y, -z,   x, -y, -z,   x, -y,  z,  -x, -y,  z,
    // Right
     x, -y,  z,   x, -y, -z,   x,  y, -z,   x,  y,  z,
    // Left
    -x, -y, -z,  -x, -y,  z,  -x,  y,  z,  -x,  y, -z,
  ]
  const norm: number[] = [
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
  ]
  const ind: number[] = []
  for (let i = 0; i < 6; i++) {
    const o = i * 4
    ind.push(o, o + 1, o + 2, o, o + 2, o + 3)
  }
  return {
    positions: new Float32Array(pos),
    normals: new Float32Array(norm),
    indices: new Uint16Array(ind),
    count: ind.length,
  }
}

function createCylinder(rTop: number, rBot: number, height: number, seg: number): MeshData {
  const pos: number[] = []
  const norm: number[] = []
  const ind: number[] = []

  const halfH = height / 2
  for (let i = 0; i <= seg; i++) {
    const u = i / seg
    const angle = u * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    // Top vertex
    pos.push(cos * rTop, halfH, sin * rTop)
    norm.push(cos, 0, sin)

    // Bottom vertex
    pos.push(cos * rBot, -halfH, sin * rBot)
    norm.push(cos, 0, sin)
  }

  for (let i = 0; i < seg; i++) {
    const a = i * 2
    const b = a + 1
    const c = a + 2
    const d = a + 3
    ind.push(a, b, c, b, d, c)
  }

  return {
    positions: new Float32Array(pos),
    normals: new Float32Array(norm),
    indices: new Uint16Array(ind),
    count: ind.length,
  }
}

function createSphere(
  rx: number,
  ry: number,
  rz: number,
  rings: number,
  sectors: number,
  thetaStart = 0,
  thetaLength = Math.PI
): MeshData {
  const pos: number[] = []
  const norm: number[] = []
  const ind: number[] = []

  for (let i = 0; i <= rings; i++) {
    const v = i / rings
    const theta = thetaStart + v * thetaLength
    const cosTheta = Math.cos(theta)
    const sinTheta = Math.sin(theta)

    for (let j = 0; j <= sectors; j++) {
      const u = j / sectors
      const phi = u * Math.PI * 2
      const cosPhi = Math.cos(phi)
      const sinPhi = Math.sin(phi)

      const x = cosPhi * sinTheta
      const y = cosTheta
      const z = sinPhi * sinTheta

      pos.push(x * rx, y * ry, z * rz)
      norm.push(x, y, z)
    }
  }

  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < sectors; j++) {
      const a = i * (sectors + 1) + j
      const b = a + sectors + 1
      ind.push(a, b, a + 1)
      ind.push(b, b + 1, a + 1)
    }
  }

  return {
    positions: new Float32Array(pos),
    normals: new Float32Array(norm),
    indices: new Uint16Array(ind),
    count: ind.length,
  }
}

function createTorus(r: number, tube: number, radialSeg: number, tubularSeg: number): MeshData {
  const pos: number[] = []
  const norm: number[] = []
  const ind: number[] = []

  for (let j = 0; j <= radialSeg; j++) {
    const v = (j / radialSeg) * Math.PI * 2
    const cosV = Math.cos(v)
    const sinV = Math.sin(v)

    for (let i = 0; i <= tubularSeg; i++) {
      const u = (i / tubularSeg) * Math.PI * 2
      const cosU = Math.cos(u)
      const sinU = Math.sin(u)

      const x = (r + tube * cosV) * cosU
      const y = (r + tube * cosV) * sinU
      const z = tube * sinV

      pos.push(x, y, z)
      norm.push(cosV * cosU, cosV * sinU, sinV)
    }
  }

  for (let j = 1; j <= radialSeg; j++) {
    for (let i = 1; i <= tubularSeg; i++) {
      const a = (tubularSeg + 1) * j + i - 1
      const b = (tubularSeg + 1) * (j - 1) + i - 1
      const c = (tubularSeg + 1) * (j - 1) + i
      const d = (tubularSeg + 1) * j + i

      ind.push(a, b, d)
      ind.push(b, c, d)
    }
  }

  return {
    positions: new Float32Array(pos),
    normals: new Float32Array(norm),
    indices: new Uint16Array(ind),
    count: ind.length,
  }
}

// ============================================================================
// WebGL Shader Programs (Obsidian Material + Electric Cyan Rim & HUD Visor)
// ============================================================================
const vertexShaderSource = `
attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_mvp;
uniform mat4 u_modelView;
uniform mat4 u_normalMatrix;

varying vec3 v_normal;
varying vec3 v_positionEye;
varying vec3 v_modelPos;

void main() {
  v_modelPos = a_position;
  vec4 posEye = u_modelView * vec4(a_position, 1.0);
  v_positionEye = posEye.xyz;
  v_normal = normalize((u_normalMatrix * vec4(a_normal, 0.0)).xyz);
  gl_Position = u_mvp * vec4(a_position, 1.0);
}
`

const fragmentShaderSource = `
precision mediump float;

varying vec3 v_normal;
varying vec3 v_positionEye;
varying vec3 v_modelPos;

uniform int u_partType; // 0: Obsidian Base, 1: Cyber Visor, 2: Neon Circuit, 3: Hologram Ring
uniform vec3 u_baseColor;
uniform float u_time;
uniform float u_hover;
uniform float u_bloom;

void main() {
  vec3 N = normalize(v_normal);
  vec3 V = normalize(-v_positionEye);

  // Directional Studio Key Light
  vec3 keyDir = normalize(vec3(1.8, 2.8, 2.2));
  float keyDiff = max(dot(N, keyDir), 0.0);

  // Soft Secondary Fill Light
  vec3 fillDir = normalize(vec3(-1.2, -0.8, 1.2));
  float fillDiff = max(dot(N, fillDir), 0.0) * 0.35;

  // Blinn-Phong Specular
  vec3 H = normalize(keyDir + V);
  float spec = pow(max(dot(N, H), 0.0), 22.0) * 0.32;

  // Fresnel Rim Highlights
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.8);

  // Color Palette: Tiffany Neon (#21F1A8) & Mint
  vec3 tiffany = vec3(0.129, 0.945, 0.659);   // #21F1A8
  vec3 tiffanySoft = vec3(0.258, 0.957, 0.718); // #42f4b7

  float sideFactor = clamp(-N.x * 0.7 + 0.3, 0.0, 1.0);
  vec3 rimColor = mix(tiffanySoft, tiffany, sideFactor) * (fresnel * (1.8 + u_hover * 0.9));

  if (u_partType == 0) {
    // Deep Matte Dark Grey Body (#171717)
    vec3 ambient = vec3(0.04, 0.04, 0.04);
    vec3 diffuse = u_baseColor * (keyDiff * 0.85 + fillDiff);
    vec3 specular = vec3(0.7, 0.9, 0.8) * spec;
    vec3 color = ambient + diffuse + specular + rimColor * 0.75;
    gl_FragColor = vec4(color, 1.0);
  } else if (u_partType == 1) {
    // Glowing Holographic Cyber Visor with animated scanline in Tiffany Neon
    float scanline = sin(v_modelPos.y * 38.0 - u_time * 5.5) * 0.18 + 0.82;
    vec3 visorGlow = tiffany * (2.0 + u_bloom * 3.5 + u_hover * 0.7) * scanline;
    vec3 visorDark = vec3(0.02, 0.1, 0.07);
    vec3 color = mix(visorDark, visorGlow, fresnel * 0.75 + 0.3) + spec * 0.5;
    gl_FragColor = vec4(color, 0.95);
  } else if (u_partType == 2) {
    // Emissive Tiffany Circuit / Vertebrae Inlay Lines
    float pulse = sin(u_time * 2.8) * 0.2 + 0.8;
    vec3 circuitGlow = tiffany * (2.4 * pulse + u_bloom * 3.0);
    gl_FragColor = vec4(circuitGlow, 1.0);
  } else {
    // Holographic Orbit Rings
    vec3 ringGlow = mix(tiffany, tiffanySoft, sin(v_modelPos.x * 2.5 + u_time) * 0.5 + 0.5);
    gl_FragColor = vec4(ringGlow * (1.3 + u_hover * 0.45), 0.78);
  }
}
`

// Helper to create and compile shader
function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

// ============================================================================
// Interactive Cyber Avatar Component (WebGL 3D Accelerated)
// ============================================================================
export function InteractiveAvatar() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Interaction State
  const [isHovered, setIsHovered] = useState(false)
  const [clickCount, setClickCount] = useState(0)
  const [isClicked, setIsClicked] = useState(false)

  // Tracking Refs for 60fps loop
  const mousePosRef = useRef({ x: 0, y: 0 })
  const hoverAnimRef = useRef(0)
  const bloomAnimRef = useRef(0)
  const nodProgressRef = useRef(0)
  const currentRotYRef = useRef(0)
  const currentRotXRef = useRef(0)

  // Mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const rawX = (e.clientX - centerX) / (window.innerWidth / 2)
    const rawY = (e.clientY - centerY) / (window.innerHeight / 2)

    mousePosRef.current = {
      x: Math.max(-1, Math.min(1, rawX)),
      y: Math.max(-1, Math.min(1, rawY)),
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  // Click Trigger: Friendly Micro-Nod Gesture + Visor Bloom Flash
  const handleClick = () => {
    setClickCount((c) => c + 1)
    setIsClicked(true)
    nodProgressRef.current = 1.0
    bloomAnimRef.current = 1.0

    setTimeout(() => {
      setIsClicked(false)
    }, 450)
  }

  // WebGL 3D Rendering Pipeline
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', {
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    })
    if (!gl) return

    // Compile Program
    const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return

    gl.useProgram(program)

    // Uniform Locations
    const u_mvp = gl.getUniformLocation(program, 'u_mvp')
    const u_modelView = gl.getUniformLocation(program, 'u_modelView')
    const u_normalMatrix = gl.getUniformLocation(program, 'u_normalMatrix')
    const u_partType = gl.getUniformLocation(program, 'u_partType')
    const u_baseColor = gl.getUniformLocation(program, 'u_baseColor')
    const u_time = gl.getUniformLocation(program, 'u_time')
    const u_hover = gl.getUniformLocation(program, 'u_hover')
    const u_bloom = gl.getUniformLocation(program, 'u_bloom')

    const a_position = gl.getAttribLocation(program, 'a_position')
    const a_normal = gl.getAttribLocation(program, 'a_normal')

    // Prepare Geometry Buffers
    interface GPUBufferMesh {
      posBuffer: WebGLBuffer
      normBuffer: WebGLBuffer
      indexBuffer: WebGLBuffer
      count: number
    }

    const allMeshes: GPUBufferMesh[] = []

    const uploadMesh = (mesh: MeshData): GPUBufferMesh => {
      const posBuffer = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW)

      const normBuffer = gl.createBuffer()!
      gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW)

      const indexBuffer = gl.createBuffer()!
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW)

      const gpuMesh: GPUBufferMesh = { posBuffer, normBuffer, indexBuffer, count: mesh.count }
      allMeshes.push(gpuMesh)
      return gpuMesh
    }

    // Procedural Stylized Bust Meshes
    const torsoMesh = uploadMesh(createCylinder(0.48, 0.86, 0.72, 8))
    const shoulderPlateMesh = uploadMesh(createBox(1.36, 0.18, 0.54))
    const circuitMesh = uploadMesh(createBox(0.035, 0.36, 0.02))
    const neckMesh = uploadMesh(createCylinder(0.2, 0.23, 0.32, 12))
    const neckRingMesh = uploadMesh(createTorus(0.22, 0.016, 6, 20))
    const headMesh = uploadMesh(createSphere(0.38, 0.44, 0.38, 16, 16))
    const jawMesh = uploadMesh(createCylinder(0.32, 0.14, 0.32, 6))
    const visorMesh = uploadMesh(createSphere(0.39, 0.16, 0.39, 12, 20, 0, Math.PI))
    const earPodMesh = uploadMesh(createCylinder(0.12, 0.12, 0.1, 14))
    const orbitRing1Mesh = uploadMesh(createTorus(0.74, 0.009, 6, 44))
    const orbitRing2Mesh = uploadMesh(createTorus(0.64, 0.007, 6, 36))

    // Global & Projection Matrices
    const projMat = mat4Create(), viewMat = mat4Create(), modelMat = mat4Create()
    const mvMat = mat4Create(), mvpMat = mat4Create(), normMat = mat4Create()

    // Pre-allocated Part Matrices (Zero GC per-frame allocation)
    const torsoMat = mat4Create(), shoulderMat = mat4Create(), circuitMat = mat4Create()
    const neckMat = mat4Create(), neckRingMat = mat4Create(), headMat = mat4Create()
    const craniumMat = mat4Create(), jawMat = mat4Create(), visorMat = mat4Create()
    const earLMat = mat4Create(), earRMat = mat4Create(), ring1Mat = mat4Create(), ring2Mat = mat4Create()

    gl.enable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const drawMesh = (
      mesh: GPUBufferMesh,
      transform: Mat4,
      partType: number,
      baseColor: [number, number, number] = [0.05, 0.07, 0.09]
    ) => {
      mat4Multiply(mvMat, viewMat, transform)
      mat4Multiply(mvpMat, projMat, mvMat)
      mat4InvertTranspose(normMat, mvMat)

      gl.uniformMatrix4fv(u_mvp, false, mvpMat)
      gl.uniformMatrix4fv(u_modelView, false, mvMat)
      gl.uniformMatrix4fv(u_normalMatrix, false, normMat)
      gl.uniform1i(u_partType, partType)
      gl.uniform3f(u_baseColor, baseColor[0], baseColor[1], baseColor[2])

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.posBuffer)
      gl.vertexAttribPointer(a_position, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(a_position)

      gl.bindBuffer(gl.ARRAY_BUFFER, mesh.normBuffer)
      gl.vertexAttribPointer(a_normal, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(a_normal)

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.indexBuffer)
      gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0)
    }

    let animationId: number
    let lastTime = performance.now()

    // 60-120 FPS Hardware Render Loop
    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now
      const timeSec = now * 0.001

      // Auto-resize canvas for sharp high-DPI displays
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const displayWidth = Math.floor(canvas.clientWidth * dpr)
      const displayHeight = Math.floor(canvas.clientHeight * dpr)

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth
        canvas.height = displayHeight
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
      }

      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

      // Perspective Camera Setup
      const aspect = canvas.width / canvas.height
      mat4Perspective(projMat, (38 * Math.PI) / 180, aspect, 0.1, 100.0)

      mat4Identity(viewMat)
      mat4Translate(viewMat, viewMat, [0, -0.15, -2.9])

      // Exponential Lerp Damping for Gaze Tracking (clamped +-25 deg yaw, +-16 deg pitch)
      const targetY = mousePosRef.current.x * 0.44
      const targetX = -mousePosRef.current.y * 0.28
      const lerpFactor = 1 - Math.exp(-6.5 * dt)

      currentRotYRef.current += (targetY - currentRotYRef.current) * lerpFactor
      currentRotXRef.current += (targetX - currentRotXRef.current) * lerpFactor

      // Hover and Bloom Animation Interpolation
      const targetHover = containerRef.current?.matches(':hover') ? 1.0 : 0.0
      hoverAnimRef.current += (targetHover - hoverAnimRef.current) * (1 - Math.exp(-8 * dt))
      bloomAnimRef.current *= Math.exp(-4.5 * dt)

      // Click Nod Spring
      if (nodProgressRef.current > 0.001) {
        nodProgressRef.current *= Math.exp(-6.0 * dt)
      }
      const nodAngle = Math.sin((1.0 - nodProgressRef.current) * Math.PI) * 0.12

      // Pass Environment Uniforms
      gl.uniform1f(u_time, timeSec)
      gl.uniform1f(u_hover, hoverAnimRef.current)
      gl.uniform1f(u_bloom, bloomAnimRef.current)

      // Idle Breathing & Floating Bob
      const breathY = Math.sin(timeSec * 1.8) * 0.035
      const breathTilt = Math.sin(timeSec * 0.9) * 0.015

      // 1. Draw Base Torso & Shoulders
      mat4Identity(modelMat)
      mat4Translate(modelMat, modelMat, [0, -0.65 + breathY * 0.4, 0])
      mat4RotateZ(modelMat, modelMat, breathTilt * 0.5)

      // Torso Chest Plate
      mat4Translate(torsoMat, modelMat, [0, 0.36, 0])
      drawMesh(torsoMesh, torsoMat, 0, [0.09, 0.09, 0.09])

      // Shoulder Armor Plate
      mat4Translate(shoulderMat, modelMat, [0, 0.48, 0.02])
      drawMesh(shoulderPlateMesh, shoulderMat, 0, [0.12, 0.12, 0.12])

      // Cyan Circuit Inlays
      mat4Translate(circuitMat, modelMat, [0, 0.42, 0.28])
      drawMesh(circuitMesh, circuitMat, 2)

      // 2. Articulated Cyber Neck
      mat4Translate(neckMat, modelMat, [0, 0.72, 0])
      mat4RotateY(neckMat, neckMat, currentRotYRef.current * 0.3)
      mat4RotateX(neckMat, neckMat, currentRotXRef.current * 0.2)
      drawMesh(neckMesh, neckMat, 0, [0.11, 0.11, 0.11])

      mat4Translate(neckRingMat, neckMat, [0, 0.04, 0])
      mat4RotateX(neckRingMat, neckRingMat, Math.PI / 2)
      drawMesh(neckRingMesh, neckRingMat, 2)

      // 3. Faceted Head & Gaze Pivot
      mat4Translate(headMat, modelMat, [0, 0.96 + breathY, 0])
      mat4RotateY(headMat, headMat, currentRotYRef.current)
      mat4RotateX(headMat, headMat, currentRotXRef.current + nodAngle)

      // Cranium Core
      mat4Translate(craniumMat, headMat, [0, 0.18, 0])
      drawMesh(headMesh, craniumMat, 0, [0.09, 0.09, 0.09])

      // Angular Jaw & Chin Guard
      mat4Translate(jawMat, headMat, [0, -0.04, 0.08])
      mat4RotateX(jawMat, jawMat, 0.18)
      drawMesh(jawMesh, jawMat, 0, [0.12, 0.12, 0.12])

      // Glowing Cyber Visor
      mat4Translate(visorMat, headMat, [0, 0.16, 0.08])
      mat4RotateX(visorMat, visorMat, 0.12)
      drawMesh(visorMesh, visorMat, 1)

      // Left & Right Ear Audio Pods
      mat4Translate(earLMat, headMat, [-0.4, 0.16, 0])
      mat4RotateZ(earLMat, earLMat, Math.PI / 2)
      drawMesh(earPodMesh, earLMat, 0, [0.12, 0.12, 0.12])

      mat4Translate(earRMat, headMat, [0.4, 0.16, 0])
      mat4RotateZ(earRMat, earRMat, -Math.PI / 2)
      drawMesh(earPodMesh, earRMat, 0, [0.12, 0.12, 0.12])

      // 4. Floating Holographic Orbit Rings
      mat4Translate(ring1Mat, modelMat, [0, 1.1 + breathY, 0])
      mat4RotateX(ring1Mat, ring1Mat, Math.PI / 3)
      mat4RotateZ(ring1Mat, ring1Mat, timeSec * (0.45 + hoverAnimRef.current * 0.35))
      drawMesh(orbitRing1Mesh, ring1Mat, 3)

      mat4Translate(ring2Mat, modelMat, [0, 1.1 + breathY, 0])
      mat4RotateX(ring2Mat, ring2Mat, -Math.PI / 3.5)
      mat4RotateZ(ring2Mat, ring2Mat, -timeSec * (0.65 + hoverAnimRef.current * 0.45))
      drawMesh(orbitRing2Mesh, ring2Mat, 3)

      animationId = requestAnimationFrame(render)
    }

    animationId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationId)
      for (const mesh of allMeshes) {
        gl.deleteBuffer(mesh.posBuffer)
        gl.deleteBuffer(mesh.normBuffer)
        gl.deleteBuffer(mesh.indexBuffer)
      }
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteProgram(program)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`hero-avatar-wrapper ${isHovered ? 'is-hovered' : ''} ${isClicked ? 'is-glitching' : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        mousePosRef.current = { x: 0, y: 0 }
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleClick()
        }
      }}
      aria-label="Interactive 3D developer avatar. Click to interact or move your mouse to guide gaze."
    >
      {/* Background Holographic Ambient Orbits */}
      <div className="avatar-ambient-glow" aria-hidden="true" />

      {/* Floating Cybernetic Status Badges */}
      <div className="avatar-badge badge-top-left" aria-hidden="true">
        <Terminal size={12} className="badge-icon" />
        <span>SYS // 3D ONLINE</span>
      </div>

      <div className="avatar-badge badge-bottom-right" aria-hidden="true">
        <Cpu size={12} className="badge-icon" />
        <span>WEBGL ACCELERATED</span>
      </div>

      <div className="avatar-interaction-hint" aria-hidden="true">
        <Sparkles size={11} />
        <span>
          {clickCount === 0
            ? 'CLICK TO NOD ✳'
            : clickCount % 2 === 0
            ? 'VISOR BLOOM PULSE'
            : 'GAZE RIG ACTIVE'}
        </span>
      </div>

      {/* Hardware-Accelerated WebGL 3D Canvas */}
      <div className="avatar-3d-stage">
        <canvas
          ref={canvasRef}
          className="avatar-canvas"
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        />
      </div>
    </div>
  )
}
