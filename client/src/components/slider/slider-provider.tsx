import { Swiper, SwiperSlide } from "swiper/react";
import "@/index.css";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {
  EffectCoverflow,
  Autoplay,
  Mousewheel,
  Keyboard,
  Navigation,
  Pagination,
} from "swiper/modules";
import topic from "@/assets/user/topic_img.jpg";
import { useNavigate } from "react-router-dom";
type SliderProviderCss = {
  widthClass: string;
  heightClass: string;
  type?: string;
};

export default function SliderProvider({
  widthClass,
  heightClass,
  type,
}: SliderProviderCss) {
  const navigate = useNavigate();

  return (
    <div className={`${widthClass} ${heightClass} relative`}>
      {type === "topic" ? (
        <Swiper
          effect={"coverflow"}
          spaceBetween={30}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          navigation={type !== "topic"}
          modules={[
            EffectCoverflow,
            Autoplay,
            Mousewheel,
            Keyboard,
            ...(type === "topic" ? [] : [Navigation]),
            Pagination,
          ]}
          className="w-full h-full mySwiper"
        >
          <SwiperSlide
            className="w-full h-full"
            onClick={() => navigate("/topic/categories")}
          >
            <img
              src={topic}
              alt="topic"
              className="w-full h-full mx-auto object-cover rounded-xl"
            />
            <div className="absolute flex flex-col items-center justify-center text-center text-white font-bold z-50 w-full translate-y-[50%] left-0 right-0 top-20">
              <span className="text-4xl">Basics </span>
              <span className="text-4xl">30 topics</span>
            </div>
          </SwiperSlide>
          <SwiperSlide className="w-full h-full">
            <img
              src={topic}
              alt="topic"
              className="w-full h-full mx-auto object-cover rounded-xl"
            />
            <div className="absolute flex flex-col items-center justify-center text-center text-white font-bold z-50 w-full translate-y-[50%] left-0 right-0 top-20">
              <span className="text-4xl">Basics </span>
              <span className="text-4xl">30 topics</span>
            </div>
          </SwiperSlide>
        </Swiper>
      ) : (
        <Swiper
          effect={"coverflow"}
          spaceBetween={30}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={1}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          navigation={true}
          modules={[
            EffectCoverflow,
            Autoplay,
            Mousewheel,
            Keyboard,
            Navigation,
            Pagination,
          ]}
          className="w-full h-full mySwiper"
        >
          <SwiperSlide className="!flex !items-center !justify-evenly px-16 bg-red-500 rounded-3xl w-full h-full">
            <div className="rounded-full w-20 h-20 bg-red-700 flex items-center justify-center">
              <span className="font-extrabold text-white">IELTS</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center text-white font-medium">
              <span>Phát âm </span>
              <span>bởi nguyentanquang</span>
              <span>32 từ vựng</span>
            </div>
          </SwiperSlide>
          <SwiperSlide className="!flex !items-center !justify-evenly px-16 bg-red-500 rounded-3xl w-full h-full">
            <div className="rounded-full w-20 h-20 bg-red-700 flex items-center justify-center">
              <span className="font-extrabold text-white">IELTS</span>
            </div>
            <div className="flex flex-col items-center text-lg justify-center text-center text-white font-medium">
              <span>Phát âm </span>
              <span>bởi nguyentanquang</span>
              <span>32 từ vựng</span>
            </div>
          </SwiperSlide>
          <SwiperSlide className="!flex !items-center !justify-evenly px-16 bg-red-500 rounded-3xl w-full h-full">
            <div className="rounded-full w-20 h-20 bg-red-700 flex items-center justify-center">
              <span className="font-extrabold text-white">IELTS</span>
            </div>
            <div className="flex flex-col items-center text-lg justify-center text-center text-white font-medium">
              <span>Phát âm </span>
              <span>bởi nguyentanquang</span>
              <span>32 từ vựng</span>
            </div>
          </SwiperSlide>
          <SwiperSlide className="!flex !items-center !justify-evenly px-16 bg-red-500 rounded-3xl w-full h-full">
            <div className="rounded-full w-20 h-20 bg-red-700 flex items-center justify-center">
              <span className="font-extrabold text-white">IELTS</span>
            </div>
            <div className="flex flex-col items-center text-lg justify-center text-center text-white font-medium">
              <span>Phát âm </span>
              <span>bởi nguyentanquang</span>
              <span>32 từ vựng</span>
            </div>
          </SwiperSlide>
        </Swiper>
      )}
    </div>
  );
}
