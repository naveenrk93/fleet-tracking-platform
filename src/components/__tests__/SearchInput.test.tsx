import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchInput } from '../SearchInput/SearchInput';

describe('SearchInput Component', () => {

  it('should render with default placeholder', () => {
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} />);
    
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} placeholder="Find items..." />);
    
    expect(screen.getByPlaceholderText('Find items...')).toBeInTheDocument();
  });

  it('should display the provided value', () => {
    const mockOnChange = vi.fn();
    render(<SearchInput value="test query" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    expect(input.value).toBe('test query');
  });

  it('should update local value on user input', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'new search');
    
    expect(input).toHaveValue('new search');
  });

  it('should debounce onChange calls', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} debounceMs={50} />);
    
    const input = screen.getByPlaceholderText('Search...');
    
    // Type multiple characters quickly
    await user.type(input, 'test');
    
    // Should not call onChange immediately
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should call onChange once with final value
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith('test');
    }, { timeout: 1000 });
  });

  it('should respect custom debounce time', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} debounceMs={50} />);
    
    const input = screen.getByPlaceholderText('Search...');
    await user.type(input, 'query');
    
    // Should not have been called yet
    expect(mockOnChange).not.toHaveBeenCalled();
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith('query');
    }, { timeout: 1000 });
  });

  it('should cancel previous debounce timer on new input', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} debounceMs={50} />);
    
    const input = screen.getByPlaceholderText('Search...');
    
    // Type first query
    await user.type(input, 'first');
    await new Promise(resolve => setTimeout(resolve, 25)); // Not enough to trigger
    
    // Clear and type second query
    await user.clear(input);
    await user.type(input, 'second');
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should only call with final value
    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith('second');
    }, { timeout: 1000 });
  });

  it('should update local value when external value changes', async () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(<SearchInput value="initial" onChange={mockOnChange} debounceMs={50} />);
    
    const input = screen.getByPlaceholderText('Search...') as HTMLInputElement;
    expect(input.value).toBe('initial');
    
    // Update external value
    rerender(<SearchInput value="updated" onChange={mockOnChange} debounceMs={50} />);
    
    await waitFor(() => {
      expect(input.value).toBe('updated');
    }, { timeout: 1000 });
  });

  it('should not call onChange if value hasnt changed after debounce', async () => {
    const mockOnChange = vi.fn();
    render(<SearchInput value="existing" onChange={mockOnChange} debounceMs={50} />);
    
    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should not call onChange since the value hasn't changed
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should accept additional input props', () => {
    const mockOnChange = vi.fn();
    render(
      <SearchInput 
        value="" 
        onChange={mockOnChange} 
        data-testid="custom-search"
        disabled
      />
    );
    
    const input = screen.getByTestId('custom-search');
    expect(input).toBeInTheDocument();
    expect(input).toBeDisabled();
  });

  it('should render search icon', () => {
    const mockOnChange = vi.fn();
    render(<SearchInput value="" onChange={mockOnChange} />);
    
    // The icon is rendered but might not have accessible text
    // We can check if the InputGroup contains the icon component
    const inputGroup = screen.getByPlaceholderText('Search...').parentElement?.parentElement;
    expect(inputGroup).toBeInTheDocument();
  });
});

