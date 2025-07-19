import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-model-store";
import { CircleAlert } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSelectedPageContext } from "@/hooks/use-context";
import { apiDeleteVideoReelById } from "@/services/videoReel.services";

// Delete VideoReel Modal
export const DeleteVideoReelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "deleteVideoReel";
  const { videoReel: videoReelDelete } = data || {};
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedPage, setVideoReel, videoReel } = useSelectedPageContext();

  const onSubmit = async () => {
    if (!videoReelDelete?._id) return;
    setIsLoading(true);
    try {
      const res = await apiDeleteVideoReelById(videoReelDelete?._id);
      if (res?.data) {
        toast.success(`Đã xóa video reel ${videoReelDelete.title} thành công`);
        const updatedList = videoReel?.filter(
          (item) => item._id !== videoReelDelete._id
        );
        setVideoReel(updatedList);
        onClose();
        setSelectedPage("Thước phim ngắn");
      }
    } catch (err) {
      console.error("Failed to delete video reel:", err);
      toast.error("Lỗi khi xóa video reel");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Xóa Video Reel
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 flex items-center justify-center gap-2 mb-4">
          <CircleAlert color="red" size={25} />
          <span className="font-medium">
            Bạn có chắc chắn muốn xóa video reel này không?
          </span>
        </div>
        <DialogFooter className="bg-gray-100 px-6 py-4">
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleClose();
            }}
            className="text-black rounded-[4px] bg-gray-200 hover:bg-gray-300"
            type="button"
            disabled={isLoading}
          >
            Không, hủy bỏ
          </Button>
          <Button
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-red-500 hover:bg-red-700 text-white rounded-[4px]"
          >
            Có, tôi chắc chắn
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
