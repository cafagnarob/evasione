/**
 * Player.ts
 *
 * Il personaggio, per ora un cubo. Si muove solo lungo X (vista laterale 2.5D).
 * - velocità diverse per camminare, correre e muoversi accovacciato
 * - abbassandosi diventa più basso ma resta con i piedi a terra
 * - non può uscire dai limiti del corridoio (minX, maxX)
 * Riceve le AZIONI dall'InputManager: non sa nulla di tasti o touch.
 */
import * as THREE from "three"
import type { InputManager } from "../input/InputManager"

// Misure in metri
const WIDTH = 0.5
const STAND_HEIGHT = 1.8
const CROUCH_HEIGHT = 1.0

// Velocità in metri al secondo
const WALK_SPEED = 2.5
const RUN_SPEED = 5
const CROUCH_SPEED = 1.2

/** Dove nasce il personaggio e entro quali limiti può muoversi */
export interface PlayerConfig {
  startX: number
  laneZ: number // la "corsia" in profondità: vicino alla parete di fondo
  minX: number
  maxX: number
}

export class Player {
  readonly mesh: THREE.Mesh
  private crouching = false

  constructor(private readonly config: PlayerConfig) {
    const geometry = new THREE.BoxGeometry(WIDTH, STAND_HEIGHT, WIDTH)
    const material = new THREE.MeshStandardMaterial({ color: 0x202020 })
    this.mesh = new THREE.Mesh(geometry, material)
    this.mesh.castShadow = true

    // Il box è centrato sulla sua origine: per avere i piedi a Y = 0 lo alziamo di metà altezza
    this.mesh.position.set(config.startX, STAND_HEIGHT / 2, config.laneZ)
  }

  get isCrouching(): boolean {
    return this.crouching
  }

  get currentHeight(): number {
    return this.crouching ? CROUCH_HEIGHT : STAND_HEIGHT
  }

  /** Chiamato dal game loop a ogni frame */
  update(delta: number, input: InputManager): void {
    this.updateCrouch(input.isActive("crouch"))
    this.updateMovement(delta, input)
  }

  private updateCrouch(wantsCrouch: boolean): void {
    if (wantsCrouch === this.crouching) return // nessun cambiamento
    this.crouching = wantsCrouch

    const height = this.currentHeight
    // La scala agisce dal centro del box: rimpiccioliamo e poi riabbassiamo il centro
    this.mesh.scale.y = height / STAND_HEIGHT
    this.mesh.position.y = height / 2
  }

  private updateMovement(delta: number, input: InputManager): void {
    let direction = 0
    if (input.isActive("moveLeft")) direction -= 1
    if (input.isActive("moveRight")) direction += 1
    if (direction === 0) return // fermo, oppure entrambe le direzioni premute

    const speed = this.getSpeed(input)
    const nextX = this.mesh.position.x + direction * speed * delta

    // Il clamp tiene il valore dentro i limiti del corridoio
    this.mesh.position.x = THREE.MathUtils.clamp(
      nextX,
      this.config.minX,
      this.config.maxX,
    )
  }

  private getSpeed(input: InputManager): number {
    if (this.crouching) return CROUCH_SPEED // accovacciati non si corre
    if (input.isActive("run")) return RUN_SPEED
    return WALK_SPEED
  }
}
