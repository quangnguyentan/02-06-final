import { useData } from "@/context/DataContext";
import * as React from "react";

interface StickyAdBannerProps {
  position: "top" | "bottom";
  imageUrl?: string; // Optional image URL for the ad
  buttonText?: string;
}

const StickyAdBanner: React.FC<StickyAdBannerProps> = ({
  position,
  imageUrl,
  buttonText,
}) => {
  const { bannerData } = useData();
  const [hiddenBanner, setHiddenBanner] = React.useState(false);
  const activeBanners = React.useMemo(() => {
    return bannerData?.filter((b) => b.isActive !== false && imageUrl) || [];
  }, [bannerData, imageUrl]);
  return (
    <div
      className={`
      ${position === "top" ? "top-0" : "bottom-0 fixed"}
      left-0
      right-0
      z-[1000]
      flex
      justify-center
      items-center
      shadow-lg
      h-auto
      w-full
      mx-auto
      max-w-[640px] sm:max-w-[768px] md:max-w-[960px]
      lg:max-w-[1024px]
      xl:max-w-[1200px]
      2xl:max-w-[1440px]
      3xl:max-w-[1440px]
    
    `}
    >
      {activeBanners?.length > 0 && !hiddenBanner && (
        <>
          <div className="items-center w-full xl:flex">
            <img
              src={imageUrl}
              srcSet={`${imageUrl}?w=320 320w, ${imageUrl}?w=640 640w`}
              sizes="(max-width: 640px) 320px, 640px"
              alt="Banner Quảng Cáo"
              className="w-full h-full md:h-[80px] object-cover rounded-md shadow"
              loading="lazy" // Tải lười hình ảnh
            />
            <img
              src={imageUrl}
              srcSet={`${imageUrl}?w=320 320w, ${imageUrl}?w=640 640w`}
              sizes="(max-width: 640px) 320px, 640px"
              alt="Banner Quảng Cáo"
              className="w-full h-full md:h-[80px] object-cover rounded-md shadow hidden xl:block"
              loading="lazy" // Tải lười hình ảnh
            />
          </div>

          {position === "bottom" && (
            <div
              onClick={() => setHiddenBanner(true)}
              className="opacity-80 bg-red-500 hover:bg-red-600 text-white font-semibold py-0 md:py-0.5 px-1.5 md:px-2.5 text-xs md:text-xs shadow absolute right-0 md:right-0 top-0 cursor-pointer"
            >
              {buttonText}
              <button className="text-white hover:text-yellow-200 text-xs md:text-lg leading-none">
                &times;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StickyAdBanner;
