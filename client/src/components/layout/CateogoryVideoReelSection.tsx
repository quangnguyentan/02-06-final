import * as React from "react";
import { CategorizedVideoReelGroup } from "@/types/videoReel.type";
import VideoReelCard from "./VideoReelCard";
import { VideoReels } from "@/types/videoReel.type";

interface CategoryVideoReelSectionProps {
  group: CategorizedVideoReelGroup;
}

const CategoryVideoReelSection: React.FC<CategoryVideoReelSectionProps> = ({
  group,
}) => {
  if (group?.replays?.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      <div className="lg:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 l  g:grid-cols-6 3xl:grid-cols-6 gap-4 hidden">
        {group?.replays?.map((reel: VideoReels) => (
          <VideoReelCard key={reel?._id} reel={reel} />
        ))}
      </div>
    </section>
  );
};

export default CategoryVideoReelSection;
