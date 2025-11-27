import { Badge, BadgeProps } from "@chakra-ui/react";

export type StatusType = 
  | "active" 
  | "inactive" 
  | "pending" 
  | "assigned" 
  | "in_progress" 
  | "completed" 
  | "cancelled"
  | "allocated";

export interface StatusBadgeProps extends Omit<BadgeProps, 'colorScheme'> {
  status: string;
  colorSchemeOverride?: string;
}

/**
 * Maps status strings to Chakra UI color schemes
 */
export const getStatusColor = (status: string): string => {
  const normalizedStatus = status.toLowerCase().replace(/_/g, "_");
  
  switch (normalizedStatus) {
    // Active states
    case "active":
    case "completed":
      return "green";
    
    // In Progress states
    case "in_progress":
    case "assigned":
    case "allocated":
      return "blue";
    
    // Pending/Warning states
    case "pending":
    case "inactive":
      return "yellow";
    
    // Negative states
    case "cancelled":
    case "canceled":
    case "failed":
      return "red";
    
    // Default
    default:
      return "gray";
  }
};

/**
 * Formats status text for display
 */
export const formatStatusText = (status: string): string => {
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export const StatusBadge = ({ 
  status, 
  colorSchemeOverride,
  children,
  ...badgeProps 
}: StatusBadgeProps) => {
  const colorScheme = colorSchemeOverride || getStatusColor(status);
  const displayText = children || formatStatusText(status);

  return (
    <Badge colorScheme={colorScheme} {...badgeProps}>
      {displayText}
    </Badge>
  );
};

