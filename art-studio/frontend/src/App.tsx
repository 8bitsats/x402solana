import {
  BrowserRouter as Router,
  Route,
  Routes,
} from 'react-router-dom';

import {
  ChakraProvider,
  CSSReset,
} from '@chakra-ui/react';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { MainLayout } from './layouts/MainLayout';
import { EditPage } from './pages/EditPage';
import { GeneratePage } from './pages/GeneratePage';
import { HistoryPage } from './pages/HistoryPage';
import { HomePage } from './pages/HomePage';
import { theme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <CSSReset />
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/edit" element={<EditPage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Routes>
          </MainLayout>
        </Router>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default App;
