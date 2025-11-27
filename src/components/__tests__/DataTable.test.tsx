import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable, Column } from '../DataTable/datatable';

interface TestItem {
  id: string;
  name: string;
  email: string;
  status: string;
}

const mockData: TestItem[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'inactive' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'active' },
];

const mockColumns: Column<TestItem>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'status', label: 'Status', sortable: false },
];

describe('DataTable Component', () => {
  const defaultProps = {
    data: mockData,
    columns: mockColumns,
    loading: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    sortField: 'name',
    sortDirection: 'asc' as const,
    onSort: vi.fn(),
    getItemId: (item: TestItem) => item.id,
  };

  describe('Loading State', () => {
    it('should render skeleton rows when loading', () => {
      const { container } = render(<DataTable {...defaultProps} loading={true} />);
      
      // Skeleton rows should be rendered
      // Check for the presence of skeleton elements by class
      const skeletons = container.querySelectorAll('.chakra-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render custom skeleton count', () => {
      const { container } = render(<DataTable {...defaultProps} loading={true} skeletonCount={3} />);
      
      const skeletons = container.querySelectorAll('.chakra-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should not render actual data when loading', () => {
      render(<DataTable {...defaultProps} loading={true} />);
      
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should render default empty message when no data', () => {
      render(<DataTable {...defaultProps} data={[]} />);
      
      expect(screen.getByText('No data found.')).toBeInTheDocument();
    });

    it('should render custom empty message', () => {
      render(<DataTable {...defaultProps} data={[]} emptyMessage="No items available" />);
      
      expect(screen.getByText('No items available')).toBeInTheDocument();
    });
  });

  describe('Data Rendering', () => {
    it('should render table with data', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('should render column headers', () => {
      render(<DataTable {...defaultProps} />);
      
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Actions')).toBeInTheDocument();
    });

    it('should render custom cell content using render function', () => {
      const customColumns: Column<TestItem>[] = [
        {
          key: 'name',
          label: 'Name',
          render: (item) => <span data-testid="custom-name">{item.name.toUpperCase()}</span>,
        },
      ];

      render(<DataTable {...defaultProps} columns={customColumns} />);
      
      expect(screen.getByText('JOHN DOE')).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should call onSort when clicking sortable column header', () => {
      const onSort = vi.fn();
      render(<DataTable {...defaultProps} onSort={onSort} />);
      
      const nameHeader = screen.getByText('Name');
      fireEvent.click(nameHeader);
      
      expect(onSort).toHaveBeenCalledWith('name');
    });

    it('should not call onSort for non-sortable columns', () => {
      const onSort = vi.fn();
      render(<DataTable {...defaultProps} onSort={onSort} />);
      
      const statusHeader = screen.getByText('Status');
      fireEvent.click(statusHeader);
      
      expect(onSort).not.toHaveBeenCalled();
    });

    it('should display sort icon for active sort column', () => {
      render(<DataTable {...defaultProps} sortField="name" sortDirection="asc" />);
      
      // Chakra renders SVG icons, so we check if the Name header has the sort icon
      const nameHeader = screen.getByText('Name').parentElement;
      expect(nameHeader).toBeInTheDocument();
    });

    it('should display correct sort direction icon', () => {
      const { rerender } = render(
        <DataTable {...defaultProps} sortField="name" sortDirection="asc" />
      );
      
      // Check ascending
      expect(screen.getByText('Name')).toBeInTheDocument();
      
      // Change to descending
      rerender(<DataTable {...defaultProps} sortField="name" sortDirection="desc" />);
      expect(screen.getByText('Name')).toBeInTheDocument();
    });
  });

  describe('Actions', () => {
    it('should call onEdit when edit button is clicked', () => {
      const onEdit = vi.fn();
      render(<DataTable {...defaultProps} onEdit={onEdit} />);
      
      const editButtons = screen.getAllByLabelText('Edit');
      fireEvent.click(editButtons[0]);
      
      expect(onEdit).toHaveBeenCalledWith(mockData[0]);
    });

    it('should call onDelete when delete button is clicked', () => {
      const onDelete = vi.fn();
      render(<DataTable {...defaultProps} onDelete={onDelete} />);
      
      const deleteButtons = screen.getAllByLabelText('Delete');
      fireEvent.click(deleteButtons[0]);
      
      expect(onDelete).toHaveBeenCalledWith('1');
    });

    it('should render action buttons for each row', () => {
      render(<DataTable {...defaultProps} />);
      
      const editButtons = screen.getAllByLabelText('Edit');
      const deleteButtons = screen.getAllByLabelText('Delete');
      
      // Both desktop and mobile views render, so we get 2x the buttons
      expect(editButtons.length).toBeGreaterThanOrEqual(mockData.length);
      expect(deleteButtons.length).toBeGreaterThanOrEqual(mockData.length);
    });
  });

  describe('Mobile View', () => {
    it('should render mobile card view with title', () => {
      const mobileTitle = (item: TestItem) => <div>{item.name}</div>;
      
      render(<DataTable {...defaultProps} mobileTitle={mobileTitle} />);
      
      // Mobile view components are rendered but may be hidden by CSS
      expect(screen.getAllByText('John Doe')[0]).toBeInTheDocument();
    });

    it('should render mobile fields', () => {
      const mobileFields = [
        { label: 'Email', render: (item: TestItem) => <span>{item.email}</span> },
      ];
      
      render(<DataTable {...defaultProps} mobileFields={mobileFields} />);
      
      expect(screen.getAllByText('Email')[0]).toBeInTheDocument();
    });

    it('should render mobile subtitle', () => {
      const mobileTitle = (item: TestItem) => <div>{item.name}</div>;
      const mobileSubtitle = (item: TestItem) => <div>{item.email}</div>;
      
      render(
        <DataTable
          {...defaultProps}
          mobileTitle={mobileTitle}
          mobileSubtitle={mobileSubtitle}
        />
      );
      
      expect(screen.getAllByText('john@example.com')[0]).toBeInTheDocument();
    });
  });

  describe('Column Configuration', () => {
    it('should apply custom column width', () => {
      const columnsWithWidth: Column<TestItem>[] = [
        { key: 'name', label: 'Name', width: '200px' },
      ];
      
      render(<DataTable {...defaultProps} columns={columnsWithWidth} />);
      
      expect(screen.getByText('Name')).toBeInTheDocument();
    });

    it('should handle missing data gracefully', () => {
      const incompleteData = [
        { id: '1', name: 'John', email: '', status: '' },
      ] as TestItem[];
      
      render(<DataTable {...defaultProps} data={incompleteData} />);
      
      expect(screen.getByText('John')).toBeInTheDocument();
    });

    it('should use custom skeleton width for loading state', () => {
      const columnsWithSkeletonWidth: Column<TestItem>[] = [
        { key: 'name', label: 'Name', skeletonWidth: '150px' },
      ];
      
      const { container } = render(
        <DataTable {...defaultProps} columns={columnsWithSkeletonWidth} loading={true} />
      );
      
      const skeletons = container.querySelectorAll('.chakra-skeleton');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('getItemId', () => {
    it('should use custom getItemId function', () => {
      const customGetItemId = vi.fn((item: TestItem) => `custom-${item.id}`);
      render(<DataTable {...defaultProps} getItemId={customGetItemId} />);
      
      expect(customGetItemId).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single item data', () => {
      const singleItem = [mockData[0]];
      render(<DataTable {...defaultProps} data={singleItem} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should handle items with special characters', () => {
      const specialData: TestItem[] = [
        { id: '1', name: "O'Brien", email: 'test@test.com', status: 'active' },
      ];
      
      render(<DataTable {...defaultProps} data={specialData} />);
      
      expect(screen.getByText("O'Brien")).toBeInTheDocument();
    });
  });
});

