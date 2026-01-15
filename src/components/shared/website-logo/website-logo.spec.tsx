import { render, screen } from '@testing-library/react';

import { WebsiteLogo } from './website-logo';

jest.mock('@/lib', () => ({
  config: {
    website: {
      title: 'Test Website',
    },
  },
}));

describe('WebsiteLogo', () => {
  it('should render logo image and title by default', () => {
    render(<WebsiteLogo />);
    expect(screen.getByAltText('Logo')).toBeInTheDocument();
    expect(screen.getByText('Test Website')).toBeInTheDocument();
  });

  it('should render logo image without link when disableLink is true', () => {
    render(<WebsiteLogo disableLink />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toBeNull();
  });

  it('should render logo image with correct size class', () => {
    const { rerender } = render(<WebsiteLogo size='small' />);
    expect(screen.getByAltText('Logo').className).toMatch(/smallLogoImg/);
    rerender(<WebsiteLogo size='medium' />);
    expect(screen.getByAltText('Logo').className).toMatch(/mediumLogoImg/);
    rerender(<WebsiteLogo size='large' />);
    expect(screen.getByAltText('Logo').className).toMatch(/largeLogoImg/);
  });

  it('should apply custom color to title', () => {
    render(<WebsiteLogo disableLink color='red' />);
    const title = screen.getByText('Test Website');
    expect(title).toHaveStyle({ color: 'red' });
  });

  it('should render with breakLogo true (column layout)', () => {
    const { container } = render(<WebsiteLogo breakLogo />);
    expect(container.firstChild).toHaveStyle('flex-direction: column');
  });
});
