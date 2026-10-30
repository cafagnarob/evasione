/**
 * Helicopter.ts
 *
 * La luce dell'elicottero: una SpotLight FUORI dall'edificio, dietro la parete di fondo
 * e in alto, che punta dentro il corridoio attraverso le finestre.
 * - pattuglia avanti e indietro lungo tutto il corridoio
 * - il movimento somma due oscillazioni per sembrare "nervoso" e non meccanico
 * - proietta ombre: sono le pareti e le sbarre a decidere dove entra la luce
 * Implementa LightSource, quindi il rilevamento lo tratta come una luce qualsiasi.
 */
import * as THREE from "three"
import type { LightSource } from "./LightSource"

// Posizione rispetto alla parete di fondo, in metri
const HEIGHT = 4
const DISTANCE_BEHIND_WALL = 12

// Forma del fascio
const CONE_ANGLE = Math.PI / 10 // 18° di semi-apertura
const PENUMBRA = 0.4 // 0 = bordo netto, 1 = bordo molto sfumato
const INTENSITY = 6

// Pattugliamento
const PATROL_SPEED = 0.25 // radianti al secondo: un'andata e ritorno ogni ~25 s
const JITTER_SPEED = 1.7
const JITTER_AMOUNT = 0.4 // metri di oscillazione "nervosa"

export interface HelicopterConfig {
  minX: number
  maxX: number
  wallZ: number // retro della parete di fondo
  aimZ: number // profondità a cui punta il fascio (la corsia del personaggio)
}

export class Helicopter implements LightSource {
  readonly object = new THREE.Group()
  private readonly light: THREE.SpotLight
  private readonly target = new THREE.Object3D()
  private time = 0

  constructor(private readonly config: HelicopterConfig) {
    this.light = new THREE.SpotLight(
      0xffffff,
      INTENSITY,
      0,
      CONE_ANGLE,
      PENUMBRA,
      0,
    )
    this.light.position.set(0, HEIGHT, config.wallZ - DISTANCE_BEHIND_WALL)

    // Ombre: risoluzione alta perché le sbarre sono sottili
    this.light.castShadow = true
    this.light.shadow.mapSize.set(2048, 2048)
    this.light.shadow.bias = -0.0005
    this.light.shadow.normalBias = 0.02

    // La SpotLight punta verso il suo target, che deve far parte della scena
    this.target.position.set(0, 0, config.aimZ)
    this.light.target = this.target

    this.object.add(this.light, this.target)
  }

  update(delta: number): void {
    this.time += delta

    const center = (this.config.minX + this.config.maxX) / 2
    const halfLength = (this.config.maxX - this.config.minX) / 2

    // Oscillazione lenta lungo il corridoio + piccola oscillazione veloce
    const patrol = Math.sin(this.time * PATROL_SPEED) * halfLength
    const jitter = Math.sin(this.time * JITTER_SPEED) * JITTER_AMOUNT
    const x = center + patrol + jitter

    this.light.position.x = x
    this.target.position.x = x
  }

  getPosition(out: THREE.Vector3): THREE.Vector3 {
    return this.light.getWorldPosition(out)
  }

  getDirection(out: THREE.Vector3): THREE.Vector3 {
    const from = this.light.getWorldPosition(new THREE.Vector3())
    return this.target.getWorldPosition(out).sub(from).normalize()
  }

  getConeAngle(): number {
    return this.light.angle
  }
}
