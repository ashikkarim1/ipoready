// Resources is a public page — no AppShell or sidebar for unauthenticated users.
// Authentication is NOT enforced at the middleware level for /resources.
export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
