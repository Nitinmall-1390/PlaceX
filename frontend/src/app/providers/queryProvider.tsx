import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, 404
        if (error && typeof error === 'object' && 'code' in error) {
          const code = (error as { code: string }).code;
          if (['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND'].includes(code)) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
    mutations: {
      onError: (error) => {
        // Global mutation error handling
        console.error('Mutation error:', error);
      },
    },
  },
});
