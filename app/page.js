"use client";

import { useEffect, useState } from "react";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [nodeLogs, setNodeLogs] = useState([]);
  const [jenkinsLogs, setJenkinsLogs] = useState([]);
  const [buildStatus, setBuildStatus] = useState(null);
  const [aiGreeting, setAiGreeting] = useState("🌤 Belum ada sapaan hari ini.");
  const [aiAdvice, setAiAdvice] = useState("🤖 AI belum memberikan rekomendasi.");

  const fetchAll = async () => {
    try {
      const [statsRes, nodeLogsRes, jenkinsLogsRes, buildRes, aiGreetRes, aiAdvisorRes] = await Promise.all([
        fetch("http://34.101.90.254:4000/cluster"),
        fetch("http://34.101.90.254:4000/logs/nodes"),
        fetch("http://34.101.90.254:4000/logs/jenkins"),
        fetch("http://34.101.90.254:4000/jenkins/status"),
        fetch("http://34.101.90.254:4000/ai/greet"),
        fetch("http://34.101.90.254:4000/jenkins/ai"),
      ]);

      const [statsData, nodeLogsData, jenkinsLogsData, buildData, aiGreetData, aiAdvisorData] = await Promise.all([
        statsRes.json(),
        nodeLogsRes.json(),
        jenkinsLogsRes.json(),
        buildRes.json(),
        aiGreetRes.json(),
        aiAdvisorRes.json(),
      ]);

      setStats(statsData);
      setNodeLogs(nodeLogsData.logs || []);
      setJenkinsLogs(jenkinsLogsData.logs || []);
      setBuildStatus(buildData);
      setAiGreeting(aiGreetData.message || "🌤 Tidak ada greeting hari ini.");
      setAiAdvice(aiAdvisorData.message || "🤖 AI belum memberikan rekomendasi.");
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setAiGreeting("🌧️ Gagal memuat greeting.");
      setAiAdvice("❌ Gagal memuat AI Build Advisor.");
    }
  };

  const triggerDeploy = async () => {
    setBuildStatus({ result: "RUNNING" });
    setAiAdvice("⏳ Menjalankan pipeline...");
    try {
      await fetch("http://34.101.90.254:4000/jenkins/deploy", { method: "POST" });
      setTimeout(fetchAll, 8000);
    } catch (err) {
      console.error(err);
      setAiAdvice(" Gagal trigger deploy");
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="p-8 bg-gray-950 text-gray-100 min-h-screen space-y-8">
      <h1 className="text-3xl font-bold text-emerald-400">☁️ RZ Cloud Intelligent Dashboard</h1>

      <section className="bg-gray-900 p-4 rounded-2xl shadow border border-sky-600">
        <h2 className="text-xl font-semibold mb-3 text-sky-300">🌤 Daily AI Greeting</h2>
        <p className="whitespace-pre-wrap">{aiGreeting}</p>
      </section>

      <section className="bg-gray-900 p-4 rounded-2xl shadow">
        <h2 className="text-xl mb-3 font-semibold">📊 Cluster Monitoring</h2>
        {stats ? (
          <div>
            <p> Nodes Aktif: {stats.active_nodes} / {stats.total_nodes}</p>
            <p> Load CPU Rata-rata: {stats.avg_cpu}%</p>
            <p> Memori Terpakai: {stats.avg_mem}%</p>
          </div>
        ) : (
          <p>Loading cluster stats...</p>
        )}
      </section>

      <section className="bg-gray-900 p-4 rounded-2xl shadow">
        <h2 className="text-xl mb-3 font-semibold"> CI/CD Pipeline</h2>
        <button
          onClick={triggerDeploy}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg"
        >
          🚀 Trigger Deploy
        </button>
        <div className="mt-4">
          {buildStatus ? (
            <p>
              🧱 Status Build Terakhir:{" "}
              <span
                className={
                  buildStatus.result === "SUCCESS"
                    ? "text-emerald-400"
                    : buildStatus.result === "FAILURE"
                    ? "text-red-400"
                    : "text-yellow-400"
                }
              >
                {buildStatus.result}
              </span>
            </p>
          ) : (
            <p>Loading build status...</p>
          )}
        </div>
      </section>

      <section className="bg-gray-900 p-4 rounded-2xl shadow max-h-64 overflow-y-auto">
        <h2 className="text-xl mb-3 font-semibold">📜 Node Logs</h2>
        <ul className="text-sm font-mono space-y-1">
          {nodeLogs.length ? (
            nodeLogs.slice(-10).map((log, i) => <li key={i}>{log}</li>)
          ) : (
            <p>Belum ada log dari node.</p>
          )}
        </ul>
      </section>

      <section className="bg-gray-900 p-4 rounded-2xl shadow max-h-64 overflow-y-auto">
        <h2 className="text-xl mb-3 font-semibold">⚙️ Jenkins Logs</h2>
        <ul className="text-sm font-mono space-y-1">
          {jenkinsLogs.length ? (
            jenkinsLogs.slice(-10).map((log, i) => <li key={i}>{log}</li>)
          ) : (
            <p>Belum ada log Jenkins.</p>
          )}
        </ul>
      </section>

      <section className="bg-gray-900 p-4 rounded-2xl shadow border border-emerald-600">
        <h2 className="text-xl font-semibold mb-3 text-emerald-300">🤖 AI Build Advisor</h2>
        <p className="whitespace-pre-wrap">{aiAdvice}</p>
      </section>
    </main>
  );
}
