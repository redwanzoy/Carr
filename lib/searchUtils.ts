export function escapeIlikeSearch(value: string): string {
  return value.replace(/[\\%_(),']/g, (character) => `\\${character}`);
}