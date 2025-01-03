import { COLORS } from "../constants/contstants";

type Color = keyof typeof COLORS; // 'gray' | 'yellow' | 'green' | 'input'

export interface Cell {
  letter: string;
  color: Color;
  local: boolean;
}
export type Grid = Cell[][];

export interface GameStart {
  message: string;
  attempts: number;
}
