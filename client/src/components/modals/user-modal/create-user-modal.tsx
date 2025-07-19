import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-model-store";
import toast from "react-hot-toast";
import { useSelectedPageContext } from "@/hooks/use-context";
import { RoleType } from "@/types/user.types";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { apiRegister } from "@/services/auth.services";

const formSchema = z.object({
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  username: z.string().min(1, { message: "Username is required" }),
  role: z.enum(["USER", "ADMIN", "COMMENTATOR"], {
    message: "Role is required",
  }),
  phone: z
    .string()
    .min(10, { message: "Password must be at least 6 characters" }),

  avatar: z
    .instanceof(File)
    .refine((file) => file && /image\/(jpg|jpeg|png)/.test(file.type), {
      message: "Vui lòng chọn file ảnh hợp lệ (.jpg, .jpeg, .png)",
    })
    .optional(),
  typeLogin: z.enum(["phone"], {
    message: "Login type is required",
  }),
});

export const CreateUserModal = () => {
  const { isOpen, onClose, type } = useModal();
  const isModalOpen = isOpen && type === "createUser";
  const { setSelectedPage, addUser } = useSelectedPageContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      username: "",
      role: "USER",
      phone: "",
      avatar: undefined,
      typeLogin: "phone",
    },
  });

  const isLoading = form.formState.isSubmitting;
  const onDropLogo = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        form.setValue("avatar", acceptedFiles[0], { shouldValidate: true });
      }
    },
    [form]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropLogo,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit to match multer
    onDropRejected: (fileRejections) => {
      const error =
        fileRejections[0]?.errors[0]?.message || "File ảnh không hợp lệ";
      toast.error(error);
    },
  });
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const formData = new FormData();
      formData.append("typeLogin", "phone");
      formData.append("username", values.username);
      formData.append("password", values.password);
      formData.append("role", values.role);
      formData.append("phone", values.phone as string);
      if (values.avatar) {
        formData.append("avatar", values.avatar);
      }
      const res = await apiRegister(formData);
      if (res?.data) {
        toast.success(`Đã tạo người dùng ${values.username} thành công`);
        onClose();
        addUser(res.data?.newUser);
        setSelectedPage("Người dùng");
        form.reset();
      }
      form.reset();
    } catch (error: any) {
      console.error(error);
      if (error.status === 409) {
        toast.error(
          error.data?.msg || "Người dùng đã tồn tại. Vui lòng thử lại!"
        );
      } else {
        toast.error("Lỗi khi tạo người dùng");
      }
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-y-auto max-h-[90vh] md:max-w-[60%] max-w-[90%]">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Thêm Người Dùng
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 px-6">
              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-100 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 no-arrows"
                        placeholder="Nhập số điện thoại"
                        {...field}
                        type="number"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-100 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Nhập mật khẩu"
                        {...field}
                        type="password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Username */}
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-100 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Nhập họ và tên"
                        {...field}
                        type="text"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="typeLogin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loại đăng nhập</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-100 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0">
                          <SelectValue placeholder="Chọn loại đăng nhập" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-black h-[80px]">
                        {["phone"].map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "phone" ? "Số điện thoại" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Role */}
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vai trò</FormLabel>
                    <Select
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-100 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0">
                          <SelectValue placeholder="Chọn vai trò" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-black h-[120px]">
                        {Object.values(RoleType).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "USER"
                              ? "Người dùng"
                              : type === "ADMIN"
                              ? "Quản trị viên"
                              : "Bình luận viên"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Avatar */}
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer ${
                          isDragActive ? "border-blue-500" : "border-gray-300"
                        }`}
                      >
                        <input {...getInputProps()} />
                        {field.value ? (
                          <p className="text-blue-600">{field.value.name}</p>
                        ) : (
                          <p className="!text-sm">
                            Kéo và thả file ảnh tại đây (.jpg, .jpeg, .png)
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="bg-gray-100 px-6 py-4">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  handleClose();
                }}
                className="text-black rounded-[4px] bg-gray-200 hover:bg-gray-300"
              >
                Đóng
              </Button>
              <Button
                disabled={isLoading}
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-[4px]"
              >
                Tạo
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
