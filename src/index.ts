import './style/index.scss'
import Stats from 'stats.js'
import { GUI } from 'dat.gui'
import { WebGLRenderer, Vector2, Raycaster, Vector3 } from 'three'
import { App } from './App'

const app = new App()

const renderer = new WebGLRenderer({ antialias: true })
document.body.appendChild(renderer.domElement)

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI({ autoPlace: false })
gui.domElement.classList.add('gui')
document.body.appendChild(gui.domElement)

app.on('ready', () => {
  gui.add(
    {
      start() {
        if (app.running) return
        app.audioContext.resume()
        app.start()
      },
    },
    'start'
  )
})

function render() {
  requestAnimationFrame(render)
  stats.begin()
  app.tick()
  app.renderTo(renderer)
  stats.end()
}

async function onLoad() {
  requestAnimationFrame(render)
}

window.addEventListener('load', onLoad)

function onWindowResize() {
  const w = window.innerWidth,
    h = window.innerHeight
  renderer.setSize(w, h)
  app.updateSize(w, h)
}

onWindowResize()
window.addEventListener('resize', onWindowResize)

const rendererSizeTmp = new Vector2()

const onMouseMoveTmp = new Vector3()

function onMouseMove(e: MouseEvent) {
  renderer.getSize(rendererSizeTmp)

  onMouseMoveTmp
    .set(
      (e.clientX / rendererSizeTmp.x) * 2 - 1,
      -(e.clientY / rendererSizeTmp.y) * 2 + 1,
      1
    )
    .unproject(app.camera)
    .sub(app.camera.position)
    .multiplyScalar(-app.camera.position.y / onMouseMoveTmp.y)
    .add(app.camera.position)

  app.setListeningPoint(onMouseMoveTmp)
}
renderer.domElement.addEventListener('mousemove', onMouseMove)
