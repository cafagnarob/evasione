/**
 * GameLoop.ts
 *
 * Il "battito" del gioco: a ogni frame calcola quanto tempo è passato
 * dal frame precedente (delta, in secondi) e chiama la funzione di update.
 * - usa renderer.setAnimationLoop, che si sincronizza con lo schermo
 * - limita il delta a un massimo, per evitare salti dopo una pausa
 * - start() e stop() permettono di fermare il gioco (game over, menu)
 */
import * as THREE from "three"

// Mai più di 0,1 s per frame: se il browser si blocca, il gioco rallenta invece di "saltare"
const MAX_DELTA = 0.1

export type UpdateFn = (delta: number) => void

export class GameLoop {
  private lastTime: number | null = null

  constructor(
    private readonly renderer: THREE.WebGLRenderer,
    private readonly onUpdate: UpdateFn,
  ) {}

  start(): void {
    this.lastTime = null
    this.renderer.setAnimationLoop(this.tick)
  }

  stop(): void {
    this.renderer.setAnimationLoop(null)
  }

  // Arrow function: mantiene "this" collegato alla classe quando il browser la richiama
  private tick = (time: number): void => {
    // Primo frame: non c'è un frame precedente, quindi delta = 0
    const delta = this.lastTime === null ? 0 : (time - this.lastTime) / 1000
    this.lastTime = time

    this.onUpdate(Math.min(delta, MAX_DELTA))
  }
}
