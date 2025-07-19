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
import { useState, useEffect, useCallback, useMemo } from "react";
import { apiUpdateVideoReel } from "@/services/videoReel.services";
import { apiGetAllSports } from "@/services/sport.services";
import { apiGetAllUser } from "@/services/user.services";
import { Sport } from "@/types/sport.types";
import { User } from "@/types/user.types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";
import { DropEvent, FileRejection, useDropzone } from "react-dropzone";
import { XCircle } from "lucide-react";
import Select from "react-select";
import { FixedSizeList as List } from "react-window";
import debounce from "lodash.debounce";
import { createSlug } from "@/lib/helper";

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

// Video Reel Schema
const videoReelSchema = z.object({
  title: z.string().min(1, { message: "Tiêu đề là bắt buộc" }),
  description: z.string().optional(),
  video: z
    .instanceof(File)
    .refine((file) => file && /video\/(mp4|mov|avi)/i.test(file.type), {
      message: "Vui lòng chọn file video hợp lệ (.mp4, .mov, .avi)",
    })
    .optional(),
  videoUrl: z
    .string()
    .url({ message: "Vui lòng nhập URL video hợp lệ" })
    .optional()
    .or(z.literal("")),
  thumbnail: z
    .instanceof(File)
    .refine((file) => file && /image\/(jpg|jpeg|png)/.test(file.type), {
      message: "Vui lòng chọn file ảnh hợp lệ (.jpg, .jpeg, .png)",
    })
    .optional(),
  thumbnailUrl: z
    .string()
    .url({ message: "Vui lòng nhập URL ảnh hợp lệ" })
    .optional()
    .or(z.literal("")),
  sport: z.string().min(1, { message: "Môn thể thao là bắt buộc" }),
  views: z.coerce
    .number()
    .min(0, { message: "Lượt xem phải là số không âm" })
    .optional(),
  duration: z.coerce
    .number()
    .min(0, { message: "Thời lượng phải là số không âm" })
    .optional(),
  publishDate: z.date({ required_error: "Ngày xuất bản là bắt buộc" }),
  isFeatured: z.boolean().optional(),
  order: z.coerce.number().min(1, { message: "Thứ tự phải là số không âm" }),
});
// Edit Video Reel Modal
export const EditVideoReelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { videoReel: videoReelToEdit } = data || {};
  const isModalOpen = isOpen && type === "editVideoReel";
  const { setSelectedPage, setVideoReel, videoReel } = useSelectedPageContext();
  const [sports, setSports] = useState<Sport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sportSearch, setSportSearch] = useState("");
  const [commentatorSearch, setCommentatorSearch] = useState("");
  const debouncedSetSportSearch = useCallback(
    debounce((value: string) => setSportSearch(value), 300),
    []
  );
  const debouncedSetCommentatorSearch = useCallback(
    debounce((value: string) => setCommentatorSearch(value), 300),
    []
  );

  const form = useForm<z.infer<typeof videoReelSchema>>({
    resolver: zodResolver(videoReelSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      thumbnail: undefined,
      thumbnailUrl: "",
      sport: "",
      views: 0,
      duration: 0,
      publishDate: new Date(),
      isFeatured: false,
      order: 1,
    },
  });

  const isLoading = form.formState.isSubmitting;

  const sportOptions = useMemo(
    () =>
      sports.map((sport) => ({
        value: sport._id ?? "",
        label: sport.name ?? "",
      })),
    [sports]
  );

  const filteredSportOptions = useMemo(
    () =>
      sportOptions.filter((option) =>
        option.label.toLowerCase().includes(sportSearch.toLowerCase())
      ),
    [sportOptions, sportSearch]
  );

  const commentatorOptions = useMemo(
    () =>
      users.map((user) => ({
        value: user._id ?? "",
        label: user.username ?? "",
      })),
    [users]
  );

  const filteredCommentatorOptions = useMemo(
    () =>
      commentatorOptions.filter((option) =>
        option.label.toLowerCase().includes(commentatorSearch.toLowerCase())
      ),
    [commentatorOptions, commentatorSearch]
  );

  useEffect(() => {
    if (!isModalOpen) return;

    const fetchData = async () => {
      try {
        const [sportsRes, usersRes] = await Promise.all([
          apiGetAllSports(),
          apiGetAllUser(),
        ]);
        setSports(sportsRes.data || []);
        setUsers(
          usersRes.data?.rs?.filter(
            (user: User) => user?.role === "COMMENTATOR"
          ) || []
        );
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu");
        console.error(error);
      }
    };

    fetchData();
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen && videoReelToEdit) {
      form.reset({
        title: videoReelToEdit.title || "",
        description: videoReelToEdit.description || "",
        video: undefined,
        videoUrl: videoReelToEdit.videoUrl || "",
        thumbnail: undefined,
        thumbnailUrl: videoReelToEdit.thumbnail || "",
        sport: videoReelToEdit?.sport?._id || "",

        views: videoReelToEdit.views || 0,
        duration: videoReelToEdit.duration || 0,
        publishDate: videoReelToEdit.publishDate
          ? new Date(videoReelToEdit.publishDate)
          : new Date(),
        isFeatured: videoReelToEdit.isFeatured || false,
        order: videoReelToEdit.order || 1,
      });
    }
  }, [isModalOpen, videoReelToEdit, form]);
  const onDropVideo = useCallback(
    (
      acceptedFiles: File[],
      fileRejections: FileRejection[],
      event: DropEvent
    ) => {
      if (acceptedFiles[0]) {
        form.setValue("video", acceptedFiles[0], { shouldValidate: true });
        form.setValue("videoUrl", "", { shouldValidate: true });
      } else {
        if ("dataTransfer" in event && event.dataTransfer) {
          const url = event.dataTransfer.getData("text/uri-list");
          if (url && z.string().url().safeParse(url).success) {
            form.setValue("videoUrl", url, { shouldValidate: true });
            form.setValue("video", undefined, { shouldValidate: true });
          } else {
            toast.error("URL video không hợp lệ");
          }
        } else if (fileRejections.length > 0) {
          toast.error(
            `File video không hợp lệ: ${fileRejections[0].errors[0].message}`
          );
        }
      }
    },
    [form]
  );

  const {
    getRootProps: getVideoRootProps,
    getInputProps: getVideoInputProps,
    isDragActive: isVideoDragActive,
  } = useDropzone({
    onDrop: onDropVideo,
    accept: {
      "video/mp4": [".mp4"],
      "video/mov": [".mov"],
      "video/avi": [".avi"],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const error =
        fileRejections[0]?.errors[0]?.message || "File video không hợp lệ";
      toast.error(error);
    },
  });
  const onDropThumbnail = useCallback(
    (acceptedFiles: File[], fileRejections: any[], event: any) => {
      if (acceptedFiles[0]) {
        form.setValue("thumbnail", acceptedFiles[0], { shouldValidate: true });
        form.setValue("thumbnailUrl", "", { shouldValidate: true });
      } else {
        const dataTransfer = event.dataTransfer;
        if (dataTransfer.types.includes("text/uri-list")) {
          const url = dataTransfer.getData("text/uri-list");
          if (url && z.string().url().safeParse(url).success) {
            form.setValue("thumbnailUrl", url, { shouldValidate: true });
            form.setValue("thumbnail", undefined, { shouldValidate: true });
          } else {
            toast.error("URL ảnh không hợp lệ");
          }
        }
      }
    },
    [form]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropThumbnail,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const error =
        fileRejections[0]?.errors[0]?.message || "File ảnh không hợp lệ";
      toast.error(error);
    },
  });

  const onSubmit = async (values: z.infer<typeof videoReelSchema>) => {
    try {
      if (!videoReelToEdit?._id) {
        toast.error("Không tìm thấy ID video reel để cập nhật");
        return;
      }

      const sportData = sports.find((s) => s._id === values.sport);
      if (!sportData) {
        toast.error("Môn thể thao không hợp lệ");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("slug", createSlug(values.title));
      formData.append("description", values.description || "");
      if (values.video instanceof File) {
        formData.append("videoUrl", values.video);
      } else if (values.videoUrl) {
        formData.append("videoUrl", values.videoUrl);
      }
      if (values.thumbnail instanceof File) {
        formData.append("thumbnail", values.thumbnail);
      } else if (values.thumbnailUrl) {
        formData.append("thumbnail", values.thumbnailUrl);
      }
      formData.append("sport", sportData._id || "");
      formData.append("views", values.views?.toString() || "0");
      formData.append("duration", values.duration?.toString() || "0");
      formData.append("publishDate", values.publishDate.toISOString());
      formData.append("isFeatured", values.isFeatured ? "true" : "false");
      formData.append("order", values.order.toString());

      const res = await apiUpdateVideoReel(videoReelToEdit._id, formData);
      if (res?.data) {
        toast.success(`Đã cập nhật video reel ${values.title} thành công`);
        onClose();
        const updatedList = videoReel?.map((item) =>
          item._id === res.data._id ? res.data : item
        );
        setVideoReel(updatedList);
        setSelectedPage("Thước phim ngắn");
        form.reset();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật video reel";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleClose = () => {
    form.reset();
    setSportSearch("");
    setCommentatorSearch("");
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-y-auto max-h-[90vh] md:max-w-[60%] max-w-[90%]">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Chỉnh sửa Video Reel
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-4 px-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập tiêu đề"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập mô tả"
                        type="text"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="video"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Video</FormLabel>
                    <FormControl>
                      <div>
                        {form.getValues("videoUrl") ? (
                          <div className="relative mb-2">
                            <p className="text-blue-600 truncate">
                              {form.getValues("videoUrl")}
                            </p>
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue("videoUrl", "", {
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
                          <div className="relative mb-2">
                            <p className="text-blue-600">{field.value.name}</p>
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue("video", undefined, {
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
                            {...getVideoRootProps()}
                            className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer ${
                              isVideoDragActive
                                ? "border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            <input {...getVideoInputProps()} />
                            <p className="!text-sm">
                              Kéo và thả file video (.mp4, .mov, .avi) hoặc URL
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
                name="videoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Video (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập URL video (ví dụ: https://example.com/video.mp4)"
                        {...field}
                        type="url"
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value) {
                            form.setValue("video", undefined, {
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
                name="thumbnail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hình thu nhỏ (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <div>
                        {form.getValues("thumbnailUrl") ? (
                          <div className="relative w-24 h-24 mb-2">
                            <img
                              src={form.getValues("thumbnailUrl")}
                              alt="Thumbnail"
                              className="object-cover w-full h-full rounded"
                              onError={() =>
                                toast.error("Không thể tải hình ảnh từ URL")
                              }
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue("thumbnailUrl", "", {
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
                              alt="Thumbnail Preview"
                              className="object-cover w-full h-full rounded"
                            />
                            <Button
                              type="button"
                              onClick={() =>
                                form.setValue("thumbnail", undefined, {
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
                              tại đây, hoặc nhấp để chọn file
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
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL hình thu nhỏ (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập URL ảnh (ví dụ: https://example.com/image.png)"
                        type="url"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value) {
                            form.setValue("thumbnail", undefined, {
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
                name="sport"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Môn thể thao</FormLabel>
                    <FormControl>
                      <Select
                        options={filteredSportOptions}
                        value={filteredSportOptions.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        onInputChange={debouncedSetSportSearch}
                        placeholder="Chọn môn thể thao"
                        isDisabled={isLoading}
                        isClearable
                        isSearchable
                        noOptionsMessage={() => "Không tìm thấy môn thể thao"}
                        components={{ MenuList }}
                        styles={customStyles}
                        aria-label="Môn thể thao"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="views"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lượt xem (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        type="number"
                        min={0}
                        placeholder="Nhập số lượt xem"
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời lượng (giây, Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        type="number"
                        min={0}
                        placeholder="Nhập thời lượng"
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
                name="publishDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Ngày xuất bản</FormLabel>
                    <FormControl>
                      <Controller
                        name="publishDate"
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
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel>Nổi bật</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thứ tự hiển thị</FormLabel>
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
                Cập nhật
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
