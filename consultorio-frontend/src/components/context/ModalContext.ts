import { createContext } from "react";
import type { ModalContextType } from "../../types/Modal";

export const ModalContext = createContext<ModalContextType | null>(null);
