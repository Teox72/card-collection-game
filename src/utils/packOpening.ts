import { Rarity, RARITY_CHANCES, Card } from '../types/card';
import { commonCards, rareCards, legendaryCards } from '../data/cards-by-rarity';

export function getRandomRarity(): Rarity {
    const random = Math.random();  
    let sum = 0;
    
    for (const [rarity, chance] of Object.entries(RARITY_CHANCES)) {
        sum += chance;
        if (random <= sum) {
            return rarity as Rarity;
        }
    }
    
    return 'common'; // Fallback
}

export function drawCard(): Card {
    const targetRarity = getRandomRarity();
    
    // Sélectionner le bon tableau de cartes selon la rareté
    let availableCards: Card[];
    switch (targetRarity) {
        case 'common':
            availableCards = commonCards;
            break;
        case 'rare':
            availableCards = rareCards;
            break;
        case 'legendary':
            availableCards = legendaryCards;
            break;
        default:
            availableCards = commonCards; // Fallback
    }
    
    if (availableCards.length === 0) {
        throw new Error(`Aucune carte trouvée pour la rareté ${targetRarity}`);
    }
    
    // Sélectionner une carte au hasard
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    return availableCards[randomIndex];
}
