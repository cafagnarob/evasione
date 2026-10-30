/**
 * loadCorridor.ts
 *
 * Carica il modello del corridoio esportato da Blender (GLB) e lo prepara per il gioco.
 * - attiva ombre proiettate e ricevute su tutte le mesh
 * - calcola il "box" che contiene il corridoio (bounds): dimensioni e posizione,
 *   utili a camera, elicottero e personaggio per sapere dove inizia e finisce
 */
import * as THREE from "three"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js"

// I file in public/ si richiamano dalla radice del sito, senza scrivere "public"
const CORRIDOR_URL = "/models/corridoio.glb"

/** Ciò che il resto del gioco riceve dal caricamento */
export interface Corridor {
  model: THREE.Group
  bounds: THREE.Box3
}

export async function loadCorridor(): Promise<Corridor> {
  const loader = new GLTFLoader()
  const gltf = await loader.loadAsync(CORRIDOR_URL)
  const model = gltf.scene

  // Ogni pezzo del corridoio proietta e riceve ombre
  model.traverse((obj) => {
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true
      obj.receiveShadow = true
    }
  })

  // Il box più piccolo che contiene tutto il modello
  const bounds = new THREE.Box3().setFromObject(model)

  // Un box vuoto significa che il file non contiene geometria: meglio fermarsi con un messaggio chiaro
  if (bounds.isEmpty()) {
    throw new Error(
      `Il modello ${CORRIDOR_URL} non contiene geometria: controlla l'export da Blender`,
    )
  }

  return { model, bounds }
}
