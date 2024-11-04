import AboutUsHero from "../components/about_us_components/AboutUsHero";
import Empowering from "../components/about_us_components/Empowering";
import Purpose from "../components/about_us_components/Purpose";
import Vision from "../components/about_us_components/Vision";
import Footer from "../components/footer";
import HomeFooter from "../components/homepage_components/HomeFooter";
import Header from "../components/navigation/Header";

const AboutUs = () => {
  return(
    <div className="container mx-auto">
      <Header/>
      <AboutUsHero/>
      <Purpose/>
      <Vision/>
      <Empowering/>
      <HomeFooter/>
      <Footer/>
    </div>
  )
   
    
     };

export default AboutUs;

