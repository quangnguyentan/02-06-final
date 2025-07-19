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
import { apiUpdateReplay } from "@/services/replay.services";
import { apiGetAllMatches } from "@/services/match.services";
import { apiGetAllSports } from "@/services/sport.services";
import { Match } from "@/types/match.types";
import { Sport } from "@/types/sport.types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";
import { useDropzone, FileRejection, DropEvent } from "react-dropzone";
import { createSlug } from "@/lib/helper";
import { XCircle } from "lucide-react";
import Select from "react-select";
import { FixedSizeList as List } from "react-window";
import debounce from "lodash.debounce";

registerLocale("vi", vi);
setDefaultLocale("vi");

const formSchema = z
  .object({
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
      .refine(
        (file) => file && /image\/(jpe?g|png|gif|bmp|webp)/i.test(file.type),
        {
          message:
            "Vui lòng chọn file ảnh hợp lệ (.jpg, .jpeg, .png, .gif, .bmp, .webp)",
        }
      )
      .optional(),
    thumbnailUrl: z
      .string()
      .url({ message: "Vui lòng nhập URL ảnh hợp lệ" })
      .optional()
      .or(z.literal("")),
    match: z.string().min(1, { message: "Trận đấu là bắt buộc" }),
    sport: z.string().min(1, { message: "Môn thể thao là bắt buộc" }),
    duration: z.coerce
      .number()
      .min(0, { message: "Thời lượng phải là số không âm" })
      .optional(),
    views: z.coerce
      .number()
      .min(0, { message: "Lượt xem phải là số không âm" }),
    commentator: z.string().optional(),
    publishDate: z.date({ required_error: "Ngày phát hành là bắt buộc" }),
    isShown: z.boolean(),
  })
  .refine((data) => data.video || data.videoUrl, {
    message: "Phải cung cấp file video hoặc URL video",
    path: ["videoUrl"],
  });

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

export const EditReplayModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const isModalOpen = isOpen && type === "editReplay";
  const { setSelectedPage, replay, setReplay } = useSelectedPageContext();
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [matchSearch, setMatchSearch] = useState("");
  const [sportSearch, setSportSearch] = useState("");

  const debouncedSetMatchSearch = useCallback(
    debounce((value: string) => setMatchSearch(value), 300),
    []
  );
  const debouncedSetSportSearch = useCallback(
    debounce((value: string) => setSportSearch(value), 300),
    []
  );

  const matchOptions = useMemo(
    () =>
      matches.map((match) => ({
        value: match._id ?? "",
        label: match.title ?? "",
      })),
    [matches]
  );

  const filteredMatchOptions = useMemo(
    () =>
      matchOptions.filter((option) =>
        option.label.toLowerCase().includes(matchSearch.toLowerCase())
      ),
    [matchOptions, matchSearch]
  );

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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      video: undefined,
      videoUrl: "",
      thumbnail: undefined,
      thumbnailUrl: "",
      match: "",
      sport: "",
      duration: undefined,
      views: 0,
      commentator: "",
      publishDate: new Date(),
      isShown: false,
    },
  });

  const isLoading = form.formState.isSubmitting;

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
    (
      acceptedFiles: File[],
      fileRejections: FileRejection[],
      event: DropEvent
    ) => {
      if (acceptedFiles[0]) {
        form.setValue("thumbnail", acceptedFiles[0], { shouldValidate: true });
        form.setValue("thumbnailUrl", "", { shouldValidate: true });
      } else {
        if ("dataTransfer" in event && event.dataTransfer) {
          const url = event.dataTransfer.getData("text/uri-list");
          if (url && z.string().url().safeParse(url).success) {
            form.setValue("thumbnailUrl", url, { shouldValidate: true });
            form.setValue("thumbnail", undefined, { shouldValidate: true });
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

  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
    isDragActive: isThumbnailDragActive,
  } = useDropzone({
    onDrop: onDropThumbnail,
    accept: {
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const error =
        fileRejections[0]?.errors[0]?.message || "File ảnh không hợp lệ";
      toast.error(error);
    },
  });

  useEffect(() => {
    if (!isModalOpen) return;

    const fetchData = async () => {
      try {
        const [matchRes, sportsRes] = await Promise.all([
          apiGetAllMatches(),
          apiGetAllSports(),
        ]);
        setMatches(matchRes.data || []);
        setSports(sportsRes.data || []);
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu trận đấu hoặc môn thể thao");
        console.error(error);
      }
    };

    fetchData();
  }, [isModalOpen]);

  useEffect(() => {
    if (data?.replay && isModalOpen) {
      form.reset({
        title: data.replay.title || "",
        description: data.replay.description || "",
        video: undefined,
        videoUrl: data.replay.videoUrl || "",
        thumbnail: undefined,
        thumbnailUrl: data.replay.thumbnail || "",
        match: data.replay.match?._id || "",
        sport: data.replay.sport?._id || "",
        duration: data.replay.duration,
        views: data.replay.views || 0,
        commentator: data.replay.commentator || "",
        publishDate: data.replay.publishDate
          ? new Date(data.replay.publishDate)
          : new Date(),
        isShown: data.replay.isShown || false,
      });
    } else if (!isModalOpen) {
      form.reset();
      setMatchSearch("");
      setSportSearch("");
    }
  }, [isModalOpen, data?.replay, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const selectedMatch = matches.find((m) => m._id === values.match);
      if (!selectedMatch) {
        toast.error("Trận đấu không hợp lệ");
        return;
      }
      const selectedSport = sports.find((s) => s._id === values.sport);
      if (!selectedSport) {
        toast.error("Môn thể thao không hợp lệ");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("slug", createSlug(values.title));
      if (values.description) {
        formData.append("description", values.description);
      }
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
      formData.append("match", values.match);
      formData.append("sport", values.sport);
      if (values.duration !== undefined && values.duration !== null) {
        formData.append("duration", values.duration.toString());
      }
      formData.append("views", values.views.toString());
      if (values.commentator) {
        formData.append("commentator", values.commentator);
      }
      formData.append("publishDate", values.publishDate.toISOString());
      formData.append("isShown", values.isShown.toString());

      if (!data?.replay?._id) {
        toast.error("Không tìm thấy ID replay để cập nhật");
        return;
      }

      const res = await apiUpdateReplay(data.replay._id, formData);
      if (res?.data) {
        toast.success(`Đã cập nhật ${values.title} thành công`);
        const updatedList = replay?.map((item) =>
          item._id === res.data._id ? res.data : item
        );
        setReplay(updatedList);
        onClose();
        setSelectedPage("Phát lại");
        form.reset();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật nội dung phát lại";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleClose = () => {
    form.reset();
    setMatchSearch("");
    setSportSearch("");
    onClose();
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-white text-black p-0 overflow-y-auto max-h-[90vh] md:max-w-[60%] max-w-[90%]">
        <DialogHeader className="pt-8 px-6">
          <DialogTitle className="text-2xl text-center font-bold">
            Chỉnh sửa trận đấu phát lại
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mô tả (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập mô tả"
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
                    <FormLabel>Ảnh nhỏ (Không bắt buộc)</FormLabel>
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
                            {...getThumbnailRootProps()}
                            className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer ${
                              isThumbnailDragActive
                                ? "border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            <input {...getThumbnailInputProps()} />
                            <p className="!text-sm">
                              Kéo và thả file ảnh (.jpg, .jpeg, .png, .gif,
                              .bmp, .webp) hoặc URL tại đây
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
                    <FormLabel>URL Ảnh nhỏ (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập URL ảnh (ví dụ: https://example.com/image.jpg)"
                        {...field}
                        type="url"
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
                name="match"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trận đấu</FormLabel>
                    <FormControl>
                      <Select
                        options={filteredMatchOptions}
                        value={filteredMatchOptions.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        onInputChange={debouncedSetMatchSearch}
                        placeholder="Chọn trận đấu"
                        isDisabled={isLoading}
                        isClearable
                        isSearchable
                        noOptionsMessage={() => "Không tìm thấy trận đấu"}
                        components={{ MenuList }}
                        styles={customStyles}
                        aria-label="Trận đấu"
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
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thời lượng (phút, Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập thời lượng"
                        type="number"
                        min={0}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
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
                    <FormLabel>Ngày phát hành</FormLabel>
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
                name="views"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lượt xem</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập số lượt xem"
                        type="number"
                        min={0}
                        value={field.value ?? 0}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : 0
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
                name="commentator"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bình luận viên (Không bắt buộc)</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Nhập tên bình luận viên"
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
                name="isShown"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel>Hiển thị trên trang chủ</FormLabel>
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

export default EditReplayModal;
