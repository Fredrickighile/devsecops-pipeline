import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getLatestScan } from "./api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function Dashboard() {
  const [latestScan, setLatestScan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sortMode, setSortMode] = useState("ai");
  const [exporting, setExporting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const scanData = await getLatestScan();
      setLatestScan(scanData);
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const exportToPDF = () => {
    setExporting(true);
    setTimeout(() => {
      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Security Analysis Report", 14, 20);
      doc.setFontSize(10);
      doc.text(`${new Date().toLocaleString()}`, 14, 28);

      const summaryData = [
        ["Critical", latestScan?.metrics.critical || 0],
        ["High", latestScan?.metrics.high || 0],
        ["Medium", latestScan?.metrics.medium || 0],
        ["Low", latestScan?.metrics.low || 0],
      ];

      autoTable(doc, {
        startY: 35,
        head: [["Severity", "Count"]],
        body: summaryData,
        theme: "grid",
      });

      const vulnData = sortedVulns
        .slice(0, 10)
        .map((v, i) => [
          i + 1,
          v.title.substring(0, 30),
          v.severity,
          v.aiAnalysis?.priorityScore || "N/A",
        ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 10,
        head: [["#", "Vulnerability", "Severity", "AI Score"]],
        body: vulnData,
        theme: "striped",
        styles: { fontSize: 8 },
      });

      doc.save(`security-report-${latestScan?.scanId}.pdf`);
      setExporting(false);
    }, 300);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${darkMode ? "bg-black" : "bg-white"} flex items-center justify-center`}
      >
        <div className="text-center">
          <div
            className={`w-8 h-8 border-2 ${darkMode ? "border-zinc-800 border-t-white" : "border-gray-200 border-t-black"} rounded-full animate-spin mx-auto mb-4`}
          ></div>
          <p
            className={`${darkMode ? "text-zinc-400" : "text-gray-600"} text-sm`}
          >
            Loading...
          </p>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Critical", value: latestScan?.metrics.critical || 0 },
    { name: "High", value: latestScan?.metrics.high || 0 },
    { name: "Medium", value: latestScan?.metrics.medium || 0 },
    { name: "Low", value: latestScan?.metrics.low || 0 },
  ];

  const sortedVulns = latestScan?.vulnerabilities
    ? [...latestScan.vulnerabilities].sort((a, b) => {
        if (sortMode === "ai") {
          return (
            (b.aiAnalysis?.priorityScore || 0) -
            (a.aiAnalysis?.priorityScore || 0)
          );
        } else {
          const order = { critical: 4, high: 3, medium: 2, low: 1 };
          return order[b.severity] - order[a.severity];
        }
      })
    : [];

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"} transition-colors duration-200`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span
                className={`text-xs ${darkMode ? "text-zinc-500" : "text-gray-500"} uppercase tracking-wider`}
              >
                Live
              </span>
            </div>
            <h1 className="text-3xl font-bold">Security Dashboard</h1>
            <p
              className={`text-sm ${darkMode ? "text-zinc-400" : "text-gray-600"} mt-1`}
            >
              AI-powered vulnerability analysis
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 ${darkMode ? "bg-zinc-900 hover:bg-zinc-800" : "bg-gray-100 hover:bg-gray-200"} rounded-lg transition-colors`}
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            <button
              onClick={exportToPDF}
              disabled={exporting}
              className={`px-4 py-2 ${darkMode ? "bg-white text-black hover:bg-zinc-200" : "bg-black text-white hover:bg-gray-800"} text-sm font-medium rounded-lg transition-colors disabled:opacity-50`}
            >
              {exporting ? "Exporting..." : "Export PDF"}
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: "Critical",
              value: latestScan?.metrics.critical,
              color: "text-red-500",
            },
            {
              label: "High",
              value: latestScan?.metrics.high,
              color: "text-orange-500",
            },
            {
              label: "Medium",
              value: latestScan?.metrics.medium,
              color: "text-yellow-500",
            },
            {
              label: "Low",
              value: latestScan?.metrics.low,
              color: "text-green-500",
            },
          ].map((m, i) => (
            <div
              key={i}
              className={`${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"} border rounded-lg p-4`}
            >
              <p
                className={`text-xs ${darkMode ? "text-zinc-500" : "text-gray-500"} uppercase tracking-wider mb-2`}
              >
                {m.label}
              </p>
              <p className={`text-3xl font-bold ${m.color}`}>{m.value || 0}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div
          className={`${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"} border rounded-lg p-6`}
        >
          <h2 className="text-sm font-medium mb-4">Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                stroke={darkMode ? "#52525b" : "#9ca3af"}
                style={{ fontSize: "12px" }}
              />
              <YAxis
                stroke={darkMode ? "#52525b" : "#9ca3af"}
                style={{ fontSize: "12px" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? "#18181b" : "#ffffff",
                  border: `1px solid ${darkMode ? "#27272a" : "#e5e7eb"}`,
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: darkMode ? "#ffffff" : "#000000",
                }}
              />
              <Bar
                dataKey="value"
                fill={darkMode ? "#ffffff" : "#000000"}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sort Toggle */}
        <div
          className={`flex items-center justify-between ${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"} border rounded-lg p-4`}
        >
          <div>
            <p className="text-sm font-medium">Prioritization Mode</p>
            <p
              className={`text-xs ${darkMode ? "text-zinc-500" : "text-gray-500"} mt-1`}
            >
              AI analyzes severity, exploitability, and fix availability
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSortMode("ai")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                sortMode === "ai"
                  ? darkMode
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : darkMode
                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              AI Priority
            </button>
            <button
              onClick={() => setSortMode("severity")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                sortMode === "severity"
                  ? darkMode
                    ? "bg-white text-black"
                    : "bg-black text-white"
                  : darkMode
                    ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
              }`}
            >
              Severity
            </button>
          </div>
        </div>

        {/* Vulnerabilities */}
        <div className="space-y-3">
          {sortedVulns.map((vuln, idx) => (
            <div
              key={idx}
              className={`${darkMode ? "bg-zinc-900 border-zinc-800 hover:border-zinc-700" : "bg-gray-50 border-gray-200 hover:border-gray-300"} border rounded-lg p-5 transition-colors`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      vuln.severity === "critical"
                        ? "bg-red-500/10 text-red-500"
                        : vuln.severity === "high"
                          ? "bg-orange-500/10 text-orange-500"
                          : vuln.severity === "medium"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-green-500/10 text-green-500"
                    }`}
                  >
                    {vuln.severity}
                  </span>
                  <span
                    className={`px-2 py-0.5 ${darkMode ? "bg-zinc-800 text-zinc-400" : "bg-gray-200 text-gray-600"} text-xs font-medium rounded`}
                  >
                    {vuln.source}
                  </span>
                  {sortMode === "ai" && (
                    <span
                      className={`px-2 py-0.5 ${darkMode ? "bg-white/10 text-white" : "bg-black/10 text-black"} text-xs font-medium rounded`}
                    >
                      #{idx + 1}
                    </span>
                  )}
                </div>
                {vuln.aiAnalysis && (
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {vuln.aiAnalysis.priorityScore}
                    </p>
                    <p
                      className={`text-xs ${darkMode ? "text-zinc-500" : "text-gray-500"}`}
                    >
                      AI Score
                    </p>
                  </div>
                )}
              </div>

              <h3 className="text-base font-medium mb-1">{vuln.title}</h3>
              <p
                className={`text-xs ${darkMode ? "text-zinc-500" : "text-gray-500"} font-mono mb-3`}
              >
                {vuln.package}
              </p>

              {vuln.aiAnalysis && (
                <div
                  className={`${darkMode ? "bg-zinc-800/50 border-zinc-700" : "bg-white border-gray-200"} border rounded-lg p-3`}
                >
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p
                        className={`text-xs ${darkMode ? "text-zinc-500" : "text-gray-500"}`}
                      >
                        Risk
                      </p>
                      <p className="text-sm font-medium">
                        {vuln.aiAnalysis.riskLevel}
                      </p>
                    </div>
                    <div>
                      <p
                        className={`text-xs ${darkMode ? "text-zinc-500" : "text-gray-500"}`}
                      >
                        Effort
                      </p>
                      <p className="text-sm font-medium capitalize">
                        {vuln.aiAnalysis.estimatedEffort}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p
                      className={`text-xs ${darkMode ? "text-zinc-500" : "text-gray-500"} mb-1`}
                    >
                      Suggested Fix
                    </p>
                    <p className="text-sm">{vuln.aiAnalysis.suggestedFix}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          className={`${darkMode ? "bg-zinc-900 border-zinc-800" : "bg-gray-50 border-gray-200"} border rounded-lg p-4`}
        >
          <div className="grid grid-cols-3 gap-4 text-center text-xs">
            <div>
              <p
                className={`${darkMode ? "text-zinc-500" : "text-gray-500"} mb-1`}
              >
                Last Scan
              </p>
              <p className="font-medium">
                {new Date(latestScan?.timestamp).toLocaleString()}
              </p>
            </div>
            <div>
              <p
                className={`${darkMode ? "text-zinc-500" : "text-gray-500"} mb-1`}
              >
                Branch
              </p>
              <p className="font-medium">{latestScan?.branch}</p>
            </div>
            <div>
              <p
                className={`${darkMode ? "text-zinc-500" : "text-gray-500"} mb-1`}
              >
                Author
              </p>
              <p className="font-medium">{latestScan?.author}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
