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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-model-store";
import toast from "react-hot-toast";
import { useSelectedPageContext } from "@/hooks/use-context";
import { useCallback, useEffect } from "react";
import { apiUpdateSport } from "@/services/sport.services";
import { useDropzone, FileRejection, DropEvent } from "react-dropzone";
import { XCircle } from "lucide-react";

// Hàm tạo slug từ name
const createSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Schema cho form
const formSchema = z
  .object({
    name: z.string().min(1, { message: "Tên môn thể thao là bắt buộc" }),
    icon: z
      .instanceof(File)
      .refine((file) => file && /image\/(jpe?g|png)/i.test(file.type), {
        message: "Vui lòng chọn file ảnh hợp lệ (.jpg, .jpeg, .png)",
      })
      .optional(),
    iconUrl: z
      .string()
      .url({ message: "Vui lòng nhập URL ảnh hợp lệ" })
      .optional()
      .or(z.literal("")),
    order: z.coerce.number().min(1, { message: "Thứ tự phải là số không âm" }),
  })
  .refine((data) => data.icon || data.iconUrl || !data.iconUrl, {
    message: "Phải cung cấp file ảnh hoặc URL ảnh nếu không xóa icon",
    path: ["iconUrl"],
  });

export const EditSportModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "editSport";
  const { setSelectedPage, setSports, sports } = useSelectedPageContext();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      icon: undefined,
      iconUrl: "",
      order: 1,
    },
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (data?.sport && isModalOpen) {
      form.reset({
        name: data.sport.name || "",
        icon: undefined,
        iconUrl: data.sport.icon || "",
        order: data.sport.order || 1,
      });
    } else if (!isModalOpen) {
      form.reset();
    }
  }, [isModalOpen, data?.sport, form]);

  const onDropIcon = useCallback(
    (
      acceptedFiles: File[],
      fileRejections: FileRejection[],
      event: DropEvent
    ) => {
      if (acceptedFiles[0]) {
        form.setValue("icon", acceptedFiles[0], { shouldValidate: true });
        form.setValue("iconUrl", "", { shouldValidate: true });
      } else {
        if ("dataTransfer" in event && event.dataTransfer) {
          const url = event.dataTransfer.getData("text/uri-list");
          if (url && z.string().url().safeParse(url).success) {
            form.setValue("iconUrl", url, { shouldValidate: true });
            form.setValue("icon", undefined, { shouldValidate: true });
          } else {
            toast.error("URL ảnh không hợp lệ");
          }
        } else if (fileRejections.length > 0) {
          toast.error(
            `File ảnh không hợp lệ: ${fileRejections[0].errors[0].message}`
          );
        }
      }
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropIcon,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    onDropRejected: (fileRejections) => {
      const error =
        fileRejections[0]?.errors[0]?.message || "File ảnh không hợp lệ";
      toast.error(error);
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!data?.sport?._id) {
        toast.error("Không tìm thấy ID môn thể thao để cập nhật");
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("slug", createSlug(values.name));
      formData.append("order", values.order.toString());
      if (values.icon instanceof File) {
        formData.append("icon", values.icon);
      } else if (values.iconUrl) {
        formData.append("icon", values.iconUrl);
      } else if (!values.iconUrl && data.sport.icon) {
        formData.append("removeIcon", "true");
      }

      const res = await apiUpdateSport(data.sport._id, formData);
      if (res?.data) {
        const updatedList = sports?.map((item) =>
          item._id === res.data._id ? res.data : item
        );
        setSports(updatedList);
        toast.success(`Đã cập nhật ${values.name} thành công`);
        onClose();
        setSelectedPage("Môn thể thao");
        form.reset();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật môn thể thao";
      toast.error(errorMessage);
      console.error(error);
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
            Chỉnh Sửa Môn Thể Thao
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 px-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên Môn Thể Thao</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-100 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Nhập tên môn thể thao (ví dụ: Bóng Đá)"
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
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <FormControl>
                      <div>
                        {form.getValues("iconUrl") ? (
                          <div className="relative w-24 h-24 mb-2">
                            <img
                              src={form.getValues("iconUrl")}
                              alt="Icon Preview"
                              className="object-cover w-full h-full rounded"
                              onError={() =>
                                toast.error("Không thể tải hình ảnh từ URL")
                              }
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue("iconUrl", "", {
                                  shouldValidate: true,
                                })
                              }
                              className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : field.value instanceof File ? (
                          <div className="relative w-24 h-24 mb-2">
                            <img
                              src={URL.createObjectURL(field.value)}
                              alt="Icon Preview"
                              className="object-cover w-full h-full rounded"
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue("icon", undefined, {
                                  shouldValidate: true,
                                })
                              }
                              className="absolute top-0 right-0 bg-red-500 hover:bg-red-600 text-white rounded-full p-1"
                              size="sm"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            {...getRootProps()}
                            className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer ${
                              isDragActive
                                ? "border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            <input {...getInputProps()} />
                            <p className="!text-sm">
                              Kéo và thả file ảnh (.jpg, .jpeg, .png) hoặc URL
                              tại đây
                            </p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="iconUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Icon</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-100 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Nhập URL icon (ví dụ: https://example.com/icon.png)"
                        {...field}
                        type="url"
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value) {
                            form.setValue("icon", undefined, {
                              shouldValidate: true,
                            });
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ Tự</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        className="bg-zinc-100 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                        placeholder="Nhập thứ tự"
                        {...field}
                        type="number"
                        min={1}
                        value={field.value ?? 1}
                      />
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
                type="button"
                disabled={isLoading}
              >
                Đóng
              </Button>
              <Button
                disabled={isLoading}
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700 rounded-[4px]"
              >
                Cập Nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSportModal;
