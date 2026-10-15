import { BoldAspirationalHomePage } from "../components/home/BoldAspirationalHomePage";
import { FeaturedProgrammes } from "../components/home/programmes/FeaturedProgrammes";
import { GalleryPreview } from "../components/home/gallery/GalleryPreview";
import { HowTrainingWorks } from "../components/home/how-it-works/HowTrainingWorks";
import { WhyKPX } from "../components/home/why-kpx/WhyKPX";
import { FinalCTA } from "../components/home/cta/FinalCTA";

export const HomePage = () => (
  <>
    <BoldAspirationalHomePage />
    <FeaturedProgrammes />
    <GalleryPreview />
    <HowTrainingWorks />
    <WhyKPX />
    <FinalCTA />
  </>
);
