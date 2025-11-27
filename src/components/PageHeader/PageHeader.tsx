import { 
  Heading, 
  Button, 
  HStack, 
  ButtonProps,
  HeadingProps,
} from "@chakra-ui/react";
import { MdAdd } from "react-icons/md";
import { ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
  actionIcon?: ReactNode;
  actionButtonProps?: Omit<ButtonProps, 'onClick'>;
  headingProps?: HeadingProps;
  showAction?: boolean;
}

export const PageHeader = ({ 
  title, 
  actionLabel = "Add New",
  onActionClick,
  actionIcon = <MdAdd />,
  actionButtonProps = {},
  headingProps = {},
  showAction = true,
}: PageHeaderProps) => {
  return (
    <HStack 
      justify="space-between" 
      flexWrap={{ base: "wrap", sm: "nowrap" }} 
      gap={{ base: 3, md: 0 }}
    >
      <Heading 
        size={{ base: "md", md: "lg" }} 
        color="text.primary"
        {...headingProps}
      >
        {title}
      </Heading>
      {showAction && onActionClick && (
        <Button
          colorScheme="purple"
          leftIcon={actionIcon as any}
          size={{ base: "sm", md: "md" }}
          onClick={onActionClick}
          width={{ base: "full", sm: "auto" }}
          {...actionButtonProps}
        >
          {actionLabel}
        </Button>
      )}
    </HStack>
  );
};

