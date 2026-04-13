export type ContainerKey = 'wood' | 'bamboo' | 'tin';

export interface ProductHighlight {
  title: string;
  price: number;
  image: string;
  id: string;
}

export interface EventItem {
  name: string;
  dateRange: string;
  description: string;
}

export type CustomizerStep = 1 | 2 | 3 | 4 | 5;

export interface CustomizerState {
  currentStep: CustomizerStep;
  container: ContainerKey | null;
  engravingText: string;
  includeChippy: boolean;
  logoFile: File | null;
  recipientCount: number;
  designHelpRequested: boolean;
}
