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
            console.log("Remove response:", res.data);

            if (onRemoved) onRemoved(id);

            showToast("warn", "Removed", { position: "top-center" });
        } catch (err) {
            console.error("Error removing match:", err);
            showToast("error", "Failed to remove match");
        }
    };

    return (
        <div className="card w-70 sm:w-80 md:w-96 bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border border-base-300">
            {/* Image Section */}
            <figure className="relative">
                <img
                    src={
                        img ||
                        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                    }
                    alt={`${name}'s profile`}
                    className=" h-50  object-cover"
                />
                <button
                    onClick={handleRemoveClick}
                    className="absolute top-2 right-2 btn bg-red-500 btn-sm text-white"
                >
                    Unmatch
                </button>
            </figure>

            {/* Info Section */}
            <div className="card-body p-4">
                <h2 className="card-title text-lg font-semibold text-base-content">
                    {name}
                </h2>
                <p className="text-sm text-base-content/70 font-normal">
                    &nbsp;• {age} yrs old
                </p>
                <p className="text-sm text-base-content/70 border rounded-xl p-2 max-h-30 sm:max-h-20 min-h-20 overflow-y-auto scrollbar-thin 
                scrollbar-thumb-accent/50 scrollbar-track-transparent">{bio}</p>
            </div>
        </div>
    );
}
