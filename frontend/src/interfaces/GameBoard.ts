import { COLORS } from "../constants/contstants";

type Color = keyof typeof COLORS; // 'gray' | 'yellow' | 'green' | 'input' | 'default'

interface Cell {
  letter: string;
  color: Color;
  local: boolean;
}
type Grid = Cell[][];

interface GameStart {
  message: string;
  attempts: number;
}

export type { Cell, Grid, GameStart };
