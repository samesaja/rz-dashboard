"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [stats, setStats] = useState(null);
  const [aiMessage, setAiMessage] = useState("⏳ Sedang memuat data...");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, greetRes] = await Promise.all([
          fetch("http://34.101.90.254:4000/cluster"),
          fetch("http://34.101.90.254:4000/ai/greet"),
        ]);
        const statsData = await statsRes.json();
        const greetData = await greetRes.json();
        setStats(statsData);
        setAiMessage(greetData.message || "☕ Hai Dhito! Semua sistem aktif.");
      } catch (err) {
        console.error("Fetch error:", err);
        setAiMessage("🤖 AI lagi bengong, coba lagi sebentar.");
      }
    }
    loadData();
  }, []);

  async function handleAskAI() {
    setLoading(true);
    const message = await getGeminiResponse(
      `Halo Gemini, sapa Dhito dan beri insight serta rekomendasi singkat berdasarkan performa cluster cloud saat ini.`
    );
    setAiMessage(message);
    setLoading(false);
  }

  async function getGeminiResponse(prompt) {
    try {
      const res = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": process.env.NEXT_PUBLIC_GEMINI_KEY,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                ],
              },
            ],
          }),
        }
      );

      const data = await res.json();
      console.log("AI Response raw:", data);

      if (
        data?.candidates?.[0]?.content?.parts?.[0]?.text
      ) {
        return data.candidates[0].content.parts[0].text;
      } else {
        return "AI lagi bengong, coba lagi sebentar.";
      }
    } catch (err) {
      console.error("AI Error:", err);
      return "Gagal mendapatkan rekomendasi AI";
    }
  }

  if (!stats)
    return (
      <main className="p-10 text-gray-200 bg-slate-900 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">RZ Cloud Dashboard</h1>
        <p>Loading data cluster...</p>
      </main>
    );

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        backgroundColor: "#0f172a",
        color: "#e2e8f0",
        minHeight: "100vh",
        padding: "2rem",
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "1rem" }}>
        ☁️ RZ Cloud Dashboard
      </h1>

      <div
        style={{
          backgroundColor: "#1e293b",
          padding: "1rem",
          borderRadius: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
          🤖 AI Assistant
        </h2>
        <p style={{ marginBottom: "1rem" }}>{aiMessage}</p>
        <button
          onClick={handleAskAI}
          disabled={loading}
          style={{
            backgroundColor: loading ? "#475569" : "#3b82f6",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Menunggu respon AI..." : "Minta Rekomendasi AI"}
        </button>
      </div>

      <h2 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Cluster Nodes</h2>
      {stats.map((node, i) => (
        <div
          key={i}
          style={{
            backgroundColor: "#1e293b",
            padding: "1rem",
            borderRadius: "0.75rem",
            marginBottom: "1rem",
          }}
        >
          <p><strong>{node.name}</strong> ({node.ip})</p>
          <p> CPU: {node.cpu}%</p>
          <p> Memory: {node.mem}%</p>
          <p> Uptime: {Math.round(node.uptime / 60)} menit</p>
          <p> Status: {node.online ? "Online " : "Offline "}</p>
        </div>
      ))}

      <footer style={{ marginTop: "3rem", opacity: 0.6 }}>
        Built by <strong>Dhito</strong> · Powered by GCP, Next.js & Gemini 2.5 Flash
      </footer>
    </main>
  );
}
