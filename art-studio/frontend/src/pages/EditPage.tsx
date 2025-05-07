import { useState } from 'react';

import { useDropzone } from 'react-dropzone';
import {
  FaDownload,
  FaUpload,
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

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

import {
  editArt,
  upscaleArt,
} from '../services/artService';

const styles = [
  { value: 'studio-ghibli', label: 'Studio Ghibli' },
  { value: 'anime', label: 'Anime' },
  { value: 'realistic', label: 'Realistic' },
  { value: 'cartoon', label: 'Cartoon' },
];

export const EditPage = () => {
  const location = useLocation();
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('studio-ghibli');
  const [scale, setScale] = useState(2);
  const toast = useToast();

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setImage(acceptedFiles[0]);
    },
  });

  const editMutation = useMutation({
    mutationFn: editArt,
    onSuccess: (data) => {
      toast({
        title: 'Art edited successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error editing art',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const upscaleMutation = useMutation({
    mutationFn: upscaleArt,
    onSuccess: (data) => {
      toast({
        title: 'Art upscaled successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error) => {
      toast({
        title: 'Error upscaling art',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;
    editMutation.mutate({ image, prompt, style });
  };

  const handleUpscale = () => {
    if (!image) return;
    upscaleMutation.mutate({ image, scale });
  };

  return (
    <Box maxW="container.md" mx="auto">
      <VStack spacing={8} align="stretch">
        <Text fontSize="2xl" fontWeight="bold" textAlign="center">
          Edit Art
        </Text>

        {!image && !location.state?.imageUrl && (
          <Box
            {...getRootProps()}
            p={10}
            border="2px dashed"
            borderColor="gray.300"
            borderRadius="lg"
            textAlign="center"
            cursor="pointer"
            _hover={{ borderColor: 'brand.500' }}
          >
            <input {...getInputProps()} />
            <FaUpload size={32} color="gray.400" />
            <Text mt={2}>
              {isDragActive
                ? 'Drop the image here'
                : 'Drag and drop an image here, or click to select'}
            </Text>
          </Box>
        )}

        {(image || location.state?.imageUrl) && (
          <VStack spacing={4}>
            <Image
              src={image ? URL.createObjectURL(image) : location.state.imageUrl}
              alt="Selected image"
              maxW="100%"
              borderRadius="lg"
              boxShadow="lg"
            />

            <form onSubmit={handleEdit} style={{ width: '100%' }}>
              <Stack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Prompt</FormLabel>
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe how you want to edit the image..."
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

                <HStack spacing={4}>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={editMutation.isPending}
                    loadingText="Editing..."
                    flex={1}
                  >
                    Edit Image
                  </Button>
                  <Button
                    onClick={handleUpscale}
                    colorScheme="brand"
                    variant="outline"
                    isLoading={upscaleMutation.isPending}
                    loadingText="Upscaling..."
                    flex={1}
                  >
                    Upscale
                  </Button>
                </HStack>
              </Stack>
            </form>
          </VStack>
        )}

        {(editMutation.isPending || upscaleMutation.isPending) && (
          <VStack spacing={4} align="center">
            <Spinner size="xl" />
            <Text>
              {editMutation.isPending ? 'Editing your art...' : 'Upscaling your art...'}
            </Text>
          </VStack>
        )}

        {(editMutation.data || upscaleMutation.data) && (
          <VStack spacing={4} align="center">
            <Image
              src={editMutation.data?.imageUrl || upscaleMutation.data?.imageUrl}
              alt="Edited art"
              maxW="100%"
              borderRadius="lg"
              boxShadow="lg"
            />
            <Button
              onClick={() =>
                window.open(
                  editMutation.data?.imageUrl || upscaleMutation.data?.imageUrl,
                  '_blank'
                )
              }
              leftIcon={<FaDownload />}
            >
              Download
            </Button>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}; 