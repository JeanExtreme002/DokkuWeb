import { render } from '@testing-library/react';

import { ServerUpdateIndicator } from './server-update-indicator';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ServerUpdateIndicator', () => {
  it('should render successfully', () => {
    const { container } = render(<ServerUpdateIndicator visible={true} />);
    expect(container).toMatchSnapshot();
  });
});
