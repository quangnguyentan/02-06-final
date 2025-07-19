import { useNavigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
  name: string;
  selectedItem?: string | null;
}

const NavigationLink = ({ children, name, selectedItem }: Props) => {
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
