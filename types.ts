
export type Category = 'Tops' | 'Bottoms' | 'Shoes' | 'Accessories' | 'Outerwear';

export interface SustainabilityMetric {
  rating: 'A' | 'B' | 'C' | 'D' | 'F';
  carbonFootprint: string; // e.g. "4.5 kg CO2"
  waterUsage: string; // e.g. "2700 L"
  materialAnalysis: string;
}

export interface WardrobeItem {
  id: string;
  title: string;
  category: Category;
  imageUrl: string;
  tags: string[];
  color: string;
  fabric: string;
  wearCount: number;
  cost: number; // For "Money Saved" calculations
  sustainability?: SustainabilityMetric;
  dateAdded: string;
  brand?: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  recommendation: string;
}

export interface GatekeeperVerdict {
  decision: 'APPROVED' | 'REJECTED';
  reason: string;
  similarItemId?: string;
  carbonImpact: 'Low' | 'Medium' | 'High';
  potentialOutfits: number;
}

export enum AppView {
  DASHBOARD = 'dashboard',
  VAULT = 'vault',
  ORCHESTRATOR = 'orchestrator',
  GATEKEEPER = 'gatekeeper',
  IMPACT = 'impact',
  SETTINGS = 'settings'
}