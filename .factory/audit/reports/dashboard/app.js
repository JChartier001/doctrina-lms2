// Dashboard JavaScript - loads and displays audit data

let auditData = null;
let filteredViolations = [];

// Load audit data
async function loadAuditData() {
  try {
    // Try to load from violations.json
    const response = await fetch('../violations.json');
    if (!response.ok) throw new Error('Failed to load data');
    
    auditData = await response.json();
    renderDashboard();
  } catch (error) {
    console.error('Error loading audit data:', error);
    // Use mock data for development
    useMockData();
  }
}

// Use mock data if JSON not available
function useMockData() {
  auditData = {
    timestamp: new Date().toISOString(),
    project: 'doctrina-lms',
    summary: {
      totalFiles: 453,
      totalViolations: 142,
      complianceScore: 87.3,
      violationsByStandard: {
        typescript: 45,
        react: 32,
        nextjs: 28,
        security: 15,
        testing: 12,
        forms: 7,
        tailwind: 3
      },
      violationsBySeverity: {
        error: 58,
        warning: 72,
        info: 12
      }
    },
    violations: generateMockViolations(),
    fileStats: []
  };
  renderDashboard();
}

// Generate mock violations
function generateMockViolations() {
  const mockViolations = [
    {
      ruleId: 'nextjs-001',
      filePath: 'app/dashboard/page.tsx',
      line: 12,
      column: 5,
      severity: 'error',
      message: 'Component uses hooks but missing "use client"',
      codeSnippet: 'const [user] = useState()',
      fixSuggestion: 'Add "use client" directive at top of file',
      standard: 'nextjs'
    },
    {
      ruleId: 'react-003',
      filePath: 'components/courses/CourseCard.tsx',
      line: 8,
      column: 1,
      severity: 'error',
      message: 'Default export instead of named export',
      codeSnippet: 'export default function CourseCard() { ... }',
      fixSuggestion: 'Change to: export function CourseCard() { ... }',
      standard: 'react'
    },
    {
      ruleId: 'ts-005',
      filePath: 'lib/utils/format.ts',
      line: 15,
      column: 22,
      severity: 'warning',
      message: 'Missing explicit return type',
      codeSnippet: 'export function formatDate(date) {',
      fixSuggestion: 'Add return type: export function formatDate(date: Date): string {',
      standard: 'typescript'
    },
    {
      ruleId: 'security-007',
      filePath: 'convex/users.ts',
      line: 45,
      column: 3,
      severity: 'error',
      message: 'Missing authentication check in mutation',
      codeSnippet: 'export const updateUser = mutation({',
      fixSuggestion: 'Add: const identity = await ctx.auth.getUserIdentity();',
      standard: 'security'
    }
  ];

  return mockViolations;
}

// Render the entire dashboard
function renderDashboard() {
  if (!auditData) return;

  const { summary, violations, timestamp, project } = auditData;

  // Update header
  document.getElementById('projectInfo').textContent = 
    `${project} • Last updated: ${new Date(timestamp).toLocaleString()}`;

  // Update stats
  document.getElementById('complianceScore').textContent = 
    `${summary.complianceScore.toFixed(1)}%`;
  
  const scoreEl = document.getElementById('complianceScore');
  scoreEl.className = 'stat-value score';
  if (summary.complianceScore < 75) scoreEl.classList.add('danger');
  else if (summary.complianceScore < 90) scoreEl.classList.add('warning');

  document.getElementById('totalFiles').textContent = summary.totalFiles;
  document.getElementById('totalViolations').textContent = summary.totalViolations;
  document.getElementById('errorCount').textContent = summary.violationsBySeverity.error;

  // Initialize charts
  renderStandardsChart(summary.violationsByStandard);
  renderSeverityChart(summary.violationsBySeverity);
  renderRulesChart(violations);

  // Initialize table
  filteredViolations = [...violations];
  renderViolationsTable(violations);

  // Setup event listeners
  setupEventListeners();
}

// Render Standards Chart
function renderStandardsChart(violationsByStandard) {
  const ctx = document.getElementById('standardsChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(violationsByStandard).map(s => 
        s.charAt(0).toUpperCase() + s.slice(1)
      ),
      datasets: [{
        label: 'Violations',
        data: Object.values(violationsByStandard),
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
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}

// Render Severity Chart
function renderSeverityChart(violationsBySeverity) {
  const ctx = document.getElementById('severityChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Error', 'Warning', 'Info'],
      datasets: [{
        data: [
          violationsBySeverity.error,
          violationsBySeverity.warning,
          violationsBySeverity.info
        ],
        backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6']
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  });
}

// Render Top Rules Chart
function renderRulesChart(violations) {
  const ruleCounts = {};
  violations.forEach(v => {
    ruleCounts[v.message] = (ruleCounts[v.message] || 0) + 1;
  });

  const topRules = Object.entries(ruleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const ctx = document.getElementById('rulesChart').getContext('2d');
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: topRules.map(r => r[0]),
      datasets: [{
        label: 'Occurrences',
        data: topRules.map(r => r[1]),
        backgroundColor: '#6366f1'
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}

// Render violations table
function renderViolationsTable(violations) {
  const tbody = document.getElementById('violationsTableBody');
  tbody.innerHTML = '';

  violations.forEach(v => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="file-path">${v.filePath}</td>
      <td>${v.line}</td>
      <td>${v.ruleId}</td>
      <td><span class="standard-badge">${v.standard}</span></td>
      <td>
        <span class="severity-badge severity-${v.severity}">
          ${v.severity.toUpperCase()}
        </span>
      </td>
      <td>${v.message}</td>
      <td>
        ${v.codeSnippet ? `<div class="code-snippet">${escapeHtml(v.codeSnippet)}</div>` : ''}
        ${v.fixSuggestion ? `<div class="fix-suggestion">💡 ${v.fixSuggestion}</div>` : ''}
      </td>
    `;
    tbody.appendChild(row);
  });

  // Show/hide no results message
  const noResults = document.getElementById('noResults');
  if (violations.length === 0) {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

// Setup event listeners
function setupEventListeners() {
  // Search box
  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('input', applyFilters);

  // Filters
  const severityFilter = document.getElementById('severityFilter');
  const standardFilter = document.getElementById('standardFilter');
  severityFilter.addEventListener('change', applyFilters);
  standardFilter.addEventListener('change', applyFilters);

  // Refresh button
  const refreshBtn = document.getElementById('refreshBtn');
  refreshBtn.addEventListener('click', () => {
    location.reload();
  });

  // Export CSV button
  const exportBtn = document.getElementById('exportCsvBtn');
  exportBtn.addEventListener('click', exportToCSV);
}

// Apply all filters
function applyFilters() {
  const searchTerm = document.getElementById('searchBox').value.toLowerCase();
  const severityFilter = document.getElementById('severityFilter').value;
  const standardFilter = document.getElementById('standardFilter').value;

  filteredViolations = auditData.violations.filter(v => {
    // Search filter
    const matchesSearch = !searchTerm || 
      v.filePath.toLowerCase().includes(searchTerm) ||
      v.message.toLowerCase().includes(searchTerm) ||
      v.ruleId.toLowerCase().includes(searchTerm);

    // Severity filter
    const matchesSeverity = severityFilter === 'all' || v.severity === severityFilter;

    // Standard filter
    const matchesStandard = standardFilter === 'all' || v.standard === standardFilter;

    return matchesSearch && matchesSeverity && matchesStandard;
  });

  renderViolationsTable(filteredViolations);
}

// Export to CSV
function exportToCSV() {
  const headers = ['File', 'Line', 'Rule', 'Standard', 'Severity', 'Message', 'Code Snippet', 'Fix Suggestion'];
  const rows = filteredViolations.map(v => [
    v.filePath,
    v.line,
    v.ruleId,
    v.standard,
    v.severity,
    v.message,
    v.codeSnippet || '',
    v.fixSuggestion || ''
  ]);

  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-violations-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// Utility: Escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', loadAuditData);
