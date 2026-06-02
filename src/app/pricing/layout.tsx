// Pricing is a public page — no AppShell or sidebar for unauthenticated users.
// Authentication is NOT enforced at the middleware level for /pricing.
export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
