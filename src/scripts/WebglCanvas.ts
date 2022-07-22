import * as THREE from "three";
import {Mesh} from "three";

export default function WebglCanvas() {
  return {
    onMounted() {
      const canvas = (this as { $refs: { [key: string]: HTMLElement }, onMounted(): void }).$refs.canvas as HTMLCanvasElement
      if (canvas) drawCanvas(canvas)
    },
  }
}


function drawCanvas(canvas: HTMLCanvasElement) {
  // variables
  const objectsDistance = 4
  const parameters = {
    materialColor: '#c7bcbc'
  }

  // textures
  const textureLoader = new THREE.TextureLoader()
  const gradientTexture = textureLoader.load('textures/gradients/5.jpg')
  gradientTexture.magFilter = THREE.NearestFilter

  // materials
  const material = new THREE.MeshToonMaterial({
    color: parameters.materialColor,
    gradientMap: gradientTexture
  })

  // Scene
  const scene = new THREE.Scene()

  // objects
  const geometries = [
    new THREE.TorusGeometry(1, 0.4, 16, 60),
    new THREE.ConeGeometry(1, 2, 32),
    new THREE.TorusGeometry(0.8, 0.35, 100, 16),
  ]

  // elements
  let elements: Mesh[] = []
  for (let i = 0; i < 3; i++) {
    elements.push(new THREE.Mesh(
      geometries[i],
      material
    ))
    elements[i].scale.set(0.5, 0.5, 0.5)
    elements[i].position.y = objectsDistance * i * -1
    scene.add(elements[i])
  }
  const sectionMeshes = elements.slice(0)

  // Particles
  const particlesCount = 300
  const positions = new Float32Array(particlesCount * 3)
  for (let i = 0; i < particlesCount; i++) {
    const index = i * 3
    positions[index] = (Math.random() - 0.5) * 10
    positions[index + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * sectionMeshes.length
    positions[index + 2] = (Math.random() - 0.5) * 20
  }

  const particlesGeometry = new THREE.BufferGeometry()
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const particlesMaterial = new THREE.PointsMaterial({
    color: parameters.materialColor,
    sizeAttenuation: true,
    size: 0.03
  })

  const particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)

  // light
  const directionalLight = new THREE.DirectionalLight()
  directionalLight.position.set(1, 1, 0)
  scene.add(directionalLight)

  // Sizes
  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
  }
  let scrollY = window.scrollY
  let currentSection = 0

  // cursor
  const cursor = {
    x: 0,
    y: 0,
  }

  // Base camera
  const cameraGroup = new THREE.Group()
  scene.add(cameraGroup)
  const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
  camera.position.z = 6
  cameraGroup.add(camera)


  // renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
  })
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  // animate
  const clock = new THREE.Clock()
  let previousTime = 0
  const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - previousTime
    previousTime = elapsedTime

    // animations
    sectionMeshes.forEach(mesh => {
      mesh.rotation.x += deltaTime * 0.04
      mesh.rotation.y += deltaTime * 0.1
    })


    camera.position.y = scrollY / sizes.height * -4

    const parallaxX = cursor.x * 0.5
    const parallaxY = -cursor.y * 0.5

    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime


    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
  }

  tick()

  window.addEventListener('mousemove', (e) => {
    cursor.x = e.clientX / sizes.width - 0.5
    cursor.y = e.clientY / sizes.height - 0.5
  })

  window.addEventListener('scroll', () => {
    scrollY = window.scrollY
    const newSection = Math.round(window.scrollY / sizes.height)
    if (newSection !== currentSection) {
      currentSection = newSection
    }
    if (sectionMeshes[currentSection]) {
      sectionMeshes[currentSection].rotation.x += 0.03
    }

  })
}
