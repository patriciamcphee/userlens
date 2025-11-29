import type { Participant, StickyNote, Hypothesis } from "../App";

interface ExportData {
  participants: Participant[];
  stickyNotes: StickyNote[];
  hypotheses: Hypothesis[];
}

// Helper function to get SUS grade
function getSUSGrade(score: number): string {
  if (score >= 80) return "A (Excellent)";
  if (score >= 68) return "B (Good)";
  if (score >= 50) return "C (OK)";
  if (score >= 25) return "D (Poor)";
  return "F (Fail)";
}

// Helper function to get NPS rating
function getNPSRating(score: number): string {
  if (score >= 70) return "Excellent";
  if (score >= 50) return "Great";
  if (score >= 30) return "Good";
  if (score >= 0) return "Needs Improvement";
  return "Critical";
}

export function exportToPDF(data: ExportData) {
  // Create a formatted HTML document
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>User Research Synthesis Report</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          color: #4f46e5;
          border-bottom: 3px solid #4f46e5;
          padding-bottom: 10px;
        }
        h2 {
          color: #334155;
          margin-top: 30px;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 5px;
        }
        .participants-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        .participant {
          border: 1px solid #e2e8f0;
          padding: 15px;
          border-radius: 8px;
          background: #f8fafc;
        }
        .participant-header {
          font-weight: 600;
          color: #1e293b;
        }
        .sticky-note {
          display: inline-block;
          padding: 10px;
          margin: 5px;
          border-radius: 4px;
          border: 2px solid;
          font-size: 12px;
        }
        .barrier { background: #fecaca; border-color: #f87171; }
        .insight { background: #fef08a; border-color: #facc15; }
        .opportunity { background: #86efac; border-color: #4ade80; }
        .quote { background: #fde68a; border-color: #fbbf24; }
        .hypothesis {
          border: 2px solid;
          padding: 15px;
          margin: 10px 0;
          border-radius: 8px;
        }
        .validated { background: #f0fdf4; border-color: #86efac; }
        .disproven { background: #fef2f2; border-color: #fca5a5; }
        .unclear { background: #fff7ed; border-color: #fdba74; }
        .testing { background: #eff6ff; border-color: #93c5fd; }
        .cluster {
          margin: 20px 0;
        }
        .cluster-title {
          font-weight: 600;
          margin-bottom: 10px;
        }
      </style>
    </head>
    <body>
      <h1>User Research Synthesis Report</h1>
      <p>Generated on ${new Date().toLocaleDateString()}</p>
      
      <h2>Participant Summary (${data.participants.length} total)</h2>
      <div class="participants-grid">
        ${data.participants
          .map(
            (p) => `
          <div class="participant">
            <div class="participant-header">${p.id}</div>
            <div><strong>Segment:</strong> ${p.segment}</div>
            <div><strong>Role:</strong> ${p.role}</div>
            <div><strong>Date:</strong> ${p.date} | <strong>Duration:</strong> ${p.duration}</div>
            <div><strong>Status:</strong> ${p.status}</div>
            ${p.susScore ? `<div><strong>SUS Score:</strong> ${p.susScore} (${getSUSGrade(p.susScore)})</div>` : ""}
            ${p.npsScore ? `<div><strong>NPS Score:</strong> ${p.npsScore} (${getNPSRating(p.npsScore)})</div>` : ""}
          </div>
        `
          )
          .join("")}
      </div>
      
      <h2>Affinity Map Insights (${data.stickyNotes.length} notes)</h2>
      ${Array.from(new Set(data.stickyNotes.map((n) => n.cluster)))
        .map(
          (cluster) => `
        <div class="cluster">
          <div class="cluster-title">${cluster}</div>
          ${data.stickyNotes
            .filter((n) => n.cluster === cluster)
            .map(
              (note) => `
            <div class="sticky-note ${note.type}">${note.text}</div>
          `
            )
            .join("")}
        </div>
      `
        )
        .join("")}
      
      <h2>Hypothesis Validation (${data.hypotheses.length} hypotheses)</h2>
      ${data.hypotheses
        .map(
          (h) => `
        <div class="hypothesis ${h.status}">
          <div><strong>${h.id}:</strong> ${h.hypothesis}</div>
          <div><strong>Status:</strong> ${h.status.toUpperCase()}</div>
          <div>${h.evidence}</div>
        </div>
      `
        )
        .join("")}
    </body>
    </html>
  `;

  // Create a new window and print
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}

export function exportToCSV(data: ExportData) {
  // Participants CSV
  const participantsCSV = [
    ["ID", "Segment", "Role", "Date", "Duration", "Status", "SUS Score", "SUS Grade", "NPS Score", "NPS Rating"],
    ...data.participants.map((p) => [
      p.id,
      p.segment,
      p.role,
      p.date,
      p.duration,
      p.status,
      p.susScore || "",
      p.susScore ? getSUSGrade(p.susScore) : "",
      p.npsScore || "",
      p.npsScore ? getNPSRating(p.npsScore) : "",
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // Sticky Notes CSV
  const notesCSV = [
    ["ID", "Text", "Type", "Cluster"],
    ...data.stickyNotes.map((n) => [n.id, n.text, n.type, n.cluster]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // Hypotheses CSV
  const hypothesesCSV = [
    ["ID", "Status", "Hypothesis", "Evidence"],
    ...data.hypotheses.map((h) => [h.id, h.status, h.hypothesis, h.evidence]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  // Combined CSV
  const combinedCSV = `PARTICIPANTS\n${participantsCSV}\n\nSTICKY NOTES\n${notesCSV}\n\nHYPOTHESES\n${hypothesesCSV}`;

  // Download
  const blob = new Blob([combinedCSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `research-synthesis-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}