import fs from 'fs'
import path from 'path'

// Geometry Helpers
function createBoxData(w, h, d) {
  const x = w / 2, y = h / 2, z = d / 2
  const positions = [
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
  const normals = [
    0, 0, 1,  0, 0, 1,  0, 0, 1,  0, 0, 1,
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    0, 1, 0,  0, 1, 0,  0, 1, 0,  0, 1, 0,
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    1, 0, 0,  1, 0, 0,  1, 0, 0,  1, 0, 0,
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
  ]
  const indices = []
  for (let i = 0; i < 6; i++) {
    const o = i * 4
    indices.push(o, o + 1, o + 2, o, o + 2, o + 3)
  }
  return { positions, normals, indices }
}

function createCylinderData(rTop, rBot, height, seg) {
  const positions = []
  const normals = []
  const indices = []
  const halfH = height / 2

  for (let i = 0; i <= seg; i++) {
    const u = i / seg
    const angle = u * Math.PI * 2
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    positions.push(cos * rTop, halfH, sin * rTop)
    normals.push(cos, 0, sin)

    positions.push(cos * rBot, -halfH, sin * rBot)
    normals.push(cos, 0, sin)
  }

  for (let i = 0; i < seg; i++) {
    const a = i * 2
    const b = a + 1
    const c = a + 2
    const d = a + 3
    indices.push(a, b, c, b, d, c)
  }

  return { positions, normals, indices }
}

function createSphereData(rx, ry, rz, rings, sectors) {
  const positions = []
  const normals = []
  const indices = []

  for (let i = 0; i <= rings; i++) {
    const v = i / rings
    const theta = v * Math.PI
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

      positions.push(x * rx, y * ry, z * rz)
      normals.push(x, y, z)
    }
  }

  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < sectors; j++) {
      const a = i * (sectors + 1) + j
      const b = a + sectors + 1
      indices.push(a, b, a + 1)
      indices.push(b, b + 1, a + 1)
    }
  }

  return { positions, normals, indices }
}

// Build glTF 2.0 asset
function buildGLTF() {
  const bufferParts = []
  let byteOffset = 0

  const accessors = []
  const bufferViews = []
  const meshes = []
  const nodes = []

  function addBuffer(typedArray, target) {
    const buffer = Buffer.from(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength)
    const length = buffer.length
    bufferParts.push(buffer)

    const viewIndex = bufferViews.length
    bufferViews.push({
      buffer: 0,
      byteOffset: byteOffset,
      byteLength: length,
      target: target,
    })

    // Pad to 4 bytes boundary
    const padding = (4 - (length % 4)) % 4
    if (padding > 0) {
      bufferParts.push(Buffer.alloc(padding))
      byteOffset += length + padding
    } else {
      byteOffset += length
    }

    return viewIndex
  }

  function addPart(name, geom, materialIndex, translation = [0, 0, 0], rotation = [0, 0, 0, 1]) {
    const posF32 = new Float32Array(geom.positions)
    const normF32 = new Float32Array(geom.normals)
    const indU16 = new Uint16Array(geom.indices)

    // Calculate Bounding Box
    let minX = Infinity, minY = Infinity, minZ = Infinity
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity
    for (let i = 0; i < posF32.length; i += 3) {
      const x = posF32[i], y = posF32[i + 1], z = posF32[i + 2]
      if (x < minX) minX = x; if (x > maxX) maxX = x
      if (y < minY) minY = y; if (y > maxY) maxY = y
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z
    }

    const posView = addBuffer(posF32, 34962) // ARRAY_BUFFER
    const normView = addBuffer(normF32, 34962)
    const indView = addBuffer(indU16, 34963) // ELEMENT_ARRAY_BUFFER

    const posAccIndex = accessors.length
    accessors.push({
      bufferView: posView,
      componentType: 5126, // FLOAT
      count: posF32.length / 3,
      type: 'VEC3',
      min: [minX, minY, minZ],
      max: [maxX, maxY, maxZ],
    })

    const normAccIndex = accessors.length
    accessors.push({
      bufferView: normView,
      componentType: 5126,
      count: normF32.length / 3,
      type: 'VEC3',
    })

    const indAccIndex = accessors.length
    accessors.push({
      bufferView: indView,
      componentType: 5123, // UNSIGNED_SHORT
      count: indU16.length,
      type: 'SCALAR',
    })

    const meshIndex = meshes.length
    meshes.push({
      name: `${name}_Mesh`,
      primitives: [
        {
          attributes: {
            POSITION: posAccIndex,
            NORMAL: normAccIndex,
          },
          indices: indAccIndex,
          material: materialIndex,
        },
      ],
    })

    const nodeIndex = nodes.length
    nodes.push({
      name: name,
      mesh: meshIndex,
      translation: translation,
      rotation: rotation,
    })

    return nodeIndex
  }

  // Materials
  const materials = [
    // 0: Matte Dark Grey Body (#171717)
    {
      name: 'MatteDarkGrey_PBR',
      pbrMetallicRoughness: {
        baseColorFactor: [0.09, 0.09, 0.09, 1.0],
        metallicFactor: 0.18,
        roughnessFactor: 0.82,
      },
    },
    // 1: Tiffany Neon Visor (#21F1A8)
    {
      name: 'TiffanyNeon_Visor',
      pbrMetallicRoughness: {
        baseColorFactor: [0.129, 0.945, 0.659, 0.9],
        metallicFactor: 0.1,
        roughnessFactor: 0.1,
      },
      emissiveFactor: [0.129, 0.945, 0.659],
    },
    // 2: Tiffany Neon Circuit (#21F1A8)
    {
      name: 'TiffanyCircuit_Neon',
      pbrMetallicRoughness: {
        baseColorFactor: [0.129, 0.945, 0.659, 1.0],
        metallicFactor: 0.5,
        roughnessFactor: 0.2,
      },
      emissiveFactor: [0.129, 0.945, 0.659],
    },
  ]

  // Model Assembly
  const nodeIndices = []
  // Torso
  nodeIndices.push(addPart('Torso', createCylinderData(0.48, 0.86, 0.72, 8), 0, [0, -0.28, 0]))
  // Shoulder Clavicle Wings
  nodeIndices.push(addPart('ShoulderArmor', createBoxData(1.36, 0.18, 0.54), 0, [0, -0.16, 0.02]))
  // Circuit Inlay
  nodeIndices.push(addPart('ChestCircuit', createBoxData(0.035, 0.36, 0.02), 2, [0, -0.22, 0.28]))
  // Cyber Neck
  nodeIndices.push(addPart('Neck', createCylinderData(0.2, 0.23, 0.32, 12), 0, [0, 0.08, 0]))
  // Faceted Cranium
  nodeIndices.push(addPart('HeadCranium', createSphereData(0.38, 0.44, 0.38, 16, 16), 0, [0, 0.46, 0]))
  // Angular Jaw
  nodeIndices.push(addPart('JawGuard', createCylinderData(0.32, 0.14, 0.32, 6), 0, [0, 0.24, 0.08]))
  // Glowing Visor
  nodeIndices.push(addPart('CyberVisor', createSphereData(0.39, 0.16, 0.39, 12, 18), 1, [0, 0.44, 0.08]))
  // Ear Comms
  nodeIndices.push(addPart('EarPodLeft', createCylinderData(0.12, 0.12, 0.1, 12), 0, [-0.4, 0.44, 0]))
  nodeIndices.push(addPart('EarPodRight', createCylinderData(0.12, 0.12, 0.1, 12), 0, [0.4, 0.44, 0]))

  // Root Node
  const rootNodeIndex = nodes.length
  nodes.push({
    name: 'CyberBust_Root',
    children: nodeIndices,
  })

  const fullBuffer = Buffer.concat(bufferParts)
  const base64Buffer = fullBuffer.toString('base64')

  const gltf = {
    asset: {
      version: '2.0',
      generator: 'Antigravity CyberBust 3D Generator',
    },
    scene: 0,
    scenes: [
      {
        name: 'DefaultScene',
        nodes: [rootNodeIndex],
      },
    ],
    nodes: nodes,
    meshes: meshes,
    materials: materials,
    accessors: accessors,
    bufferViews: bufferViews,
    buffers: [
      {
        byteLength: fullBuffer.length,
        uri: `data:application/octet-stream;base64,${base64Buffer}`,
      },
    ],
  }

  const outDir = path.resolve('public/models')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const outPath = path.join(outDir, 'cyber-bust.gltf')
  fs.writeFileSync(outPath, JSON.stringify(gltf, null, 2))
  console.log(`✓ 3D glTF Model successfully generated at: ${outPath} (${(fullBuffer.length / 1024).toFixed(1)} KB)`)
}

buildGLTF()
