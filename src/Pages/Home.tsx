import { useState, useRef } from "react";
import Card from "../components/Card";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../components/ToastNotif";
import { useRandomProvider } from "../context/RandomListContext";
import FilterModal from "../components/Modals/FilterModal";
import { FaFilter } from "react-icons/fa";

interface Position {
    x: number;
    y: number;
}

interface OverlayLabelProps {
    text: string;
    color?: "green" | "red";
    opacity?: number;
    rotate?: number;
    position?: "left" | "right";
}

interface FullScreenMessageProps {
    title: string;
    subtitle: string;
    onRefresh: () => void;

}

export default function Home() {
    const { user } = useAuth();
    const { profiles, isEmpty, loading, ageFilter, updateAgeFilter, removeProfile, radius, updateRadius, refresh, Update_InterestedIn, useAgeFilter, toggleUseAgeFilter, interestedIn } = useRandomProvider();


    const userId = user?._id;
    const Baseurl = import.meta.env.VITE_BASEURL as string;
    const accessToken = localStorage.getItem("AccessToken") || "";
    const isLoading = loading;

    const [currentIndex] = useState(0);
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [showModal, setShowModal] = useState(false);


    const startPos = useRef<Position>({ x: 0, y: 0 });

    const handleToggleAgeFilter = (value: boolean) => {
        toggleUseAgeFilter(value);
    };

    const handleStart = (x: number, y: number) => {
        startPos.current = { x, y };
        setIsDragging(true);
    };

    const handleMove = (x: number, y: number) => {
        if (!isDragging || isLeaving) return;
        setPosition({ x: x - startPos.current.x, y: y - startPos.current.y });
    };

    const handleEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);
        if (position.x > 120) return swipe("right");
        if (position.x < -120) return swipe("left");
        setPosition({ x: 0, y: 0 });
    };

    const swipe = async (direction: "left" | "right") => {
        const profile = profiles[currentIndex];
        if (!profile) return;
        const isLike = direction === "right";

        try {

            const res = await axios.post(
                `${Baseurl}/Matching/Like_unlike`,
                {
                    Userid: userId,
                    MatchingId: profile.id,
                    isLike,
                },
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            showToast(
                isLike ? "info" : "warn",
                isLike ? `You liked ${profile.name}!` : `You skipped ${profile.name}.`,
                { position: "top-center" }
            );

            if (res.data.match) {
                showToast("success", `It's a match with ${profile.name}!`, { position: "top-center" });
            }
        } catch (err: any) {
            console.error(err);
            showToast("error", "Error sending swipe", { position: "top-center" });
        }

        setIsLeaving(true);
        setPosition({
            x: isLike ? window.innerWidth : -window.innerWidth,
            y: position.y,
        });

        setTimeout(() => {
            // Remove profile from global context
            removeProfile(profile.id);
            // Reset state
            setPosition({ x: 0, y: 0 });
            setIsLeaving(false);
        }, 300);
    };


    const likeOpacity = position.x > 0 ? Math.min(position.x / 120, 1) : 0;
    const nopeOpacity = position.x < 0 ? Math.min(-position.x / 120, 1) : 0;
    const blurEffect = Math.min(Math.abs(position.x) / 50, 5);

    return (
        <div className="relative min-h-screen flex flex-col items-center px-4 ">

            <div
                className="absolute top-6 right-6 z-50 cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/40 transition text-gray-800"
                onClick={() => setShowModal(true)}
                title="Settings"
            >
                <FaFilter className="text-base-content" size={20} />
            </div>

            {isLoading && (
                <FullScreenMessage title="Loading..." subtitle="Please wait while we find matches for you" onRefresh={refresh} />
            )}
            {!isLoading && (!profiles.length || currentIndex >= profiles.length) && (
                <FullScreenMessage title="No available profiles" subtitle="Check back later for more people to meet!" onRefresh={refresh} />
            )}
            {!isLoading && isEmpty && (
                <FullScreenMessage title="No more profiles" subtitle="Check back later for more people to meet!" onRefresh={refresh} />
            )}

            <div className="absolute top-10 left-1/2 -translate-x-1/2 text-center z-20">
                <p className="text-lg font-semibold text-primary animate-pulse bg-base-100/70 px-4 py-2 rounded-full shadow-lg">
                    Matching...
                </p>
            </div>

            {!isLoading &&
                profiles.length > 0 &&
                currentIndex < profiles.length &&
                !isEmpty && (
                    <div
                        className="flex items-center justify-center min-h-screen px-4 relative"
                        onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                        onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
                        onTouchEnd={handleEnd}
                    >
                        {profiles
                            .slice(currentIndex, currentIndex + 3)
                            .reverse()
                            .map((profile, i, arr) => {
                                const isTop = i === arr.length - 1;
                                return (
                                    <div
                                        key={profile.id}
                                        className="absolute w-full h-full flex items-center justify-center rounded-xl"
                                        style={{
                                            transform: isTop
                                                ? `translate(${position.x}px, ${position.y}px) rotate(${position.x / 20}deg)`
                                                : `scale(${1 - i * 0.05}) translateY(${i * 15}px)`,
                                            transition:
                                                isTop && (isDragging || isLeaving)
                                                    ? "none"
                                                    : "transform 0.3s ease",
                                            zIndex: i,
                                        }}
                                    >
                                        {isTop && (
                                            <>
                                                <OverlayLabel
                                                    text="LIKE"
                                                    color="green"
                                                    opacity={likeOpacity}
                                                    rotate={-15}
                                                    position="left"
                                                />
                                                <OverlayLabel
                                                    text="SKIP"
                                                    color="red"
                                                    opacity={nopeOpacity}
                                                    rotate={15}
                                                    position="right"
                                                />
                                            </>
                                        )}

                                        {/* //! Card of showing of a random people */}
                                        <div style={{ filter: isTop ? `blur(${blurEffect}px)` : "none" }}>
                                            <Card
                                                name={profile.name}
                                                bio={profile.bio}
                                                image={profile.image}
                                                age={profile.age}
                                                latitude={profile.latitude}
                                                longitude={profile.longitude}
                                                currentLatitude={user?.Latitude || "0"}
                                                currentLongitude={user?.Longitude || "0"}
                                                gender={profile.gender}
                                            />
                                        </div>

                                    </div>
                                );
                            })}
                    </div>
                )}
            {/* // Modal for changing age range and radius */}
            <FilterModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                minAge={ageFilter.min}
                maxAge={ageFilter.max}
                radius={radius}
                useAgeFilter={useAgeFilter}
                onToggleUseAgeFilter={handleToggleAgeFilter}
                onRadiusChange={updateRadius}
                interestedIn={interestedIn}
                onApply={(min, max, radiusValue, InterestGender) => {
                    updateAgeFilter(min, max);
                    updateRadius(radiusValue);
                    setShowModal(false);
                    Update_InterestedIn(InterestGender);
                }}
            />



        </div>
    );
}

function FullScreenMessage({ title, subtitle, onRefresh }: FullScreenMessageProps) {
    return (
        <div className="flex items-center justify-center h-screen flex-col px-4 text-center text-gray-200">
            <h2 className="text-3xl font-bold mb-4 text-info-content">{title}</h2>
            <p className="text-lg text-gray-500">{subtitle}</p>
            {title != "Loading..." && (
                <button
                    className="btn btn-active btn-accent mt-5"
                    onClick={() => onRefresh()}
                >
                    Refresh
                </button>
            )}
            
        </div>
    );
}

function OverlayLabel({
    text,
    color = "green",
    opacity = 1,
    rotate = 0,
    position = "left",
}: OverlayLabelProps) {
    const bgColor = color === "green" ? "bg-green-500/20" : "bg-red-500/20";
    const textColor = color === "green" ? "text-green-600" : "text-red-600";
    // const positionClass = position === "left" ? "left-36" : "right-36";
    const positionClass = position === "left" ? "left-10 sm:left-36" : "right-4 sm:right-36";
    const topClass = "top-40 sm:top-36";

    return (

        <div
            className={`absolute ${topClass} ${positionClass} z-50 font-bold text-2xl px-4 sm:px-6 py-2 sm:py-3 rounded-xl shadow-md backdrop-blur-sm ${bgColor} ${textColor} border-2 border-current flex items-center justify-center`}
            style={{
                opacity,
                transform: `rotate(${rotate}deg)`,
                pointerEvents: "none",
            }}
        >
            {text}
        </div >

    );
}

