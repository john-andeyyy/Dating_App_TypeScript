import { io, Socket } from "socket.io-client";
import { showToast } from "../components/ToastNotif";

interface NotificationData {
  message: string;
  [key: string]: any;
}

export const Baseurl = import.meta.env.VITE_BASEURL as string;

let socket: Socket | null = null;

export const initSocket = (userId: string): Socket => {
  if (socket) return socket;

  socket = io(Baseurl, {
    transports: ["websocket"],
    withCredentials: true,
  });

  socket.on("connect", () => {
    if (userId) {
      socket!.emit("join", userId);
      // console.log(`Joined room: ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    // console.log("❌ Socket disconnected");
  });

  socket.on("New_Notif", (data: NotificationData) => {
    const MsgData = data.message;
    showToast("success", MsgData);
  });

  return socket;
};

export default socket;
