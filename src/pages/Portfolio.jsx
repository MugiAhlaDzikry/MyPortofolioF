import { useLenis } from '../hooks/useLenis';
import CustomCursor from '../components/Layout/CustomCursor';
import Navbar from '../components/Layout/Navbar';
import Footer from '../components/Layout/Footer';
import Hero from '../sections/Hero';
import Skills from '../sections/Skills';
import Projects from '../sections/Projects';
import GithubActivity from '../sections/GithubActivity';
import Experience from '../sections/Experience';
import Awards from '../sections/Awards';
import Education from '../sections/Education';
import Contact from '../sections/Contact';

export default function Portfolio() {
  useLenis();

  return (
    <>
      <CustomCursor />
      <Navbar />
      
      <main>
        <Hero />
        <Skills />
        <Projects />
        <GithubActivity />
        <Experience />
        <Awards />
        <Education />
        <Contact />
      </main>

      <Footer />

      {/* Noise texture overlay */}
      <div className="noise-overlay" aria-hidden="true"></div>
    </>
  );
}
