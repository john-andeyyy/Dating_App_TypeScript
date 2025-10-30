import { AiFillCheckCircle } from "react-icons/ai";
import { IoLocationSharp } from "react-icons/io5";
// import { BsCalendar3 } from "react-icons/bs";

interface CardProps {
    name: string;
    bio: string;
    image: string;
    age: number;
    longitude: string;
    latitude: string;
    currentLatitude: string;
    currentLongitude: string;
    gender: string;
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}


function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

export default function Card({
    name,
    bio,
    image,
    age,
    latitude,
    longitude,
    currentLatitude,
    currentLongitude,
    gender
}: CardProps) {
    const distance = getDistanceFromLatLonInKm(
        parseFloat(currentLatitude),
        parseFloat(currentLongitude),
        parseFloat(latitude),
        parseFloat(longitude)
    );

    return (
        <div className="relative w-70 max-w-sm sm:w-96 sm:max-w-md rounded-3xl overflow-hidden shadow-2xl border border-gray-200/50 hover:border-primary/30 transition-all duration-300 hover:shadow-primary/10 hover:scale-[1.02]">
            {/* Profile Image with Gradient Overlay */}
            <div className="relative h-80 sm:h-96 overflow-hidden">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out"
                />

                {/* Enhanced Multi-layer gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-600/40 to-purple-900/90" />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-transparent to-transparent" />



                {/* Verified Badge at top */}
                <div className="absolute top-4 right-4 bg-gradient-to-br from-white to-white/80 backdrop-blur-md rounded-full p-2.5 shadow-xl hover:scale-110 transition-transform duration-200 border border-white/50">
                    <AiFillCheckCircle className="text-blue-500" size={22} />
                </div>

                {/* Bottom Info Section */}
                <div className="absolute bottom-0 left-0 right-0 p-5 text-white bg-gradient-to-t from-black/80 via-black/60 to-transparent">
                    {/* Name and age */}
                    <div className="mb-3">
                        <h2 className="text-2xl sm:text-2xl font-bold capitalize drop-shadow-2xl mb-2 truncate tracking-tight">
                            {name}
                        </h2>
                        <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm opacity-95">
                            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                                {/* <BsCalendar3 className="text-primary" size={16} /> */}
                                <span className="font-medium">{age} yrs old</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                                <IoLocationSharp className="text-red-400" size={16} />
                                <span className="font-medium">{distance.toFixed(1)} km</span>
                            </span>
                            <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/20">
                                {/* <BsCalendar3 className="text-primary" size={16} /> */}
                                <span className="font-medium">{gender} </span>
                            </span>
                        </div>
                    </div>

                    {/* Bio preview - scrollable */}
                    <div className="bg-black/30 backdrop-blur-lg rounded-xl p-3 border border-white/20 shadow-inner max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-white/40 scrollbar-track-transparent hover:scrollbar-thumb-white/60 transition-colors">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-100">
                            {bio || "No bio available"}
                        </p>
                    </div>
                </div>

                {/* Decorative corner accents */}
                <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-primary/30 to-transparent rounded-br-full blur-xl" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-bl-full blur-xl" />
            </div>
        </div>
    );
}
