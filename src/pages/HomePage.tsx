import { HeroSection } from "../components/home/hero/HeroSection";
import { AcademyIntro } from "../components/home/intro/AcademyIntro";
import { GalleryPreview } from "../components/home/gallery/GalleryPreview";
import { WhyKPX } from "../components/home/why-kpx/WhyKPX";
import { FinalCTA } from "../components/home/cta/FinalCTA";
import { HowTrainingWorks } from "../components/home/how-it-works/HowTrainingWorks"
import { FeaturedProgrammes } from "../components/home/programmes/FeaturedProgrammes";
import { CreativeWorkshopsPreview } from "../components/home/workshops/CreativeWorkshopsPreview";

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <AcademyIntro />
      <GalleryPreview />
      <FeaturedProgrammes />
      <CreativeWorkshopsPreview />
      <HowTrainingWorks/>
      <WhyKPX />
      <FinalCTA/>


      {/* Future sections will be composed here:
          AcademyIntroSection
          FeaturedProgrammesSection
          TrainingProcessSection
          GallerySection
          WhyKPXSection
          FinalCTASection
      */}
    </>
  );
};
