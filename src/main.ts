/**
 * main.ts
 *
 * Punto di ingresso del gioco: crea i pezzi e li collega tra loro.
 * Ordine: renderer → scena → corridoio → input e personaggio → elicottero → camera → game loop.
 * A ogni frame: aggiorna personaggio ed elicottero, la camera segue, si disegna la scena.
 */
import "./style.css"
import * as THREE from "three"
import { createRenderer } from "./core/createRenderer"
import { CameraRig } from "./core/CameraRig"
import { GameLoop } from "./core/GameLoop"
import { loadCorridor } from "./world/loadCorridor"
import { InputManager } from "./input/InputManager"
import { Player } from "./player/Player"
import { Helicopter } from "./lights/Helicopter"

// Distanze dai bordi del modello, in metri: da regolare guardando il risultato
const LANE_FROM_BACK = 1.0 // corsia del personaggio, misurata dal retro della parete di fondo
const SIDE_MARGIN = 1.0 // spazio lasciato a inizio e fine corridoio (pareti laterali)

// Luce di base: quasi nulla, serve solo a non avere il nero assoluto
// (così la sagoma del personaggio si stacca appena dalle pareti)
const AMBIENT_INTENSITY = 1

async function main(): Promise<void> {
  const renderer = createRenderer()

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, AMBIENT_INTENSITY))

  const corridor = await loadCorridor()
  scene.add(corridor.model)
  const { min, max } = corridor.bounds
  const laneZ = min.z + LANE_FROM_BACK

  // Input e personaggio
  const input = new InputManager()
  const player = new Player({
    startX: min.x + SIDE_MARGIN + 0.5,
    laneZ,
    minX: min.x + SIDE_MARGIN,
    maxX: max.x - SIDE_MARGIN,
  })
  scene.add(player.mesh)

  // L'elicottero pattuglia tutta la lunghezza del corridoio, puntando alla corsia del personaggio
  const helicopter = new Helicopter({
    minX: min.x,
    maxX: max.x,
    wallZ: min.z,
    aimZ: laneZ,
  })
  scene.add(helicopter.object)

  const cameraRig = new CameraRig(player.mesh.position.x, min.z)

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    cameraRig.resize(window.innerWidth, window.innerHeight)
  })

  // Ordine dentro il frame: prima la logica, poi la camera, per ultimo il disegno
  const loop = new GameLoop(renderer, (delta) => {
    player.update(delta, input)
    helicopter.update(delta)
    cameraRig.follow(player.mesh.position.x, delta)
    renderer.render(scene, cameraRig.camera)
  })
  loop.start()
}

main().catch((error) => console.error("Errore all'avvio:", error))
