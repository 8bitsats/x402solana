import {
  FaEdit,
  FaHistory,
  FaPalette,
} from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

import {
  Box,
  Container,
  Flex,
  Link,
  Stack,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    as={RouterLink}
    to={to}
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
  >
    {children}
  </Link>
);

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <Box minH="100vh">
      <Box bg={useColorModeValue('white', 'gray.900')} px={4} boxShadow="sm">
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <Flex alignItems={'center'}>
            <Text fontSize="xl" fontWeight="bold" color="brand.600">
              Studio Ghibli AI
            </Text>
          </Flex>

          <Stack direction={'row'} spacing={7}>
            <NavLink to="/generate">
              <Flex align="center">
                <FaPalette />
                <Text ml={2}>Generate</Text>
              </Flex>
            </NavLink>
            <NavLink to="/edit">
              <Flex align="center">
                <FaEdit />
                <Text ml={2}>Edit</Text>
              </Flex>
            </NavLink>
            <NavLink to="/history">
              <Flex align="center">
                <FaHistory />
                <Text ml={2}>History</Text>
              </Flex>
            </NavLink>
          </Stack>
        </Flex>
      </Box>

      <Container maxW="container.xl" py={8}>
        {children}
      </Container>
    </Box>
  );
}; 