import {
  ArrowRight,
  ButtonLink,
  Container,
} from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <section className="relative overflow-hidden">
      <div aria-hidden className="gx-grid-bg absolute inset-0" />
      <Container className="relative flex min-h-[60vh] flex-col justify-center py-24">
        <p className="font-mono text-sm text-primary">404</p>
        <h1 className="mt-4 max-w-xl font-display text-3xl leading-tight font-semibold text-balance sm:text-4xl">
          That page is not part of the plan.
        </h1>
        <p className="mt-4 max-w-lg text-base leading-8 text-text-secondary">
          The page you are looking for does not exist, or it may have moved as
          the platform developed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/">
            Back to home
            <ArrowRight />
          </ButtonLink>
          <ButtonLink href="/opportunities" variant="secondary">
            View opportunities
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
