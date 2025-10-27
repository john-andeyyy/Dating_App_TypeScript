import { toast, Zoom, Bounce } from "react-toastify";
import type { ToastOptions } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type ToastType = "success" | "error" | "info" | "warn";

const toastTypes = {
    success: toast.success,
    error: toast.error,
    info: toast.info,
    warn: toast.warn,
} as const;

const defaultOptions: ToastOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: false,
    theme: "light",
    transition: Zoom,
};

export const showToast = (
    type: ToastType = "success",
    message: string,
    options?: ToastOptions
): void => {
    const toastFunc = toastTypes[type] || toast.success;
    toastFunc(message, { ...defaultOptions, ...options });
};
