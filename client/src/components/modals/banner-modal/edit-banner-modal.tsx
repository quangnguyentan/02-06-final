import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useState, useEffect, useCallback } from "react";
import { apiUpdateBanner } from "@/services/banner.services";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";
import { useDropzone } from "react-dropzone";
import { XCircle } from "lucide-react";
import Select from "react-select";
import { FixedSizeList as List } from "react-window";
import debounce from "lodash.debounce";

registerLocale("vi", vi);
setDefaultLocale("vi");

// Custom Option component for react-select with virtualization
const MenuList = ({ options, children, maxHeight, getValue }: any) => {
  const [value] = getValue();
  const height = 35;
  const initialOffset = options.indexOf(value) * height;

  return (
    <List
      height={maxHeight}
      itemCount={children.length}
      itemSize={height}
      initialScrollOffset={initialOffset}
      width="100%"
    >
      {({ index, style }) => <div style={style}>{children[index]}</div>}
    </List>
  );
};

// Custom styles for react-select to match Tailwind CSS
const customStyles = {
  control: (provided: any) => ({
    ...provided,
    border: "1px solid #e5e7eb",
    borderRadius: "0.375rem",
    padding: "0.5rem",
    backgroundColor: "#fff",
    "&:hover": {
      borderColor: "#d1d5db",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    borderRadius: "0.375rem",
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    zIndex: 50,
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#3b82f6"
      : state.isFocused
      ? "#f3f4f6"
      : "#fff",
    color: state.isSelected ? "#fff" : "#000",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#6b7280",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#000",
  }),
  input: (provided: any) => ({
    ...provided,
    color: "#000",
  }),
};

// Banner Schema
const bannerSchema = z.object({
  image: z
    .instanceof(File)
    .refine((file) => file && /image\/(jpg|jpeg|png|gif)/.test(file.type), {
      message: "Vui lòng chọn file ảnh hợp lệ (.jpg, .jpeg, .png, .gif)",
    })
    .optional(),
  imageUrl: z
    .string()
    .url({ message: "Vui lòng nhập URL hợp lệ" })
    .optional()
    .or(z.literal("")),
  link: z
    .string()
    .url({ message: "Vui lòng nhập URL hợp lệ" })
    .optional()
    .or(z.literal("")),
  position: z.enum(
    [
      "TOP",
      "BOTTOM",
      "SIDEBAR_LEFT",
      "SIDEBAR_RIGHT",
      "FOOTER",
      "POPUP",
      "INLINE",
    ],
    { message: "Vị trí là bắt buộc" }
  ),
  displayPage: z.enum(
    [
      "ALL_PAGE",
      "HOME_PAGE",
      "SHEDULE_PAGE",
      "RESULT_PAGE",
      "REPLAY_PAGE",
      "LIVE_PAGE",
      "REPLAY_VIDEO_PAGE",
    ],
    { message: "Trang hiển thị là bắt buộc" }
  ),
  priority: z.coerce
    .number()
    .min(1, { message: "Độ ưu tiên phải là số không âm" })
    .optional(),
  isActive: z.boolean().optional(),
  startDate: z.date({ required_error: "Ngày bắt đầu là bắt buộc" }),
  endDate: z.date({ required_error: "Ngày kết thúc là bắt buộc" }),
});

// Position and Display Page Options
const positionOptions = [
  { value: "TOP", label: "Đầu trang" },
  { value: "BOTTOM", label: "Cuối trang" },
  { value: "SIDEBAR_LEFT", label: "Thanh bên trái" },
  { value: "SIDEBAR_RIGHT", label: "Thanh bên phải" },
  { value: "FOOTER", label: "Chân trang" },
  { value: "POPUP", label: "Cửa sổ bật lên" },
  { value: "INLINE", label: "Trong dòng" },
];

const displayPageOptions = [
  { value: "ALL_PAGE", label: "Hiển thị mọi trang" },
  { value: "HOME_PAGE", label: "Trang chủ" },
  { value: "SHEDULE_PAGE", label: "Trang lịch thi đấu" },
  { value: "RESULT_PAGE", label: "Trang kết quả" },
  { value: "REPLAY_PAGE", label: "Trang xem lại" },
  { value: "LIVE_PAGE", label: "Trang trực tiếp" },
  { value: "REPLAY_VIDEO_PAGE", label: "Trang video xem lại" },
];

// Edit Banner Modal
export const EditBannerModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { banner: bannerToEdit } = data || {};
  const isModalOpen = isOpen && type === "editBanner";
  const { setSelectedPage, setBanner, banner } = useSelectedPageContext();
  const [positionSearch, setPositionSearch] = useState("");
  const [displayPageSearch, setDisplayPageSearch] = useState("");
  const debouncedSetPositionSearch = useCallback(
    debounce((value: string) => setPositionSearch(value), 300),
    []
  );
  const debouncedSetDisplayPageSearch = useCallback(
    debounce((value: string) => setDisplayPageSearch(value), 300),
    []
  );

  const form = useForm<z.infer<typeof bannerSchema>>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      image: undefined,
      imageUrl: "",
      link: "",
      position: "TOP",
      displayPage: "ALL_PAGE",
      priority: 1,
      isActive: false,
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  const isLoading = form.formState.isSubmitting;

  const filteredPositionOptions = positionOptions.filter((option) =>
    option.label.toLowerCase().includes(positionSearch.toLowerCase())
  );

  const filteredDisplayPageOptions = displayPageOptions.filter((option) =>
    option.label.toLowerCase().includes(displayPageSearch.toLowerCase())
  );

  useEffect(() => {
    if (isModalOpen && bannerToEdit) {
      form.reset({
        image: undefined,
        imageUrl: bannerToEdit.imageUrl || "",
        link: bannerToEdit.link || "",
        position: bannerToEdit.position || "TOP",
        displayPage: bannerToEdit.displayPage || "ALL_PAGE",
        priority: bannerToEdit.priority ?? 0,
        isActive: bannerToEdit.isActive || false,
        startDate: bannerToEdit.startDate
          ? new Date(bannerToEdit.startDate)
          : new Date(),
        endDate: bannerToEdit.endDate
          ? new Date(bannerToEdit.endDate)
          : new Date(),
      });
    }
  }, [isModalOpen, bannerToEdit, form]);

  const onDropImage = useCallback(
    (acceptedFiles: File[], fileRejections: any[], event: any) => {
      if (acceptedFiles[0]) {
        form.setValue("image", acceptedFiles[0], { shouldValidate: true });
        form.setValue("imageUrl", "", { shouldValidate: true });
      } else {
        const dataTransfer = event.dataTransfer;
        if (dataTransfer.types.includes("text/uri-list")) {
          const url = dataTransfer.getData("text/uri-list");
          if (url && z.string().url().safeParse(url).success) {
            form.setValue("imageUrl", url, { shouldValidate: true });
            form.setValue("image", undefined, { shouldValidate: true });
          } else {
            toast.error("URL ảnh không hợp lệ");
          }
        }
      }
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropImage,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const error =
        fileRejections[0]?.errors[0]?.message ||
        "File ảnh không hợp lệ. Chỉ chấp nhận .jpg, .jpeg, .png, .gif.";
      toast.error(error);
    },
  });

  const onSubmit = async (values: z.infer<typeof bannerSchema>) => {
    try {
      if (!bannerToEdit?._id) {
        toast.error("Không tìm thấy ID banner để cập nhật");
        return;
      }

      const formData = new FormData();
      if (values.image instanceof File) {
        formData.append("imageUrl", values.image);
      } else if (values.imageUrl) {
        formData.append("imageUrl", values.imageUrl);
      }
      formData.append("link", values.link || "");
      formData.append("position", values.position);
      formData.append("displayPage", values.displayPage);
      formData.append("priority", values.priority?.toString() || "1");
      formData.append("isActive", values.isActive ? "true" : "false");
      formData.append("startDate", values.startDate.toISOString());
      formData.append("endDate", values.endDate.toISOString());

      const res = await apiUpdateBanner(bannerToEdit._id, formData);
      if (res?.data) {
        toast.success(`Đã cập nhật banner thành công`);
        onClose();
        const updatedList = banner?.map((item) =>
          item._id === res.data._id ? res.data : item
        );
        setBanner(updatedList);
        setSelectedPage("Banner quảng cáo");
        form.reset();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật banner";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleClose = () => {
    form.reset();
    setPositionSearch("");
    setDisplayPageSearch("");
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-y-auto max-h-[90vh] md:max-w-[60%] max-w-[90%]">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Chỉnh sửa Banner
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 px-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ảnh Banner (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <div>
                        {form.getValues("imageUrl") ? (
                          <div className="relative w-24 h-24 mb-2">
                            <img
                              src={form.getValues("imageUrl")}
                              alt="Banner"
                              className="object-cover w-full h-full rounded"
                              onError={() =>
                                toast.error("Không thể tải hình ảnh từ URL")
                              }
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue("imageUrl", "", {
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
                              alt="Banner Preview"
                              className="object-cover w-full h-full rounded"
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue("image", undefined, {
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
                              Kéo và thả file ảnh (.jpg, .jpeg, .png, .gif) hoặc
                              URL tại đây, hoặc nhấp để chọn file
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
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL ảnh Banner (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập URL ảnh (ví dụ: https://example.com/image.png)"
                        type="url"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value) {
                            form.setValue("image", undefined, {
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
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL chuyển hướng (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập URL chuyển hướng (ví dụ: https://example.com)"
                        type="url"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="displayPage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trang hiển thị</FormLabel>
                    <FormControl>
                      <Select
                        options={filteredDisplayPageOptions}
                        value={filteredDisplayPageOptions.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) =>
                          field.onChange(option?.value || "HOME_PAGE")
                        }
                        onInputChange={debouncedSetDisplayPageSearch}
                        placeholder="Chọn trang hiển thị"
                        isDisabled={isLoading}
                        isClearable
                        isSearchable
                        noOptionsMessage={() => "Không tìm thấy trang hiển thị"}
                        components={{ MenuList }}
                        styles={customStyles}
                        aria-label="Trang hiển thị"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vị trí</FormLabel>
                    <FormControl>
                      <Select
                        options={
                          form.getValues("displayPage") === "ALL_PAGE"
                            ? filteredPositionOptions.filter((option) =>
                                [
                                  "TOP",
                                  "BOTTOM",
                                  "SIDEBAR_LEFT",
                                  "SIDEBAR_RIGHT",
                                  "POPUP",
                                ].includes(option.value)
                              )
                            : filteredPositionOptions
                        }
                        value={filteredPositionOptions.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) =>
                          field.onChange(option?.value || "TOP")
                        }
                        onInputChange={debouncedSetPositionSearch}
                        placeholder="Chọn vị trí"
                        isDisabled={isLoading}
                        isClearable
                        isSearchable
                        noOptionsMessage={() => "Không tìm thấy vị trí"}
                        components={{ MenuList }}
                        styles={customStyles}
                        aria-label="Vị trí"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Độ ưu tiên (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        type="number"
                        min={0}
                        placeholder="Nhập độ ưu tiên"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel>Kích hoạt</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày bắt đầu</FormLabel>
                    <FormControl>
                      <Controller
                        name="startDate"
                        control={form.control}
                        render={({ field: dateField }) => (
                          <DatePicker
                            selected={dateField.value}
                            onChange={(date: Date | null) =>
                              dateField.onChange(date || new Date())
                            }
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="dd/MM/yyyy HH:mm"
                            locale="vi"
                            disabled={isLoading}
                            placeholderText="Nhập ngày và giờ"
                            className="w-full p-2 border rounded placeholder:text-gray-500"
                            minDate={new Date()}
                          />
                        )}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày kết thúc</FormLabel>
                    <FormControl>
                      <Controller
                        name="endDate"
                        control={form.control}
                        render={({ field: dateField }) => (
                          <DatePicker
                            selected={dateField.value}
                            onChange={(date: Date | null) =>
                              dateField.onChange(date || new Date())
                            }
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="dd/MM/yyyy HH:mm"
                            locale="vi"
                            disabled={isLoading}
                            placeholderText="Nhập ngày và giờ"
                            className="w-full p-2 border rounded placeholder:text-gray-500"
                            minDate={form.getValues("startDate") || new Date()}
                          />
                        )}
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
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditBannerModal;
