import { FarmerKnowledgePractice } from '../types';

// Temporary client-side store. Every record is scoped by centreId so it can be
// replaced with centre-specific API calls when persistence is introduced.
let practices: FarmerKnowledgePractice[] = [
  {
    id: 'knowledge-parseoni-1', centreId: 'ctr_parseoni', farmerName: 'Ramesh Patil', crop: 'Paddy', season: 'Kharif 2025',
    fertilizers: ['Farmyard manure', 'Neem-coated urea', 'Zinc sulphate'],
    pesticides: ['Neem oil spray', 'Chlorantraniliprole (need-based)'],
    farmingPractices: ['Line transplanting at 20 × 15 cm', 'Alternate wetting and drying', 'Weekly pest scouting'],
    observedImprovement: '18% higher marketable yield with uniform, fuller grains.',
  },
  {
    id: 'knowledge-parseoni-2', centreId: 'ctr_parseoni', farmerName: 'Sunita Wankhede', crop: 'Soybean', season: 'Kharif 2025',
    fertilizers: ['Rhizobium seed treatment', 'SSP', 'Bio-compost'],
    pesticides: ['Pheromone traps', 'Emamectin benzoate (need-based)'],
    farmingPractices: ['Seed treatment before sowing', 'Intercropping with pigeon pea', 'Mulching to retain soil moisture'],
    observedImprovement: 'Cleaner produce and 15% improvement in accepted procurement quantity.',
  },
  {
    id: 'knowledge-ramtek-1', centreId: 'ctr_ramtek', farmerName: 'Mahesh Gawande', crop: 'Bengal Gram', season: 'Rabi 2025–26',
    fertilizers: ['Vermicompost', 'DAP at sowing', 'Sulphur granules'],
    pesticides: ['Bird perches', 'Neem seed kernel extract'],
    farmingPractices: ['Timely sowing after residual moisture', 'Two irrigations at flowering and pod formation'],
    observedImprovement: 'Better pod filling and 12% lower input cost per quintal.',
  },
];

export const getPracticesForCentre = (centreId: string) => practices.filter((practice) => practice.centreId === centreId);

export const savePractice = (practice: FarmerKnowledgePractice) => {
  practices = practices.some((item) => item.id === practice.id)
    ? practices.map((item) => item.id === practice.id ? practice : item)
    : [...practices, practice];
};

export const deletePractice = (id: string) => { practices = practices.filter((practice) => practice.id !== id); };
