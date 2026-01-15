import { render, screen } from '@testing-library/react';

import { ErrorCard } from './error-card';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ErrorCard', () => {
  it('should render successfully', () => {
    const { container } = render(<ErrorCard error='message' />);
    expect(container).toMatchSnapshot();
  });
  it('should render error message', () => {
    render(<ErrorCard error='message' />);
    expect(screen.queryByText('errorCard.prefix message')).toBeInTheDocument();
  });
});
