import toast, { ToastPosition } from "react-hot-toast";

interface ToastOptions {
  position?: ToastPosition;
  duration?: number;
}

const defaultStyle = {
  padding: "0.75rem",
  minWidth: "200px",
};

export const moduleToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, {
      position: options?.position || "top-right",
      duration: options?.duration || 5000,
      className:
        "bg-background text-foreground border rounded-md border-success",
      style: defaultStyle,
      iconTheme: {
        primary: "#22c55e",
        secondary: "#ffffff",
      },
    }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, {
      position: options?.position || "top-right",
      duration: options?.duration || 5000,
      className:
        "bg-background text-foreground border rounded-md border-destructive",
      style: defaultStyle,
      iconTheme: {
        primary: "#ef4444",
        secondary: "#ffffff",
      },
    }),
};
