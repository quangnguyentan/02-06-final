import { CategorizedReplayGroup } from "@/types/replay.types";
import ReplayCard from "./ReplayCard";
import * as React from "react";

interface CategoryReplaySectionProps {
  group: CategorizedReplayGroup;
}

const CategoryReplaySection: React.FC<CategoryReplaySectionProps> = ({
  group,
}) => {
  if (group?.replays?.length === 0) {
    return null;
  }

  return (
    <section className="py-4">
      {/* Header section commented out but preserved for potential reuse */}
      {/* <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-white flex items-center">
          {group.icon && <span className="mr-2">{group.icon}</span>}
          {group.title}
        </h2>
        {group.viewAllUrl && (
          <a
            href={group.viewAllUrl}
            className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center"
          >
            Xem tất cả <ChevronRightIcon className="w-4 h-4 ml-1" />
          </a>
        )}
      </div> */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-4 gap-4">
        {group?.replays?.map((replay) => (
          <ReplayCard
            key={replay?._id} // Use optional chaining to handle potential undefined _id
            replay={replay}
            variant="default"
          />
        ))}
      </div>
    </section>
  );
};

export default CategoryReplaySection;
