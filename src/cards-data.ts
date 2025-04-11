import { Card } from './types/card';

// Importez vos images ici
// Exemple : import card1Image from './assets/images/card1.jpg';

export const cards: Card[] = [
    {
        id: 1,
        name: "Dragon de Feu",
        description: "Un puissant dragon cracheur de feu",
        rarity: "legendary",
        // Remplacez cette URL par le chemin vers votre image
        // Exemple : imageUrl: card1Image,
        imageUrl: "/path/to/your/image1.jpg"
    },
    {
        id: 2,
        name: "Guerrier",
        description: "Un brave combattant",
        rarity: "common",
        imageUrl: "/path/to/your/image2.jpg"
    },
    {
        id: 3,
        name: "Magicien",
        description: "Maître des arcanes",
        rarity: "rare",
        imageUrl: "/path/to/your/image3.jpg"
    },
];
