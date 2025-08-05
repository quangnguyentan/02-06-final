import { NavItem, SportCategory } from "@/types/index.types";
import {
  UserIcon,
  BadmintonIcon,
  BasketballIcon,
  OtherSportsIcon,
  EventsIcon,
  FootballIcon,
  TennisIcon,
  VolleyballIcon,
  EsportsIcon,
  RacingIcon,
  MartialArtsIcon,
  BilliardsIcon,
  TVIcon,
} from "../layout/Icon";
import logo from "@/assets/user/Logo hoi quan khong nen.png";
import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import { Sport } from "@/types/sport.types";
import { useSelectedPageContext } from "@/hooks/use-context";
import { useData } from "@/context/DataContext";
import { LogOut, Settings } from "lucide-react";
import { useAppDispatch } from "@/hooks/use-dispatch";
import { logout } from "@/stores/actions/authAction";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { motion, AnimatePresence } from "framer-motion";
import Auth from "@/pages/Auth";
import avatar from "@/assets/user/avatar.webp";
import { useMediaQuery, useTheme } from "@mui/material";
import { MatchStatusType } from "@/types/match.types";
import { adjustToVietnamTime, formatDate } from "@/lib/helper";

const MainNavbar: React.FC<{ onOpenMenu: () => void }> = ({ onOpenMenu }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("xs", "sm")); // 600px - 899px
  const isMd = useMediaQuery(theme.breakpoints.between("sm", "md")); // 900px - 1199px
  const isLg = useMediaQuery(theme.breakpoints.between("md", "lg")); // 1200px - 1535px
  const isXl = useMediaQuery(theme.breakpoints.up("xl")); // >= 1536px

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const {
    selectedPage,
    setSelectedPage,
    setSelectedSportsNavbarPage,
    selectedSportsNavbarPage,
  } = useSelectedPageContext();
  const { sportData } = useData();
  const location = useLocation();
  const navigate = useNavigate();
  const { userData } = useSelector((state: RootState) => state.user);
  const { isLoggedIn, token } = useSelector((state: RootState) => state.auth);

  const getSportNameFromSlug = (slug: string) => {
    const sport = sportData?.find((s) => s.slug === slug);
    return sport ? sport.name : null;
  };

  const getInitialActiveSportName = React.useCallback(() => {
    if (
      location.pathname.startsWith("/lich-thi-dau/") ||
      location.pathname.startsWith("/ket-qua/") ||
      location.pathname.startsWith("/xem-lai/")
    ) {
      const parts = location.pathname.split("/");
      const urlSlug = parts[parts.length - 1];
      return getSportNameFromSlug(urlSlug) ?? "eSports";
    }
    const savedSportName = localStorage.getItem("selectedSportsNavbarPage");
    if (savedSportName && sportData?.some((s) => s.name === savedSportName)) {
      return savedSportName;
    }
    return "eSports";
  }, [location.pathname, sportData, getSportNameFromSlug]);
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: isMobile ? "100%" : isMd ? 750 : isLg ? 900 : 1200,
    p: 4,
    ouline: "none",
    border: "none", // Remove border from Box
    backgroundColor: "transparent", // Make background transparent
  };

  // const handleEmailClick = () => {
  //   const email = "ads.hoiquantv@gmail.com";
  //   const subject = "Liên hệ quảng cáo";
  //   const body = "Xin chào, tôi muốn liên hệ về dịch vụ quảng cáo.";
  //   window.open(
  //     `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent(
  //       email
  //     )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
  //     "_blank"
  //   );
  // };
  const handleEmailClick = () => {
    const email = "ads.hoiquantv@gmail.com";
    const subject = "Liên hệ quảng cáo";
    const body = "Xin chào, tôi muốn liên hệ về dịch vụ quảng cáo.";
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };
  const navItems: NavItem[] = React.useMemo(() => {
    const activeSportName = getInitialActiveSportName();
    const sport = sportData?.find((s) => s.name === activeSportName);

    const slug = sport ? sport.slug : "esports";

    return [
      { label: "TRANG CHỦ", url: "/" },
      {
        label: "LỊCH THI ĐẤU",
        url: `/lich-thi-dau/${slug}`,
        nameForHighlight: activeSportName,
      },
      {
        label: "KẾT QUẢ",
        url: `/ket-qua/${slug}`,
        nameForHighlight: activeSportName,
      },
      {
        label: "XEM LẠI",
        url: `/xem-lai/${slug}`,
        nameForHighlight: activeSportName,
      },
      // { label: "XOILAC.TV", url: "/xoi-lac-tv" },
    ];
  }, [getInitialActiveSportName, sportData]);

  const dispatch = useAppDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const handleLogout = () => {
    setSelectedPage("TRANG CHỦ");
    localStorage.setItem("selectedPage", "TRANG CHỦ");
    setSelectedSportsNavbarPage("");
    localStorage.removeItem("selectedSportsNavbarPage");
    dispatch(logout());
    navigate("/");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node) // event.target needs to be cast to Node for .contains()
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return (
    <>
      <div
        className="flex sm:hidden items-center justify-center bg-blue-500 w-full py-2"
        onClick={handleEmailClick}
      >
        <span className="text-xs text-white">
          Liên hệ quảng cáo: ads.hoiquantv@gmail.com
        </span>
      </div>
      <div className="bg-[#1E2027] text-gray-300 flex items-center justify-between p-2 relative">
        <img
          onClick={() => {
            navigate("/");
            setSelectedPage("TRANG CHỦ");
            localStorage.setItem("selectedPage", "TRANG CHỦ");
            setSelectedSportsNavbarPage("");
            localStorage.removeItem("selectedSportsNavbarPage");
            localStorage.setItem("previousSection", "home");
          }}
          src={logo}
          alt="HoiQuanTV Logo"
          className="h-[50px] md:h-[70px] mr-2 md:mr-6 w-32 md:w-36 object-cover cursor-pointer"
        />

        <div>
          <nav className="hidden md:flex items-center">
            {navItems.map((item) => (
              <div
                key={item.label}
                onClick={() => {
                  const activeSportName =
                    selectedSportsNavbarPage || getInitialActiveSportName();
                  const sport = sportData?.find(
                    (s) => s.name === activeSportName
                  );
                  const targetSlug = sport ? sport.slug : "esports";
                  const finalUrl =
                    item.url.includes(":slug") || item.url.includes(":title")
                      ? item.url
                          .replace(":slug", targetSlug ?? "")
                          .replace(":title", targetSlug ?? "")
                      : item.url;

                  navigate(finalUrl);
                  setSelectedPage(item.label);
                  localStorage.setItem("selectedPage", item.label);
                  if (item.nameForHighlight) {
                    setSelectedSportsNavbarPage(item.nameForHighlight);
                    localStorage.setItem(
                      "selectedSportsNavbarPage",
                      item.nameForHighlight
                    );
                  } else {
                    setSelectedSportsNavbarPage("");
                    localStorage.removeItem("selectedSportsNavbarPage");
                  }
                }}
                className={`px-1.5 sm:px-2 lg:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs lg:text-sm rounded transition-colors whitespace-nowrap font-bold cursor-pointer ${
                  selectedPage === item.label
                    ? "text-current-color"
                    : "text-gray-300 hover:text-current-color"
                }`}
              >
                {item.label}
              </div>
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-1.5 md:space-x-1 xl:space-x-2">
          <button
            className="hidden sm:flex items-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 font-medium rounded text-sm"
            onClick={handleEmailClick}
          >
            {/* <TVIcon className="w-5 h-5 mr-1" /> */}
            LHQC: ads.hoiquantv@gmail.com
          </button>
          <button className="hidden sm:flex items-center bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-medium px-3 py-2 rounded text-sm">
            Cược Uy Tín
          </button>
          <div>
            {isLoggedIn && token ? (
              <div className="relative" ref={wrapperRef}>
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={userData?.avatar ? userData?.avatar : avatar} // Replace with actual avatar path
                    alt="User Avatar"
                    className="w-4 h-4 md:w-6 md:h-6 rounded-full"
                  />
                  <span className="font-bold text-[9px] md:text-sm">
                    {userData?.username ?? "anonymous"}
                  </span>
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-4 w-48 bg-white text-gray-800 rounded-md shadow-lg z-10"
                    >
                      <ul className="py-1">
                        <li>
                          <button
                            onClick={() => alert("Settings clicked")}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            <Settings
                              size={16}
                              className="mr-2"
                              onClick={() => {}}
                            />
                            Cài đặt
                          </button>
                        </li>
                        <li>
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsDropdownOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                          >
                            <LogOut size={16} className="mr-2" />
                            Đăng xuất
                          </button>
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={handleOpen}
                className="bg-slate-700 hover:bg-slate-600 p-1.5 sm:p-2 rounded-full"
              >
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            )}
            <Modal
              aria-labelledby="signin-modal-title"
              aria-describedby="signin-modal-description"
              open={open}
              onClose={handleClose}
              closeAfterTransition
              slots={{ backdrop: Backdrop }}
              slotProps={{ backdrop: { timeout: 500 } }}
            >
              <Fade in={open}>
                <Box sx={style}>
                  <Auth handleClose={handleClose} />
                </Box>
              </Fade>
            </Modal>
          </div>
          <button
            className="md:hidden p-2 text-gray-300 hover:text-white"
            onClick={onOpenMenu}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

const SportsNavbar: React.FC = () => {
  const today = React.useMemo(() => new Date(), []);
  const vietnamToday = React.useMemo(() => adjustToVietnamTime(today), [today]);
  const navigate = useNavigate();
  const location = useLocation();
  const { sportData, matchData } = useData();

  const { selectedSportsNavbarPage, setSelectedSportsNavbarPage } =
    useSelectedPageContext();
  React.useEffect(() => {
    if (sportData?.length === 0) return;

    // Check if set by ReplayCard
    const setByReplayCard = localStorage.getItem("setByReplayCard") === "true";
    if (setByReplayCard) {
      localStorage.removeItem("setByReplayCard"); // Clear flag after use
      return; // Skip useEffect logic
    }

    const pathSegments = location.pathname.split("/");
    const currentPathSlug = pathSegments[pathSegments.length - 1];
    const currentSection = pathSegments[1] || "home";

    const previousSection = localStorage.getItem("previousSection") || "";

    if (location.pathname === "/") {
      setSelectedSportsNavbarPage("");
      localStorage.setItem("selectedSportsNavbarPage", "");
      localStorage.setItem("previousSection", currentSection);
      return;
    }

    if (
      (location.pathname.startsWith("/lich-thi-dau/") ||
        location.pathname.startsWith("/ket-qua/") ||
        location.pathname.startsWith("/xem-lai/")) &&
      currentSection !== previousSection
    ) {
      setSelectedSportsNavbarPage("eSports");
      localStorage.setItem("selectedSportsNavbarPage", "eSports");
      localStorage.setItem("previousSection", currentSection);
      return;
    }

    if (
      location.pathname.startsWith("/lich-thi-dau/") ||
      location.pathname.startsWith("/ket-qua/") ||
      location.pathname.startsWith("/xem-lai/")
    ) {
      const sportFromUrl = sportData?.find((s) => s.slug === currentPathSlug);
      let initialSportName = "eSports";
      if (sportFromUrl) {
        initialSportName = sportFromUrl.name ?? "";
      } else {
        const savedSportName = localStorage.getItem("selectedSportsNavbarPage");
        if (
          savedSportName &&
          sportData?.some((s) => s.name === savedSportName)
        ) {
          initialSportName = savedSportName;
        }
      }
      setSelectedSportsNavbarPage(initialSportName);
      localStorage.setItem("selectedSportsNavbarPage", initialSportName);
    }
  }, [setSelectedSportsNavbarPage, location.pathname, sportData]);
  const handleSportClick = (category: Sport) => {
    let targetUrl = "";
    if (
      location.pathname.startsWith("/lich-thi-dau/") ||
      location.pathname.startsWith("/ket-qua/") ||
      location.pathname.startsWith("/xem-lai/")
    ) {
      // Maintain the current section (lich-thi-dau, ket-qua, or xem-lai)
      const basePath = location.pathname.split("/")[1]; // Extract the section
      targetUrl = `/${basePath}/${category.slug}`;
    } else {
      // On homepage or other paths, navigate directly to /:slug
      targetUrl = `/${category.slug}`;
    }
    navigate(targetUrl);
    setSelectedSportsNavbarPage(category.name ?? "");
    localStorage.setItem("selectedSportsNavbarPage", category.name ?? "");
  };

  return (
    <div className="flex md:flex-row bg-[#22252D] px-2 md:px-3 py-3 md:py-4 gap-6 md:gap-8 overflow-x-auto md:overflow-x-hidden shadow-xl">
      {sportData?.map((category) => (
        <div
          key={category._id}
          onClick={() => handleSportClick(category)}
          className={`group relative flex items-center flex-shrink-0 gap-1 md:gap-2 pb-1 md:pb-2 pt-2 md:pt-4 text-xs md:text-sm font-medium cursor-pointer
        transition-all duration-300
        ${
          selectedSportsNavbarPage === category.name
            ? "text-current-color"
            : "text-gray-200 hover:text-white"
        }`}
        >
          <div className="flex items-center justify-start gap-2 md:gap-2">
            <img
              src={category?.icon}
              className="w-3 h-3 md:w-4 md:h-4"
              alt={category?.name}
            />
            <span className="whitespace-nowrap">{category.name}</span>
          </div>
          <span
            className={`
          absolute bottom-0 left-1/2 h-[1px] md:h-[2px] bg-current-color transition-all duration-300 ease-in-out
          ${
            selectedSportsNavbarPage === category.name
              ? "w-full -translate-x-1/2"
              : "w-0 group-hover:w-full group-hover:-translate-x-1/2"
          }
        `}
          />
          {matchData?.some((match) => {
            if (
              match.sport?.slug === category.slug &&
              match.status === "LIVE"
            ) {
              if (!match?.startTime) return false;
              const matchDate = adjustToVietnamTime(new Date(match.startTime));
              const now = vietnamToday;
              const durationHours = match.sport?.name === "eSports" ? 24 : 24;
              const matchEndTime = new Date(
                matchDate.getTime() + durationHours * 60 * 60 * 1000
              );
              const isOngoing =
                match.status === MatchStatusType.LIVE
                  ? now <= matchEndTime
                  : true;
              return isOngoing;
            }
            return false;
          }) && (
            <span className="ml-1 text-[6px] md:text-[7px] font-bold bg-red-500 text-white px-1 md:px-2 rounded-full md:rounded-full absolute right-[-5px] md:right-[-10px] top-0 md:top-[0px] animate-pulse">
              LIVE
            </span>
          )}
        </div>
      ))}
    </div>
  );
};
const DrawerMenu: React.FC<{
  open: boolean;
  onClose: () => void;
  navItems: NavItem[];
  sportCategories: SportCategory[];
  navigate: (url: string) => void;
}> = ({ open, onClose, navItems, sportCategories, navigate }) => {
  const {
    setSelectedPage,
    setSelectedSportsNavbarPage,
    selectedSportsNavbarPage,
    selectedPage,
  } = useSelectedPageContext();
  const { sportData, matchData } = useData();
  const location = useLocation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open) {
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, open]);
  const getSportNameFromSlug = (slug: string) => {
    const sport = sportData?.find((s) => s.slug === slug);
    return sport ? sport.name : null;
  };

  const getInitialActiveSportName = React.useCallback(() => {
    if (
      location.pathname.startsWith("/lich-thi-dau/") ||
      location.pathname.startsWith("/ket-qua/") ||
      location.pathname.startsWith("/xem-lai/")
    ) {
      const parts = location.pathname.split("/");
      const urlSlug = parts[parts.length - 1];
      return getSportNameFromSlug(urlSlug) ?? "eSports";
    }
    const savedSportName = localStorage.getItem("selectedSportsNavbarPage");
    if (savedSportName && sportData?.some((s) => s.name === savedSportName)) {
      return savedSportName;
    }
    return "eSports";
  }, [location.pathname, sportData]);

  React.useEffect(() => {
    if (sportData?.length === 0) return;

    // Check if set by ReplayCard
    const setByReplayCard = localStorage.getItem("setByReplayCard") === "true";
    if (setByReplayCard) {
      localStorage.removeItem("setByReplayCard"); // Clear flag after use
      return; // Skip useEffect logic
    }

    const pathSegments = location.pathname.split("/");
    const currentPathSlug = pathSegments[pathSegments.length - 1];
    const currentSection = pathSegments[1] || "home";

    const previousSection = localStorage.getItem("previousSection") || "";

    if (location.pathname === "/") {
      setSelectedSportsNavbarPage("");
      localStorage.setItem("selectedSportsNavbarPage", "");
      localStorage.setItem("previousSection", currentSection);
      return;
    }

    if (
      (location.pathname.startsWith("/lich-thi-dau/") ||
        location.pathname.startsWith("/ket-qua/") ||
        location.pathname.startsWith("/xem-lai/")) &&
      currentSection !== previousSection
    ) {
      setSelectedSportsNavbarPage("eSports");
      localStorage.setItem("selectedSportsNavbarPage", "eSports");
      localStorage.setItem("previousSection", currentSection);
      return;
    }

    if (
      location.pathname.startsWith("/lich-thi-dau/") ||
      location.pathname.startsWith("/ket-qua/") ||
      location.pathname.startsWith("/xem-lai/")
    ) {
      const sportFromUrl = sportData?.find((s) => s.slug === currentPathSlug);
      let initialSportName = "eSports";
      if (sportFromUrl) {
        initialSportName = sportFromUrl.name ?? "";
      } else {
        const savedSportName = localStorage.getItem("selectedSportsNavbarPage");
        if (
          savedSportName &&
          sportData?.some((s) => s.name === savedSportName)
        ) {
          initialSportName = savedSportName;
        }
      }
      setSelectedSportsNavbarPage(initialSportName);
      localStorage.setItem("selectedSportsNavbarPage", initialSportName);
    }
  }, [setSelectedSportsNavbarPage, location.pathname, sportData]);
  const handleSportClick = (category: Sport) => {
    let targetUrl = "";
    if (
      location.pathname.startsWith("/lich-thi-dau/") ||
      location.pathname.startsWith("/ket-qua/") ||
      location.pathname.startsWith("/xem-lai/")
    ) {
      // Maintain the current section (lich-thi-dau, ket-qua, or xem-lai)
      const basePath = location.pathname.split("/")[1]; // Extract the section
      targetUrl = `/${basePath}/${category.slug}`;
    } else {
      // On homepage or other paths, navigate directly to /:slug
      targetUrl = `/${category.slug}`;
    }
    navigate(targetUrl);
    setSelectedSportsNavbarPage(category.name ?? "");
    localStorage.setItem("selectedSportsNavbarPage", category.name ?? "");
  };
  return (
    <div
      className={`fixed  inset-0 z-[10000] transition-all duration-300 ${
        open ? "visible" : "invisible"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`absolute left-0 top-0 h-full w-64 max-w-[80vw] bg-slate-800 shadow-lg transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        {/* <button
          className="self-end text-white hover:text-white bg-red-500"
          onClick={onClose}
        >
          <svg
            width={24}
            height={24}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button> */}
        <nav
          ref={containerRef}
          className="flex-1 px-4 pt-8 overflow-y-auto h-auto"
        >
          {navItems.map((item) => (
            <div
              key={item.label}
              onClick={() => {
                const activeSportName =
                  selectedSportsNavbarPage || getInitialActiveSportName();
                const sport = sportData?.find(
                  (s) => s.name === activeSportName
                );
                const targetSlug = sport ? sport.slug : "esports";
                const finalUrl =
                  item.url.includes(":slug") || item.url.includes(":title")
                    ? item.url
                        .replace(":slug", targetSlug ?? "")
                        .replace(":title", targetSlug ?? "")
                    : item.url;

                navigate(finalUrl);
                setSelectedPage(item.label);
                localStorage.setItem("selectedPage", item.label);
                if (item.nameForHighlight) {
                  setSelectedSportsNavbarPage(item.nameForHighlight);
                  localStorage.setItem(
                    "selectedSportsNavbarPage",
                    item.nameForHighlight
                  );
                } else {
                  setSelectedSportsNavbarPage("");
                  localStorage.removeItem("selectedSportsNavbarPage");
                }
                onClose();
              }}
              // onClick={() => {
              //   navigate(item.url);
              //   setSelectedPage(item.label);
              //   localStorage.setItem("selectedPage", item.label);
              // }}
              className={`px-1.5 sm:px-2 lg:px-4 py-4 sm:py-2 text-[14px] sm:text-xs lg:text-sm rounded transition-colors whitespace-nowrap font-bold cursor-pointer ${
                selectedPage === item.label
                  ? "text-current-color"
                  : "text-gray-300 hover:text-current-color"
              }`}
            >
              {item.label}
            </div>
          ))}
          <hr className="my-2 border-slate-700" />
          <div className="flex flex-col gap-1">
            {sportData?.map((category) => (
              <div
                key={category._id}
                onClick={() => {
                  handleSportClick(category);
                  onClose();
                }}
                className={`group relative flex items-center gap-2 pb-2 pt-4 text-sm font-medium cursor-pointer
                  transition-all duration-300
                  ${
                    selectedSportsNavbarPage === category.name
                      ? "text-current-color"
                      : "text-gray-200 hover:text-white"
                  }`}
              >
                <img
                  src={category?.icon}
                  className="w-4 h-4"
                  alt={category?.name}
                />
                <span>{category.name}</span>
                <span
                  className={`
            absolute bottom-0 left-0 h-[2px] bg-current-color transition-all duration-300 ease-in-out
            ${
              selectedSportsNavbarPage === category.name
                ? "w-20 -translate-x-0"
                : "w-0 group-hover:w-full group-hover:-translate-x-1/2"
            }
          `}
                />
                {matchData?.some(
                  (match) =>
                    match.sport?.slug === category.slug &&
                    match.status === "LIVE"
                ) && (
                  <span className="ml-1 text-[7px] bg-red-500 text-white px-2 rounded-full flex-shrink-0 animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

const Header: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();
  const { setSelectedPage, setSelectedSportsNavbarPage } =
    useSelectedPageContext();
  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navItems: NavItem[] = [
    { label: "TRANG CHỦ", url: "/" },
    { label: "LỊCH THI ĐẤU", url: "/lich-thi-dau/esports" },
    { label: "KẾT QUẢ", url: "/ket-qua/esports" },
    { label: "XEM LẠI", url: "/xem-lai/esports" },
    // { label: "XOILAC.TV", url: "/xoi-lac-tv" },
  ];
  const sportCategories: SportCategory[] = [
    { id: "tennis", name: "Tennis", icon: <TennisIcon className="w-4 h-4" /> },
    { id: "racing", name: "Đua xe", icon: <RacingIcon className="w-4 h-4" /> },
    {
      id: "esports",
      name: "eSports",
      icon: <EsportsIcon className="w-4 h-4" />,
    },
    {
      id: "basketball",
      name: "Bóng rổ",
      icon: <BasketballIcon className="w-4 h-4" />,
    },
    {
      id: "badminton",
      name: "Cầu lông",
      icon: <BadmintonIcon className="w-4 h-4" />,
    },
    {
      id: "volleyball",
      name: "Bóng chuyền",
      icon: <VolleyballIcon className="w-4 h-4" />,
    },
    {
      id: "other_sports",
      name: "Môn khác",
      icon: <OtherSportsIcon className="w-4 h-4" />,
    },
    {
      id: "football",
      name: "Bóng đá",
      icon: <FootballIcon className="w-4 h-4" />,
    },
    {
      id: "martial_arts",
      name: "Võ thuật",
      icon: <MartialArtsIcon className="w-4 h-4" />,
    },
    {
      id: "events",
      name: "Sự kiện đặc biệt",
      icon: <EventsIcon className="w-4 h-4" />,
    },
    {
      id: "billiards",
      name: "Bi-a",
      icon: <BilliardsIcon className="w-4 h-4" />,
    },
  ];
  React.useEffect(() => {
    const savedPage = localStorage.getItem("selectedPage");
    console.log(savedPage);
    const savedSportsPage = localStorage.getItem("selectedSportsNavbarPage");
    if (savedPage) setSelectedPage(savedPage);
    if (savedSportsPage) setSelectedSportsNavbarPage(savedSportsPage);
  }, [setSelectedPage, setSelectedSportsNavbarPage]);

  return (
    <header
      className="w-full mx-auto 
        max-w-[640px] sm:max-w-[768px] md:max-w-[960px] 
        lg:max-w-[1024px] 
        xl:max-w-[1200px] 
        2xl:max-w-[1440px] 
        3xl:max-w-[1440px]"
    >
      <MainNavbar onOpenMenu={() => setDrawerOpen(true)} />
      <SportsNavbar />
      {isMobile && (
        <DrawerMenu
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          navItems={navItems}
          sportCategories={sportCategories}
          navigate={navigate}
        />
      )}
    </header>
  );
};

export default Header;
