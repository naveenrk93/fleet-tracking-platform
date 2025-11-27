import { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Code,
} from '@chakra-ui/react';
import { MdRefresh, MdHome } from 'react-icons/md';

interface Props {
  children: ReactNode;
  fallbackType?: 'page' | 'section';
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI.
 * 
 * Usage:
 * <ErrorBoundary fallbackType="page">
 *   <YourComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // TODO: In production, send error to logging service (e.g., Sentry, LogRocket)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Call custom reset handler if provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallbackType = 'page' } = this.props;

    if (hasError) {
      // Section-level error (smaller error UI)
      if (fallbackType === 'section') {
        return (
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            minH="200px"
            borderRadius="md"
            bg="red.50"
            _dark={{ bg: 'red.900' }}
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Something went wrong in this section
            </AlertTitle>
            <AlertDescription maxWidth="sm" mb={4}>
              {error?.message || 'An unexpected error occurred'}
            </AlertDescription>
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<MdRefresh />}
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </Alert>
        );
      }

      // Page-level error (full error UI)
      return (
        <Box
          minH="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="bg.page"
          p={6}
        >
          <VStack
            spacing={6}
            maxW="600px"
            w="100%"
            bg="bg.card"
            p={8}
            borderRadius="xl"
            border="1px solid"
            borderColor="border.default"
            textAlign="center"
          >
            {/* Error Icon */}
            <Box
              fontSize="6xl"
              role="img"
              aria-label="Error"
            >
              💥
            </Box>

            {/* Error Title */}
            <Heading size="lg" color="text.primary">
              Oops! Something went wrong
            </Heading>

            {/* Error Description */}
            <Text color="text.secondary" fontSize="md">
              We're sorry, but something unexpected happened. Please try refreshing
              the page or go back to the home page.
            </Text>

            {/* Error Details (in development) */}
            {import.meta.env.DEV && error && (
              <Alert status="error" borderRadius="md">
                <Box flex="1" textAlign="left">
                  <AlertTitle fontSize="sm" mb={2}>
                    Error Details (Development Only):
                  </AlertTitle>
                  <AlertDescription fontSize="xs">
                    <Code
                      colorScheme="red"
                      p={2}
                      borderRadius="md"
                      display="block"
                      whiteSpace="pre-wrap"
                      wordBreak="break-word"
                    >
                      {error.toString()}
                    </Code>
                    {errorInfo && (
                      <Code
                        mt={2}
                        p={2}
                        borderRadius="md"
                        display="block"
                        whiteSpace="pre-wrap"
                        wordBreak="break-word"
                        fontSize="10px"
                      >
                        {errorInfo.componentStack}
                      </Code>
                    )}
                  </AlertDescription>
                </Box>
              </Alert>
            )}

            {/* Action Buttons */}
            <VStack spacing={3} w="100%">
              <Button
                colorScheme="blue"
                size="lg"
                w="100%"
                leftIcon={<MdRefresh />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                size="lg"
                w="100%"
                leftIcon={<MdHome />}
                onClick={this.handleGoHome}
              >
                Go to Home Page
              </Button>
            </VStack>

            {/* Help Text */}
            <Text fontSize="sm" color="text.tertiary">
              If the problem persists, please contact support.
            </Text>
          </VStack>
        </Box>
      );
    }

    return children;
  }
}

/**
 * Hook-based wrapper for functional components that need error boundaries
 */
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackType: 'page' | 'section' = 'section'
) => {
  return (props: P) => (
    <ErrorBoundary fallbackType={fallbackType}>
      <Component {...props} />
    </ErrorBoundary>
  );
};

