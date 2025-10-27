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

    const userId = user?._id as string | undefined;
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // scroll to bottom when messages change
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "auto" });
        }
    }, [messages, selectedMatch]);

    // socket connection
    useEffect(() => {
        if (!userId) return;

        const newSocket = io(Baseurl, { transports: ["websocket"] });
        setSocket(newSocket);

        newSocket.on("receive_message", (data: any) => {
            const { senderId, receiverId, message, createdAt } = data;
            const otherId = senderId === userId ? receiverId : senderId;

            setMessages((prev) => ({
                ...prev,
                [otherId]: [
                    ...(prev[otherId] || []),
                    {
                        senderId,
                        receiverId,
                        text: message,
                        date: new Date(createdAt).toLocaleDateString(),
                        time: new Date(createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        }),
                    },
                ],
            }));
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

    if (!userId || !userdata) {
        return (
            <div className="flex items-center justify-center h-screen">Loading...</div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen">
            {/* Left Panel */}
            <div className="w-full lg:w-1/3 border-r border-dark flex flex-col bg-base-200">
                <h2 className="p-4 text-xl font-bold border-b border-dark text-base-content">
                    Matches
                </h2>
                <div className="flex-grow overflow-y-auto">
                    <ul className="bg-base-300">
                        {matchedList.map((match) => (
                            <li
                                key={match._id}
                                onClick={() => handleSelectMatch(match)}
                                className={`cursor-pointer flex items-center gap-3 px-4 py-3 hover:bg-base-100/20 transition-colors rounded 
                  ${selectedMatch?._id === match._id
                                        ? "bg-base-100/20 font-semibold text-white"
                                        : ""
                                    }`}
                            >
                                <img
                                    src={
                                        getImageSrc(match.image) ||
                                        "https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small_2x/default-avatar-icon-of-social-media-user-vector.jpg"
                                    }
                                    alt={match.name}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-dark"
                                />
                                <div className="flex flex-col flex-1">
                                    <span className="text-base-content/80">{match.name}</span>
                                    <span className="text-xs truncate max-w-[160px]">
                                        {match.lastMessage || "No messages yet"}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex flex-col flex-1 p-4 lg:p-6 bg-base-200">
                {selectedMatch ? (
                    <>
                        <h3 className="text-sm lg:text-2xl font-bold mb-4">
                            Messages with{" "}
                            <span className="text-base-content">{selectedMatch.name}</span>
                        </h3>

                        <div className="flex-1 overflow-y-auto mb-4 p-4 bg-base-100/30 rounded-lg shadow-inner flex flex-col gap-2 max-h-[90vh] lg:h-[80vh]">
                            {(messages[selectedMatch._id] || []).map((msg, i) => {
                                const isSent = msg.senderId === userdata._id;
                                return (
                                    <div
                                        key={i}
                                        className={`px-4 py-2 rounded-xl shadow-sm max-w-56 lg:max-w-3xl ${isSent
                                            ? "bg-base-300 self-end"
                                            : "bg-base-300 self-start"
                                            }`}
                                    >
                                        <div className="text-sm break-words">{msg.text}</div>
                                        <div className="text-xs text-base-content mt-1 text-right">
                                            {msg.date} • {msg.time}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="flex gap-2">
                            <textarea
                                rows={2}
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                className="flex-grow resize-none p-2 border rounded focus:ring-2 focus:ring-accent bg-base-200"
                                placeholder="Type your message..."
                            />
                            <button
                                onClick={handleSend}
                                className="px-10 bg-accent font-semibold hover:bg-accent/90 text-white"
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full italic">
                        Select a match to view messages
                    </div>
                )}
            </div>
        </div>
    );
}
