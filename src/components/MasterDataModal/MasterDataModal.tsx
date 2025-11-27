import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input as ChakraInput,
  Textarea as ChakraTextarea,
  Select as ChakraSelect,
  InputProps,
  TextareaProps,
  SelectProps,
} from "@chakra-ui/react";
import { ReactNode } from "react";

// Styled Input with dark mode text
export const Input = (props: InputProps) => (
  <ChakraInput {...props} sx={{ _dark: { color: "gray.900" }, ...props.sx }} />
);

// Styled Textarea with dark mode text
export const Textarea = (props: TextareaProps) => (
  <ChakraTextarea {...props} sx={{ _dark: { color: "gray.900" }, ...props.sx }} />
);

// Styled Select with dark mode text
export const Select = (props: SelectProps) => (
  <ChakraSelect {...props} sx={{ _dark: { color: "gray.900" }, ...props.sx }} />
);

interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full" | "xs" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | { base?: string; sm?: string; md?: string; lg?: string; xl?: string };
}

export const MasterDataModal = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  isSubmitting = false,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  size = { base: "full", sm: "md", md: "xl" },
}: MasterDataModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size={size}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent 
        bg="bg.card" 
        borderColor="border.default"
        mx={{ base: 0, sm: 4 }}
        my={{ base: 0, sm: 16 }}
      >
        <form onSubmit={onSubmit}>
          <ModalHeader color="text.primary" fontSize={{ base: "lg", md: "xl" }}>
            {title}
          </ModalHeader>
          <ModalCloseButton />
          
          <ModalBody 
            px={{ base: 4, md: 6 }} 
            py={{ base: 4, md: 6 }}
            overflow="auto"
            maxHeight={{ base: "calc(100vh - 200px)", sm: "calc(66vh - 124px)" }}
          >
            {children}
          </ModalBody>

          <ModalFooter 
            px={{ base: 4, md: 6 }} 
            py={{ base: 3, md: 4 }}
            flexDirection={{ base: "column", sm: "row" }}
            gap={{ base: 2, sm: 0 }}
          >
            <Button 
              variant="ghost" 
              mr={{ base: 0, sm: 3 }} 
              onClick={onClose}
              width={{ base: "full", sm: "auto" }}
              size={{ base: "md", md: "md" }}
              type="button"
            >
              {cancelLabel}
            </Button>
            <Button
              colorScheme="purple"
              type="submit"
              isLoading={isSubmitting}
              width={{ base: "full", sm: "auto" }}
              size={{ base: "md", md: "md" }}
            >
              {submitLabel}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
};

