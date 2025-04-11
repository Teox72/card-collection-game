import React from 'react';
import {
  Box,
  Image,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  useColorMode,
} from '@chakra-ui/react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Card } from '../types/card';

const MotionBox = motion(Box);

interface CardItemProps {
  card: Card;
  isNew?: boolean;
  count?: number;
}

export function CardItem({ card, isNew = false, count }: CardItemProps) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return colorMode === 'dark' ? 'yellow.400' : 'yellow.500';
      case 'rare':
        return colorMode === 'dark' ? 'purple.400' : 'purple.500';
      case 'uncommon':
        return colorMode === 'dark' ? 'blue.400' : 'blue.500';
      default:
        return colorMode === 'dark' ? 'gray.400' : 'gray.500';
    }
  };

  return (
    <>
      <MotionBox
        position="relative"
        style={{ x, y, rotateX, rotateY, transformPerspective: 1200 }}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.7}
        whileTap={{ cursor: 'grabbing' }}
        w={["180px", "220px", "300px"]}
        h={["252px", "308px", "400px"]}
        cursor="grab"
        onClick={onOpen}
      >
        <Box
          position="relative"
          width="100%"
          height="100%"
          borderRadius="lg"
          overflow="hidden"
          boxShadow="lg"
          bg={colorMode === 'dark' ? 'gray.700' : 'white'}
          border="2px solid"
          borderColor={getRarityColor(card.rarity)}
          transform={isNew ? 'scale(1.05)' : 'scale(1)'}
          transition="transform 0.6s"
        >
          <Image
            src={card.imageUrl}
            alt={card.name}
            width="100%"
            height="100%"
            objectFit="cover"
            draggable={false}
          />
          {count && count > 1 && (
            <Badge
              position="absolute"
              top={2}
              right={2}
              colorScheme={colorMode === 'dark' ? 'purple' : 'blue'}
              fontSize="1em"
              fontWeight="bold"
              borderRadius="full"
              px={3}
              py={1}
              boxShadow="md"
              bg={colorMode === 'dark' ? 'purple.500' : 'blue.500'}
              color="white"
              border="2px solid"
              borderColor={colorMode === 'dark' ? 'purple.200' : 'blue.200'}
            >
              x{count}
            </Badge>
          )}
          {isNew && (
            <Badge
              position="absolute"
              top={2}
              left={2}
              colorScheme="green"
              fontSize="0.8em"
              borderRadius="full"
              px={2}
            >
              NEW!
            </Badge>
          )}
        </Box>
      </MotionBox>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={colorMode === 'dark' ? 'gray.700' : 'white'}>
          <ModalBody p={0}>
            <MotionBox
              style={{ x, y, rotateX, rotateY, transformPerspective: 1200 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              whileHover={{ scale: 1.1 }}
              dragElastic={0.1}
            >
              <Image
                src={card.imageUrl}
                alt={card.name}
                maxH="80vh"
                objectFit="contain"
                borderRadius="lg"
                boxShadow="dark-lg"
                draggable={false}
              />
            </MotionBox>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
