/**
 * PDF Report Generator Utility
 * Uses browser print-to-PDF functionality for reliable PDF generation
 */

import { format } from 'date-fns';

export interface ReportData {
    type: 'collections' | 'payments' | 'attendance' | 'requests';
    period: string;
    dateRange: { start: string; end: string };
    generatedAt: string;
    data: Record<string, unknown>;
}

/**
 * Generate PDF from report data using browser print
 */
export function generatePDF(report: ReportData): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow pop-ups to generate PDF reports');
        return;
    }

    const html = generateReportHTML(report);
    printWindow.document.write(html);
    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
        printWindow.print();
    };
}

/**
 * Generate CSV from report data
 */
export function generateCSV(report: ReportData): void {
    let csvContent = '';
    const data = report.data;

    // Add header info
    csvContent += `Report Type,${getReportTypeLabel(report.type)}\n`;
    csvContent += `Period,${getPeriodLabel(report.period)}\n`;
    csvContent += `Date Range,${report.dateRange.start} to ${report.dateRange.end}\n`;
    csvContent += `Generated At,${format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm:ss')}\n\n`;

    // Add details based on report type
    const details = data.details as Array<Record<string, unknown>> | undefined;
    if (details && details.length > 0) {
        // Get headers from first item
        const headers = Object.keys(details[0]);
        csvContent += headers.join(',') + '\n';

        // Add rows
        details.forEach(row => {
            csvContent += headers.map(h => {
                const val = row[h];
                // Escape commas and quotes
                if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                    return `"${val.replace(/"/g, '""')}"`;
                }
                return val;
            }).join(',') + '\n';
        });
    }

    // Download
    downloadFile(csvContent, `${report.type}-report-${report.period}.csv`, 'text/csv');
}

/**
 * Generate Excel-compatible HTML table for download
 */
export function generateExcel(report: ReportData): void {
    let htmlContent = `
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #22c55e; color: white; }
                .summary-table { margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <h1>${getReportTypeLabel(report.type)}</h1>
            <p>Period: ${getPeriodLabel(report.period)} (${report.dateRange.start} to ${report.dateRange.end})</p>
            <p>Generated: ${format(new Date(report.generatedAt), 'yyyy-MM-dd HH:mm:ss')}</p>
    `;

    const data = report.data;

    // Summary table
    const summary = data.summary as Record<string, unknown> | undefined;
    if (summary) {
        htmlContent += '<h2>Summary</h2><table class="summary-table"><tr>';
        Object.keys(summary).forEach(key => {
            htmlContent += `<th>${formatHeader(key)}</th>`;
        });
        htmlContent += '</tr><tr>';
        Object.values(summary).forEach(val => {
            htmlContent += `<td>${formatValue(val)}</td>`;
        });
        htmlContent += '</tr></table>';
    }

    // Details table
    const details = data.details as Array<Record<string, unknown>> | undefined;
    if (details && details.length > 0) {
        htmlContent += '<h2>Details</h2><table>';
        const headers = Object.keys(details[0]);
        htmlContent += '<tr>' + headers.map(h => `<th>${formatHeader(h)}</th>`).join('') + '</tr>';
        details.forEach(row => {
            htmlContent += '<tr>' + headers.map(h => `<td>${formatValue(row[h])}</td>`).join('') + '</tr>';
        });
        htmlContent += '</table>';
    }

    htmlContent += '</body></html>';

    // Download as .xls (Excel will open HTML tables)
    downloadFile(htmlContent, `${report.type}-report-${report.period}.xls`, 'application/vnd.ms-excel');
}

// Helper functions
function getReportTypeLabel(type: string): string {
    switch (type) {
        case 'collections': return 'Collection Report';
        case 'payments': return 'Payment Report';
        case 'attendance': return 'Attendance Report';
        case 'requests': return 'Request Analytics Report';
        default: return 'Report';
    }
}

function getPeriodLabel(period: string): string {
    switch (period) {
        case 'today': return 'Today';
        case 'week': return 'This Week';
        case 'month': return 'This Month';
        case 'quarter': return 'This Quarter';
        case 'year': return 'This Year';
        default: return period;
    }
}

function formatHeader(key: string): string {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
}

function formatValue(val: unknown): string {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'number') {
        return val.toLocaleString();
    }
    return String(val);
}

function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateReportHTML(report: ReportData): string {
    const data = report.data;
    const summary = data.summary as Record<string, unknown> | undefined;

    let summaryHtml = '';
    if (summary) {
        summaryHtml = Object.entries(summary).map(([key, value]) => `
            <div class="stat-card">
                <div class="stat-label">${formatHeader(key)}</div>
                <div class="stat-value">${formatValue(value)}${key.includes('Rate') ? '%' : ''}</div>
            </div>
        `).join('');
    }

    let chartDataHtml = '';
    // Add distribution charts based on report type
    const distributions = ['byBarangay', 'byStatus', 'byCollector', 'byWasteType', 'byPriority', 'revenueByBarangay'];
    distributions.forEach(key => {
        const distData = data[key] as Record<string, number> | undefined;
        if (distData && Object.keys(distData).length > 0) {
            chartDataHtml += `
                <div class="chart-section">
                    <h3>${formatHeader(key)}</h3>
                    <table>
                        <tr><th>Category</th><th>Count</th></tr>
                        ${Object.entries(distData).map(([k, v]) => `<tr><td>${k}</td><td>${formatValue(v)}</td></tr>`).join('')}
                    </table>
                </div>
            `;
        }
    });

    // For attendance, handle byCollector array
    const byCollectorArray = data.byCollector as Array<{ collector: string; daysWorked: number; totalHours: number }> | undefined;
    if (byCollectorArray && Array.isArray(byCollectorArray) && byCollectorArray.length > 0) {
        chartDataHtml += `
            <div class="chart-section">
                <h3>Collector Attendance Summary</h3>
                <table>
                    <tr><th>Collector</th><th>Days Worked</th><th>Total Hours</th></tr>
                    ${byCollectorArray.map(c => `<tr><td>${c.collector}</td><td>${c.daysWorked}</td><td>${c.totalHours}</td></tr>`).join('')}
                </table>
            </div>
        `;
    }

    let detailsHtml = '';
    const details = data.details as Array<Record<string, unknown>> | undefined;
    if (details && details.length > 0) {
        const headers = Object.keys(details[0]);
        detailsHtml = `
            <h2>Detailed Records</h2>
            <table class="details-table">
                <tr>${headers.map(h => `<th>${formatHeader(h)}</th>`).join('')}</tr>
                ${details.slice(0, 50).map(row =>
            `<tr>${headers.map(h => `<td>${formatValue(row[h])}</td>`).join('')}</tr>`
        ).join('')}
            </table>
            ${details.length > 50 ? `<p class="note">Showing first 50 of ${details.length} records</p>` : ''}
        `;
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${getReportTypeLabel(report.type)} - ${getPeriodLabel(report.period)}</title>
            <style>
                * { box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px;
                    color: #333;
                }
                .header { 
                    border-bottom: 3px solid #22c55e; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px;
                }
                .header h1 { 
                    color: #22c55e; 
                    margin: 0; 
                    font-size: 28px;
                }
                .header p { 
                    color: #666; 
                    margin: 5px 0; 
                }
                .logo { 
                    display: flex; 
                    align-items: center; 
                    gap: 15px;
                    margin-bottom: 10px;
                }
                .logo-icon {
                    width: 50px;
                    height: 50px;
                    background: #22c55e;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 24px;
                    font-weight: bold;
                }
                .stats-grid { 
                    display: grid; 
                    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); 
                    gap: 15px; 
                    margin-bottom: 30px;
                }
                .stat-card { 
                    background: #f8fafc; 
                    border: 1px solid #e2e8f0;
                    padding: 15px; 
                    border-radius: 8px;
                    text-align: center;
                }
                .stat-label { 
                    font-size: 12px; 
                    color: #64748b; 
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }
                .stat-value { 
                    font-size: 24px; 
                    font-weight: bold; 
                    color: #22c55e;
                }
                h2 { 
                    color: #1e293b; 
                    border-bottom: 2px solid #e2e8f0; 
                    padding-bottom: 10px;
                    margin-top: 30px;
                }
                h3 { 
                    color: #475569; 
                    margin: 15px 0 10px;
                }
                table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 20px;
                    font-size: 12px;
                }
                th, td { 
                    border: 1px solid #e2e8f0; 
                    padding: 8px; 
                    text-align: left; 
                }
                th { 
                    background: #22c55e; 
                    color: white;
                    font-weight: 600;
                }
                tr:nth-child(even) { 
                    background: #f8fafc; 
                }
                .chart-section { 
                    margin-bottom: 25px;
                    break-inside: avoid;
                }
                .details-table {
                    font-size: 10px;
                }
                .note { 
                    font-style: italic; 
                    color: #64748b;
                    font-size: 11px;
                }
                .footer { 
                    margin-top: 40px; 
                    padding-top: 20px; 
                    border-top: 1px solid #e2e8f0;
                    text-align: center; 
                    font-size: 11px; 
                    color: #94a3b8;
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">
                    <div class="logo-icon">♻</div>
                    <div>
                        <h1>${getReportTypeLabel(report.type)}</h1>
                        <p>Waste Collection Management System - Panabo City CENRO</p>
                    </div>
                </div>
                <p><strong>Period:</strong> ${getPeriodLabel(report.period)} (${report.dateRange.start} to ${report.dateRange.end})</p>
                <p><strong>Generated:</strong> ${format(new Date(report.generatedAt), 'MMMM d, yyyy h:mm a')}</p>
            </div>

            <h2>Summary</h2>
            <div class="stats-grid">
                ${summaryHtml}
            </div>

            ${chartDataHtml}

            ${detailsHtml}

            <div class="footer">
                <p>This report was automatically generated by the Waste Collection Management System.</p>
                <p>© ${new Date().getFullYear()} Panabo City CENRO. All rights reserved.</p>
            </div>
        </body>
        </html>
    `;
}
