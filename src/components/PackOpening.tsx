import React, { useState } from 'react';
import {
  Box,
  Image,
  VStack,
  Text,
  useColorMode,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../types/card';

const MotionBox = motion(Box);

interface PackOpeningProps {
  cards: Card[];
  onComplete: () => void;
}

export function PackOpening({ cards, onComplete }: PackOpeningProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [removedCards, setRemovedCards] = useState<number[]>([]);
  const { colorMode } = useColorMode();

  const handleCardClick = (index: number) => {
    if (flippedCards.includes(index)) {
      // Si la carte est déjà retournée, on la retire
      setRemovedCards([...removedCards, index]);
      
      // Si toutes les cartes sont retirées, on termine
      if (removedCards.length + 1 === cards.length) {
        setTimeout(() => {
          onComplete();
        }, 500);
      }
    } else if (index === currentCardIndex) {
      // Si c'est la carte du dessus et qu'elle n'est pas retournée, on la retourne
      setFlippedCards([...flippedCards, index]);
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  return (
    <VStack spacing={8} align="center" w="100%">
      <Text fontSize={["lg", "xl", "2xl"]} fontWeight="bold" textAlign="center" px={4}>
        Cliquez sur les cartes pour les retourner, puis cliquez à nouveau pour les retirer !
      </Text>
      <Box position="relative" w={["200px", "250px", "300px"]} h={["280px", "350px", "400px"]} mx="auto">
        <AnimatePresence>
          {cards.map((card, index) => {
            const isFlipped = flippedCards.includes(index);
            const isRemoved = removedCards.includes(index);
            const zIndex = cards.length - index;

            if (isRemoved) return null;

            return (
              <MotionBox
                key={`pack-card-${index}`}
                position="absolute"
                width="100%"
                height="100%"
                initial={false}
                animate={{
                  rotateY: isFlipped ? 180 : 0,
                  scale: isFlipped ? 1 : 1,
                  opacity: isRemoved ? 0 : 1,
                }}
                exit={{
                  scale: 0.5,
                  opacity: 0,
                  transition: { duration: 0.3 }
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                style={{
                  zIndex,
                  transformStyle: "preserve-3d",
                }}
                onClick={() => handleCardClick(index)}
                cursor={(!isFlipped && index === currentCardIndex) || isFlipped ? "pointer" : "default"}
              >
                {/* Face avant (dos de la carte) */}
                <Box
                  position="absolute"
                  width="100%"
                  height="100%"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="xl"
                  bg={colorMode === 'dark' ? 'purple.600' : 'blue.500'}
                  border="4px solid"
                  borderColor={colorMode === 'dark' ? 'purple.400' : 'blue.300'}
                  backgroundImage="url('/card-back.svg')"
                  backgroundSize="cover"
                  backgroundPosition="center"
                  style={{ backfaceVisibility: 'hidden' }}
                />

                {/* Face arrière (image de la carte) */}
                <Box
                  position="absolute"
                  width="100%"
                  height="100%"
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="xl"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <Image
                    src={card.imageUrl}
                    alt={card.name}
                    w="100%"
                    h="100%"
                    objectFit="cover"
                    draggable={false}
                  />
                </Box>
              </MotionBox>
            );
          })}
        </AnimatePresence>
      </Box>
    </VStack>
  );
}
