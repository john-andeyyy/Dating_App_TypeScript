import { useMatchList } from "../context/MatchListContext";
import List from "../components/UserMatchList";

export default function MatchList() {
    const { matchesList, loading, removeMatch } = useMatchList();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-info-content">
                Loading matches...
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen  bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
            {/* bg-base-200 */}
            <h1 className="p-4 pb-2 text-xl font-bold text-base-content bg-base-300" >
                All current matches
            </h1>

            {/* //! List of matches or no matches found message */}
            <div className="grow overflow-y-auto p-4">
                {matchesList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {matchesList.map((match: {
                            id: string;
                            _id?: string;
                            name: string;
                            age: string | number;
                            bio: string;
                            img: string;
                        }) => (
                            <List
                                key={match._id ?? match.id}
                                id={match.id}
                                name={match.name}
                                age={Number(match.age)}
                                bio={match.bio}
                                img={match.img}
                                onRemoved={removeMatch}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-info-content">
                        <h2 className="text-3xl font-bold mb-4">No matches found</h2>
                        <p className="text-lg text-gray-100">Start to match</p>
                    </div>
                )}
            </div>

        </div>
    );
}
