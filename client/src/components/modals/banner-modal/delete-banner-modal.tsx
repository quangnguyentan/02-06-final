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
import { apiDeleteBannerById } from "@/services/banner.services";
import { Banner } from "@/types/banner.types";

// Delete Banner Modal
export const DeleteBannerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "deleteBanner";
  const { banner: bannerDelete } = data || {};
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedPage, setBanner, banner } = useSelectedPageContext();

  const onSubmit = async () => {
    if (!bannerDelete?._id) return;
    setIsLoading(true);
    try {
      const res = await apiDeleteBannerById(bannerDelete?._id);
      if (res?.data) {
        toast.success(`Đã xóa banner ${bannerDelete?.position} thành công`);
        const updatedList = banner?.filter(
          (item: Banner) => item._id !== bannerDelete._id
        );
        setBanner(updatedList);
        onClose();
        setSelectedPage("Banner quảng cáo");
      }
    } catch (err) {
      console.error("Failed to delete banner:", err);
      toast.error("Lỗi khi xóa banner");
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
            Xóa Banner
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 flex items-center justify-center gap-2 mb-4">
          <CircleAlert color="red" size={25} />
          <span className="font-medium">
            Bạn có chắc chắn muốn xóa banner này không?
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
