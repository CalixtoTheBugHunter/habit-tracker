export function formatMessage(
  message: string,
  values: Record<string, string | number>
): string {
  return message.replace(/\{(\w+)\}/g, (_, key) =>
    String(values[key] ?? '')
  )
}
