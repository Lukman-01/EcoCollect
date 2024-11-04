import Hero from '../components/homepage_components/HeroSection';
import Recycling from '../components/homepage_components/Recycling';
import HowItWorks from '../components/homepage_components/howItWorks';
import ReccoinAsaService from '../components/homepage_components/ReccoinAsaService';
import HomeFooter from '../components/homepage_components/HomeFooter';
import Header from '../components/navigation/Header';
import Footer from '../components/footer';

const Home = () => {
  return (
    <div className='container mx-auto'>
      <Header />
      <Hero />
      <ReccoinAsaService />
      <Recycling />
      <HowItWorks />
      <HomeFooter />
      <Footer />
    </div>
  );
};
export default Home;
