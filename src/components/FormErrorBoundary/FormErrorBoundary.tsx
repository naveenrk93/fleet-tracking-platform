import { Component, ErrorInfo, ReactNode } from 'react';
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Box,
} from '@chakra-ui/react';
import { MdRefresh } from 'react-icons/md';

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * FormErrorBoundary Component
 * 
 * Specialized error boundary for form components
 * Provides a cleaner, inline error UI for forms
 */
export class FormErrorBoundary extends Component<Props, State> {
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
    console.error('FormErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    const { hasError, error } = this.state;
    const { children } = this.props;

    if (hasError) {
      return (
        <Box p={4}>
          <Alert
            status="error"
            variant="subtle"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            minH="150px"
            borderRadius="md"
          >
            <AlertIcon boxSize="40px" mr={0} />
            <AlertTitle mt={4} mb={1} fontSize="lg">
              Form Error
            </AlertTitle>
            <AlertDescription maxWidth="sm" mb={4}>
              {error?.message || 'An error occurred while loading the form.'}
            </AlertDescription>
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<MdRefresh />}
              onClick={this.handleReset}
            >
              Reset Form
            </Button>
          </Alert>
        </Box>
      );
    }

    return children;
  }
}

