import NavigationBarAdmin from "@/components/navigation/navigation-bar-admin";
import ModalProvider from "@/components/provider/modal-provider";
import TableProvider from "@/components/provider/table-provider";
import { SelectedPageProvider } from "@/components/navigation/navigation-provider";
import HeaderAdmin from "@/components/header-admin";
import {
  ArrowPathIcon,
  BanknotesIcon,
  CalendarDateRangeIcon,
  GlobeAsiaAustraliaIcon,
  PhotoIcon,
  UserGroupIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/solid";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { DrawerMenu } from "@/components/navigation/navigation-bar-admin-mobile";
interface MenuItem {
  id: number;
  name: string;
  icon: React.ReactElement; // Kiểu cho icon React component
}

const Home = () => {
  const { current } = useSelector((state: RootState) => state.auth);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const navigate = useNavigate();

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const allItems: MenuItem[] = [
    {
      id: 1,
      name: "Người dùng",
      icon: <UsersIcon className="stroke-white stroke-[1] min-w-5 w-5" />,
    },
    {
      id: 2,
      name: "Môn thể thao",
      icon: (
        <GlobeAsiaAustraliaIcon className="stroke-white stroke-[1] min-w-5 w-5" />
      ),
    },
    {
      id: 3,
      name: "Giải đấu",
      icon: (
        <CalendarDateRangeIcon className="stroke-white stroke-[1] min-w-5 w-5" />
      ),
    },
    {
      id: 4,
      name: "Đội bóng",
      icon: <UserGroupIcon className="stroke-white stroke-[1] min-w-5 w-5" />,
    },
    {
      id: 5,
      name: "Trận đấu",
      icon: <BanknotesIcon className="stroke-white stroke-[1] min-w-5 w-5" />,
    },
    {
      id: 6,
      name: "Phát lại",
      icon: <ArrowPathIcon className="stroke-white stroke-[1] min-w-5 w-5" />,
    },
    {
      id: 7,
      name: "Thước phim ngắn",
      icon: <VideoCameraIcon className="stroke-white stroke-[1] min-w-5 w-5" />,
    },
    {
      id: 6,
      name: "Banner quảng cáo",
      icon: <PhotoIcon className="stroke-white stroke-[1] min-w-5 w-5" />,
    },
  ];
  // Sử dụng React.useMemo để lọc các mục dựa trên vai trò của người dùng
  const filteredNavItems = React.useMemo(() => {
    if (current === "COMMENTATOR") {
      // Nếu là COMMENTATOR, chỉ hiện mục "Matches"
      return allItems.filter((item) => item.name === "Trận đấu");
    } else if (current === "ADMIN") {
      // Nếu là ADMIN, hiện tất cả các mục
      return allItems;
    }
    // Mặc định hoặc khi chưa đăng nhập, không hiện mục nào
    // Bạn có thể thay đổi logic này nếu có các vai trò khác hoặc trạng thái mặc định
    return [];
  }, [current]); // Dependency array: chỉ tính toán lại khi `current` thay đổi
  const initialPageName =
    filteredNavItems?.length > 0 ? filteredNavItems[0]?.name : "Người dùng";
  return (
    <SelectedPageProvider initialPage={initialPageName}>
      <main className="w-full h-screen flex flex-col relative bg-white overflow-hidden ">
        <HeaderAdmin onOpenMenu={() => setDrawerOpen(true)} />
        <div className="flex flex-row flex-1 overflow-hidden">
          <div className="hidden md:flex flex-col bg-gray-800 text-white h-full overflow-y-auto min-w-[200px] sticky z-50">
            <NavigationBarAdmin items={filteredNavItems} />
          </div>
          {isMobile && (
            <DrawerMenu
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              navItems={allItems}
              navigate={navigate}
            />
          )}
          <section className="flex flex-col flex-1 p-0 md:p-8  overflow-y-auto items-center justify-center gap-5">
            <ModalProvider />
            <TableProvider />
          </section>
        </div>
      </main>
    </SelectedPageProvider>
  );
};

export default Home;
