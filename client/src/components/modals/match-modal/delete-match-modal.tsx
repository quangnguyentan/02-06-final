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
import { apiDeleteMatchById } from "@/services/match.services";

export const DeleteMatchModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "deleteMatch";
  const { match: matchDelete } = data;
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedPage, setMatch, match } = useSelectedPageContext();
  const onSubmit = async () => {
    if (!matchDelete?._id) return;
    setIsLoading(true);
    try {
      const res = await apiDeleteMatchById(matchDelete._id);
      if (res?.data) {
        toast.success(`Đã xóa ${matchDelete.title} thành công`);
        const updatedList = match.filter(
          (item) => item._id !== matchDelete._id
        );
        setMatch(updatedList); // ✅ cập nhật danh sách sau khi xóa
        onClose();
        setSelectedPage("Trận đấu");
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
      <DialogContent className="bg-white text-black p-0 overflow-hidden">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Xóa trận đấu
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 flex items-center justify-center gap-2 mb-4">
          <CircleAlert color="red" size={25} />
          <span className="font-medium">
            Bạn có chắc chắn muốn xóa trận đấu này không?
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
