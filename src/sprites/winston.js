// Winston pixel matrices. 23 cols x 20 rows standing (46x40 at PIXEL_SCALE 2),
// 23 x 13 ducking (46x26). Facing right. Char map in palette.js.
// K ink, F fur shade, C cream, T tan, P tongue, N nose, E eye white.

// Petite build: slim torso, and a floppy tail that droops behind him
// instead of standing up.

const BODY_RUN_A = [
  '.............KKK....KKK',
  '............KKKK...KKKK',
  '............KKKKK.KKKKK',
  '............KKKKKKKKKKK',
  '............KKTKKKKKTKK',
  '............KEKKKKKKKEK',
  '...........KKKKKCCCKKKK',
  '.....KKKKKKKKKKCCCCCKKK',
  '...KK..KKKKKKKKCCCCCNN.',
  '..KK..KKKKKKKKKKCCCCNN.',
  '.KC..KKKKKKKKKKKCCCC...',
  '.....KFFFFFKKKKKCCC....',
  '.....KFFFFFKKKKCCC.....',
  '......KKKKKKKKKCC......',
];

const BODY_RUN_B = [
  '............KKKK...KKKK',
  '............KKKKK.KKKKK',
  '............KKKKKKKKKKK',
  '............KKKKKKKKKKK',
  '............KKTKKKKKTKK',
  '............KEKKKKKKKEK',
  '...........KKKKKCCCKKKK',
  '...KK..KKKKKKKKCCCCCKKK',
  '..KC...KKKKKKKKCCCCCNN.',
  '......KKKKKKKKKKCCCCNNP',
  '.....KKKKKKKKKKKCCCC..P',
  '.....KFFFFFKKKKKCCC....',
  '.....KFFFFFKKKKCCC.....',
  '......KKKKKKKKKCC......',
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
  '............KKKKK.KKKKK',
  '............KKKKKKKKKKK',
  '............KKKKKKKKKKK',
  '............KKKKKKKKKKK',
  '............KKTKKKKKTKK',
  '............KEKKKKKKKEK',
  '...........KKKKKCCCKKKK',
  '.....KKKKKKKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCCNN.',
  '.KKKKKKKKKKKKKKKCCCCNNP',
  'KC.KKKKKKKKKKKKKCCCC..P',
  '.....KFFFFFKKKKKCCC..P.',
  '.....KFFFFFKKKKCCC.....',
  '......KKKKKKKKKKCC.....',
  '.....KKKK....KKKKC.....',
  '......KKK.....KKC......',
  '.......KK......KC......',
  '........K..............',
  '.......................',
  '.......................',
];

export const JUMP_FALL = [
  '.............KKK...KKK.',
  '............KKKKK.KKKKK',
  '............KKKKKKKKKKK',
  '............KKKKKKKKKKK',
  '............KKTKKKKKTKK',
  '............KEKKKKKKKEK',
  '...........KKKKKCCCKKKK',
  '.....KKKKKKKKKKCCCCCKKK',
  '..KKKKKKKKKKKKKCCCCCNN.',
  '.KC...KKKKKKKKKKCCCCNN.',
  '.....KKKKKKKKKKKCCCC...',
  '.....KFFFFFKKKKKCCC....',
  '.....KFFFFFKKKKCCC.....',
  '......KKKKKKKKKCC......',
  '....KKK......KKK.......',
  '...KKK........KKK......',
  '..KKK..........KKK.....',
  '..KC............KC.....',
  '..C..............C.....',
  '.......................',
];

// Duck: 23 x 13 (46 x 26)
export const DUCK_1 = [
  '.............KKKKKKKKK.',
  '...........KKKKKKKKKKKK',
  '...KKKKKKKKKKKKTKKKKTKK',
  '.KKKKKKKKKKKKKKEKKKKKEK',
  'KC.KKKKKKKKKKKKKKCCCKKK',
  '...KKKFFFFFKKKKKCCCCNN.',
  '...KKKFFFFFKKKKKCCCCNN.',
  '....KKKKKKKKKKKKKKCCC..',
  '....KKKKKKKKKKKKKKCC...',
  '.....KKKK....KKKK......',
  '.....KKK......KKK......',
  '.....KKC......KKC......',
  '.....CC........CC......',
];

export const DUCK_2 = [
  '.............KKKKKKKKK.',
  '...........KKKKKKKKKKKK',
  '..KKKKKKKKKKKKKTKKKKTKK',
  'KKKKKKKKKKKKKKKEKKKKKEK',
  '.C.KKKKKKKKKKKKKKCCCKKK',
  '...KKKFFFFFKKKKKCCCCNN.',
  '...KKKFFFFFKKKKKCCCCNN.',
  '....KKKKKKKKKKKKKKCCC..',
  '....KKKKKKKKKKKKKKCC...',
  '......KKKK....KKKK.....',
  '.......KKK.....KKK.....',
  '.......KKC.....KKC.....',
  '.......CC.......CC.....',
];

export const HURT = [
  '.......................',
  '.......................',
  '............KKK....KKK.',
  '............KKKK..KKKK.',
  '............KKKKKKKKKK.',
  '............KKKKKKKKKKK',
  '............KKTKKKKKTKK',
  '............KKKKKKKKKKK',
  '............KEKKKKKKKEK',
  '...........KKKKKCCCKKKK',
  '.....KKKKKKKKKKCCCCCKKK',
  '.....KKKKKKKKKKCCCCCNN.',
  '....KKKKKKKKKKKKCCCCNN.',
  '...KKKKKKKKKKKKKCCCC...',
  '.KKKKKFFFFFFKKKKCCC....',
  'KC.KKFFFFFFFKKKKCC.....',
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
  '...........KKKKKKKKKKK.',
  '...........KKTKKKKKTKK.',
  '...........KEKKKKKKKEK.',
  '..........KKKKKCCCKKKK.',
  '..........KKKKKCCCCCKKK',
  '......KKKKKKKKKCCCCCNN.',
  '.....KKKKKKKKKKKCCCCNN.',
  '.....KKKKKKKKKKKCCCC...',
  '.KKKKKKKKKKKKKKKCCC....',
  'KC.KKKFFFFFFKKKKCC.....',
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
  '...........KKKKKKKKKKK.',
  '...........KKTKKKKKTKK.',
  '...........KEKKKKKKKEK.',
  '..........KKKKKCCCKKKK.',
  '..........KKKKKCCCCCKKK',
  '......KKKKKKKKKCCCCCNN.',
  '.....KKKKKKKKKKKCCCCNN.',
  '.....KKKKKKKKKKKCCCC...',
  '..KKKKKKKKKKKKKKCCC....',
  '.KC.KKKFFFFFFKKKCC.....',
  '...KKFFFFFFFFKKKC......',
  '...KKKKKKKKKKKKKK......',
  '...KKKK..KKKK..KK......',
  '...KKK....KKK..KK......',
  '...KKC....KKC..KC......',
  '...CC......CC..C.......',
];

// Eyes closed happy, ball in mouth, tail mid-wag.
export const CATCH = [
  '.......................',
  '............KKK...KKK..',
  '...........KKKK...KKKK.',
  '...........KKKKK.KKKKK.',
  '...........KKKKKKKKKKK.',
  '...........KKTKKKKKTKK.',
  '...........KKKKKKKKKKK.',
  '..........KKKKKCCCKKKK.',
  '..........KKKKKCCCCCKKK',
  '......KKKKKKKKKCCCCBBB.',
  '.....KKKKKKKKKKKCCBBBBB',
  '..KKKKKKKKKKKKKKCCBBLBB',
  '.KC.KKKKKKKKKKKKCCBBBBB',
  '....KKKFFFFFFKKKCC.BBB.',
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
