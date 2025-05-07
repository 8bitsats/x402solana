import {
  FaEdit,
  FaHistory,
  FaPalette,
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

import {
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react';

const Feature = ({ title, text, icon }: { title: string; text: string; icon: React.ReactElement }) => {
  return (
    <Stack
      align={'center'}
      textAlign={'center'}
      p={6}
      bg={'white'}
      rounded={'xl'}
      boxShadow={'lg'}
    >
      <Box color={'brand.500'} fontSize={'2xl'} mb={2}>
        {icon}
      </Box>
      <Text fontWeight={600}>{title}</Text>
      <Text color={'gray.600'}>{text}</Text>
    </Stack>
  );
};

export const HomePage = () => {
  return (
    <Box>
      <Container maxW={'7xl'}>
        <Stack
          as={Box}
          textAlign={'center'}
          gap={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: '2xl', sm: '4xl', md: '6xl' }}
            lineHeight={'110%'}
          >
            Create Beautiful Art in <br />
            <Text as={'span'} color={'brand.500'}>
              Studio Ghibli Style
            </Text>
          </Heading>
          <Text color={'gray.500'}>
            Transform your ideas into stunning artwork using the power of AI. Generate, edit, and upscale
            your images with our Studio Ghibli-inspired art generation tool.
          </Text>
          <Stack
            direction={'column'}
            gap={3}
            align={'center'}
            alignSelf={'center'}
            position={'relative'}
          >
            <RouterLink to="/generate">
              <Button
                colorScheme={'brand'}
                bg={'brand.500'}
                rounded={'full'}
                px={6}
                _hover={{
                  bg: 'brand.600',
                }}
              >
                Get Started
              </Button>
            </RouterLink>
          </Stack>
        </Stack>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={10} py={10}>
          <Feature
            icon={<FaPalette />}
            title={'Generate Art'}
            text={'Create unique artwork from your text descriptions using our AI-powered generator.'}
          />
          <Feature
            icon={<FaEdit />}
            title={'Edit Images'}
            text={'Transform and enhance your existing images with our editing tools.'}
          />
          <Feature
            icon={<FaHistory />}
            title={'Track History'}
            text={'Keep track of all your generated and edited artwork in one place.'}
          />
        </SimpleGrid>
      </Container>
    </Box>
  );
}; 