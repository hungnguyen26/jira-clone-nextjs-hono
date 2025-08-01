"use client"

import { useQueryState, parseAsBoolean } from "nuqs"
import { TaskStatus } from "../types";

export const useCreateTaskModal = ()=>{
    const [isOpen, setIsOpen] = useQueryState(
        "create-task",
        parseAsBoolean.withDefault(false).withOptions({clearOnDefault: true})
    );

    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return {
        isOpen,
        open,
        close,
        setIsOpen
    }
}