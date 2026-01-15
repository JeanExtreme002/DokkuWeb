import { fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/router';

import { Search } from './search';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Search', () => {
  let pushMock: jest.Mock;

  beforeEach(() => {
    pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
  });

  it('should render successfully', () => {
    const { container } = render(<Search />);
    expect(container).toMatchSnapshot();

    expect(screen.getByPlaceholderText('search.placeholder')).toBeInTheDocument();
    expect(screen.getByLabelText('search.inputLabel')).toBeInTheDocument();

    expect(screen.getByTestId('SearchIcon')).toBeInTheDocument();
    expect(screen.queryByTestId('ClearIcon')).not.toBeInTheDocument();

    const input = screen.getByPlaceholderText('search.placeholder');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(screen.getByTestId('ClearIcon')).toBeInTheDocument();
  });

  it('should call router.push with query on search icon click', () => {
    render(<Search />);

    const input = screen.getByPlaceholderText('search.placeholder');
    fireEvent.change(input, { target: { value: 'test' } });

    const searchIcon = screen.getByTestId('SearchIcon');
    fireEvent.click(searchIcon);

    expect(pushMock).toHaveBeenCalledWith('/search?q=test');
  });

  it('should call router.push with query on Enter key', () => {
    render(<Search />);

    const input = screen.getByPlaceholderText('search.placeholder');
    fireEvent.change(input, { target: { value: 'foo' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(pushMock).toHaveBeenCalledWith('/search?q=foo');
  });

  it('should clear input when clear icon is clicked', () => {
    render(<Search />);

    const input = screen.getByPlaceholderText('search.placeholder');
    fireEvent.change(input, { target: { value: 'bar' } });

    const clearIcon = screen.getByTestId('ClearIcon');
    fireEvent.click(clearIcon);

    expect(input).toHaveValue('');
  });
});
