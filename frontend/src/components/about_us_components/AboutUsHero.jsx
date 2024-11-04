const AboutUsHero = () => {
  return (
    <div className="w-full py-20 md:py-32 lg:py-40 bg-gradient-to-b from-green-900 to-green-800 flex flex-col items-center px-6 text-center">
      
      {/* Main content */}
      <div className="max-w-screen-md mx-auto space-y-6">
        <p className="text-green-200 font-montserrat font-semibold text-xl md:text-3xl">
          About EcoCollect
        </p>
        
        <div className="h-1 w-24 mx-auto bg-green-400"></div>

        <h2 className="text-white font-montserrat font-bold text-2xl md:text-4xl lg:text-5xl leading-tight">
          We Safeguard The Environment
        </h2>

        <p className="text-green-100 font-montserrat text-base md:text-lg lg:text-xl max-w-lg mx-auto leading-relaxed">
          At EcoCollect, we are revolutionizing the way we address the global plastic crisis. We incentivize individuals to take action by collecting waste plastics and reward them with tokens. Partnering with leading recycling companies, we ensure that collected plastics are repurposed, contributing to a sustainable future.
        </p>
      </div>
    </div>
  );
};

export default AboutUsHero;
