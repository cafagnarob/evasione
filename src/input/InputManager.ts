/**
 * InputManager.ts
 *
 * Traduce i tasti premuti in AZIONI di gioco (vai a sinistra, abbassati, corri...).
 * Il resto del gioco non sa quali tasti esistono: chiede solo "questa azione è attiva?".
 * - tastiera: più tasti possono attivare la stessa azione (frecce e WASD)
 * - touch: predisposto con setTouchAction, così i pulsanti mobile useranno le stesse azioni
 * - quando la finestra perde il focus, tutti i tasti vengono rilasciati
 */

/** Tutte le azioni che il giocatore può compiere */
export type Action = "moveLeft" | "moveRight" | "crouch" | "run"

// event.code indica il tasto FISICO: funziona uguale su tastiere italiane, inglesi, francesi...
const KEY_BINDINGS: Record<Action, string[]> = {
  moveLeft: ["ArrowLeft", "KeyA"],
  moveRight: ["ArrowRight", "KeyD"],
  crouch: ["ArrowDown", "KeyS", "KeyC"],
  run: ["ShiftLeft", "ShiftRight"],
}

export class InputManager {
  private readonly pressedKeys = new Set<string>()
  private readonly touchActions = new Set<Action>()

  constructor() {
    window.addEventListener("keydown", this.onKeyDown)
    window.addEventListener("keyup", this.onKeyUp)
    window.addEventListener("blur", this.onBlur)
  }

  /** L'unica domanda che il gioco fa all'input: questa azione è attiva adesso? */
  isActive(action: Action): boolean {
    if (this.touchActions.has(action)) return true
    return KEY_BINDINGS[action].some((code) => this.pressedKeys.has(code))
  }

  /** Usato dai pulsanti touch (li aggiungeremo dopo) */
  setTouchAction(action: Action, active: boolean): void {
    if (active) this.touchActions.add(action)
    else this.touchActions.delete(action)
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    // Le frecce farebbero scorrere la pagina: lo impediamo
    if (event.code.startsWith("Arrow")) event.preventDefault()
    this.pressedKeys.add(event.code)
  }

  private onKeyUp = (event: KeyboardEvent): void => {
    this.pressedKeys.delete(event.code)
  }

  // Se cambi finestra con un tasto premuto, il keyup non arriva mai: lo azzeriamo noi
  private onBlur = (): void => {
    this.pressedKeys.clear()
  }
}
