import { ActivityDefinition } from '@/types';

export const ACTIVITIES: ActivityDefinition[] = [
  { id: 'musculacao', name: 'Musculação', icon: 'Dumbbell', metric: 'time', minutesPerPoint: 60, description: '60 min = 1 pt' },
  { id: 'crossfit', name: 'Crossfit', icon: 'Flame', metric: 'time', minutesPerPoint: 60, description: '60 min = 1 pt' },
  { id: 'funcional', name: 'Funcional', icon: 'Target', metric: 'time', minutesPerPoint: 60, description: '60 min = 1 pt' },
  { id: 'artes-marciais', name: 'Artes Marciais', icon: 'Swords', metric: 'time', minutesPerPoint: 60, description: '60 min = 1 pt' },
  { id: 'esportes', name: 'Esportes c/ Bola', icon: 'CircleDot', metric: 'time', minutesPerPoint: 60, description: '60 min = 1 pt' },
  { id: 'esteira', name: 'Esteira', icon: 'Timer', metric: 'time', minutesPerPoint: 30, description: '30 min = 1 pt' },
  { id: 'bike-ergometrica', name: 'Bike Ergométrica', icon: 'Bike', metric: 'time', minutesPerPoint: 45, description: '45 min = 1 pt' },
  { id: 'escada', name: 'Escada', icon: 'ArrowUpRight', metric: 'time', minutesPerPoint: 20, description: '20 min = 1 pt' },
  { id: 'eliptico', name: 'Elíptico', icon: 'Activity', metric: 'time', minutesPerPoint: 25, description: '25 min = 1 pt' },
  { id: 'caminhada', name: 'Caminhada', icon: 'Footprints', metric: 'distance', kmPerPoint: 5, description: '5 km = 1 pt' },
  { id: 'corrida', name: 'Corrida', icon: 'Zap', metric: 'distance', kmPerPoint: 3, description: '3 km = 1 pt' },
  { id: 'bike-rua', name: 'Bicicleta', icon: 'Bike', metric: 'distance', kmPerPoint: 5, description: '5 km = 1 pt' },
];

export const MAX_DAILY_POINTS = 4;
