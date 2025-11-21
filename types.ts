export interface Dimensions {
  width: number;  // x axis
  height: number; // y axis
  depth: number;  // z axis
}

export interface BoxItem {
  id: string;
  width: number;
  height: number;
  depth: number;
  weight: number; // kg
  cantStackTop: boolean;
  color: string;
  position?: [number, number, number]; // [x, y, z] - bottom-left-front corner
  placed: boolean;
}

export interface ContainerStats {
  totalVolume: number;
  usedVolume: number;
  boxCount: number;
  placedCount: number;
  totalWeight: number;
  loadedWeight: number;
}