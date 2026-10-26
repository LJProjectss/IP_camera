/** localStorage kan ontbreken of geblokkeerd zijn (privévenster); val dan terug op de standaardwaarde. */
export function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Opslaan is een gemak, geen vereiste.
  }
}
