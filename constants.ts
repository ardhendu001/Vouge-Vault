
import { WardrobeItem } from './types';

export const INITIAL_WARDROBE: WardrobeItem[] = [
  {
    id: '1',
    title: 'Vintage Denim Jacket',
    category: 'Outerwear',
    imageUrl: 'https://picsum.photos/id/338/600/800',
    tags: ['#Casual', '#Vintage', '#Layering'],
    color: 'Blue',
    fabric: 'Cotton Denim',
    wearCount: 42,
    cost: 85,
    sustainability: {
      rating: 'B',
      carbonFootprint: '12 kg CO2',
      waterUsage: '500 L',
      materialAnalysis: 'Recycled Denim, durable but water-intensive initially.'
    },
    dateAdded: '2023-10-15'
  },
  {
    id: '2',
    title: 'Silk Midnight Blouse',
    category: 'Tops',
    imageUrl: 'https://picsum.photos/id/1060/600/800',
    tags: ['#Evening', '#Luxury', '#Breathable'],
    color: 'Black',
    fabric: 'Organic Silk',
    wearCount: 12,
    cost: 150,
    sustainability: {
      rating: 'C',
      carbonFootprint: '8 kg CO2',
      waterUsage: '1200 L',
      materialAnalysis: 'Natural Silk, high resource cost for maintenance.'
    },
    dateAdded: '2023-11-02'
  },
  {
    id: '3',
    title: 'Cyber-Punk Combat Boots',
    category: 'Shoes',
    imageUrl: 'https://picsum.photos/id/103/600/800',
    tags: ['#Streetwear', '#Durable', '#Black'],
    color: 'Black',
    fabric: 'Vegan Leather',
    wearCount: 85,
    cost: 200,
    sustainability: {
      rating: 'A',
      carbonFootprint: '5 kg CO2',
      waterUsage: '100 L',
      materialAnalysis: 'Vegan Leather, low impact production.'
    },
    dateAdded: '2023-12-10'
  },
  {
    id: '4',
    title: 'Silver Pleated Skirt',
    category: 'Bottoms',
    imageUrl: 'https://picsum.photos/id/175/600/800',
    tags: ['#Metallic', '#Party', '#Flowy'],
    color: 'Silver',
    fabric: 'Recycled Polyester',
    wearCount: 5,
    cost: 95,
    sustainability: {
      rating: 'D',
      carbonFootprint: '15 kg CO2',
      waterUsage: '300 L',
      materialAnalysis: 'Polyester Blend, releases microplastics.'
    },
    dateAdded: '2024-01-05'
  },
  {
    id: '5',
    title: 'Classic Blue Oxford',
    category: 'Tops',
    imageUrl: 'https://picsum.photos/id/1005/600/800', // Generic person in blue layer
    tags: ['#Work', '#Smart', '#Classic'],
    color: 'Blue',
    fabric: 'Cotton',
    wearCount: 20,
    cost: 60,
    sustainability: {
      rating: 'B',
      carbonFootprint: '6 kg CO2',
      waterUsage: '200 L',
      materialAnalysis: 'Standard Cotton.'
    },
    dateAdded: '2024-02-14'
  },
  {
    id: '6',
    title: 'Minimalist White Tee',
    category: 'Tops',
    imageUrl: 'https://picsum.photos/id/91/600/800',
    tags: ['#Basic', '#Essential', '#Organic'],
    color: 'White',
    fabric: 'Organic Cotton',
    wearCount: 110,
    cost: 35,
    sustainability: {
      rating: 'A',
      carbonFootprint: '3 kg CO2',
      waterUsage: '400 L',
      materialAnalysis: '100% Organic Cotton, excellent biodegradability.'
    },
    dateAdded: '2024-03-01'
  },
  {
    id: '7',
    title: 'Chambray Button Down',
    category: 'Tops',
    imageUrl: 'https://picsum.photos/id/1004/600/800', // Another blueish vibe
    tags: ['#Casual', '#Blue', '#Layer'],
    color: 'Blue',
    fabric: 'Cotton Blend',
    wearCount: 15,
    cost: 45,
    sustainability: {
      rating: 'C',
      carbonFootprint: '7 kg CO2',
      waterUsage: '250 L',
      materialAnalysis: 'Cotton blend.'
    },
    dateAdded: '2023-09-10'
  }
];

export const MOCK_WEATHER = {
  temp: 18,
  condition: 'Rainy',
  recommendation: 'Rainy, 18°C. Perfect day for your Vintage Denim Jacket.'
};
