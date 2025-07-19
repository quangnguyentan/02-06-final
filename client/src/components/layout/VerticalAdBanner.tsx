import { useData } from "@/context/DataContext";
import * as React from "react";

interface VerticalAdBannerProps {
  position: "left" | "right";
  imageUrl?: string;
  altText?: string;
  adLink?: string;
}

const VerticalAdBanner: React.FC<VerticalAdBannerProps> = ({
  position,
  imageUrl,
  altText = "Advertisement",
  adLink = "#",
}) => {
  const defaultImageUrl = "";
  const { bannerData } = useData();
  const activeBanners = React.useMemo(() => {
    return bannerData?.filter((b) => b.isActive !== false) || [];
  }, [bannerData]);
  return (
    activeBanners?.length > 0 && (
      <div
        className={`hidden 3xl:block 2xl:hidden fixed top-4 -translate-y-0 z-50 w-36
      ${
        position === "left"
          ? "left-4 xl:left-8 2xl:left-[4%]"
          : "right-4 xl:right-8 2xl:right-[4%]"
      }
    `}
      >
        <div
          onClick={() => window.open(adLink, "_blank")}
          rel="noopener noreferrer"
          className="block shadow-lg rounded-lg overflow-hidden"
        >
          <img
            src={imageUrl || defaultImageUrl}
            alt={altText}
            className="w-full h-auto object-contain"
            onError={(e) => (e.currentTarget.src = defaultImageUrl)}
          />
        </div>
      </div>
    )
  );
};

export default VerticalAdBanner;
