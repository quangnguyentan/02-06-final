import { ChatMessage } from "@/types/index.types";
import {
  PaperAirplaneIconSolid,
  UserIcon,
  UsersIconSolid,
  TvIconSolid,
} from "./Icon"; // Assuming UserIcon is a generic user avatar
import * as React from "react";

const mockMessages: ChatMessage[] = [
  {
    id: "1",
    user: "User123",
    message: "Go Giants!",
    timestamp: "10:32",
    userColor: "text-sky-400",
  },
  {
    id: "2",
    user: "PadresFan_No1",
    message: "Padres will win this for sure!!!",
    timestamp: "10:33",
    userColor: "text-green-400",
  },
  {
    id: "3",
    user: "SportsLover",
    message: "Great game so far.",
    timestamp: "10:35",
    userColor: "text-yellow-400",
  },
  {
    id: "4",
    user: "Anonymous",
    message: "Anyone know the score of the other game?",
    timestamp: "10:36",
    userColor: "text-purple-400",
  },
  {
    id: "5",
    user: "Admin",
    message: "Please keep the chat respectful. Thanks!",
    timestamp: "10:38",
    userColor: "text-red-500 font-semibold",
  },
];

const ChatPanel: React.FC<{ isChatVisible?: boolean }> = ({
  isChatVisible,
}) => {
  const [activeTab, setActiveTab] = React.useState<"general" | "match">(
    "general"
  );
  const [messages, setMessages] = React.useState<ChatMessage[]>(mockMessages);
  const [newMessage, setNewMessage] = React.useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    const msg: ChatMessage = {
      id: String(Date.now()),
      user: "CurrentUser", // Replace with actual user
      avatar: "https://picsum.photos/seed/currentUser/32/32",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      userColor: "text-orange-400",
    };
    setMessages((prev) => [...prev, msg]);
    setNewMessage("");
    // Auto scroll to bottom would be here
  };

  return (
    <div className="bg-slate-800 text-white rounded-lg shadow-xl flex flex-col h-full">
      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center space-x-1
            ${
              activeTab === "general"
                ? "bg-slate-700 text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:bg-slate-700/50"
            }`}
        >
          <UsersIconSolid className="w-4 h-4" />
          <span>Chung</span>
        </button>
        <button
          onClick={() => setActiveTab("match")}
          className={`flex-1 py-2 px-3 text-sm font-medium flex items-center justify-center space-x-1
            ${
              activeTab === "match"
                ? "bg-slate-700 text-yellow-400 border-b-2 border-yellow-400"
                : "text-gray-400 hover:bg-slate-700/50"
            }`}
        >
          <TvIconSolid className="w-4 h-4" />
          <span>Trận Đấu</span>
        </button>
      </div>
      <div className="w-full h-full">
        {!isChatVisible && (
          <div className="w-full h-full opacity-100 pointer-events-none touch-none absolute z-0">
            {/* Nội dung chat */}
          </div>
        )}
        {/* Message Area */}
        {activeTab === "match" ? (
          <div className="relative w-full h-full">
            <iframe
              src="https://www5.cbox.ws/box/?boxid=957607&boxtag=XAS4wp"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="yes"
              style={{
                border: "none",
                background: "#000",
                opacity: isChatVisible ? 1 : 0.01, // mờ khi ẩn
                pointerEvents: isChatVisible ? "auto" : "none", // chặn tương tác khi ẩn
                visibility: isChatVisible ? "visible" : "hidden", // Ẩn thật sự khỏi luồng sự kiện iOS
              }}
              className="transition-opacity duration-300 absolute inset-0"
            />
          </div>
        ) : (
          // <div className="relative w-full h-full">
          //   <iframe
          //     src="https://www5.cbox.ws/box/?boxid=949782&boxtag=pXQtQ5"
          //     width="100%"
          //     height="100%"
          //     frameBorder="0"
          //     scrolling="yes"
          //     style={{
          //       border: "none",
          //       background: "#000",
          //       opacity: isChatVisible ? 1 : 0.01, // mờ khi ẩn
          //       pointerEvents: isChatVisible ? "auto" : "none", // chặn tương tác khi ẩn
          //       visibility: isChatVisible ? "visible" : "hidden", // Ẩn thật sự khỏi luồng sự kiện iOS
          //     }}
          //     className="transition-opacity duration-300 absolute inset-0"
          //   />
          // </div>
          <div className="relative w-full h-full">
            <iframe
              src="https://www5.cbox.ws/box/?boxid=957607&boxtag=XAS4wp"
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="yes"
              style={{
                border: "none",
                background: "#000",
                opacity: isChatVisible ? 1 : 0.01, // mờ khi ẩn
                pointerEvents: isChatVisible ? "auto" : "none", // chặn tương tác khi ẩn
                visibility: isChatVisible ? "visible" : "hidden", // Ẩn thật sự khỏi luồng sự kiện iOS
              }}
              className="transition-opacity duration-300 absolute inset-0"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPanel;
