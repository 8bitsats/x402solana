import { useState } from 'react';

import {
  FaDownload,
  FaEdit,
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Select,
  Spinner,
  Stack,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useMutation } from '@tanstack/react-query';

import { generateArt } from '../services/artService';

const styles = [
  { value: 'studio-ghibli', label: 'Studio Ghibli' },
  { value: 'anime', label: 'Anime' },
  { value: 'realistic', label: 'Realistic' },
  { value: 'cartoon', label: 'Cartoon' },
];

const sizes = [
  { value: '1024x1024', label: 'Square (1024x1024)' },
  { value: '1024x1792', label: 'Portrait (1024x1792)' },
  { value: '1792x1024', label: 'Landscape (1792x1024)' },
];

export const GeneratePage = () => {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('studio-ghibli');
  const [size, setSize] = useState('1024x1024');
  const toast = useToast();

  const generateMutation = useMutation({
    mutationFn: generateArt,
    onSuccess: (data) => {
      toast({
        title: 'Art generated successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error generating art',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateMutation.mutate({ prompt, style, size });
  };

  return (
    <Box maxW="container.md" mx="auto">
      <VStack spacing={8} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Generate Art
        </Text>

        <form onSubmit={handleSubmit}>
          <Stack spacing={4}>
            <FormControl isRequired>
              <FormLabel>Prompt</FormLabel>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the art you want to generate..."
              />
            </FormControl>

            <FormControl>
              <FormLabel>Style</FormLabel>
              <Select value={style} onChange={(e) => setStyle(e.target.value)}>
                {styles.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Size</FormLabel>
              <Select value={size} onChange={(e) => setSize(e.target.value)}>
                {sizes.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </FormControl>

            <Button
              type="submit"
              colorScheme="brand"
              isLoading={generateMutation.isPending}
              loadingText="Generating..."
            >
              Generate Art
            </Button>
          </Stack>
        </form>

        {generateMutation.isPending && (
          <VStack spacing={4} align="center">
            <Spinner size="xl" />
            <Text>Generating your art...</Text>
          </VStack>
        )}

        {generateMutation.data && (
          <VStack spacing={4} align="center">
            <Image
              src={generateMutation.data.imageUrl}
              alt="Generated art"
              maxW="100%"
              borderRadius="lg"
              boxShadow="lg"
            />
            <HStack spacing={4}>
              <Button
                onClick={() => window.open(generateMutation.data.imageUrl, '_blank')}
                leftIcon={<FaDownload />}
              >
                Download
              </Button>
              <Button
                as={RouterLink}
                to="/edit"
                state={{ imageUrl: generateMutation.data.imageUrl }}
                leftIcon={<FaEdit />}
              >
                Edit
              </Button>
            </HStack>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}; 