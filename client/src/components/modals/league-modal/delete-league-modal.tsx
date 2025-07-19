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
import { apiDeleteLeagueById } from "@/services/league.services";

export const DeleteLeagueModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { league: leagueDelete } = data;
  const isModalOpen = isOpen && type === "deleteLeague";
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedPage, setLeague, league } = useSelectedPageContext();
  const onSubmit = async () => {
    if (!leagueDelete?._id) return;
    setIsLoading(true);
    try {
      const res = await apiDeleteLeagueById(leagueDelete._id);
      if (res?.data) {
        toast.success(`Đã xóa ${leagueDelete.name} thành công`);
        const updatedList = league.filter(
          (item) => item._id !== leagueDelete._id
        );
        setLeague(updatedList);
        onClose();
        setSelectedPage("Giải đấu");
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
            Xóa giải đấu
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 flex items-center justify-center gap-2 mb-4">
          <CircleAlert color="red" size={25} />
          <span className="font-medium">
            Bạn có chắc chắn muốn xóa giải đấu này không?
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
