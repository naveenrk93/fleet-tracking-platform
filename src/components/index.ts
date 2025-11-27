// Error Boundaries
export { ErrorBoundary, withErrorBoundary } from './ErrorBoundary/ErrorBoundary.tsx';
export { MapErrorBoundary } from './MapErrorBoundary/MapErrorBoundary.tsx';
export { FormErrorBoundary } from './FormErrorBoundary/FormErrorBoundary.tsx';

// Layout Components
export { Header } from './Header/Header.tsx';
export { Sidebar } from './Sidebar/Sidebar.tsx';
export { RoleAutoSwitch } from './RoleAutoSwitch/RoleAutoSwitch.tsx';
export { RoleBasedRedirect } from '../utils/RoleBasedRedirect.tsx';
export { RoleGuard } from './RoleGuard/RoleGuard.tsx';

// Dashboard Components
export { StatCard } from './dashboard/StatCard';
export { EarningReportsCard } from './dashboard/EarningReportsCard';
export { RevenueGeneratedCard } from './dashboard/RevenueGeneratedCard';
export { WebsiteAnalyticsCard } from './dashboard/WebsiteAnalyticsCard';
export { SupportTrackerCard } from './dashboard/SupportTrackerCard';

// Admin Components
export { DataTable } from './DataTable/datatable.tsx';
export type { Column, MobileField, DataTableProps } from './DataTable/datatable.tsx';

// Reusable UI Components
export { SearchInput } from './SearchInput/SearchInput';
export type { SearchInputProps } from './SearchInput/SearchInput';

export { PageHeader } from './PageHeader/PageHeader';
export type { PageHeaderProps } from './PageHeader/PageHeader';

export { ConfirmDialog, useConfirmDialog } from './ConfirmDialog/ConfirmDialog';
export type { ConfirmDialogProps } from './ConfirmDialog/ConfirmDialog';

export { StatusBadge, getStatusColor, formatStatusText } from './StatusBadge/StatusBadge';
export type { StatusBadgeProps, StatusType } from './StatusBadge/StatusBadge';

export { MasterDataModal, Input as MasterDataInput, Textarea as MasterDataTextarea, Select as MasterDataSelect } from './MasterDataModal/MasterDataModal';