import {
  Scene,
  WebGLRenderer,
  PerspectiveCamera,
  GridHelper,
  BoxBufferGeometry,
  MeshBasicMaterial,
  Mesh,
} from 'three'

const pointGeometry = new BoxBufferGeometry(0.01, 0.01, 0.01)

class Point {
  geometry = pointGeometry
  material = new MeshBasicMaterial({ color: 0xffffff })
  mesh = new Mesh(this.geometry, this.material)
  position = this.mesh.position
}

export class App {
  scene = new Scene()
  camera = new PerspectiveCamera()
  points: Point[] = []

  constructor() {
    const { scene, camera, points } = this

    scene.add(new GridHelper(1, 10))

    camera.position.set(1, 2, 1)
    camera.lookAt(0, 0, 0)

    for (let j = -0.5; j <= 0.5; j += 1 / 4) {
      for (let i = -0.5; i <= 0.5; i += 1 / 4) {
        const point = new Point()
        point.position.set(i, 0, j)
        scene.add(point.mesh)
        points.push(point)
      }
    }
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
