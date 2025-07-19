import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store"; // đường dẫn đến store.ts

export const useAppDispatch = () => useDispatch<AppDispatch>();
