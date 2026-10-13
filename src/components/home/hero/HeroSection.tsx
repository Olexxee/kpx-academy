import { Container } from "../../ui/Container";
import { HeroContent } from "./HeroContent";
import { HeroVisual } from "./HeroVisual";

export const HeroSection = () => {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="overflow-hidden bg-neutral"
    >
      <Container className="grid min-h-[620px] items-center gap-12 py-16 md:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <HeroContent />
        <HeroVisual />
      </Container>
    </section>
  );
};
