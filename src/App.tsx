import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChakraProvider, 
  Container, 
  VStack, 
  Heading, 
  Button, 
  useToast, 
  Badge, 
  Box, 
  Text, 
  Center, 
  Image,
  useColorMode,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  GridItem,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Progress,
  HStack,
  Icon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Tooltip
} from "@chakra-ui/react";
import { MoonIcon, SunIcon, DeleteIcon } from '@chakra-ui/icons';
import { MusicIcon } from './components/MusicIcon';
import { FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useAudio } from './hooks/useAudio';
import { Card, Collection, Rarity } from './types/card';
import { drawCard } from './utils/packOpening';
import { allCards } from './data/cards-by-rarity';

function App() {
  const PACKS_PER_DAY = 6; // Nombre maximum de packs par jour

  const [collection, setCollection] = useState<Collection>(() => {
    const savedCollection = localStorage.getItem('collection');
    if (savedCollection) {
      const parsed = JSON.parse(savedCollection);
      return {
        cards: parsed.cards,
        discoveredCards: new Set(parsed.discoveredCards)
      };
    }
    return {
      cards: [],
      discoveredCards: new Set()
    };
  });
  const [currentPack, setCurrentPack] = useState<Card[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [revealedCards, setRevealedCards] = useState<boolean[]>([]);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  const [cardRotations, setCardRotations] = useState<{ [key: string]: { x: number, y: number } }>({});
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<HTMLElement | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(-1);
  const [isCardFading, setIsCardFading] = useState(false);
  const [packsOpenedToday, setPacksOpenedToday] = useState<number>(() => {
    const savedData = localStorage.getItem('packsOpenedToday');
    if (savedData) {
      const { count, date } = JSON.parse(savedData);
      // Si c'est un nouveau jour, réinitialiser le compteur
      if (new Date(date).getDate() !== new Date().getDate()) {
        return 0;
      }
      return count;
    }
    return 0;
  });
  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const cardBackImage = '/card-back.svg';

  const {
    volume,
    setVolume,
    playRareSound,
    playLegendarySound,
    toggleBgm,
    isBgmPlaying
  } = useAudio();

  useEffect(() => {
    localStorage.setItem('collection', JSON.stringify({
      cards: collection.cards,
      discoveredCards: Array.from(collection.discoveredCards)
    }));
  }, [collection]);

  useEffect(() => {
    localStorage.setItem('packsOpenedToday', JSON.stringify({
      count: packsOpenedToday,
      date: new Date().toISOString()
    }));
  }, [packsOpenedToday]);

  const getCardsByRarity = () => {
    const cardsByRarity = new Map<Rarity, number>();
    collection.cards.forEach(card => {
      const count = cardsByRarity.get(card.rarity) || 0;
      cardsByRarity.set(card.rarity, count + 1);
    });
    return cardsByRarity;
  };

  const revealCurrentCard = () => {
    if (currentCardIndex >= 0 && currentCardIndex < currentPack.length) {
      const newRevealedCards = [...revealedCards];
      newRevealedCards[currentCardIndex] = true;
      setRevealedCards(newRevealedCards);
    }
  };

  const hideCurrentCard = () => {
    if (currentCardIndex >= 0) {
      if (currentCardIndex === 0) {
        // Toutes les cartes ont été révélées
        const newCards = [...collection.cards, ...currentPack];
        const newDiscovered = new Set(collection.discoveredCards);
        currentPack.forEach(card => newDiscovered.add(card.id));

        setCollection({
          cards: newCards,
          discoveredCards: newDiscovered,
        });

        toast({
          title: "Pack ouvert !",
          description: `Vous avez obtenu ${currentPack.length} nouvelles cartes !`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setTimeout(() => {
          setIsOpening(false);
          setCurrentPack([]);
          setRevealedCards([]);
          setCurrentCardIndex(-1);
        }, 2000);
      } else {
        // Animation de fondu avant de passer à la carte suivante
        setIsCardFading(true);
        setTimeout(() => {
          setCurrentCardIndex(currentCardIndex - 1);
          setIsCardFading(false);
        }, 300);
      }
    }
  };

  const handlePackCardClick = () => {
    if (!revealedCards[currentCardIndex]) {
      // Premier clic : on révèle la carte
      const newRevealedCards = [...revealedCards];
      newRevealedCards[currentCardIndex] = true;
      setRevealedCards(newRevealedCards);
    } else {
      // Second clic : on passe à la suivante
      hideCurrentCard();
    }
  };

  const getTimeUntilReset = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime() - now.getTime();
  };

  const formatTimeRemaining = () => {
    const ms = getTimeUntilReset();
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const openPack = useCallback(() => {
    if (packsOpenedToday >= PACKS_PER_DAY) {
      toast({
        title: "Limite atteinte",
        description: `Vous avez atteint votre limite de ${PACKS_PER_DAY} packs aujourd'hui. Revenez dans ${formatTimeRemaining()} !`,
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsOpening(true);
    const newPack: Card[] = [];
    for (let i = 0; i < 5; i++) {
      newPack.push(drawCard());
    }
    setCurrentPack(newPack);
    setRevealedCards(new Array(5).fill(false));
    setCurrentCardIndex(4);
    setPacksOpenedToday(prev => prev + 1);
    setIsOpening(false);
  }, [packsOpenedToday, toast, formatTimeRemaining]);

  const handleMouseDown = (cardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(cardId);
    setActiveCard(e.currentTarget as HTMLElement);
    updateCardRotation(cardId, e.clientX, e.clientY);
  };

  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && activeCard) {
      e.preventDefault();
      const rect = activeCard.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculer la distance par rapport au centre de la carte
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      
      // Limiter la zone d'effet à un cercle autour de la carte
      const maxRadius = Math.max(rect.width, rect.height);
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      if (distance <= maxRadius) {
        updateCardRotation(isDragging, e.clientX, e.clientY);
      }
    }
  }, [isDragging, activeCard]);

  const handleGlobalMouseUp = useCallback(() => {
    setIsDragging(null);
    setActiveCard(null);
    setCardRotations({});
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [handleGlobalMouseMove, handleGlobalMouseUp]);

  const updateCardRotation = (cardId: string, clientX: number, clientY: number) => {
    if (!activeCard) return;
    
    const rect = activeCard.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculer les angles de rotation
    let rotateX = ((y - centerY) / centerY) * 75;
    let rotateY = ((x - centerX) / centerX) * 75;

    // Limiter les angles de rotation à ±45 degrés
    rotateX = Math.max(-45, Math.min(45, rotateX));
    rotateY = Math.max(-45, Math.min(45, rotateY));

    setCardRotations(prev => ({
      ...prev,
      [cardId]: { x: -rotateX, y: rotateY }
    }));
  };

  const toggleExpand = (cardId: string) => {
    if (!isDragging) {
      setExpandedCards(prev => ({
        ...prev,
        [cardId]: !prev[cardId]
      }));
    }
  };

  const getUniqueCardsWithCount = () => {
    const cardCounts = new Map<number, { card: Card; count: number }>();
    
    collection.cards.forEach(card => {
      const existing = cardCounts.get(card.id);
      if (existing) {
        existing.count += 1;
      } else {
        cardCounts.set(card.id, { card, count: 1 });
      }
    });

    return Array.from(cardCounts.values());
  };

  const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
      case 'common':
        return 'gray';
      case 'rare':
        return 'blue';
      case 'legendary':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const resetCollection = useCallback(() => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser votre collection ?')) {
      setCollection({
        cards: [],
        discoveredCards: new Set()
      });
      localStorage.removeItem('collection');
      toast({
        title: "Collection réinitialisée",
        description: "Toutes vos cartes ont été supprimées",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [toast]);

  const getCardOffset = (index: number) => {
    const baseOffset = -150; // Décalage de base pour centrer les cartes
    const spacing = 50; // Espacement entre les cartes
    return baseOffset + (index * spacing);
  };

  const handleCardClick = useCallback((index: number) => {
    if (index === currentCardIndex) {
      if (!revealedCards[index]) {
        // Révéler la carte actuelle
        const newRevealedCards = [...revealedCards];
        newRevealedCards[index] = true;
        setRevealedCards(newRevealedCards);

        // Jouer le son en fonction de la rareté
        const card = currentPack[index];
        if (card.rarity === 'legendary') {
          playLegendarySound();
        } else if (card.rarity === 'rare') {
          playRareSound();
        }

        // Ajouter la carte à la collection
        setCollection(prevCollection => {
          const newDiscoveredCards = new Set(prevCollection.discoveredCards);
          newDiscoveredCards.add(card.id);
          return {
            cards: [...prevCollection.cards, card],
            discoveredCards: newDiscoveredCards
          };
        });
      } else {
        // La carte est déjà révélée, passer à la suivante
        if (index > 0) {
          setCurrentCardIndex(index - 1);
        } else {
          // Si c'était la dernière carte, réinitialiser le pack
          setCurrentPack([]);
          setRevealedCards([]);
          setCurrentCardIndex(-1);
          setIsOpening(false);
        }
      }
    }
  }, [currentCardIndex, revealedCards, currentPack, playRareSound, playLegendarySound]);

  const cardsByRarity = getCardsByRarity();
  const totalCards = collection.cards.length;
  const uniqueCards = collection.discoveredCards.size;
  const collectionProgress = (uniqueCards / allCards.length) * 100;

  return (
    <ChakraProvider>
      <Container maxW="container.xl" py={4}>
        <VStack spacing={4} align="stretch">
          <HStack w="100%" justify="space-between">
            <Text fontSize="2xl" fontWeight="bold" textAlign="center" flex={1}>
              TCG Skittles
            </Text>
            <HStack spacing={2}>
              <Tooltip label="Contrôle du volume">
                <Box>
                  <Slider
                    aria-label="Volume"
                    defaultValue={volume}
                    min={0}
                    max={1}
                    step={0.1}
                    w="100px"
                    onChange={setVolume}
                  >
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <SliderThumb boxSize={6}>
                      <Box>
                        {volume === 0 ? "🔇" : "🔊"}
                      </Box>
                    </SliderThumb>
                  </Slider>
                </Box>
              </Tooltip>
              <Tooltip label={isBgmPlaying ? "Arrêter la musique" : "Jouer la musique"}>
                <IconButton
                  aria-label="Toggle music"
                  icon={<MusicIcon />}
                  onClick={toggleBgm}
                  colorScheme={isBgmPlaying ? "green" : "gray"}
                />
              </Tooltip>
              <IconButton
                aria-label="Toggle color mode"
                icon={colorMode === 'dark' ? <SunIcon /> : <MoonIcon />}
                onClick={toggleColorMode}
              />
              <IconButton
                aria-label="Réinitialiser la collection"
                icon={<DeleteIcon />}
                onClick={resetCollection}
                colorScheme="red"
                variant="outline"
                title="Réinitialiser la collection"
              />
            </HStack>
          </HStack>

          <Tabs isFitted variant="enclosed" size="lg">
            <TabList mb="1em">
              <Tab>Ouvrir des packs</Tab>
              <Tab>Collection ({collection.cards.length})</Tab>
            </TabList>

            <TabPanels>
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  <Center>
                    <VStack>
                      <Button
                        colorScheme="yellow"
                        size="lg"
                        onClick={openPack}
                        isDisabled={isOpening || currentPack.length > 0 || packsOpenedToday >= PACKS_PER_DAY}
                        bgGradient="linear(to-r, yellow.400, orange.300)"
                        color="gray.800"
                        _hover={{
                          bgGradient: "linear(to-r, yellow.500, orange.400)",
                          transform: "scale(1.05)"
                        }}
                        _active={{
                          bgGradient: "linear(to-r, yellow.600, orange.500)",
                          transform: "scale(0.95)"
                        }}
                        transition="all 0.2s"
                        boxShadow="0 0 10px gold"
                        textShadow="0 0 2px white"
                      >
                        {currentPack.length > 0 ? "Terminez d'ouvrir ce pack" : "Ouvrir un pack"}
                      </Button>
                      <Text fontSize="sm" color={packsOpenedToday >= PACKS_PER_DAY ? "red.500" : "gray.500"}>
                        {packsOpenedToday >= PACKS_PER_DAY 
                          ? `Revenez dans ${formatTimeRemaining()} pour plus de packs !`
                          : `${PACKS_PER_DAY - packsOpenedToday} pack${PACKS_PER_DAY - packsOpenedToday !== 1 ? 's' : ''} restant${PACKS_PER_DAY - packsOpenedToday !== 1 ? 's' : ''} aujourd'hui`}
                      </Text>
                    </VStack>
                  </Center>

                  {currentPack.length > 0 && (
                    <VStack spacing={4} align="center">
                      <Heading size="md" textAlign="center">
                        {currentCardIndex >= 0
                          ? !revealedCards[currentCardIndex]
                            ? "Cliquez pour révéler la carte"
                            : "Cliquez pour passer à la carte suivante"
                          : "Toutes les cartes ont été révélées"}
                      </Heading>
                      <Box
                        position="relative"
                        height="60vh"
                        width="100%"
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                      >
                        {currentPack.map((card, index) => (
                          <Box
                            key={`pack-${index}`}
                            position="absolute"
                            width="300px"
                            height="400px"
                            cursor="pointer"
                            onClick={() => handleCardClick(index)}
                            style={{
                              transform: `translateX(${getCardOffset(index)}px)`,
                              opacity: currentCardIndex === index ? 1 : 0.5,
                              transition: 'transform 0.3s ease-out, opacity 0.3s ease-out',
                              zIndex: currentCardIndex === index ? 2 : 1,
                              display: index > currentCardIndex ? 'none' : 'block'
                            }}
                          >
                            <Image
                              src={revealedCards[index] ? card.imageUrl : cardBackImage}
                              alt={revealedCards[index] ? card.name : 'Card back'}
                              width="100%"
                              height="100%"
                              objectFit="contain"
                              transform={`rotateY(${revealedCards[index] ? '0deg' : '180deg'})`}
                              transition="transform 0.6s"
                              style={{ transformStyle: 'preserve-3d' }}
                            />
                          </Box>
                        ))}
                      </Box>
                    </VStack>
                  )}
                </VStack>
              </TabPanel>

              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    <Box p={4} borderRadius="md" bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}>
                      <Stat>
                        <StatLabel>Total de cartes</StatLabel>
                        <StatNumber>{totalCards}</StatNumber>
                      </Stat>
                    </Box>
                    <Box p={4} borderRadius="md" bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}>
                      <Stat>
                        <StatLabel>Cartes uniques</StatLabel>
                        <StatNumber>{uniqueCards} / {allCards.length}</StatNumber>
                      </Stat>
                    </Box>
                    <Box p={4} borderRadius="md" bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}>
                      <Stat>
                        <StatLabel>Progression</StatLabel>
                        <StatNumber>{collectionProgress.toFixed(1)}%</StatNumber>
                      </Stat>
                    </Box>
                  </Grid>

                  <Progress value={collectionProgress} colorScheme="green" size="sm" />

                  <HStack spacing={4} wrap="wrap">
                    <Badge colorScheme="gray">
                      Communes: {cardsByRarity.get('common') || 0}
                    </Badge>
                    <Badge colorScheme="blue">
                      Rares: {cardsByRarity.get('rare') || 0}
                    </Badge>
                    <Badge colorScheme="yellow">
                      Légendaires: {cardsByRarity.get('legendary') || 0}
                    </Badge>
                  </HStack>

                  <SimpleGrid columns={[2, 3, 4, 5]} spacing={4}>
                    {getUniqueCardsWithCount().map(({ card, count }) => (
                      <Box
                        key={`collection-${card.id}`}
                        position="relative"
                        cursor="pointer"
                        onClick={() => toggleExpand(`collection-${card.id}`)}
                        onMouseDown={(e) => expandedCards[`collection-${card.id}`] && handleMouseDown(`collection-${card.id}`, e)}
                        bg="transparent"
                        boxShadow="none"
                        transform={expandedCards[`collection-${card.id}`] ? 'scale(2)' : 'scale(1)'}
                        transformOrigin="center"
                        transition="transform 0.2s ease-out"
                        zIndex={expandedCards[`collection-${card.id}`] ? 2 : 1}
                      >
                        <VStack spacing={2} align="center" p={2}>
                          <Box 
                            position="relative" 
                            width="150px" 
                            height="200px"
                            transform={
                              isDragging === `collection-${card.id}` 
                                ? `perspective(800px) rotateX(${cardRotations[`collection-${card.id}`]?.x || 0}deg) rotateY(${cardRotations[`collection-${card.id}`]?.y || 0}deg)`
                                : 'none'
                            }
                            style={{ transformStyle: 'preserve-3d' }}
                            transition="transform 0.2s ease-out"
                          >
                            <Image
                              src={card.imageUrl}
                              alt={card.name}
                              width="150px"
                              height="200px"
                              objectFit="contain"
                            />
                          </Box>
                          <VStack spacing={1}>
                            <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                              {card.name}
                            </Text>
                            <HStack>
                              <Badge colorScheme={getRarityColor(card.rarity)}>
                                {card.rarity}
                              </Badge>
                              <Badge colorScheme="purple">
                                x{count}
                              </Badge>
                            </HStack>
                          </VStack>
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

export default App;
