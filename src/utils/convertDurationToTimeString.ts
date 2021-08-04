export function convertDurationToTimeString(duration: number) {
  return new Date(duration * 1000).toISOString().substr(11, 8)
}