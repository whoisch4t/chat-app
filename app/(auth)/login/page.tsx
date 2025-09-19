"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const router = useRouter();

    const handleLogin = async () => {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) router.push("/chat");
        else alert("Giriş başarısız!");
    };

    return (
        <div className="flex h-screen items-center justify-center bg-gray-950 text-gray-100">
            <div className="w-full max-w-md bg-gray-900 rounded-xl shadow-lg p-6 space-y-5">
                <h1 className="text-2xl font-semibold text-center">🔑 Login</h1>
                <input
                    type="email"
                    placeholder="Email"
                    className="w-full rounded-md bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="w-full rounded-md bg-gray-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button
                    onClick={handleLogin}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 rounded-md py-2 font-medium"
                >
                    Giriş Yap
                </button>
                <p className="text-center text-sm text-gray-400">
                    Hesabın yok mu?{" "}
                    <a href="/register" className="text-indigo-400 hover:text-indigo-300">
                        Kayıt ol
                    </a>
                </p>
            </div>
        </div>
    );
}
