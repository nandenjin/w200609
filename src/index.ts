import './style/index.scss'
import Stats from 'stats.js'
import { GUI } from 'dat.gui'
import { WebGLRenderer } from 'three'
import { App } from './App'

const app = new App()

const renderer = new WebGLRenderer({ antialias: true })
document.body.appendChild(renderer.domElement)

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI({ autoPlace: false })
gui.domElement.classList.add('gui')
document.body.appendChild(gui.domElement)

function render() {
  requestAnimationFrame(render)
  stats.begin()
  app.renderTo(renderer)
  stats.end()
}

window.addEventListener('load', () => requestAnimationFrame(render))

function onWindowResize() {
  const w = window.innerWidth,
    h = window.innerHeight
  renderer.setSize(w, h)
  app.updateSize(w, h)
}

onWindowResize()
window.addEventListener('resize', onWindowResize)
