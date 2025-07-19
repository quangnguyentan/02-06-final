import * as React from "react";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useSelectedPageContext } from "@/hooks/use-context";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

type ItemType = {
  id: number;
  name: string;
  icon: React.JSX.Element;
};
export const DrawerMenu: React.FC<{
  open: boolean;
  onClose: () => void;
  navItems: ItemType[];
  navigate: (url: string) => void;
}> = ({ open, onClose, navItems, navigate }) => {
  const { selectedPage, setSelectedPage } = useSelectedPageContext();
  const { current } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (open) {
      containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [location.pathname, open]);
  const handleSelect = (name: string) => {
    setSelectedPage(name);
  };

  return (
    <div
      className={`fixed  inset-0 z-50 transition-all duration-300 ${
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
          className="flex-1 px-4 pt-8 overflow-y-auto h-auto flex flex-col gap-10"
        >
          <h6
            className="font-extrabold text-lg font-ubuntu overflow-clip truncate whitespace-nowrap tracking-wide text-center w-full"
            style={{
              // boxShadow: "0px 3px 8.3px 0.7px rgba(163, 93, 255, 0.35)",
              backgroundColor:
                "linear-gradient(to right, #da8cff, #9a55ff) !important",
              color: "#b66dff",
            }}
          >
            {current === "ADMIN" ? "ADMIN PANEL" : "CONTROL PANEL"}
          </h6>
          <div className="flex flex-col gap-3">
            {navItems?.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  handleSelect(item.name);
                  onClose();
                }}
              >
                <NavigationLink name={item.name} selectedItem={selectedPage}>
                  {item.icon}
                </NavigationLink>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
};

interface Props {
  children: React.ReactNode;
  name: string;
  selectedItem?: string | null;
}

export const NavigationLink = ({ children, name, selectedItem }: Props) => {
  const navigate = useNavigate();
  return (
    <a
      onClick={() => navigate("/")}
      className={`${
        selectedItem === name
          ? "flex p-1 cursor-pointer stroke-[0.75]  stroke-neutral-400 place-items-center gap-2 bg-gray-900 transition-colors duration-100 py-2 px-8"
          : "flex p-1 rounded cursor-pointer stroke-[0.75] hover:bg-gray-900 py-2 stroke-neutral-400 place-items-center gap-2 hover:bg-gray-300/50 transition-colors duration-100 px-8"
      }`}
    >
      {children}
      <p className="text-[15px] !text-white overflow-clip truncate whitespace-nowrap tracking-wide font-normal font-ubuntu ">
        {name}
      </p>
    </a>
  );
};

export default NavigationLink;
