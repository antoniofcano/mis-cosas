import { readFileSync } from 'node:fs';
import { createChart } from '../src/chart/chart.js';

export const chartData = JSON.parse(readFileSync(new URL('../data/chart-105.json', import.meta.url)));
export const chart = createChart(chartData);
export const ctx = { chart };
