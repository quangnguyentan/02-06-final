import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select as SelectComponent,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { apiUpdateMatch } from "@/services/match.services";
import { apiGetAllTeams } from "@/services/team.services";
import { apiGetAllLeagues } from "@/services/league.services";
import { apiGetAllSports } from "@/services/sport.services";
import { MatchStatusType, SourceMatch } from "@/types/match.types";
import { Team } from "@/types/team.types";
import { League } from "@/types/league.types";
import { Sport } from "@/types/sport.types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";
import { useDropzone } from "react-dropzone";
import { PlusCircle, XCircle } from "lucide-react";
import { apiGetAllUser } from "@/services/user.services";
import { User } from "@/types/user.types";
import { createSlug } from "@/lib/helper";
import Select from "react-select";
import { FixedSizeList as List } from "react-window";
import debounce from "lodash.debounce";
import { Banner } from "@/types/banner.types";

registerLocale("vi", vi);
setDefaultLocale("vi");

const streamLinkSchema = z.object({
  label: z.string().optional(),
  url: z.string().optional(),
  image: z
    .instanceof(File)
    .refine((file) => file && /image\/(jpg|jpeg|png)/.test(file.type), {
      message: "Vui lòng chọn file ảnh hợp lệ (.jpg, .jpeg, .png)",
    })
    .optional(),
  imageUrl: z
    .string()
    .url({ message: "Vui lòng nhập URL hợp lệ" })
    .optional()
    .or(z.literal("")),
  commentator: z.string().optional(),
  priority: z.coerce
    .number()
    .min(1, { message: "Ưu tiên phải là số không âm" })
    .optional(),
});

const formSchema = z.object({
  title: z.string().min(1, { message: "Tiêu đề là bắt buộc" }),
  homeTeam: z.string().min(1, { message: "Đội nhà là bắt buộc" }),
  awayTeam: z.string().min(1, { message: "Đội khách là bắt buộc" }),
  league: z.string().min(1, { message: "Giải đấu là bắt buộc" }),
  sport: z.string().min(1, { message: "Môn thể thao là bắt buộc" }),
  startTime: z.date({ required_error: "Ngày bắt đầu là bắt buộc" }),
  status: z.enum(Object.values(MatchStatusType) as [string, ...string[]], {
    required_error: "Trạng thái là bắt buộc",
  }),
  scores: z
    .object({
      homeScore: z.coerce
        .number()
        .min(0, { message: "Tỉ số đội nhà phải là số không âm" })
        .optional(),
      awayScore: z.coerce
        .number()
        .min(0, { message: "Tỉ số đội khách phải là số không âm" })
        .optional(),
    })
    .optional(),
  isHot: z.boolean().optional(),
  source: z.enum(["BUGIO", "MANUAL"], {
    required_error: "Nguồn dữ liệu là bắt buộc",
  }),
  streamLinks: z.array(streamLinkSchema).optional(),
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

interface StreamLinkFieldProps {
  index: number;
  form: any;
  remove: (index: number) => void;
  isLoading: boolean;
  users: User[];
}

const StreamLinkField: React.FC<StreamLinkFieldProps> = ({
  index,
  form,
  remove,
  isLoading,
  users,
}) => {
  const [commentatorSearch, setCommentatorSearch] = useState("");
  const debouncedSetCommentatorSearch = useCallback(
    debounce((value: string) => setCommentatorSearch(value), 300),
    []
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

  const onDropImage = useCallback(
    (acceptedFiles: File[], fileRejections: any[], event: any) => {
      if (acceptedFiles[0]) {
        form.setValue(`streamLinks.${index}.image`, acceptedFiles[0], {
          shouldValidate: true,
        });
        form.setValue(`streamLinks.${index}.imageUrl`, "", {
          shouldValidate: true,
        });
      } else {
        const dataTransfer = event.dataTransfer;
        if (dataTransfer.types.includes("text/uri-list")) {
          const url = dataTransfer.getData("text/uri-list");
          if (url && z.string().url().safeParse(url).success) {
            form.setValue(`streamLinks.${index}.imageUrl`, url, {
              shouldValidate: true,
            });
            form.setValue(`streamLinks.${index}.image`, undefined, {
              shouldValidate: true,
            });
          } else {
            toast.error("URL ảnh không hợp lệ");
          }
        }
      }
    },
    [form, index]
  );

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onDropImage,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const error =
        fileRejections[0]?.errors[0]?.message || "File ảnh không hợp lệ";
      toast.error(error);
    },
  });

  return (
    <div className="grid grid-cols-1 gap-4 border p-3 rounded-md relative">
      <Button
        type="button"
        onClick={() => remove(index)}
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
        disabled={isLoading}
      >
        <XCircle className="h-4 w-4" />
      </Button>
      <FormField
        control={form.control}
        name={`streamLinks.${index}.label`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Nhãn <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={isLoading}
                placeholder="Ví dụ: K+SPORT1"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`streamLinks.${index}.url`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              URL <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input
                disabled={isLoading}
                placeholder="Ví dụ: https://example.com/stream"
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
        name={`streamLinks.${index}.image`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ảnh đại diện link (Không bắt buộc)</FormLabel>
            <FormControl>
              <div>
                {form.getValues(`streamLinks.${index}.imageUrl`) ? (
                  <div className="relative w-24 h-24 mb-2">
                    <img
                      src={form.getValues(`streamLinks.${index}.imageUrl`)}
                      alt="Stream Link"
                      className="object-cover w-full h-full rounded"
                      onError={() =>
                        toast.error("Không thể tải hình ảnh từ URL")
                      }
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        form.setValue(`streamLinks.${index}.imageUrl`, "", {
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
                      alt="Stream Link Preview"
                      className="object-cover w-full h-full rounded"
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        form.setValue(`streamLinks.${index}.image`, undefined, {
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
                    {...getImageRootProps()}
                    className={`border-2 border-dashed p-4 rounded-lg text-center cursor-pointer ${
                      isImageDragActive ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    <input {...getImageInputProps()} />
                    <p className="!text-sm">
                      Kéo và thả file ảnh (.jpg, .jpeg, .png) hoặc URL tại đây,
                      hoặc nhấp để chọn file
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
        name={`streamLinks.${index}.imageUrl`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL ảnh đại diện (Không bắt buộc)</FormLabel>
            <FormControl>
              <Input
                disabled={isLoading}
                className="bg-zinc-100 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0"
                placeholder="Nhập URL ảnh (ví dụ: https://example.com/image.png)"
                {...field}
                type="url"
                onChange={(e) => {
                  field.onChange(e);
                  if (e.target.value) {
                    form.setValue(`streamLinks.${index}.image`, undefined, {
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
        name={`streamLinks.${index}.commentator`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bình luận viên (Link này)</FormLabel>
            <FormControl>
              <Select
                options={filteredCommentatorOptions}
                value={filteredCommentatorOptions.find(
                  (option) => option.value === field.value
                )}
                onChange={(option) => field.onChange(option?.value || "")}
                onInputChange={debouncedSetCommentatorSearch}
                placeholder="Chọn bình luận viên"
                isDisabled={isLoading}
                isClearable
                isSearchable
                noOptionsMessage={() => "Không tìm thấy bình luận viên"}
                components={{ MenuList }}
                styles={customStyles}
                aria-label="Bình luận viên"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`streamLinks.${index}.priority`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ưu tiên</FormLabel>
            <FormControl>
              <Input
                disabled={isLoading}
                type="number"
                min={0}
                placeholder="Số ưu tiên"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export const EditMatchModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const { match: matchToEdit } = data || {};
  const isModalOpen = isOpen && type === "editMatch";
  const { setSelectedPage, setMatch, match } = useSelectedPageContext();
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [homeTeamSearch, setHomeTeamSearch] = useState("");
  const [awayTeamSearch, setAwayTeamSearch] = useState("");
  const [leagueSearch, setLeagueSearch] = useState("");
  const [sportSearch, setSportSearch] = useState("");

  const debouncedSetHomeTeamSearch = useCallback(
    debounce((value: string) => setHomeTeamSearch(value), 300),
    []
  );
  const debouncedSetAwayTeamSearch = useCallback(
    debounce((value: string) => setAwayTeamSearch(value), 300),
    []
  );
  const debouncedSetLeagueSearch = useCallback(
    debounce((value: string) => setLeagueSearch(value), 300),
    []
  );
  const debouncedSetSportSearch = useCallback(
    debounce((value: string) => setSportSearch(value), 300),
    []
  );

  const teamOptions = useMemo(
    () =>
      teams.map((team) => ({
        value: team._id ?? "",
        label: team.name ?? "",
      })),
    [teams]
  );

  const filteredTeamOptions = useMemo(
    () =>
      teamOptions.filter((option) =>
        option.label.toLowerCase().includes(homeTeamSearch.toLowerCase())
      ),
    [teamOptions, homeTeamSearch]
  );

  const filteredAwayTeamOptions = useMemo(
    () =>
      teamOptions.filter((option) =>
        option.label.toLowerCase().includes(awayTeamSearch.toLowerCase())
      ),
    [teamOptions, awayTeamSearch]
  );

  const leagueOptions = useMemo(
    () =>
      leagues.map((league) => ({
        value: league._id ?? "",
        label: league.name ?? "",
      })),
    [leagues]
  );

  const filteredLeagueOptions = useMemo(
    () =>
      leagueOptions.filter((option) =>
        option.label.toLowerCase().includes(leagueSearch.toLowerCase())
      ),
    [leagueOptions, leagueSearch]
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
      homeTeam: "",
      awayTeam: "",
      league: "",
      sport: "",
      startTime: new Date(),
      status: MatchStatusType.UPCOMING,
      scores: { homeScore: 0, awayScore: 0 },
      isHot: false,
      source: "MANUAL",
      streamLinks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "streamLinks",
  });

  const isLoading = form.formState.isSubmitting;

  useEffect(() => {
    if (!isModalOpen) return;

    const fetchData = async () => {
      try {
        const [teamsRes, leaguesRes, sportsRes, usersRes] = await Promise.all([
          apiGetAllTeams(),
          apiGetAllLeagues(),
          apiGetAllSports(),
          apiGetAllUser(),
        ]);
        setTeams(teamsRes.data);
        setLeagues(leaguesRes.data);
        setSports(sportsRes.data);
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
    if (isModalOpen && matchToEdit) {
      form.reset({
        title: matchToEdit.title || "",
        homeTeam: matchToEdit.homeTeam?._id || "",
        awayTeam: matchToEdit.awayTeam?._id || "",
        league: matchToEdit.league?._id || "",
        sport: matchToEdit.sport?._id || "",
        startTime: matchToEdit.startTime
          ? new Date(matchToEdit.startTime)
          : new Date(),
        status: matchToEdit.status || MatchStatusType.UPCOMING,
        scores: {
          homeScore: matchToEdit.scores?.homeScore ?? 0,
          awayScore: matchToEdit.scores?.awayScore ?? 0,
        },
        isHot: matchToEdit.isHot || false,
        source: matchToEdit.source === "BUGIO" ? "BUGIO" : "MANUAL",
        streamLinks:
          matchToEdit.streamLinks?.map((link) => ({
            label: link.label || "",
            url: link.url || "",
            image: undefined,
            imageUrl: link.image || "",
            commentator:
              typeof link.commentator === "object" && link.commentator?._id
                ? link.commentator._id
                : typeof link.commentator === "string"
                ? link.commentator
                : "",
            priority: link.priority || 1,
          })) || [],
      });
    }
  }, [isModalOpen, matchToEdit, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!matchToEdit?._id) {
        toast.error("Không tìm thấy ID trận đấu để cập nhật");
        return;
      }

      const homeTeamData = teams.find((t) => t._id === values.homeTeam);
      const awayTeamData = teams.find((t) => t._id === values.awayTeam);
      const leagueData = leagues.find((l) => l._id === values.league);
      const sportData = sports.find((s) => s._id === values.sport);

      if (!homeTeamData || !awayTeamData || !leagueData || !sportData) {
        toast.error("Dữ liệu đội, giải đấu hoặc môn thể thao không hợp lệ");
        return;
      }

      const formData = new FormData();
      formData.append("title", values.title);
      formData.append("slug", createSlug(values.title));
      formData.append("homeTeam", homeTeamData._id || "");
      formData.append("awayTeam", awayTeamData._id || "");
      formData.append("league", leagueData._id || "");
      formData.append("sport", sportData._id || "");
      formData.append("startTime", values.startTime.toISOString());
      formData.append("status", values.status);
      formData.append("source", values.source);

      if (
        values.scores?.homeScore !== undefined &&
        values.scores?.homeScore !== null
      ) {
        formData.append(
          "scores[homeScore]",
          values.scores.homeScore.toString()
        );
      }
      if (
        values.scores?.awayScore !== undefined &&
        values.scores?.awayScore !== null
      ) {
        formData.append(
          "scores[awayScore]",
          values.scores.awayScore.toString()
        );
      }
      if (values.isHot !== undefined) {
        formData.append("isHot", values.isHot.toString());
      }

      const validStreamLinks =
        values.streamLinks?.filter((link) => link.url || link.commentator) ||
        [];
      const processedLinks = validStreamLinks.map((link, index) => ({
        label: link.label || undefined,
        url: link.url || undefined,
        image:
          link.image instanceof File
            ? `file:image-${index}`
            : link.imageUrl || undefined,
        commentator: link.commentator || undefined,
        priority: link.priority || 1,
      }));

      formData.append("streamLinks", JSON.stringify(processedLinks));

      validStreamLinks.forEach((link) => {
        if (link.image instanceof File) {
          formData.append("streamLinkImages", link.image);
        } else if (link.imageUrl) {
          formData.append("streamLinkImages", link.imageUrl);
        }
      });

      const res = await apiUpdateMatch(matchToEdit._id, formData);
      if (res?.data) {
        toast.success(`Đã cập nhật ${values.title} thành công`);
        onClose();
        const updatedList = match?.map((item: Banner) =>
          item._id === res.data._id ? res.data : item
        );
        setMatch(updatedList);
        setSelectedPage("Trận đấu");
        form.reset();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Lỗi khi cập nhật trận đấu";
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
            Chỉnh sửa trận đấu
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
                name="homeTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đội nhà</FormLabel>
                    <FormControl>
                      <Select
                        options={filteredTeamOptions}
                        value={filteredTeamOptions.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        onInputChange={debouncedSetHomeTeamSearch}
                        placeholder="Chọn đội nhà"
                        isDisabled={isLoading}
                        isClearable
                        isSearchable
                        noOptionsMessage={() => "Không tìm thấy đội"}
                        components={{ MenuList }}
                        styles={customStyles}
                        aria-label="Đội nhà"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="awayTeam"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Đội khách</FormLabel>
                    <FormControl>
                      <Select
                        options={filteredAwayTeamOptions}
                        value={filteredAwayTeamOptions.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        onInputChange={debouncedSetAwayTeamSearch}
                        placeholder="Chọn đội khách"
                        isDisabled={isLoading}
                        isClearable
                        isSearchable
                        noOptionsMessage={() => "Không tìm thấy đội"}
                        components={{ MenuList }}
                        styles={customStyles}
                        aria-label="Đội khách"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="league"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Giải đấu</FormLabel>
                    <FormControl>
                      <Select
                        options={filteredLeagueOptions}
                        value={filteredLeagueOptions.find(
                          (option) => option.value === field.value
                        )}
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        onInputChange={debouncedSetLeagueSearch}
                        placeholder="Chọn giải đấu"
                        isDisabled={isLoading}
                        isClearable
                        isSearchable
                        noOptionsMessage={() => "Không tìm thấy giải đấu"}
                        components={{ MenuList }}
                        styles={customStyles}
                        aria-label="Giải đấu"
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
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Thời gian bắt đầu</FormLabel>
                    <FormControl>
                      <Controller
                        name="startTime"
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <FormControl>
                      <Select
                        options={Object.values(MatchStatusType).map(
                          (status) => ({
                            value: status,
                            label: status,
                          })
                        )}
                        value={Object.values(MatchStatusType)
                          .map((status) => ({ value: status, label: status }))
                          .find((option) => option.value === field.value)}
                        onChange={(option) =>
                          field.onChange(option?.value || "")
                        }
                        placeholder="Chọn trạng thái"
                        isDisabled={isLoading}
                        isClearable
                        isSearchable={false}
                        noOptionsMessage={() => "Không tìm thấy trạng thái"}
                        components={{ MenuList }}
                        styles={customStyles}
                        aria-label="Trạng thái"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scores.homeScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỉ số đội nhà</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          type="number"
                          min={0}
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
                  name="scores.awayScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tỉ số đội khách</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          type="number"
                          min={0}
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
              </div>
              <FormField
                control={form.control}
                name="isHot"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormLabel>Trận đấu Hot</FormLabel>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nguồn dữ liệu</FormLabel>
                    <SelectComponent
                      disabled={isLoading}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-zinc-100 border-0 focus:ring-0 text-black ring-offset-0 focus:ring-offset-0">
                          <SelectValue placeholder="Chọn nguồn dữ liệu" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white text-black h-[90px]">
                        {Object.values(SourceMatch).map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "MANUAL" ? "HOIQUANTV" : "BUGIO"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </SelectComponent>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-4 border p-4 rounded-lg">
                <h3 className="!text-base font-semibold">
                  Liên kết stream (Không bắt buộc)
                </h3>
                {fields.map((item, index) => (
                  <StreamLinkField
                    key={item.id}
                    index={index}
                    form={form}
                    remove={remove}
                    isLoading={isLoading}
                    users={users}
                  />
                ))}
                <Button
                  type="button"
                  onClick={() =>
                    append({
                      label: "",
                      url: "",
                      image: undefined,
                      imageUrl: "",
                      commentator: "",
                      priority: 1,
                    })
                  }
                  className="flex items-center gap-2 mt-4 bg-blue-500 hover:bg-blue-600"
                  disabled={isLoading}
                >
                  <PlusCircle className="h-4 w-4" /> Thêm liên kết stream
                </Button>
              </div>
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

export default EditMatchModal;
