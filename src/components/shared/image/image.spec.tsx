import { render } from '@testing-library/react';

import { Image } from './image';

describe('Image component', () => {
  it('should render Next.js Image inside a styled div', () => {
    const { container } = render(
      <Image src='/test.png' alt='Test image' className='custom-class' />
    );
    expect(container.firstChild).toHaveClass('custom-class');
    expect(container.querySelector('img')).toBeInTheDocument();
  });
});
