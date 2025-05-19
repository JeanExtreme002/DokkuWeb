import { render, screen } from '@testing-library/react';

import { WebsiteLogo } from './website-logo';

describe('<WebsiteLogo />', () => {
  it('should render an image', () => {
    render(<WebsiteLogo />);

    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
