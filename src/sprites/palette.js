export const PALETTE = {
  ink:      '#1B1B1F', // Winston's black fur, outlines
  fur:      '#2E2B33', // fur shading
  cream:    '#F5EFE3', // Winston's white markings, stone
  tan:      '#C99A63', // Winston's tan eyebrow dots
  tongue:   '#E8748A',
  nose:     '#141317',
  ball:     '#D8F32A', // THE accent — used nowhere else
  ballLine: '#F7FBE4',
  brick:    '#9A4B3F',
  slate:    '#4A5560',
  stone:    '#D6CDBD',
  sky1:     '#BFD4DE', // horizon
  sky2:     '#8FAFC4', // zenith
  red:      '#C0322B', // phone box, bus
  black:    '#232326', // taxi
  moss:     '#5E7A55',
  wet:      '#7C8C99', // puddles, rain
};

// Character map for pixel matrices
export const CHAR_MAP = {
  K: PALETTE.ink,
  F: PALETTE.fur,
  C: PALETTE.cream,
  T: PALETTE.tan,
  P: PALETTE.tongue,
  N: PALETTE.nose,
  E: '#FFFFFF',
  B: PALETTE.ball,
  L: PALETTE.ballLine,
  R: PALETTE.red,
  S: PALETTE.slate,
  O: PALETTE.stone,
  M: PALETTE.moss,
  W: PALETTE.wet,
  D: PALETTE.black,
  G: '#B8B4AC', // grey (bin, squirrel)
  X: '#8A2A24', // dark red shade
  Y: '#E8A33D', // amber (windows, cone stripe)
  Z: '#3A3F46', // dark slate shade
};

export function drawMatrix(ctx, matrix, x, y, scale) {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      if (ch === '.') { c++; continue; }
      let end = c + 1;
      while (end < row.length && row[end] === ch) end++;
      const color = CHAR_MAP[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + c * scale, y + r * scale, (end - c) * scale, scale);
      }
      c = end;
    }
  }
}
