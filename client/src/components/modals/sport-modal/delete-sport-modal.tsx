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
import { apiDeleteSportById } from "@/services/sport.services";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSelectedPageContext } from "@/hooks/use-context";

export const DeleteSportModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { sport } = data;
  const isModalOpen = isOpen && type === "deleteSport";
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedPage, setSports, sports } = useSelectedPageContext();
  const onSubmit = async () => {
    if (!sport?._id) return;
    setIsLoading(true);
    try {
      const res = await apiDeleteSportById(sport._id);
      if (res?.data) {
        toast.success(`Đã xóa ${sport.name} thành công`);
        const updatedList = sports.filter((item) => item._id !== sport._id);
        setSports(updatedList); // ✅ cập nhật danh sách sau khi xóa
        onClose();
        setSelectedPage("Môn thể thao");
      }
    } catch (err) {
      console.error("Failed to delete course:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-hidden sm:w-auto w-[90%]">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Xóa môn thể thao
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 flex items-center justify-center gap-2 mb-4">
          <CircleAlert color="red" size={25} />
          <span className="font-medium">
            Bạn có chắc chắn muốn xóa môn thể thao này không?
          </span>
        </div>

        <DialogFooter className="bg-gray-100 px-6 py-4">
          <Button
            onClick={(e) => {
              e.preventDefault();
              handleClose();
            }}
            className="text-black rounded-[4px]"
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
