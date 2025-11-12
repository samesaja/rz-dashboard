export async function getGeminiGreeting(clusterData) {
  const total = clusterData.length;
  const online = clusterData.filter((n) => n.online).length;
  const avgCpu =
    clusterData.reduce((a, b) => a + parseFloat(b.cpu || 0), 0) / total;
  const avgMem =
    clusterData.reduce((a, b) => a + parseFloat(b.mem || 0), 0) / total;

  const prompt = `
Kamu adalah Gemini AI Assistant untuk Dhito.
Tulis sapaan singkat yang ramah, kreatif, dan penuh karakter, maksimal 2 kalimat.
Boleh pakai emoji.
Data cluster:
- Total node: ${total}
- Online: ${online}
- CPU rata-rata: ${avgCpu.toFixed(2)}%
- Memory rata-rata: ${avgMem.toFixed(2)}%
`;

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.NEXT_PUBLIC_GEMINI_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await res.json();
  const message =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Halo Dhito! ☕ Semua sistem stabil — cluster dalam kondisi aman.";

  return message.trim();
}
