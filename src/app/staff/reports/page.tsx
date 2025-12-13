'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import {
    FileText,
    Download,
    Printer,
    Truck,
    DollarSign,
    Users,
    Calendar,
    FileSpreadsheet,
    File,
    Loader2,
    History
} from 'lucide-react';
import {
    generateCollectionReport,
    generatePaymentReport,
    generateAttendanceReport,
    generateRequestReport,
    type ReportData
} from '@/lib/actions/reports';
import { generatePDF, generateCSV, generateExcel } from '@/lib/utils/reportGenerator';

type ReportType = 'collections' | 'payments' | 'attendance' | 'requests';
type Period = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
type ExportFormat = 'pdf' | 'excel' | 'csv';

interface GeneratedReport {
    id: string;
    type: ReportType;
    period: Period;
    generatedAt: Date;
    status: 'ready' | 'generating';
    data?: ReportData;
}

interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    type: ReportType;
    onGenerate: (type: ReportType, period: Period) => Promise<void>;
}

function ReportCard({ title, description, icon: Icon, type, onGenerate }: ReportCardProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            await onGenerate(type, selectedPeriod);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100">
                            <Icon className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{title}</CardTitle>
                            <CardDescription className="text-sm">{description}</CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as Period)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                            <SelectItem value="quarter">This Quarter</SelectItem>
                            <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="h-4 w-4 mr-2" />
                                Generate Report
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function StaffReportsPage() {
    const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);

    const handleGenerateReport = async (type: ReportType, period: Period) => {
        let result;

        // Call appropriate report generation function
        switch (type) {
            case 'collections':
                result = await generateCollectionReport(period);
                break;
            case 'payments':
                result = await generatePaymentReport(period);
                break;
            case 'attendance':
                result = await generateAttendanceReport(period);
                break;
            case 'requests':
                result = await generateRequestReport(period);
                break;
        }

        if (result?.success && result.data) {
            const newReport: GeneratedReport = {
                id: `${type}-${period}-${Date.now()}`,
                type,
                period,
                generatedAt: new Date(),
                status: 'ready',
                data: result.data,
            };
            setGeneratedReports(prev => [newReport, ...prev]);
            toast.success(`${getReportTypeLabel(type)} generated successfully`);
        } else {
            toast.error(result?.error || 'Failed to generate report');
        }
    };

    const handleExport = (report: GeneratedReport, format: ExportFormat) => {
        if (!report.data) {
            toast.error('No report data available');
            return;
        }

        try {
            switch (format) {
                case 'pdf':
                    generatePDF(report.data);
                    toast.success('PDF opened in new window for printing');
                    break;
                case 'excel':
                    generateExcel(report.data);
                    toast.success('Excel file downloaded');
                    break;
                case 'csv':
                    generateCSV(report.data);
                    toast.success('CSV file downloaded');
                    break;
            }
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export report');
        }
    };

    const getReportTypeLabel = (type: ReportType) => {
        switch (type) {
            case 'collections': return 'Collection Report';
            case 'payments': return 'Payment Report';
            case 'attendance': return 'Attendance Report';
            case 'requests': return 'Request Report';
        }
    };

    const getPeriodLabel = (period: Period) => {
        switch (period) {
            case 'today': return 'Today';
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'quarter': return 'This Quarter';
            case 'year': return 'This Year';
            case 'custom': return 'Custom Range';
        }
    };

    return (
        <div className="space-y-6 p-6">
            <PageHeader
                title="Reports"
                description="Generate and export system reports"
            />

            {/* Report Types Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <ReportCard
                    title="Collection Reports"
                    description="Daily, weekly, and monthly collection summaries including by barangay and collector."
                    icon={Truck}
                    type="collections"
                    onGenerate={handleGenerateReport}
                />
                <ReportCard
                    title="Payment Reports"
                    description="Revenue summaries, pending payments, and collection efficiency metrics."
                    icon={DollarSign}
                    type="payments"
                    onGenerate={handleGenerateReport}
                />
                <ReportCard
                    title="Attendance Reports"
                    description="Collector attendance logs, hours worked, and attendance percentages."
                    icon={Users}
                    type="attendance"
                    onGenerate={handleGenerateReport}
                />
                <ReportCard
                    title="Request Reports"
                    description="Request statistics, peak times, rejection rates, and area distribution."
                    icon={Calendar}
                    type="requests"
                    onGenerate={handleGenerateReport}
                />
            </div>

            {/* Reports History Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5 text-green-600" />
                        Reports History
                    </CardTitle>
                    <CardDescription>Download or print previously generated reports</CardDescription>
                </CardHeader>
                <CardContent>
                    {generatedReports.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No reports generated yet</p>
                            <p className="text-sm">Generate a report using the cards above</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {generatedReports.map((report) => (
                                <div
                                    key={report.id}
                                    className="flex items-center justify-between p-4 rounded-lg border bg-gray-50"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">{getReportTypeLabel(report.type)}</p>
                                            <p className="text-sm text-gray-500">
                                                {getPeriodLabel(report.period)} • Generated {report.generatedAt.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={report.status === 'ready' ? 'default' : 'secondary'}>
                                            {report.status === 'ready' ? 'Ready' : 'Generating'}
                                        </Badge>
                                        {report.status === 'ready' && (
                                            <>
                                                <Button variant="outline" size="sm" onClick={() => handleExport(report, 'pdf')}>
                                                    <File className="h-4 w-4 mr-1" />
                                                    PDF
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleExport(report, 'excel')}>
                                                    <FileSpreadsheet className="h-4 w-4 mr-1" />
                                                    Excel
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleExport(report, 'csv')}>
                                                    <Download className="h-4 w-4 mr-1" />
                                                    CSV
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleExport(report, 'pdf')} title="Print">
                                                    <Printer className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
