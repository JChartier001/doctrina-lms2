// HTML report template

import type { AuditResult } from '../types';

export function generateHtmlReport(result: AuditResult): string {
	const { summary, violations } = result;

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Standards Audit Report - ${result.project}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      color: #333;
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }

    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 20px;
      border-radius: 12px;
      margin-bottom: 30px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }

    .subtitle {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: bold;
      color: #333;
    }

    .stat-value.score {
      color: ${summary.complianceScore >= 90 ? '#10b981' : summary.complianceScore >= 75 ? '#f59e0b' : '#ef4444'};
    }

    .chart-container {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      margin-bottom: 30px;
    }

    .chart-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
      color: #333;
    }

    canvas {
      max-height: 400px;
    }

    .violations-table {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    thead {
      background: #f9fafb;
    }

    th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
    }

    td {
      padding: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    tbody tr:hover {
      background: #f9fafb;
    }

    .severity-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .severity-error {
      background: #fee2e2;
      color: #991b1b;
    }

    .severity-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .severity-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .file-path {
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.9rem;
      color: #6366f1;
    }

    .code-snippet {
      background: #f3f4f6;
      padding: 8px 12px;
      border-radius: 6px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.85rem;
      margin: 8px 0;
      border-left: 3px solid #6366f1;
    }

    .fix-suggestion {
      background: #ecfdf5;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.9rem;
      margin-top: 8px;
      border-left: 3px solid #10b981;
      color: #065f46;
    }

    .search-box {
      margin-bottom: 20px;
      padding: 12px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      width: 100%;
      font-size: 1rem;
    }

    .search-box:focus {
      outline: none;
      border-color: #6366f1;
    }

    @media (max-width: 768px) {
      h1 {
        font-size: 1.8rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .stat-value {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔍 Standards Audit Report</h1>
      <p class="subtitle">${result.project} • ${new Date(result.timestamp).toLocaleString()}</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Compliance Score</div>
        <div class="stat-value score">${summary.complianceScore.toFixed(1)}%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Files</div>
        <div class="stat-value">${summary.totalFiles}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Total Violations</div>
        <div class="stat-value">${summary.totalViolations}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Errors</div>
        <div class="stat-value" style="color: #ef4444;">${summary.violationsBySeverity.error}</div>
      </div>
    </div>

    <div class="chart-container">
      <h2 class="chart-title">Violations by Standard</h2>
      <canvas id="standardsChart"></canvas>
    </div>

    <div class="chart-container">
      <h2 class="chart-title">Violations by Severity</h2>
      <canvas id="severityChart"></canvas>
    </div>

    <div class="violations-table">
      <h2 class="chart-title">All Violations</h2>
      <input 
        type="text" 
        class="search-box" 
        id="searchBox" 
        placeholder="Search violations by file, message, or rule..."
      />
      <table id="violationsTable">
        <thead>
          <tr>
            <th>File</th>
            <th>Line</th>
            <th>Rule</th>
            <th>Severity</th>
            <th>Message</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          ${violations
						.map(
							(v) => `
            <tr>
              <td class="file-path">${v.filePath}</td>
              <td>${v.line}</td>
              <td>${v.ruleId}</td>
              <td>
                <span class="severity-badge severity-${v.severity}">${v.severity.toUpperCase()}</span>
              </td>
              <td>${v.message}</td>
              <td>
                ${v.codeSnippet ? `<div class="code-snippet">${escapeHtml(v.codeSnippet)}</div>` : ''}
                ${v.fixSuggestion ? `<div class="fix-suggestion">💡 ${v.fixSuggestion}</div>` : ''}
              </td>
            </tr>
          `,
						)
						.join('')}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    // Standards Chart
    const standardsData = ${JSON.stringify(summary.violationsByStandard)};
    const standardsCtx = document.getElementById('standardsChart').getContext('2d');
    new Chart(standardsCtx, {
      type: 'bar',
      data: {
        labels: Object.keys(standardsData).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        datasets: [{
          label: 'Violations',
          data: Object.values(standardsData),
          backgroundColor: [
            '#6366f1',
            '#8b5cf6',
            '#ec4899',
            '#ef4444',
            '#f59e0b',
            '#10b981',
            '#06b6d4'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });

    // Severity Chart
    const severityData = ${JSON.stringify(summary.violationsBySeverity)};
    const severityCtx = document.getElementById('severityChart').getContext('2d');
    new Chart(severityCtx, {
      type: 'doughnut',
      data: {
        labels: ['Error', 'Warning', 'Info'],
        datasets: [{
          data: [severityData.error, severityData.warning, severityData.info],
          backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true
      }
    });

    // Search functionality
    const searchBox = document.getElementById('searchBox');
    const table = document.getElementById('violationsTable');
    const rows = table.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

    searchBox.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase();
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const text = row.textContent.toLowerCase();
        
        if (text.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      }
    });
  </script>
</body>
</html>`;
}

function escapeHtml(unsafe: string): string {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

export function saveHtmlReport(result: AuditResult, outputPath: string): void {
	const fs = require('fs');
	const path = require('path');

	// Ensure directory exists
	const dir = path.dirname(outputPath);
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}

	// Write HTML file
	fs.writeFileSync(outputPath, generateHtmlReport(result), 'utf-8');
}
