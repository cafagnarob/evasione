/**
 * main.ts
 *
 * Punto di ingresso del gioco: crea i pezzi e li collega tra loro.
 * Ordine: renderer → scena → corridoio → camera → game loop.
 * Per ora contiene anche una luce temporanea di debug e la stampa
 * delle dimensioni del corridoio in console.
 */
import "./style.css"
import * as THREE from "three"
import { createRenderer } from "./core/createRenderer"
import { CameraRig } from "./core/CameraRig"
import { GameLoop } from "./core/GameLoop"
import { loadCorridor } from "./world/loadCorridor"

async function main(): Promise<void> {
  const renderer = createRenderer()

  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // TEMPORANEA: senza l'elicottero il corridoio sarebbe completamente nero.
  // La toglieremo quando arriva la SpotLight.
  const debugLight = new THREE.HemisphereLight(0xffffff, 0x222222, 1.5)
  scene.add(debugLight)

  const corridor = await loadCorridor()
  scene.add(corridor.model)

  // DEBUG: dimensioni e posizione del corridoio, per verificare la scala
  const size = corridor.bounds.getSize(new THREE.Vector3())
  console.log("Dimensioni corridoio (m):", size)
  console.log("Bounds min:", corridor.bounds.min, "max:", corridor.bounds.max)

  // La camera parte dal centro del corridoio, così vediamo il modello per intero o quasi
  const center = corridor.bounds.getCenter(new THREE.Vector3())
  const cameraRig = new CameraRig(center.x, corridor.bounds.min.z)

  // Finestra ridimensionata o telefono ruotato: aggiorniamo renderer e camera
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight)
    cameraRig.resize(window.innerWidth, window.innerHeight)
  })

  // Per ora l'unica cosa da fare a ogni frame è disegnare
  const loop = new GameLoop(renderer, () => {
    renderer.render(scene, cameraRig.camera)
  })
  loop.start()
}

main().catch((error) => console.error("Errore all'avvio:", error))
