import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { Toast } from './toast';

jest.useFakeTimers();

describe('Toast', () => {
  const baseProps = {
    message: 'Test message',
    visible: true,
    onHide: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  it('renders nothing when not visible', () => {
    const { container } = render(<Toast {...baseProps} visible={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the message when visible', () => {
    render(<Toast {...baseProps} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders a close button with accessible label', () => {
    render(<Toast {...baseProps} />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('calls onHide when the close button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime.bind(jest) });
    const onHide = jest.fn();
    render(<Toast {...baseProps} onHide={onHide} />);
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('calls onHide after the default duration of 5000ms', () => {
    const onHide = jest.fn();
    render(<Toast {...baseProps} onHide={onHide} />);
    jest.advanceTimersByTime(4999);
    expect(onHide).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('calls onHide after a custom duration', () => {
    const onHide = jest.fn();
    render(<Toast {...baseProps} onHide={onHide} duration={2000} />);
    jest.advanceTimersByTime(1999);
    expect(onHide).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('applies --toast-duration CSS variable from duration prop', () => {
    const { container } = render(<Toast {...baseProps} duration={3000} />);
    const toastEl = container.firstChild as HTMLElement;
    expect(toastEl).toHaveStyle({ '--toast-duration': '3000ms' });
  });

  it('does not start the auto-hide timer when not visible', () => {
    const onHide = jest.fn();
    render(<Toast {...baseProps} visible={false} onHide={onHide} />);
    jest.advanceTimersByTime(10000);
    expect(onHide).not.toHaveBeenCalled();
  });

  it('clears the timer when visibility changes to false', () => {
    const onHide = jest.fn();
    const { rerender } = render(<Toast {...baseProps} onHide={onHide} />);
    rerender(<Toast {...baseProps} onHide={onHide} visible={false} />);
    jest.advanceTimersByTime(5000);
    expect(onHide).not.toHaveBeenCalled();
  });
});
