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
import { apiDeleteUserById } from "@/services/user.services";
import { useSelectedPageContext } from "@/hooks/use-context";
import toast from "react-hot-toast";

export const DeleteUserModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "deleteUser";
  const { user: userDelete } = data;
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedPage, setUser, user } = useSelectedPageContext();
  const onSubmit = async () => {
    if (!userDelete?._id) return;
    setIsLoading(true);
    try {
      const res = await apiDeleteUserById(userDelete._id);
      if (res) {
        toast.success(`Đã xóa ${userDelete.username} thành công`);
        const updatedList = user.filter((item) => item._id !== userDelete._id);
        setUser(updatedList);
        onClose();
        setSelectedPage("Người dùng");
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
            Xóa người dùng
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 flex items-center justify-center gap-2 mb-4">
          <CircleAlert color="red" size={25} />
          <span className="font-medium">
            Bạn có chắc chắn muốn xóa người dùng này không?
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
