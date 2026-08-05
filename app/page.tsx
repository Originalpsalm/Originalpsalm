export default function HomePage() {
  return (
    <main className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-12 text-center shadow-sm">
        <div className="mx-auto mb-6 flex size-12 items-center justify-center rounded-xl bg-primary text-xl font-semibold text-primary-fg">
          P
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Psalm Creations Business Suite
        </h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Enterprise business management — sales, inventory, and finance in one
          place.
        </p>
        <p className="mt-8 text-xs font-medium tracking-wide text-text-muted uppercase">
          Foundation · v0.0.1
        </p>
      </div>
    </main>
  );
}
