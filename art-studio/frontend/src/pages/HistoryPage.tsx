import { useState } from 'react';

import {
  FaDownload,
  FaEdit,
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

import {
  Box,
  Button,
  Grid,
  HStack,
  Image,
  Spinner,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';

import { getArtHistory } from '../services/artService';

export const HistoryPage = () => {
  const [page, setPage] = useState(1);
  const toast = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ['artHistory', page],
    queryFn: () => getArtHistory(page),
  });

  if (isLoading) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Spinner size="xl" />
        <Text>Loading history...</Text>
      </VStack>
    );
  }

  if (error) {
    toast({
      title: 'Error loading history',
      description: error instanceof Error ? error.message : 'An error occurred',
      status: 'error',
      duration: 5000,
      isClosable: true,
    });
    return (
      <VStack spacing={4} align="center" py={8}>
        <Text color="red.500">Failed to load history</Text>
        <Button onClick={() => setPage(1)}>Retry</Button>
      </VStack>
    );
  }

  if (!data?.data?.length) {
    return (
      <VStack spacing={4} align="center" py={8}>
        <Text>No art history found</Text>
        <Button as={RouterLink} to="/generate" colorScheme="brand">
          Generate Some Art
        </Button>
      </VStack>
    );
  }

  return (
    <Box>
      <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={8}>
        Art History
      </Text>

      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)',
        }}
        gap={6}
      >
        {data.data.map((item: any) => (
          <Box
            key={item.id}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
          >
            <Image
              src={item.imageUrl}
              alt={item.prompt}
              w="100%"
              h="200px"
              objectFit="cover"
            />
            <VStack p={4} align="start" spacing={2}>
              <Text fontWeight="medium" noOfLines={2}>
                {item.prompt}
              </Text>
              <Text fontSize="sm" color="gray.500">
                Style: {item.style}
              </Text>
              <HStack spacing={2} mt={2}>
                <Button
                  size="sm"
                  onClick={() => window.open(item.imageUrl, '_blank')}
                  leftIcon={<FaDownload />}
                >
                  Download
                </Button>
                <Button
                  as={RouterLink}
                  to="/edit"
                  state={{ imageUrl: item.imageUrl }}
                  size="sm"
                  variant="outline"
                  leftIcon={<FaEdit />}
                >
                  Edit
                </Button>
              </HStack>
            </VStack>
          </Box>
        ))}
      </Grid>

      {data.pagination && (
        <HStack justify="center" spacing={4} mt={8}>
          <Button
            onClick={() => setPage(page - 1)}
            isDisabled={page === 1}
            variant="outline"
          >
            Previous
          </Button>
          <Text>Page {page}</Text>
          <Button
            onClick={() => setPage(page + 1)}
            isDisabled={!data.pagination.hasMore}
            variant="outline"
          >
            Next
          </Button>
        </HStack>
      )}
    </Box>
  );
}; 