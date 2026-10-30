/**
 * createRenderer.ts
 *
 * Crea il renderer WebGL: l'oggetto che disegna la scena 3D nel browser.
 * - attiva l'antialiasing per bordi più puliti
 * - limita il pixel ratio a 2 per non appesantire i telefoni
 * - attiva le ombre, indispensabili per la luce dell'elicottero
 * - aggiunge il canvas alla pagina e lo restituisce a chi lo usa
 */
import * as THREE from "three"

export function createRenderer(): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({ antialias: true })

  // Schermi ad alta densità: oltre 2 il costo cresce molto senza differenza visibile
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  // Ombre: senza questa riga nessuna luce proietterà ombre, nemmeno dalle sbarre
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap

  // Tone mapping: avvicina la resa a quella di Blender (AgX è il default di Blender 4)
  renderer.toneMapping = THREE.AgXToneMapping
  renderer.toneMappingExposure = 1

  // Il canvas è l'elemento HTML in cui Three.js disegna
  document.body.appendChild(renderer.domElement)

  return renderer
}
