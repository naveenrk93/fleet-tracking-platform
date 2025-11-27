import { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  VStack,
  Text,
} from '@chakra-ui/react';
import { MdRefresh } from 'react-icons/md';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * MapErrorBoundary Component
 * 
 * Specialized error boundary for map components (Mapbox GL)
 * Handles map-specific errors gracefully
 */
export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MapErrorBoundary caught an error:', error, errorInfo);
    
    // Check for common Mapbox errors
    if (error.message.includes('accessToken')) {
      console.error('Mapbox access token error. Please check your Mapbox token configuration.');
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    // Force a page reload to reinitialize the map
    window.location.reload();
  };

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      const isTokenError = error?.message.includes('accessToken') || error?.message.includes('token');
      
      return (
        <Box
          minH="500px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={8}
        >
          <VStack spacing={4} maxW="500px">
            <Box fontSize="4xl" role="img" aria-label="Map Error">
              🗺️
            </Box>
            
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Map Loading Failed</AlertTitle>
                <AlertDescription>
                  {isTokenError ? (
                    <>
                      There was an issue with the map configuration. 
                      Please check your Mapbox access token.
                    </>
                  ) : (
                    <>
                      The map failed to load. This could be due to network issues
                      or map configuration problems.
                    </>
                  )}
                </AlertDescription>
              </Box>
            </Alert>

            {import.meta.env.DEV && error && (
              <Text fontSize="xs" color="red.500" fontFamily="mono" textAlign="center">
                {error.toString()}
              </Text>
            )}

            <Button
              colorScheme="blue"
              leftIcon={<MdRefresh />}
              onClick={this.handleReset}
              size="lg"
            >
              Reload Map
            </Button>

            <Text fontSize="sm" color="text.secondary" textAlign="center">
              If the problem persists, try refreshing the entire page
            </Text>
          </VStack>
        </Box>
      );
    }

    return children;
  }
}

