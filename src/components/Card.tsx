import { AiFillCheckCircle } from "react-icons/ai";

interface CardProps {
    name: string;
    bio: string;
    image: string;
    bgColor: string;
    age: number;
    isVerified?: boolean;
}
// A card component to display user profile information
function Card({ name, bio, image, age, isVerified }: CardProps) {
    return (
        <div className="indicator">
            <div
                className="w-72 sm:w-[90vw] sm:max-w-sm rounded-2xl overflow-hidden shadow-lg 
        bg-base-100 border-2 border-base-300 text-black min-h-[28rem] hover:scale-105 
        transition-transform duration-200 flex flex-col "
            >
                <figure className="relative">
                    <img src={image} alt={name} className="w-full h-48 sm:h-60 object-cover" />
                    <div className="absolute inset-0  from-black/40 to-transparent"></div>

                    {isVerified && (
                        <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-lg">
                            <AiFillCheckCircle className="text-blue-500 h-6 w-6" />
                        </div>
                    )}
                </figure>

                <div className="p-4 flex flex-col gap-2 bg-base-100 text-base-content flex-1">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg sm:text-md font-bold capitalize text-accent">{name}</h2>
                        <p className="text-xs text-info-content sm:text-base">{age} yrs old</p>
                    </div>

                    <p className="font-semibold text-sm text-gray-500">Bio:</p>
                    <div className="border border-base-300 rounded-sm p-2 flex-1 overflow-hidden flex flex-col">
                        <p className="text-sm text-info-content sm:text-base wrap-break-words overflow-y-auto">
                            {bio}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Card;
