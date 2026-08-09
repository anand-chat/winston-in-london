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
  sky1:     '#D3E2E8', // horizon
  sky2:     '#8FB2CC', // zenith
  red:      '#D6392C', // phone box, bus
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
  G: '#5F7D4F', // green (litter bin)
  X: '#96271F', // dark red shade
  Y: '#F2B33D',
  A: '#E8853B', // orange (carrot)
  Z: '#3A3F46', // dark slate shade
};

// Coat swaps for the relay dogs: remap Winston's black (K) and fur
// shade (F) to each pup's colors, keeping white markings and features.
export const SKINS = {
  winston: null,
  mocca: { K: '#C9A87C', F: '#AD8B5D' }, // beige & white
  maui:  { K: '#4A4E57', F: '#33363D' }, // dark grey & white
  max:   { K: '#2B2620', F: '#8A5A2B', C: '#D9A05B' }, // German Shepherd tan & black
};

export function drawMatrix(ctx, matrix, x, y, scale, remap) {
  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    let c = 0;
    while (c < row.length) {
      const ch = row[c];
      if (ch === '.') { c++; continue; }
      let end = c + 1;
      while (end < row.length && row[end] === ch) end++;
      const color = (remap && remap[ch]) || CHAR_MAP[ch];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + c * scale, y + r * scale, (end - c) * scale, scale);
      }
      c = end;
    }
  }
}
