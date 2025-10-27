import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { showToast } from "./ToastNotif";

const Baseurl = import.meta.env.VITE_BASEURL;

interface ListProps {
    id: string;
    name: string;
    age: number;
    bio: string;
    img: string;
    onRemoved?: (id: string) => void;
}

export default function List({ id, name, age, bio, img, onRemoved }: ListProps) {
    const { user } = useAuth();
    const userId: string = user?._id || "";

    const handleRemoveClick = async () => {
        try {
            const res = await axios.put(`${Baseurl}/Matching/unMatch`, {
                Userid: userId,
                MatchingId: id,
            });
            console.log("Remove response:", res.data);

            if (onRemoved) onRemoved(id);

            showToast("warn", "Removed", { position: "top-center" });
        } catch (err) {
            console.error("Error removing match:", err);
            showToast("error", "Failed to remove match");
        }
    };

    return (
        <div className="rounded-lg shadow-md p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:shadow-lg transition bg-base-100">
            <img
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-md object-cover"
                src={img}
                alt={`${name}'s profile`}
            />

            <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 truncate">
                    <h2 className="text-sm sm:text-lg font-semibold text-base-content truncate">
                        {name}
                    </h2>
                    <span className="text-xs sm:text-sm text-info-content shrink-0">
                        {age} yrs old
                    </span>
                </div>
                <p className="text-xs sm:text-sm text-info-content mt-1 line-clamp-2 sm:line-clamp-none">
                    {bio}
                </p>
            </div>

            <div className="flex-shrink-0">
                <button
                    className="btn btn-xs sm:btn-sm btn-error text-white flex items-center justify-center"
                    onClick={handleRemoveClick}
                >
                    <img
                        src="../../delete.png"
                        alt="Remove"
                        className="w-3 h-3 sm:w-4 sm:h-4"
                    />
                </button>
            </div>
        </div>
    );
}
