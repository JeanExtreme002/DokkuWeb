import { render } from '@testing-library/react';

import { AppAvatar } from './app-avatar';

describe('AppAvatar', () => {
  it('should render successfully', () => {
    const { container } = render(<AppAvatar size='5' />);
    expect(container).toMatchSnapshot();
  });
});
