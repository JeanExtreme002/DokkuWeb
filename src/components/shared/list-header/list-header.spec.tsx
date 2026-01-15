import { fireEvent, render, screen } from '@testing-library/react';

import { ListHeader } from './list-header';

describe('ListHeader component', () => {
  it('should render successfully', () => {
    const { container } = render(
      <ListHeader
        title='Test Title'
        subtitle='Test Subtitle'
        buttonLabel='Create'
        onCreate={() => {}}
      />
    );
    expect(container).toMatchSnapshot();
  });

  it('should render title, subtitle and button label', () => {
    render(
      <ListHeader
        title='Test Title'
        subtitle='Test Subtitle'
        buttonLabel='Create'
        onCreate={() => {}}
        containerClassName='container-class'
        buttonClassName='button-class'
      />
    );
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Title').parentElement?.parentElement).toHaveClass(
      'container-class'
    );
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    expect(screen.getByText('Create')).toBeInTheDocument();
    expect(screen.getByText('Create')).toHaveClass('button-class');
  });

  it('should call onCreate when button is clicked', () => {
    const onCreateMock = jest.fn();
    render(
      <ListHeader title='Title' subtitle='Subtitle' buttonLabel='Add' onCreate={onCreateMock} />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onCreateMock).toHaveBeenCalled();
  });
});
