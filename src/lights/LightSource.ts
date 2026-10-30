/**
 * LightSource.ts
 *
 * Il "contratto" che ogni luce pericolosa del gioco deve rispettare
 * (elicottero oggi; fari fissi, torce delle guardie domani).
 * Il sistema di rilevamento lavora solo con questa interfaccia:
 * non sa e non deve sapere che tipo di luce ha davanti.
 */
import type * as THREE from "three"

export interface LightSource {
  /** L'oggetto da aggiungere alla scena (contiene la luce e il suo bersaglio) */
  readonly object: THREE.Object3D

  /** Scrive in "out" la posizione della luce nel mondo e lo restituisce */
  getPosition(out: THREE.Vector3): THREE.Vector3

  /** Scrive in "out" la direzione del fascio (vettore di lunghezza 1) e lo restituisce */
  getDirection(out: THREE.Vector3): THREE.Vector3

  /** Metà dell'apertura del cono, in radianti */
  getConeAngle(): number

  /** Aggiorna movimento e comportamento della luce */
  update(delta: number): void
}
