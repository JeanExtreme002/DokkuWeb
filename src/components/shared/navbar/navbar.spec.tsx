import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { Session } from 'next-auth';

import i18n from '@/i18n';
import { logout } from '@/lib';
import { fireEvent, render, screen, waitFor } from '@/test-utils';

import { NavBar } from './navbar';

jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: any) => (opts?.name ? `Hello, ${opts.name}` : key),
  }),
}));

jest.mock('@/components', () => ({
  WebsiteLogo: () => <div data-testid='website-logo' />,
  Search: () => <input data-testid='search-input' />,
  SideBar: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid='sidebar-open' /> : null,
  AppIcon: () => <span data-testid='app-icon' />,
  ServiceIcon: () => <span data-testid='service-icon' />,
  NetworkIcon: () => <span data-testid='network-icon' />,
}));

jest.mock('@/i18n', () => ({
  changeLanguage: jest.fn(),
}));

jest.mock('@/lib', () => ({
  logout: jest.fn(),
}));

jest.mock('@/lib/utils', () => ({
  LANGUAGE_NAMES: { en: 'English', pt: 'Português' },
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ asPath: '/', push: mockPush });

// Polyfill ResizeObserver for jsdom (Radix UI and MUI need it)
beforeAll(() => {
  if (typeof window !== 'undefined' && !window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
  if (typeof global !== 'undefined' && !global.ResizeObserver) {
    global.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }
});

describe('NavBar', () => {
  const session: Session = {
    user: { name: 'John Doe', email: 'john@example.com' },
    expires: 'fake',
  };

  it('should render successfully', () => {
    const { container } = render(<NavBar session={session} />);
    expect(container).toMatchSnapshot();
  });

  it('should render logo, search, and greeting', () => {
    render(<NavBar session={session} />);
    expect(screen.getByTestId('website-logo')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByText('Hello, John')).toBeInTheDocument();
  });

  it('should open sidebar when menu button is clicked', () => {
    render(<NavBar session={session} />);
    const menuBtn = screen.getByLabelText(/open drawer/i);
    fireEvent.click(menuBtn);
    expect(screen.getByTestId('sidebar-open')).toBeInTheDocument();
  });

  it('should call router.push when create app is clicked', async () => {
    render(<NavBar session={session} />);

    const allButtons = screen.getAllByRole('button');

    const createBtn = allButtons.find((btn) => btn.className.includes('createButtonTrigger'));
    expect(createBtn).toBeDefined();

    await userEvent.click(createBtn!);

    // Radix UI portals menu to document.body, so query there
    const appItem = await waitFor(() => {
      const el = Array.from(document.body.querySelectorAll('[role="menuitem"]')).find(
        (el) => el.textContent === 'navbar.createApp'
      );
      return el || null;
    });
    expect(appItem).toBeInTheDocument();

    fireEvent.click(appItem!);

    expect(mockPush).toHaveBeenCalledWith('/apps/create/');
  });

  it('should call i18n.changeLanguage when language is selected', async () => {
    render(<NavBar session={session} />);
    const allButtons = screen.getAllByRole('button');

    const langBtn = allButtons.find((btn) => btn.className.includes('languageButtonTrigger'));
    expect(langBtn).toBeDefined();

    await userEvent.click(langBtn!);

    // Radix UI portals menu to document.body, so query there
    const ptItem = await waitFor(() => {
      const el = Array.from(document.body.querySelectorAll('[role="menuitem"]')).find(
        (el) => el.textContent === 'Português'
      );
      return el || null;
    });
    expect(ptItem).toBeInTheDocument();

    fireEvent.click(ptItem!);

    expect(i18n.changeLanguage).toHaveBeenCalledWith('pt');
  });

  it('should call router.push when settings is clicked', async () => {
    render(<NavBar session={session} />);

    const profileBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-controls') === 'profile-menu');
    expect(profileBtn).toBeDefined();

    // Simulate user opening the profile menu
    fireEvent.click(profileBtn!);

    const settingsItem = await screen.findByText('navbar.settings');
    expect(settingsItem).toBeInTheDocument();

    fireEvent.click(settingsItem);

    expect(mockPush).toHaveBeenCalledWith('/settings');
  });

  it('should call logout when logout is clicked', () => {
    render(<NavBar session={session} />);

    const profileBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-controls') === 'profile-menu');
    expect(profileBtn).toBeDefined();

    // Simulate user opening the profile menu
    fireEvent.click(profileBtn!);

    const logoutItem = screen.getByText('navbar.logout');
    expect(logoutItem).toBeInTheDocument();

    fireEvent.click(logoutItem);

    expect(logout).toHaveBeenCalled();
  });
});
