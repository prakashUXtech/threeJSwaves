import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js'
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js'
import gsap from "https://cdn.skypack.dev/gsap"

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000)
camera.position.z = 50
const render = new THREE.WebGLRenderer()
const controls = new OrbitControls( camera, render.domElement );
const raycaster = new THREE.Raycaster()

render.setSize(innerWidth, innerHeight)
render.setPixelRatio(devicePixelRatio)
document.body.appendChild(render.domElement)


const plane = new THREE.PlaneGeometry(500,500,100,100)
const material = new THREE.MeshPhongMaterial({side: THREE.DoubleSide, flatShading: THREE.FlatShading, vertexColors: true})
const mesh = new THREE.Mesh(plane, material)
scene.add(mesh)

// Light setup here
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, 0, 1)
scene.add(light)
const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 0, -1)
scene.add(backLight)


// Get mouse co-ordinates
const mouse ={
  x: undefined,
  y: undefined
}
addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = -(event.clientY / innerHeight) * 2 + 1
})


//vertice position randomization
const { array } = mesh.geometry.attributes.position
const randomValues = []
for (let i = 0; i < array.length; i++) {
  if (i % 3 === 0) {
    const x = array[i]
    const y = array[i + 1]
    const z = array[i + 2]

    array[i] = x + (Math.random() - 0.5) * 3
    array[i + 1] = y + (Math.random() - 0.5) * 3
    array[i + 2] = z + (Math.random() - 0.5) * 3
  }

  randomValues.push(Math.random() * Math.PI * 2)
}

mesh.geometry.attributes.position.randomValues = randomValues
mesh.geometry.attributes.position.originalPosition = mesh.geometry.attributes.position.array

const colors = []
for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
  colors.push(0.0, 0.1, 0.25)
}

mesh.geometry.setAttribute(
  'color',
  new THREE.BufferAttribute(new Float32Array(colors), 3)
)


controls.update();
controls.enableZoom  = true;
// create a render loop function here
let frame = 0
function animate(){
  requestAnimationFrame(animate)
  render.render(scene, camera)
  controls.update();
  raycaster.setFromCamera(mouse, camera)

  mesh.rotation.y = mouse.x * .05
  mesh.rotation.x = mouse.y * .05

  frame += 0.01
  const {
    array,
    originalPosition,
    randomValues
  } = mesh.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    // x
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01

    // y
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.01
  }

  mesh.geometry.attributes.position.needsUpdate = true

  const intersects = raycaster.intersectObject(mesh)
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes
    //vertice 1
    color.setX(intersects[0].face.a, 0.1)
    color.setY(intersects[0].face.a, 0.5)
    color.setZ(intersects[0].face.a, 1)

    //vertice 2
    color.setX(intersects[0].face.b, 0.1)
    color.setY(intersects[0].face.b, 0.5)
    color.setZ(intersects[0].face.b, 1)

    //vertice 3
    color.setX(intersects[0].face.c, 0.1)
    color.setY(intersects[0].face.c, 0.5)
    color.setZ(intersects[0].face.c, 1)

    intersects[0].object.geometry.attributes.color.needsUpdate = true

    const initialColor = {
      r: 0.18,
      g: 0.1,
      b: 0.19
    }

    const hoverColor = {
      r: 1,
      g: 0.35,
      b: 0
    }

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        // vertice 1
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)

        // vertice 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)

        // vertice 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)
        color.needsUpdate = true
      }
    })
  }

 
}

animate()