"use client";

import { useEffect, useRef, useState } from "react";
import Picker from "emoji-picker-react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string | null;
    email: string;
}

interface Message {
    id: string;
    content: string | null;
    fileUrl: string | null;
    createdAt: string;
    user: User;
}

export default function ChatPage() {
    const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
    const [input, setInput] = useState("");
    const [showEmoji, setShowEmoji] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const router = useRouter();

    const handleLogout = () => {
        router.push("/login");
    };

    useEffect(() => {
        fetch("/api/rooms")
            .then((res) => res.json())
            .then(setRooms);
    }, []);

    useEffect(() => {
        if (!currentRoom) return;
        const ws = new WebSocket(`ws://localhost:4001?room=${currentRoom}`);
        wsRef.current = ws;

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type === "init") setMessages(data.messages);
            if (data.type === "message") setMessages((prev) => [...prev, data.message]);
            if (data.type === "users") setOnlineUsers(data.users);
        };

        return () => ws.close();
    }, [currentRoom]);

    const sendMessage = () => {
        if (!wsRef.current || !input.trim()) return;
        wsRef.current.send(JSON.stringify({ type: "message", content: input }));
        setInput("");
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (wsRef.current) {
            wsRef.current.send(
                JSON.stringify({ type: "message", fileUrl: data.url })
            );
        }
    };

    return (
        <div className="flex h-screen bg-[#1e1f22] text-white">
            <aside className="w-60 bg-[#2b2d31] border-r border-gray-800 flex flex-col">
                <div className="px-4 py-3 text-lg font-bold text-indigo-400">Rooms</div>
                <nav className="flex-1 space-y-1 px-2">
                    {rooms.map((room) => (
                        <button
                            key={room.id}
                            onClick={() => setCurrentRoom(room.name)}
                            className={`w-full text-left px-3 py-2 rounded-md ${currentRoom === room.name
                                ? "bg-indigo-600 text-white"
                                : "text-gray-300 hover:bg-[#3a3c40]"
                                }`}
                        >
                            #{room.name}
                        </button>
                    ))}
                </nav>
                <div className="p-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Batuhan</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-red-400 hover:text-red-300"
                        >
                            Çıkış
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((m) => (
                        <div key={m.id} className="bg-gray-800 rounded-lg p-3">
                            <p className="font-semibold text-indigo-400">
                                {m.user?.name || m.user?.email}
                            </p>
                            {m.content && <p>{m.content}</p>}
                            {m.fileUrl && (
                                <a
                                    href={m.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline"
                                >
                                    📎 Dosya
                                </a>
                            )}
                            <span className="text-xs text-gray-400 block">
                                {new Date(m.createdAt).toLocaleTimeString()}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="p-3 border-t border-gray-700 flex items-center gap-2">
                    <button
                        onClick={() => setShowEmoji(!showEmoji)}
                        className="text-xl"
                    >
                        😊
                    </button>
                    {showEmoji && (
                        <div className="absolute bottom-20 left-10 z-50">
                            <Picker
                                onEmojiClick={(e) => setInput((prev) => prev + e.emoji)}
                            />
                        </div>
                    )}
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        className="flex-1 bg-gray-800 rounded-md px-3 py-2"
                        placeholder="Mesaj yaz..."
                    />
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-gray-700 px-3 py-2 rounded-md"
                    >
                        📎
                    </button>
                    <button
                        onClick={sendMessage}
                        className="bg-indigo-600 px-4 py-2 rounded-md"
                    >
                        Gönder
                    </button>
                </div>
            </main>

            <aside className="w-60 bg-[#2b2d31] border-l border-gray-800 p-3">
                <h2 className="text-sm font-semibold text-gray-400 mb-2">
                    Online Users
                </h2>
                <ul className="space-y-2">
                    {onlineUsers.map((u) => (
                        <li key={u.id} className="text-sm text-gray-300">
                            🟢 {u.name || u.email}
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
}
