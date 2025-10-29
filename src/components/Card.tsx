import { AiFillCheckCircle } from "react-icons/ai";

interface CardProps {
    name: string;
    bio: string;
    image: string;
    age: number;
    longitude: string;
    latitude: string;
    currentLatitude: string;
    currentLongitude: string;
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
}: CardProps) {
    const distance = getDistanceFromLatLonInKm(
        parseFloat(currentLatitude),
        parseFloat(currentLongitude),
        parseFloat(latitude),
        parseFloat(longitude)
    );

    return (
        <div className="relative w-70 max-w-sm sm:w-96 sm:max-w-md rounded-3xl overflow-hidden shadow-2xl bg-base-100/90 border border-base-300">
            <figure className="relative h-72 sm:h-80">
                <img
                    src={image}
                    alt={name}
                    className="w-full h-full object-cover brightness-[0.9]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white flex justify-between items-end">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-1 capitalize drop-shadow-md">
                            {name}
                            <AiFillCheckCircle className="text-blue-400" />
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-300">
                            {age} yrs • {distance.toFixed(1)} km away
                        </p>
                    </div>
                </div>
            </figure>

            <div className="p-3 sm:p-4 flex flex-col gap-2 bg-base-100/90">
                <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Bio
                </p>
                <div className="relative border border-base-300 rounded-xl p-2 max-h-28 sm:max-h-32 min-h-16 overflow-y-auto scrollbar-thin scrollbar-thumb-accent/50 scrollbar-track-transparent">
                    <p className="text-[13px] sm:text-[15px] leading-relaxed text-base-content whitespace-pre-wrap">
                        {bio || "No bio available."}
                    </p>
                </div>
            </div>
        </div>
    );
}
