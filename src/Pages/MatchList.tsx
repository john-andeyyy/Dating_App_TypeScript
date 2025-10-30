import { useMatchList } from "../context/MatchListContext";
import List from "../components/UserMatchList";
import { HiOutlineUserGroup } from "react-icons/hi";

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
        <div className="flex flex-col h-screen bg-base-200">
            <header className="p-6 pb-3  shadow flex items-center gap-2">
                <HiOutlineUserGroup className="text-3xl mr-2 " />
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight drop-shadow-md ">
                    Your Matches
                </h1>
            </header>

            <div className="grow overflow-y-auto p-4 max-w-6xl mx-auto w-full">
                {matchesList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matchesList.map((match) => (
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
                    <div className="flex flex-col items-center justify-center h-[75vh] text-info-content">
                        <h2 className="text-2xl font-semibold mb-2 text-base-content">No matches found</h2>
                        <p className="text-lg text-base-content/70">Start matching with new people!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
