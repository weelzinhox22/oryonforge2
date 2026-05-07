import { ActivityDefinition } from '@/types';

export const ACTIVITIES: ActivityDefinition[] = [
  { id: 'musculacao', name: 'Musculação', icon: 'Dumbbell', metric: 'time', unit: 'min', factor: 60, description: '60 min = 1 pt' },
  { id: 'crossfit', name: 'Crossfit', icon: 'Flame', metric: 'time', unit: 'min', factor: 60, description: '60 min = 1 pt' },
  { id: 'funcional', name: 'Funcional', icon: 'Target', metric: 'time', unit: 'min', factor: 60, description: '60 min = 1 pt' },
  { id: 'artes-marciais', name: 'Artes Marciais', icon: 'Swords', metric: 'time', unit: 'min', factor: 60, description: '60 min = 1 pt' },
  { id: 'esportes', name: 'Esportes c/ Bola', icon: 'CircleDot', metric: 'time', unit: 'min', factor: 60, description: '60 min = 1 pt' },
  { id: 'esteira', name: 'Esteira', icon: 'Timer', metric: 'time', unit: 'min', factor: 30, description: '30 min = 1 pt' },
  { id: 'bike-ergometrica', name: 'Bike Ergométrica', icon: 'Bike', metric: 'time', unit: 'min', factor: 45, description: '45 min = 1 pt' },
  { id: 'escada', name: 'Escada', icon: 'ArrowUpRight', metric: 'time', unit: 'min', factor: 20, description: '20 min = 1 pt' },
  { id: 'eliptico', name: 'Elíptico', icon: 'Activity', metric: 'time', unit: 'min', factor: 25, description: '25 min = 1 pt' },
  { id: 'caminhada', name: 'Caminhada', icon: 'Footprints', metric: 'distance', unit: 'km', factor: 5, description: '5 km = 1 pt' },
  { id: 'corrida', name: 'Corrida', icon: 'Zap', metric: 'distance', unit: 'km', factor: 3, description: '3 km = 1 pt' },
  { id: 'bike-rua', name: 'Bicicleta', icon: 'Bike', metric: 'distance', unit: 'km', factor: 5, description: '5 km = 1 pt' },
];

export const MAX_DAILY_POINTS = 4;
