import * as React from "react";
import banner_container_after from "@/assets/user/bg-topz-min.jpg";
import { ChevronLeftIcon, ChevronRightIcon } from "./Icon";
import banner_hoiquan from "@/assets/user/Anh bia hoi quan.png";
import banner_hoiquan_bi_a from "@/assets/user/Anh bia hoi quan bi a.png";
import banner_hoiquan_bong_chuyen from "@/assets/user/Anh bia hoi quan bong chuyen.png";
import banner_hoiquan_lien_minh from "@/assets/user/Anh bia hoi quan lien minh.png";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
const HeroSection: React.FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PreviewArrow />,
    lazyLoad: "ondemand" as "ondemand" | "progressive",
    pauseOnHover: true,
  };
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
        <Slider {...settings} className="h-full w-full">
          <img
            src={banner_hoiquan}
            alt="banner_container"
            className="lg:w-full max-sm:w-full sm:w-full h-full md:w-full max-w-full mx-auto drop-shadow-lg object-cover"
          />
          <img
            src={banner_hoiquan_bong_chuyen}
            alt="banner_container"
            className="lg:w-full max-sm:w-full sm:w-full h-full md:w-full max-w-full mx-auto drop-shadow-lg object-cover"
          />
          <img
            src={banner_hoiquan_bi_a}
            alt="banner_container"
            className="lg:w-full max-sm:w-full sm:w-full h-full md:w-full max-w-full mx-auto drop-shadow-lg object-cover"
          />
          <img
            src={banner_hoiquan_lien_minh}
            alt="banner_container"
            className="lg:w-full max-sm:w-full sm:w-full h-full md:w-full max-w-full mx-auto drop-shadow-lg object-cover"
          />
        </Slider>
      </div>
    </div>
  );
};

export default HeroSection;
const NextArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="custom-next-arrow absolute top-1/2 right-0 transform  -translate-y-1/2 opacity-100 group-hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
      onClick={onClick}
    >
      {ChevronRightIcon ? (
        <ChevronRightIcon className="w-8 h-8 text-white" />
      ) : (
        <div className="text-white">Icon Missing</div>
      )}
    </div>
  );
};
const PreviewArrow = (props: any) => {
  const { onClick } = props;
  return (
    <div
      className="custom-preview-arrow absolute top-1/2 left-0 transform -translate-y-1/2 opacity-100 group-hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
      onClick={onClick}
    >
      {ChevronLeftIcon ? (
        <ChevronLeftIcon className="w-8 h-8 text-white" />
      ) : (
        <div className="text-white">Icon Missing</div>
      )}
    </div>
  );
};
