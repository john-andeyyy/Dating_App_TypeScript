import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { showToast } from "./ToastNotif";
import { FiUserX } from "react-icons/fi";

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
    const accessToken = localStorage.getItem("AccessToken");

    //! Function to handle removing a match
    const handleRemoveClick = async () => {
        try {
            const res = await axios.put(`${Baseurl}/Matching/unMatch`, {
                Userid: userId,
                MatchingId: id,
            }, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
           // console.log("Remove response:", res.data);

            if (onRemoved) onRemoved(id);

            showToast("warn", "Removed", { position: "top-center" });
        } catch (err) {
            console.error("Error removing match:", err);
            showToast("error", "Failed to remove match");
        }
    };

    return (
        <div className="card w-full max-w-xs bg-base-100 shadow-lg border border-base-300 rounded-3xl hover:ring-2 hover:ring-accent/40 transition-all duration-300 mx-auto group ">
            <figure className="relative pt-6">
                <img
                    src={img || "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"}
                    alt={`${name}'s profile`}
                    className="w-28 h-28 rounded-full object-cover shadow-lg border-4 border-base-200 mx-auto group-hover:scale-105 transition-transform duration-300"
                />
                <button
                    onClick={handleRemoveClick}
                    className="absolute top-4 right-4 btn btn-circle bg-red-500/90 hover:bg-red-600 text-white shadow transition-all text-xl p-0 border-none z-10"
                    title="Unmatch"
                >
                    <FiUserX />
                </button>
            </figure>
            <div className="card-body p-4 pb-5 text-center">
                <h2 className="card-title text-lg font-semibold text-base-content mx-auto mb-1">
                    {name}, <span className="font-normal text-base-content/70">{age}</span>
                </h2>
                <p className="text-sm text-left text-base-content/80 mb-2 border rounded-xl p-2 min-h-[48px] max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/40 scrollbar-track-transparent">
                    {bio}
                </p>
            </div>
        </div>
    );
}
