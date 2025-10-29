import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext";

interface Match {
    _id: string;
    name: string;
    image?: { data?: ArrayBuffer };
    lastMessage?: string;
}

interface MessageItem {
    senderId: string;
    receiverId: string;
    text: string;
    date: string;
    time: string;
}

export default function Message() {
    const { user, userdata } = useAuth();
    const Baseurl = import.meta.env.VITE_BASEURL as string;
    const accessToken = localStorage.getItem("AccessToken");

    const [socket, setSocket] = useState<Socket | null>(null);
    const [matchedList, setMatchedList] = useState<Match[]>([]);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [messages, setMessages] = useState<Record<string, MessageItem[]>>({});
    const [inputText, setInputText] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const userId = user?._id as string | undefined;
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
    }, [messages, selectedMatch]);

    // socket setup
    useEffect(() => {
        if (!userId) return;
        const newSocket = io(Baseurl, { transports: ["websocket"] });
        setSocket(newSocket);

        const formatDateTime = (dateString: string) => {
            const date = new Date(dateString);
            const options: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            };
            // Example output: "October 28, 2025 at 08:48 PM"
            return date.toLocaleString("en-US", options);
        };

        newSocket.on("receive_message", (data: any) => {
            const { senderId, receiverId, message, createdAt } = data;

            //  Ignore if it's your own message (already handled locally)
            if (senderId === userId) return;

            const otherId = receiverId === userId ? senderId : receiverId;

            const formatted = formatDateTime(createdAt);
            const [datePart, timePart] = formatted.split(" at ");

            setMessages((prev) => ({
                ...prev,
                [otherId]: [
                    ...(prev[otherId] || []),
                    {
                        senderId,
                        receiverId,
                        text: message,
                        date: datePart,
                        time: timePart,
                    },
                ],
                
            }));

            // Update last message preview
            setMatchedList((prev) => {
                const updated = prev.map((m) =>
                    m._id === otherId ? { ...m, lastMessage: message } : m
                );

                const target = updated.find((m) => m._id === otherId);
                const others = updated.filter((m) => m._id !== otherId);
                return target ? [target, ...others] : updated;
            });


            
        });

        return () => {
            newSocket.disconnect();
        };
    }, [userId, Baseurl]);

    // matched list
    useEffect(() => {
        const fetchMatchedList = async () => {
            if (!userId) return;
            try {
                const res = await axios.get(`${Baseurl}/Msg/MatchedListMsg/${userId}`, {
                    headers: { Authorization: `Bearer ${accessToken}` },
                });
                setMatchedList(res.data?.data || []);
            } catch (err) {
                console.error("Error fetching matched list:", err);
            }
        };
        fetchMatchedList();
    }, [userId, Baseurl, accessToken]);

    const handleSelectMatch = async (match: Match) => {
        setSelectedMatch(match);
        socket?.emit("join_convo", { senderId: userId, receiverId: match._id });

        try {
            const res = await axios.get(
                `${Baseurl}/Msg/MessageList/${userId}/${match._id}`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );

            const conversation = res.data?.data || [];
            setMessages((prev) => ({
                ...prev,
                [match._id]: conversation.map((m: any) => ({
                    senderId: m.senderID,
                    receiverId: m.receiverId,
                    text: m.message,
                    date: m.date,
                    time: m.time,
                })),
            }));

            // open modal on mobile
            if (window.innerWidth < 1024) setIsModalOpen(true);
        } catch (err) {
            console.error("Error fetching messages:", err);
        }
    };

    const handleSend = async () => {
        if (!inputText.trim() || !selectedMatch || !socket) return;

        const newMessage = {
            senderId: userId,
            receiverId: selectedMatch._id,
            message: inputText.trim(),
        };

        const now = new Date();
        const formatted = now.toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
        const [datePart, timePart] = formatted.split(" at ");

        // show immediately in chat
        setMessages((prev) => ({
            ...prev,
            [selectedMatch._id]: [
                ...(prev[selectedMatch._id] || []),
                {
                    senderId: userId!,
                    receiverId: selectedMatch._id,
                    text: newMessage.message,
                    date: datePart,
                    time: timePart,
                },
            ],
        }));

        setMatchedList((prev) => {
            const updated = prev.map((m) =>
                m._id === selectedMatch._id
                    ? { ...m, lastMessage: newMessage.message }
                    : m
            );

            const target = updated.find((m) => m._id === selectedMatch._id);
            const others = updated.filter((m) => m._id !== selectedMatch._id);
            return target ? [target, ...others] : updated;
        });
        setInputText("");

        try {
            await axios.post(`${Baseurl}/Msg/Send`, newMessage, {
                headers: { Authorization: `Bearer ${accessToken}` },
            });
        } catch (err) {
            console.error("Error saving message:", err);
        }
    };


    const getImageSrc = (imageBuffer?: { data?: ArrayBuffer }) => {
        if (!imageBuffer?.data) return null;
        const byteArray = new Uint8Array(imageBuffer.data);
        const blob = new Blob([byteArray], { type: "image/png" });
        return URL.createObjectURL(blob);
    };

    const ChatView = (
        <div className="flex flex-col flex-1 h-full bg-base-100 p-4">
            {selectedMatch ? (
                <>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <img
                                src={
                                    getImageSrc(selectedMatch.image) ||
                                    "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                                }
                                alt={selectedMatch.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <h3 className="font-semibold text-lg">{selectedMatch.name}</h3>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="lg:hidden text-sm px-3 py-1 bg-accent text-white rounded-md"
                        >
                            Close
                        </button>
                    </div>

                    <div className="flex flex-col flex-1 overflow-y-auto mb-4 space-y-2 bg-base-200 p-3 rounded-lg shadow-inner">
                        {(messages[selectedMatch._id] || []).map((msg, i) => {
                            const isSent = msg.senderId === userdata._id;
                            return (
                                <div
                                    key={i}
                                    className={`px-4 py-2 rounded-xl shadow-sm max-w-[80%] md:max-w-[70%] wrap-break-words ${isSent
                                        ? "bg-accent text-white self-end"
                                        : "bg-base-300 text-base-content self-start"
                                        }`}
                                >
                                    <div className="text-sm">{msg.text}</div>
                                    <div className="text-xs mt-1 text-right opacity-70">
                                        {msg.date} • {msg.time}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="flex gap-2">
                        <textarea
                            rows={1}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="flex-grow resize-none p-2 border rounded-lg focus:ring-2 focus:ring-accent bg-base-100 h-20"
                            placeholder="Type your message..."
                        />
                        <button
                            onClick={handleSend}
                            className="px-4 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90"
                        >
                            Send
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-base-content/60 italic">
                    Select a match to start chatting
                </div>
            )}
        </div>
    );


    return (
        <div className="flex flex-col lg:flex-row h-screen bg-base-200">
            {/* Left Panel (MatchedList) */}
            <div className="w-full lg:w-1/3 border-r border-base-300 flex flex-col">
                <h2 className="p-4 text-lg md:text-xl font-bold border-b border-base-300 bg-base-200">
                    Matches
                </h2>

                {/* USER LIST */}
                <div className="flex-grow overflow-y-auto p-3 space-y-2">
                    {matchedList.length > 0 ? (
                        matchedList.map((match) => (
                            <div
                                key={match._id}
                                onClick={() => handleSelectMatch(match)}
                                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all bg-base-300 ${selectedMatch?._id === match._id
                                    ? "bg-accent/30 ring-2 ring-accent"
                                    : "hover:bg-base-100"
                                    }`}
                            >
                                <img
                                    src={
                                        getImageSrc(match.image) ||
                                        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                                    }
                                    alt={match.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                                />
                                <div className="flex flex-col flex-1">
                                    <span className="font-semibold text-sm md:text-base truncate">
                                        {match.name}
                                    </span>
                                    <span className="text-xs text-base-content/60 truncate">
                                        {match.lastMessage
                                            ? match.lastMessage.length > 10
                                                ? match.lastMessage.slice(0, 10) + "..."
                                                : match.lastMessage
                                            : "No messages yet"}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10">
                            <div className="flex flex-col items-center gap-3 bg-base-200 rounded-xl p-6 shadow-md border border-base-300">

                                <span className="text-lg font-semibold text-base-content/70">
                                    Start matching!
                                </span>
                                <span className="text-sm text-base-content/50 text-center">
                                    Browse profiles and find your next connection.
                                </span>
                            </div>
                        </div>

                    )}
                </div>

            </div>

            {/* Right Panel (Desktop only) */}
            <div className="hidden lg:flex flex-1">{ChatView}</div>

            {/* Modal for Mobile */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 lg:hidden ">
                    <div className="bg-base-100 w-full h-full sm:w-[95%] sm:h-[90%] rounded-none sm:rounded-lg overflow-hidden flex flex-col">
                        {ChatView}
                    </div>
                </div>
            )}
        </div>
    );
}
