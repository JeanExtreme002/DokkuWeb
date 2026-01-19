import { render } from '@testing-library/react';

import { SharedAppAvatar } from './shared-app-avatar';

describe('SharedAppAvatar', () => {
  it('should render successfully', () => {
    const { container } = render(<SharedAppAvatar size='5' />);
    expect(container).toMatchSnapshot();
  });
});
