/**
 * CameraRig.ts
 *
 * Gestisce la camera del gioco: una PerspectiveCamera laterale che guarda
 * la parete di fondo del corridoio (vista 2.5D).
 * - FOV basso (32°) per appiattire la prospettiva
 * - posizionata davanti al corridoio (Z positivo), a metà altezza della parete
 * - aggiorna le proporzioni quando la finestra cambia dimensione
 * “Segue il personaggio sull’asse X con un movimento morbido”.
 */
import * as THREE from "three"

// Valori iniziali: li regoleremo dopo aver visto il corridoio nel browser
const FOV = 32
const CAMERA_DISTANCE = 8 // metri davanti alla parete di fondo
const CAMERA_HEIGHT = 1.5 // metà circa della parete da 3 m
const FOLLOW_SPEED = 5 // più è alto, più la camera è "attaccata" al personaggio

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera

  constructor(startX: number, wallZ: number) {
    const aspect = window.innerWidth / window.innerHeight
    this.camera = new THREE.PerspectiveCamera(FOV, aspect, 0.1, 100)

    // La distanza si misura dalla parete di fondo, non dall'origine della scena
    this.camera.position.set(startX, CAMERA_HEIGHT, wallZ + CAMERA_DISTANCE)
    this.camera.lookAt(startX, CAMERA_HEIGHT, wallZ)
  }

  /** Da chiamare quando la finestra cambia dimensione o il telefono ruota */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height
    // Senza questa riga la camera continua a usare le vecchie proporzioni e la scena si deforma
    this.camera.updateProjectionMatrix()
  }

  /** Segue il personaggio sull'asse X con un leggero ritardo, per un movimento morbido */
  follow(targetX: number, delta: number): void {
    // Quota di distanza da recuperare in questo frame, indipendente dagli FPS
    const t = 1 - Math.exp(-FOLLOW_SPEED * delta)
    this.camera.position.x += (targetX - this.camera.position.x) * t
  }
}
