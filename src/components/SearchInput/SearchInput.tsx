import {
  Input,
  InputGroup,
  InputLeftElement,
  InputProps,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdSearch } from "react-icons/md";
import { useState, useEffect, useRef } from "react";

export interface SearchInputProps extends Omit<InputProps, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchInput = ({ 
  value, 
  onChange, 
  placeholder = "Search...",
  debounceMs = 300,
  ...inputProps 
}: SearchInputProps) => {
  const inputTextColor = useColorModeValue("gray.800", "whiteAlpha.900");
  const [localValue, setLocalValue] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [localValue, debounceMs]);

  return (
    <InputGroup 
      flex={{ base: "1", md: "1" }} 
      maxW={{ md: "600px" }} 
      minW={{ md: "300px" }}
    >
      <InputLeftElement pointerEvents="none">
        <MdSearch color="gray" size="20px" />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        bg="bg.card"
        borderColor="border.default"
        color={inputTextColor}
        _hover={{ borderColor: "purple.400" }}
        _focus={{ 
          borderColor: "purple.500", 
          boxShadow: "0 0 0 1px var(--chakra-colors-purple-500)" 
        }}
        {...inputProps}
      />
    </InputGroup>
  );
};

