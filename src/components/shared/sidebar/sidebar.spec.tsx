import { fireEvent, render, screen } from '@testing-library/react';

import { SideBar } from './sidebar';

const mockSetIsOpen = jest.fn();

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock('@/components', () => ({
  AppIcon: () => <div data-testid='app-icon' />,
  DashboardIcon: () => <div data-testid='dashboard-icon' />,
  NetworkIcon: () => <div data-testid='network-icon' />,
  ServiceIcon: () => <div data-testid='service-icon' />,
  ThemeToggle: () => <div data-testid='theme-toggle' />,
  WebsiteLogo: () => <div data-testid='website-logo' />,
}));

jest.mock('@/lib', () => ({
  credits: {
    github: {
      projectLink: 'https://github.com/example/project',
      name: 'example',
      projectName: 'project',
    },
  },
}));

describe('SideBar', () => {
  beforeEach(() => {
    mockSetIsOpen.mockClear();
  });

  it('should render successfully', () => {
    const { container } = render(<SideBar isOpen={true} setIsOpen={mockSetIsOpen} />);
    expect(container).toMatchSnapshot();
  });

  it('should render sidebar with all main items', () => {
    render(<SideBar isOpen={true} setIsOpen={mockSetIsOpen} />);
    expect(screen.getByTestId('website-logo')).toBeInTheDocument();
    expect(screen.getByText('sidebar.overview')).toBeInTheDocument();
    expect(screen.getByText('sidebar.apps')).toBeInTheDocument();
    expect(screen.getByText('sidebar.services')).toBeInTheDocument();
    expect(screen.getByText('sidebar.networks')).toBeInTheDocument();
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('should call setIsOpen(false) when logo is clicked', () => {
    render(<SideBar isOpen={true} setIsOpen={mockSetIsOpen} />);
    const logo = screen.getByTestId('website-logo').parentElement;
    fireEvent.click(logo!);
    expect(mockSetIsOpen).toHaveBeenCalledWith(false);
  });

  it('should render GitHub link and project name', () => {
    render(<SideBar isOpen={true} setIsOpen={mockSetIsOpen} />);
    expect(screen.getByText('project')).toBeInTheDocument();
    expect(screen.getByLabelText('GitHub - example/project')).toHaveAttribute(
      'href',
      'https://github.com/example/project'
    );
  });
});
