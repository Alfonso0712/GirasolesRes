export function naturalCompare(a: string, b: string): number {
  const ax: (string | number)[] = [];
  const bx: (string | number)[] = [];

  a.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
    ax.push($1 ? Number($1) : $2);
    return '';
  });

  b.replace(/(\d+)|(\D+)/g, (_, $1, $2) => {
    bx.push($1 ? Number($1) : $2);
    return '';
  });

  while (ax.length && bx.length) {
    const an = ax.shift()!;
    const bn = bx.shift()!;
    const nn = typeof an === 'number' && typeof bn === 'number'
      ? an - bn
      : String(an).localeCompare(String(bn), 'es', { sensitivity: 'base' });
    if (nn) return nn;
  }

  return ax.length - bx.length;
}
