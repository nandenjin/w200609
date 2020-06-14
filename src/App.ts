import { EventEmitter } from 'events'
import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  GridHelper,
  BoxBufferGeometry,
  MeshBasicMaterial,
  Mesh,
} from 'three'
import soundFilePath from './assets/sound.mp3'

const pointGeometry = new BoxBufferGeometry(0.03, 0.03, 0.03)
const LIGHTNESS_DECAY_MS = 1000

class Point {
  geometry = pointGeometry
  material = new MeshBasicMaterial({ color: 0xffffff })
  mesh = new Mesh(this.geometry, this.material)
  position = this.mesh.position
  audioContext: AudioContext

  private prevTick = -1
  private prevTrigger = -1

  constructor({ audioContext }: { audioContext: AudioContext }) {
    this.audioContext = audioContext
  }

  trigger(buffer: AudioBuffer): void {
    const { audioContext, prevTick } = this
    const audio = audioContext.createBufferSource()
    audio.buffer = buffer
    audio.connect(audioContext.destination)
    audio.start(0)

    this.prevTrigger = prevTick
  }

  tick(now: number): void {
    const { material, prevTrigger } = this
    const lightness =
      0xff *
      (prevTrigger >= 0
        ? Math.max(1 - (now - prevTrigger) / LIGHTNESS_DECAY_MS, 0)
        : 0)
    material.color.set((lightness << 16) + (lightness << 8) + lightness)

    this.prevTick = now
  }
}

export class App extends EventEmitter {
  scene = new Scene()
  camera = new PerspectiveCamera()

  audioContext = new AudioContext()
  audioBuffer: AudioBuffer | undefined

  points: Point[] = []
  cycles: number[] = []
  offsets: number[] = []
  running = false

  private prevTick = -1

  constructor() {
    super()
    const { scene, camera, points, cycles, offsets, audioContext } = this

    scene.add(new GridHelper(1, 10))

    camera.position.set(1, 2, 1)
    camera.lookAt(0, 0, 0)

    for (let j = -0.5; j <= 0.5; j += 1 / 4) {
      for (let i = -0.5; i <= 0.5; i += 1 / 4) {
        const point = new Point({ audioContext })
        point.position.set(i, 0, j)
        scene.add(point.mesh)

        points.push(point)
        cycles.push(Math.random() * 10000 + 2000)
        offsets.push(Math.random() * 10000)
      }
    }

    ;(async () => {
      const { audioContext } = this
      const res = await fetch(soundFilePath)
      if (res.ok) {
        const fileBuffer = await res.arrayBuffer()
        this.audioBuffer = await audioContext.decodeAudioData(fileBuffer)
        this.emit('ready')
      } else {
        console.error('Failed to load audio data')
        console.error(res)
        this.emit('error')
      }
    })()
  }

  start(): void {
    this.running = true
  }

  tick(): void {
    const { prevTick, running, points, cycles, offsets, audioBuffer } = this
    const now = Date.now()
    for (let i = 0; i < points.length; i++) {
      const point = points[i],
        cycle = cycles[i],
        offset = offsets[i]

      if (prevTick >= 0 && running && audioBuffer) {
        if (
          Math.floor((prevTick - offset) / cycle) !=
          Math.floor((now - offset) / cycle)
        ) {
          point.trigger(audioBuffer)
        }
      }

      point.tick(now)
    }

    this.prevTick = now
  }

  renderTo(target: WebGLRenderer): void {
    const { scene, camera } = this
    target.render(scene, camera)
  }

  updateSize(w: number, h: number): void {
    const { camera } = this
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
}
