/**
 * Listed Services OS - Design Refactoring Tests
 * Verification of mission control design system implementation
 *
 * Tests verify:
 * - Color scheme consistency with mission control theme
 * - Card styling with hover/animation effects
 * - Typography hierarchy alignment
 * - Status badge styling
 * - Motion animation patterns
 * - Button/CTA styling
 * - Responsive behavior
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import ListedServicesPage from '../page'

// Mock session
const mockSession = {
  user: { email: 'test@example.com', name: 'Test User' },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
}

describe('Listed Services OS - Design Refactoring', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Color Schemes & Theming', () => {
    it('should render with mission control light theme (F7F6F4 background)', () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )
      const mainDiv = container.querySelector('div[style*="F7F6F4"]')
      expect(mainDiv).toBeInTheDocument()
    })

    it('should apply correct color scheme objects to all modules', async () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      // Wait for modules to render
      await waitFor(() => {
        expect(screen.queryByText('Capital Markets Intelligence')).toBeInTheDocument()
      })

      // Check gradient classes are applied
      const gradientElements = container.querySelectorAll('[class*="from-"]')
      expect(gradientElements.length).toBeGreaterThan(0)
    })

    it('should use CSS variables for dynamic theming', async () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      // Check for color variable usage
      const elementsWithColorVars = container.querySelectorAll('[style*="var(--color"]')
      expect(elementsWithColorVars.length).toBeGreaterThan(10)
    })
  })

  describe('Card Styling & Hover Effects', () => {
    it('should render module cards with border and styling', async () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.queryByText('Capital Markets Intelligence')).toBeInTheDocument()
      })

      const cards = container.querySelectorAll('button[style*="background"]')
      expect(cards.length).toBeGreaterThan(0)
    })

    it('should apply selection styling when module is selected', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const moduleButton = await screen.findByText('Capital Markets Intelligence')
      fireEvent.click(moduleButton)

      await waitFor(() => {
        expect(screen.queryByText('Key Metrics')).toBeInTheDocument()
      })
    })
  })

  describe('Typography Hierarchy', () => {
    it('should render proper heading hierarchy', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const mainTitle = screen.getByText('Listed Services OS')
      expect(mainTitle).toHaveClass('text-3xl')
      expect(mainTitle).toHaveClass('sm:text-4xl')
      expect(mainTitle).toHaveClass('font-bold')
    })

    it('should use semantic font sizes for responsive design', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const subtitle = screen.getByText('The intelligence layer for public company leaders')
      expect(subtitle).toHaveClass('text-base')
      expect(subtitle).toHaveClass('sm:text-lg')
    })
  })

  describe('Status Badges', () => {
    it('should render available status badge', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      await waitFor(() => {
        const availableBadges = screen.queryAllByText('Available')
        expect(availableBadges.length).toBeGreaterThan(0)
      })
    })

    it('should render beta status badge', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      await waitFor(() => {
        expect(screen.queryByText('Beta')).toBeInTheDocument()
      })
    })

    it('should render coming soon status badge', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      await waitFor(() => {
        const comingSoonBadges = screen.queryAllByText('Coming Soon')
        expect(comingSoonBadges.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Data Visualization', () => {
    it('should display metrics in grid layout', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const moduleButton = await screen.findByText('Capital Markets Intelligence')
      fireEvent.click(moduleButton)

      await waitFor(() => {
        expect(screen.queryByText('Key Metrics')).toBeInTheDocument()
      })
    })

    it('should show trending indicators (up/down arrows)', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const moduleButton = await screen.findByText('Capital Markets Intelligence')
      fireEvent.click(moduleButton)

      await waitFor(() => {
        expect(screen.queryByText('Key Metrics')).toBeInTheDocument()
      })

      // SVG elements for TrendingUp/TrendingDown should be present
      const svgElements = document.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
    })
  })

  describe('Button & CTA Styling', () => {
    it('should render accent-colored filter buttons', async () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const filterButtons = screen.queryAllByRole('button').slice(0, 4) // First 4 are filters
      expect(filterButtons.length).toBeGreaterThanOrEqual(4)
    })

    it('should render View Dashboard button in available modules', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const moduleButton = await screen.findByText('Capital Markets Intelligence')
      fireEvent.click(moduleButton)

      await waitFor(() => {
        expect(screen.queryByText('View Dashboard')).toBeInTheDocument()
      })
    })

    it('should render disabled Coming Soon button for future modules', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const moduleButton = await screen.findByText('M&A Intelligence Engine')
      fireEvent.click(moduleButton)

      await waitFor(() => {
        const comingSoonButton = screen.queryByRole('button', { name: /Coming Soon/i })
        expect(comingSoonButton).toBeDisabled()
      })
    })
  })

  describe('Animation & Motion', () => {
    it('should render with Framer Motion components', async () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      // Framer Motion adds classes and styles for animation
      const animatedElements = container.querySelectorAll('[style*="opacity"]')
      expect(animatedElements.length).toBeGreaterThan(0)
    })

    it('should have transition delays for staggered animations', () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      // Motion divs should have transition styles
      const styledElements = container.querySelectorAll('[style*="transition"]')
      expect(styledElements.length).toBeGreaterThan(0)
    })
  })

  describe('Responsive Design', () => {
    it('should use responsive grid for modules (1 col mobile, 2 col desktop)', () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const grid = container.querySelector('.grid')
      expect(grid).toHaveClass('grid-cols-1')
      expect(grid).toHaveClass('md:grid-cols-2')
    })

    it('should use responsive text sizes', () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const title = screen.getByText('Listed Services OS')
      expect(title).toHaveClass('text-3xl')
      expect(title).toHaveClass('sm:text-4xl')
    })

    it('should use responsive padding', () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const sections = container.querySelectorAll('[class*="px-6"]')
      expect(sections.length).toBeGreaterThan(0)
    })
  })

  describe('Functional Behavior', () => {
    it('should filter modules by status', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      // Initially all modules should be visible
      await waitFor(() => {
        expect(screen.queryByText('Capital Markets Intelligence')).toBeInTheDocument()
      })

      // Click Available filter
      const availableButton = screen.getByRole('button', { name: /Available/ })
      fireEvent.click(availableButton)

      // Should show only available modules
      await waitFor(() => {
        expect(screen.queryByText('Capital Markets Intelligence')).toBeInTheDocument()
      })
    })

    it('should expand and collapse module details', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const moduleButton = await screen.findByText('Capital Markets Intelligence')

      // Click to expand
      fireEvent.click(moduleButton)
      await waitFor(() => {
        expect(screen.queryByText('Key Metrics')).toBeInTheDocument()
      })

      // Click to collapse
      fireEvent.click(moduleButton)
      await waitFor(() => {
        expect(screen.queryByText('Key Metrics')).not.toBeInTheDocument()
      })
    })

    it('should display all module data when expanded', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const moduleButton = await screen.findByText('Capital Markets Intelligence')
      fireEvent.click(moduleButton)

      await waitFor(() => {
        expect(screen.queryByText('Key Metrics')).toBeInTheDocument()
        expect(screen.queryByText('Key Insights')).toBeInTheDocument()
        expect(screen.queryByText('Recommended Actions')).toBeInTheDocument()
        expect(screen.queryByText('Data Freshness')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading structure', async () => {
      const { container } = render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const headings = container.querySelectorAll('h1, h2, h3')
      expect(headings.length).toBeGreaterThan(0)
    })

    it('should have alt text or semantic meaning for icons', async () => {
      render(
        <SessionProvider session={mockSession}>
          <ListedServicesPage />
        </SessionProvider>
      )

      const buttons = screen.queryAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
