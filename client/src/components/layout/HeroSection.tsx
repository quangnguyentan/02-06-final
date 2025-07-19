import * as React from "react";
import banner_container_after from "@/assets/user/bg-topz-min.jpg";
import banner_hoiquan from "@/assets/user/Anh bia hoi quan.png";
const HeroSection: React.FC = () => {
  return (
    // <div className="relative h-[220px] sm:h-[320px] md:h-[320px] flex items-center justify-center overflow-hidden rounded-b-xl ">
    <div className="relative h-full md:h-full flex items-center justify-center overflow-hidden ">
      {/* <div className="absolute inset-0 opacity-90">
        <img
          src={banner_container_after}
          alt="background"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-bg-[#323232] via-slate-900/70 to-transparent"></div> */}

      {/* Text Content */}
      <div
        className="relative z-10 h-full w-full mx-auto 
        max-w-[640px] sm:max-w-[768px] md:max-w-[960px] 
        lg:max-w-[1024px] 
        xl:max-w-[1200px] 
        2xl:max-w-[1440px] 
        3xl:max-w-[1440px]"
      >
        <img
          src={banner_hoiquan}
          alt="banner_container"
          className="lg:w-full max-sm:w-full sm:w-full h-full md:w-full max-w-full mx-auto drop-shadow-lg object-cover"
        />
      </div>
    </div>
  );
};

export default HeroSection;
