import type { ReactNode } from "react";

interface GlobalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    actions?: ReactNode;
}

// A reusable modal component
export default function GlobalModal({
    isOpen,
    onClose,
    title,
    children,
    actions,
}: GlobalModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50 bg-black/50  text-base-content"
            onClick={onClose}
        >
            <div
                className="bg-base-200 p-6 rounded-xl shadow-lg w-80"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {title && (
                    <h2 className="text-xl font-bold mb-4">{title}</h2>
                )}
                <div className="mb-6">{children}</div>
                {actions && <div className="flex justify-end gap-2 ">{actions}</div>}
            </div>
        </div>
    );
}
