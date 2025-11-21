
export interface ContainerSpec {
  name: string;
  width: number;
  height: number;
  depth: number;
  maxLoad: number; // kg
  label: string;
  description?: string;
}

// Dimensions are Internal in cm (User provided mm / 10)
// Max Load is approximate industry standard in kg
export const CONTAINER_TYPES: ContainerSpec[] = [
  { name: '20GP', width: 589.8, height: 239.3, depth: 235.2, maxLoad: 28000, label: '20GP (小柜)', description: '20尺普柜' },
  { name: '40GP', width: 1203.2, height: 239.3, depth: 235.2, maxLoad: 26000, label: '40GP (平柜)', description: '40尺普柜' },
  { name: '40HQ', width: 1203.2, height: 269.8, depth: 235.2, maxLoad: 26000, label: '40HQ (高柜)', description: '40尺高柜' },
  { name: '45HQ', width: 1355.6, height: 269.8, depth: 235.2, maxLoad: 25000, label: '45HQ (超高)', description: '45尺高柜' },
  { name: '20RF', width: 545.0, height: 225.0, depth: 226.0, maxLoad: 27000, label: '20RF (冷冻)', description: '20尺冷冻柜' },
  { name: '40RF', width: 1155.0, height: 225.0, depth: 228.0, maxLoad: 29000, label: '40RF (冷冻)', description: '40尺冷冻柜' },
];

export const PRESET_COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#84cc16", // Lime
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#8b5cf6", // Violet
  "#d946ef", // Fuchsia
  "#f43f5e", // Rose
  "#64748b", // Slate
  "#78350f", // Brown
];
