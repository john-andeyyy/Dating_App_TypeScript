import { useMatchList } from "../context/MatchListContext";
import List from "../components/List";

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
            <h1 className="p-4 pb-2 text-xl font-bold text-base-content">
                All current matches
            </h1>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {matchesList.length > 0 ? (
                    matchesList.map((match: {
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
                            age={Number(match.age)} bio={match.bio}
                            img={match.img}
                            onRemoved={removeMatch}
                        />
                    ))
                ) : (
                    <div className="flex items-center justify-center h-full text-info-content">
                        No matches found
                    </div>
                )}
            </div>
        </div>
    );
}
