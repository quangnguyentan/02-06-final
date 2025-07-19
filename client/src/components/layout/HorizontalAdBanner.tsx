import * as React from "react";

interface HorizontalAdBannerProps {
  imageUrl?: string;
  text?: string;
  buttonText?: string;
  adLink?: string;
  bgColor?: string;
  textColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  imageAlt?: string;
}

const HorizontalAdBanner: React.FC<HorizontalAdBannerProps> = ({
  imageUrl = "https://via.placeholder.com/100x40/FFFFFF/000000?text=8XBET",
  text = "HOÀN TIỀN VỀ CƯỢC ĐẦU TIÊN 100%",
  buttonText = "ĐĂNG KÝ",
  adLink = "#",
  bgColor = "bg-blue-700",
  textColor = "text-yellow-300",
  buttonBgColor = "bg-red-500 hover:bg-red-600",
  buttonTextColor = "text-white",
  imageAlt = "8xbet logo",
}) => {
  return (
    <div
      className={`w-full ${bgColor} ${textColor} p-3 my-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center justify-between`}
    >
      <div className="flex items-center mb-2 sm:mb-0">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="h-10 object-contain mr-3"
        />
        <span className="font-bold text-lg text-center sm:text-left">
          {text}
        </span>
      </div>
      {buttonText && (
        <a
          href={adLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`${buttonBgColor} ${buttonTextColor} font-semibold py-2 px-5 rounded text-sm shadow transition-colors whitespace-nowrap`}
        >
          {buttonText}
        </a>
      )}
    </div>
  );
};

export default HorizontalAdBanner;
