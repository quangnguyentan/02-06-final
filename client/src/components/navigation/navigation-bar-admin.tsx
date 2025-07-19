import { motion, useAnimationControls, AnimatePresence } from "framer-motion";
import { useState, useEffect, JSX } from "react";
import NavigationLink from "./navigation-link";
import logo_v3 from "@/assets/user/logo-v3.png";
import ProjectNavigation from "./project-navigation";
import { useSelectedPageContext } from "@/hooks/use-context";
import { RootState } from "@/store";
import { useSelector } from "react-redux";

const containerVariants = {
  close: {
    width: "5rem",
    transition: { type: "spring", damping: 15, duration: 0.5 },
  },
  open: {
    width: "16rem",
    transition: { type: "spring", damping: 15, duration: 0.5 },
  },
};

const svgVariants = {
  open: { rotate: 360 },
  close: { rotate: 180 },
};

type ItemType = {
  id: number;
  name: string;
  icon: JSX.Element;
};

const NavigationBarAdmin = ({ items }: { items: ItemType[] }) => {
  const { current } = useSelector((state: RootState) => state.auth);
  const { selectedPage, setSelectedPage } = useSelectedPageContext();
  const [isOpen, setIsOpen] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const containerControls = useAnimationControls();
  const svgControls = useAnimationControls();

  useEffect(() => {
    if (isOpen) {
      containerControls.start("open");
      svgControls.start("open");
    } else {
      containerControls.start("close");
      svgControls.start("close");
    }
  }, [isOpen, containerControls, svgControls]);

  const handleOpenClose = () => {
    setIsOpen(!isOpen);
    setSelectedProject(null);
  };

  const handleSelect = (name: string) => {
    setSelectedPage(name);
  };

  return (
    <motion.nav
      variants={containerVariants}
      animate={containerControls}
      initial="close"
      className="dark:bg-gray-800 flex flex-col z-10 h-full py-4"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="flex flex-col gap-16">
          <div className="flex flex-row w-full justify-between place-items-center px-4">
            {/* <img
              src={logo_v3}
              alt="logo_v3"
              className={`${
                !isOpen ? "w-10 h-10 object-cover" : "w-12 h-12 object-cover"
              }`}
            /> */}
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
            {/* <button
              className="p-1 rounded-full flex"
              onClick={() => handleOpenClose()}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1}
                stroke="currentColor"
                className="w-8 h-8 stroke-white"
              >
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  variants={svgVariants}
                  animate={svgControls}
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </svg>
            </button> */}
          </div>
          <div className="flex flex-col gap-3">
            {items?.map((item, index) => (
              <button key={index} onClick={() => handleSelect(item.name)}>
                <NavigationLink name={item.name} selectedItem={selectedPage}>
                  {item.icon}
                </NavigationLink>
              </button>
            ))}
          </div>
        </div>
      </div>
      <AnimatePresence>
        {selectedProject && (
          <ProjectNavigation
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            isOpen={isOpen}
          />
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavigationBarAdmin;
