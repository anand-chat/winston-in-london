// Winston pixel matrices. 23 cols x 20 rows standing (46x40 at PIXEL_SCALE 2),
// 23 x 13 ducking (46x26). Facing right. Char map in palette.js.
// K ink, F fur shade, C cream, T tan, P tongue, N nose, E eye white.

// Shared head+body top (rows 0..13), legs vary per frame (rows 14..19).
// Long-haired: feathered ears, chest ruff, plume tail.

const BODY_RUN_A = [
  '......K......KKK....KKK',
  '.....KK.....KKKK...KKKK',
  '....KKK.....KKKKK.KKKKK',
  '...KKKK.....KKKKKKKKKKK',
  '..KKKK......KKTKKKKKTKK',
  '...KKK......KEKKKKKKKEK',
  '....KK.....KKKKKCCCKKKK',
  '.....KKKKKKKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCCNN.',
  '....KKKKKKKKKKKKCCCCNN.',
  '...KKKKKKKKKKKKKCCCC...',
  '...KKKFFFFFKKKKKCCC....',
  '...KKFFFFFFFKKKCCC.....',
  '....KKKKKKKKKKKCC......',
];

const BODY_RUN_B = [
  '......K.....KKKK...KKKK',
  '.....KK.....KKKKK.KKKKK',
  '....KKK.....KKKKKKKKKKK',
  '..KKKKK.....KKKKKKKKKKK',
  '.KKKKK......KKTKKKKKTKK',
  '..KKKK......KEKKKKKKKEK',
  '....KK.....KKKKKCCCKKKK',
  '.....KKKKKKKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCCNN.',
  '....KKKKKKKKKKKKCCCCNNP',
  '...KKKKKKKKKKKKKCCCC..P',
  '...KKKFFFFFKKKKKCCC....',
  '...KKFFFFFFFKKKCCC.....',
  '....KKKKKKKKKKKCC......',
];

export const RUN_1 = [
  ...BODY_RUN_A,
  '.....KKK....KKKK.......',
  '....KKK.......KKK......',
  '....KK.........KK......',
  '...KKC.........KKC.....',
  '...CC...........CC.....',
  '.......................',
];

export const RUN_2 = [
  ...BODY_RUN_B,
  '.....KKKKKKKKKK........',
  '......KKK...KKK........',
  '.....KKK.....KKK.......',
  '....KKC.......KKC......',
  '....CC.........CC......',
  '.......................',
];

export const RUN_3 = [
  ...BODY_RUN_A,
  '......KKKKKKKK.........',
  '.......KKKKKK..........',
  '.......KKKKK...........',
  '.......KCKC............',
  '.......C..C............',
  '.......................',
];

export const RUN_4 = [
  ...BODY_RUN_B,
  '....KKKK....KKK........',
  '...KKK.......KKK.......',
  '..KKK.........KKK......',
  '..KKC..........KKC.....',
  '..CC............CC.....',
  '.......................',
];

export const JUMP_RISE = [
  '.KK.........KKKKK.KKKKK',
  '..KKK.......KKKKKKKKKKK',
  '...KKK......KKKKKKKKKKK',
  '....KKK.....KKKKKKKKKKK',
  '.....KK.....KKTKKKKKTKK',
  '.....KK.....KEKKKKKKKEK',
  '......K....KKKKKCCCKKKK',
  '.....KKKKKKKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCCNN.',
  '....KKKKKKKKKKKKCCCCNNP',
  '...KKKKKKKKKKKKKCCCC..P',
  '...KKKFFFFFKKKKKCCC..P.',
  '...KKFFFFFFFKKKCCC.....',
  '....KKKKKKKKKKKKCC.....',
  '.....KKKK....KKKKC.....',
  '......KKK.....KKC......',
  '.......KK......KC......',
  '........K..............',
  '.......................',
  '.......................',
];

export const JUMP_FALL = [
  '......K......KKK...KKK.',
  '.....KK.....KKKKK.KKKKK',
  '....KKK.....KKKKKKKKKKK',
  '...KKKK.....KKKKKKKKKKK',
  '..KKKK......KKTKKKKKTKK',
  '..KKK.......KEKKKKKKKEK',
  '...KK......KKKKKCCCKKKK',
  '.....KKKKKKKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCCNN.',
  '....KKKKKKKKKKKKCCCCNN.',
  '...KKKKKKKKKKKKKCCCC...',
  '...KKKFFFFFKKKKKCCC....',
  '...KKFFFFFFFKKKCCC.....',
  '....KKKKKKKKKKKCC......',
  '....KKK......KKK.......',
  '...KKK........KKK......',
  '..KKK..........KKK.....',
  '..KC............KC.....',
  '..C..............C.....',
  '.......................',
];

// Duck: 23 x 13 (46 x 26)
export const DUCK_1 = [
  '.KK..........KKKKKKKKK.',
  '..KKK......KKKKKKKKKKKK',
  '...KKKKKKKKKKKKTKKKKTKK',
  '..KKKKKKKKKKKKKEKKKKKEK',
  '.KKKKKKKKKKKKKKKKCCCKKK',
  '.KKKKKFFFFFKKKKKCCCCNN.',
  '.KKKKFFFFFFFKKKKCCCCNN.',
  '..KKKKKKKKKKKKKKKCCC...',
  '..KKKKKKKKKKKKKKKCC....',
  '...KKKK......KKKK......',
  '...KKK........KKK......',
  '...KKC........KKC......',
  '...CC..........CC......',
];

export const DUCK_2 = [
  '..KK.........KKKKKKKKK.',
  '.KKKK......KKKKKKKKKKKK',
  '..KKKKKKKKKKKKKTKKKKTKK',
  '..KKKKKKKKKKKKKEKKKKKEK',
  '.KKKKKKKKKKKKKKKKCCCKKK',
  '.KKKKKFFFFFKKKKKCCCCNN.',
  '.KKKKFFFFFFFKKKKCCCCNN.',
  '..KKKKKKKKKKKKKKKCCC...',
  '..KKKKKKKKKKKKKKKCC....',
  '....KKKK....KKKK.......',
  '.....KKK.....KKK.......',
  '.....KKC.....KKC.......',
  '.....CC.......CC.......',
];

export const HURT = [
  '.......................',
  '.......................',
  '............KKK....KKK.',
  '............KKKK..KKKK.',
  '............KKKKKKKKKK.',
  '.....K......KKKKKKKKKKK',
  '....KK......KKTKKKKKTKK',
  '...KKK......KKKKKKKKKKK',
  '...KKK......KEKKKKKKKEK',
  '....KKK....KKKKKCCCKKKK',
  '.....KKKKKKKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCCNN.',
  '....KKKKKKKKKKKKCCCCNN.',
  '...KKKKKKKKKKKKKCCCC...',
  '...KKKFFFFFFKKKKCCC....',
  '...KKFFFFFFFFKKKCC.....',
  '...KKKKKKKKKKKKKK......',
  '...KKKK..KKKK..KK......',
  '...KKC....KKC..KC......',
  '...CC......CC..C.......',
];

export const IDLE_1 = [
  '.......................',
  '............KKK...KKK..',
  '...........KKKK...KKKK.',
  '...........KKKKK.KKKKK.',
  '.....K.....KKKKKKKKKKK.',
  '....KK.....KKTKKKKKTKK.',
  '...KKK.....KEKKKKKKKEK.',
  '...KKK....KKKKKCCCKKKK.',
  '....KKK...KKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCCNN.',
  '.....KKKKKKKKKKKCCCCNN.',
  '....KKKKKKKKKKKKCCCC...',
  '...KKKKKKKKKKKKKCCC....',
  '...KKKFFFFFFKKKKCC.....',
  '...KKFFFFFFFFKKKC......',
  '...KKKKKKKKKKKKKK......',
  '...KKKK..KKKK..KK......',
  '...KKK....KKK..KK......',
  '...KKC....KKC..KC......',
  '...CC......CC..C.......',
];

export const IDLE_2 = [
  '.......................',
  '............KKK...KKK..',
  '...........KKKK...KKKK.',
  '...........KKKKK.KKKKK.',
  '..K........KKKKKKKKKKK.',
  '..KK.......KKTKKKKKTKK.',
  '...KKK.....KEKKKKKKKEK.',
  '...KKK....KKKKKCCCKKKK.',
  '....KKK...KKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCCNN.',
  '.....KKKKKKKKKKKCCCCNN.',
  '....KKKKKKKKKKKKCCCC...',
  '...KKKKKKKKKKKKKCCC....',
  '...KKKFFFFFFKKKKCC.....',
  '...KKFFFFFFFFKKKC......',
  '...KKKKKKKKKKKKKK......',
  '...KKKK..KKKK..KK......',
  '...KKK....KKK..KK......',
  '...KKC....KKC..KC......',
  '...CC......CC..C.......',
];

// Eyes closed happy, ball in mouth.
export const CATCH = [
  '.......................',
  '............KKK...KKK..',
  '...........KKKK...KKKK.',
  '...........KKKKK.KKKKK.',
  '.....K.....KKKKKKKKKKK.',
  '....KK.....KKTKKKKKTKK.',
  '...KKK.....KKKKKKKKKKK.',
  '...KKK....KKKKKCCCKKKK.',
  '....KKK...KKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCBBB.',
  '.....KKKKKKKKKKKCCBBBBB',
  '....KKKKKKKKKKKKCCBBLBB',
  '...KKKKKKKKKKKKKCCBBBBB',
  '...KKKFFFFFFKKKKCC.BBB.',
  '...KKFFFFFFFFKKKC......',
  '...KKKKKKKKKKKKKK......',
  '...KKKK..KKKK..KK......',
  '...KKK....KKK..KK......',
  '...KKC....KKC..KC......',
  '...CC......CC..C.......',
];

export const RUN_FRAMES = [RUN_1, RUN_2, RUN_3, RUN_4];
export const DUCK_FRAMES = [DUCK_1, DUCK_2];
export const IDLE_FRAMES = [IDLE_1, IDLE_2];
