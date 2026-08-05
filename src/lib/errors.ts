export function formatError(err: unknown): string {
  if (err instanceof Error) return err.message
  return String(err)
}

export function logProcessingError(phase: string, err: unknown): void {
  console.error(`[PDF Splitter] Falha na etapa "${phase}":`, err)
}
