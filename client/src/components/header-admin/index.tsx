import { LogOut, Settings } from "lucide-react";
import { useAppDispatch } from "@/hooks/use-dispatch";
import { logout } from "@/stores/actions/authAction";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelectedPageContext } from "@/hooks/use-context";

const HeaderAdmin: React.FC<{ onOpenMenu: () => void }> = ({ onOpenMenu }) => {
  const { userData } = useSelector((state: RootState) => state.user);
  const { setSelectedPage, setSelectedSportsNavbarPage } =
    useSelectedPageContext();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // FIX: Explicitly type the ref to HTMLDivElement
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // The `if (wrapperRef.current)` acts as a type guard,
      // ensuring TypeScript knows `wrapperRef.current` is not null here.
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

  return (
    <header className="flex justify-end items-center p-4 bg-[#2ABBB2] text-white w-full absolute ">
      <div className="relative w-full" ref={wrapperRef}>
        <div className="flex items-center justify-between w-full sm:justify-end">
          <button
            className="sm:hidden p-2 text-gray-300 hover:text-white"
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
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 focus:outline-none"
          >
            <img
              src={userData?.avatar} // Replace with actual avatar path
              alt="User Avatar"
              className="w-6 h-6 rounded-full"
            />
            <span className="font-bold text-xs">
              {userData?.username || "anonymous"}
            </span>
          </button>
        </div>
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg z-10"
            >
              <ul className="py-1">
                <li>
                  <button
                    onClick={() => alert("Settings clicked")}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Settings size={16} className="mr-2" />
                    Cài đặt
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
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
    </header>
  );
};

export default HeaderAdmin;
