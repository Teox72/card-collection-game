export type Rarity = 'common' | 'rare' | 'legendary';

export interface Card {
    id: number;
    name: string;
    description: string;
    rarity: Rarity;
    imageUrl: string;
}

export interface Collection {
    cards: Card[];
    discoveredCards: Set<number>;
}

// Probabilités d'obtention des cartes par rareté
export const RARITY_CHANCES = {
    common: 0.93,    // 93%
    rare: 0.05,      // 5%
    legendary: 0.02  // 2%
};
