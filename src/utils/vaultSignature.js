// Deterministically derives a unique pair of accent colors from a
// vault's own ID - same vault always gets the same colors, different
// vaults get visibly different moods, with no manual color-picking.
export function vaultSignatureColors(vaultId) {
  if (!vaultId) return null;

  let hash = 0;
  for (let i = 0; i < vaultId.length; i++) {
    hash = (hash * 31 + vaultId.charCodeAt(i)) >>> 0;
  }

  const hueA = hash % 360;
  const hueB = (hueA + 140) % 360;

  return {
    colorA: `hsl(${hueA}, 70%, 60%)`,
    colorB: `hsl(${hueB}, 70%, 60%)`
  };
}