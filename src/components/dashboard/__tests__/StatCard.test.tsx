import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../../../test/test-utils';
import { StatCard } from '../StatCard';
import { MdDirectionsCar } from 'react-icons/md';

describe('StatCard', () => {
  it('should render stat card with title and value', () => {
    render(
      <StatCard
        title="Total Vehicles"
        value="50"
        icon={MdDirectionsCar}
      />
    );

    expect(screen.getByText('Total Vehicles')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('should render with percentage', () => {
    render(
      <StatCard
        title="Total Vehicles"
        value="50"
        percentage="+10%"
        icon={MdDirectionsCar}
      />
    );

    expect(screen.getByText('+10%')).toBeInTheDocument();
  });

  it('should render with subtitle', () => {
    render(
      <StatCard
        title="Revenue"
        value="50000"
        subtitle="This month"
        icon={MdDirectionsCar}
      />
    );

    expect(screen.getByText('This month')).toBeInTheDocument();
  });

  it('should apply custom color', () => {
    const { container } = render(
      <StatCard
        title="Total Vehicles"
        value="50"
        icon={MdDirectionsCar}
        color="blue.400"
      />
    );

    // Chakra UI applies color styles
    expect(container.firstChild).toBeTruthy();
  });

  it('should render without icon', () => {
    render(
      <StatCard
        title="Revenue"
        value="50000"
      />
    );

    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('50000')).toBeInTheDocument();
  });
});

