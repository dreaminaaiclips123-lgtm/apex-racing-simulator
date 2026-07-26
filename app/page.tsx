import Hero from "@/components/Hero";
import About from "@/components/About";
import SimulatorLineup from "@/components/SimulatorLineup";
import Modes from "@/components/Modes";
import Pricing from "@/components/Pricing";
import BookingSection from "@/components/BookingSection";
import Gallery from "@/components/Gallery";
import LocationContact from "@/components/LocationContact";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <SimulatorLineup />
      <Modes />
      <Pricing />
      <BookingSection />
      <Gallery />
      <LocationContact />
    </>
  );
}
