import { act, render, screen } from '@testing-library/react';
import React from 'react';

import { LoadingSpinner } from './loading-spinner';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const customMessages = ['first-message', 'second-message', 'third-message', 'fourth-message'];

describe('LoadingSpinner', () => {
  it('should render successfully', () => {
    const { container } = render(
      <LoadingSpinner title={'custom-title'} messages={customMessages} />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render component with title and messages', () => {
    render(<LoadingSpinner title={'custom-title'} messages={customMessages} />);
    expect(screen.getByText('custom-title')).toBeInTheDocument();
    expect(screen.getByText(customMessages[0])).toBeInTheDocument();
  });

  it('should cycle through messages over time', () => {
    jest.useFakeTimers();
    render(<LoadingSpinner title={'custom-title'} messages={customMessages} />);
    expect(screen.getByText(customMessages[0])).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText(customMessages[1])).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText(customMessages[2])).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText(customMessages[3])).toBeInTheDocument();

    // After the last message, go back to the first one.
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(screen.getByText(customMessages[0])).toBeInTheDocument();

    jest.useRealTimers();
  });
});
