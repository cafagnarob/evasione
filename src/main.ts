/**
 * main.ts
 *
 * Punto di ingresso del gioco: crea i pezzi e li collega tra loro.
 * Ordine: renderer → scena → corridoio → input e personaggio → camera → game loop.
 * A ogni frame: aggiorna il personaggio, la camera lo segue, si disegna la scena.
 * Per ora contiene anche una luce temporanea di debug.
 */
import "./style.css"
import * as THREE from "three"
import { createRenderer } from "./core/createRenderer"
import { CameraRig } from "./core/CameraRig"
import { GameLoop } from "./core/GameLoop"
import { loadCorridor } from "./world/loadCorridor"
import { InputManager } from "./input/InputManager"
import { Player } from "./player/Player"

// Distanze dai bordi del modello, in metri: da regolare guardando il risultato
const LANE_FROM_BACK = 1.0 // corsia del personaggio, misurata dal retro della parete di fondo
const SIDE_MARGIN = 1.0 // spazio lasciato a inizio e fine corridoio (pareti laterali)

async function main(): Promise<void> {
  const renderer = createRenderer()

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // TEMPORANEA: la toglieremo quando arriva la SpotLight dell'elicottero
  const debugLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1.5)
  scene.add(debugLight)

  const corridor = await loadCorridor()
  scene.add(corridor.model)
  const { min, max } = corridor.bounds

  // Input e personaggio: il cubo nasce all'inizio del corridoio, vicino alla parete di fondo
  const input = new InputManager()
  const player = new Player({
    startX: min.x + SIDE_MARGIN + 0.5,
    laneZ: min.z + LANE_FROM_BACK,
    minX: min.x + SIDE_MARGIN,
    maxX: max.x - SIDE_MARGIN,
  })
  scene.add(player.mesh)

  // La camera parte già centrata sul personaggio
  const cameraRig = new CameraRig(player.mesh.position.x, min.z)

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    cameraRig.resize(window.innerWidth, window.innerHeight)
  })

  // Ordine dentro il frame: prima la logica, poi la camera, per ultimo il disegno
  const loop = new GameLoop(renderer, (delta) => {
    player.update(delta, input)
    cameraRig.follow(player.mesh.position.x, delta)
    renderer.render(scene, cameraRig.camera)
  })
  loop.start()
}

main().catch((error) => console.error("Errore all'avvio:", error))
