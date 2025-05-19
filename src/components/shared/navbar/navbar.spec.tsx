import { Theme } from '@radix-ui/themes';
import { render } from '@testing-library/react';

import { NavBar } from './navbar';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

describe('<NavBar />', () => {
  it('should render navbar successfully', () => {
    render(
      <Theme>
        <NavBar />
      </Theme>
    );
  });
});
