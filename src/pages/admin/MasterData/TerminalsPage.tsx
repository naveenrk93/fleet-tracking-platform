import { Box, Heading, VStack, Button, HStack } from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";

export const TerminalsPage = () => {
  return (
    <Box>
      <VStack align="stretch" spacing={6}>
        {/* Page Header */}
        <HStack justify="space-between">
          <Heading size="lg" color="text.primary">
            Terminals Management
          </Heading>
          <Button
            colorScheme="purple"
            leftIcon={<MdAdd />}
            size="md"
          >
            Add Terminal
          </Button>
        </HStack>

        {/* Content */}
        <Box
          bg="bg.card"
          borderRadius="lg"
          border="1px solid"
          borderColor="border.default"
          p={6}
          minH="400px"
        >
          {/* Table or content will go here */}
        </Box>
      </VStack>
    </Box>
  );
};

