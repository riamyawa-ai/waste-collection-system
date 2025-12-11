'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    FileText,
    Download,
    Printer,
    Truck,
    DollarSign,
    Users,
    Calendar,
    BarChart3,
    PieChart,
    TrendingUp,
    Clock,
    FileSpreadsheet,
    File
} from 'lucide-react';

type ReportType = 'collections' | 'payments' | 'attendance' | 'requests';
type Period = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';
type ExportFormat = 'pdf' | 'excel' | 'csv';

interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    type: ReportType;
    onGenerate: (type: ReportType, period: Period) => void;
}

function ReportCard({ title, description, icon: Icon, type, onGenerate }: ReportCardProps) {
    const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        await onGenerate(type, selectedPeriod);
        setTimeout(() => setIsGenerating(false), 1500);
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
                                <Clock className="h-4 w-4 mr-2 animate-spin" />
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

export default function ReportsPage() {
    const [generatedReports, setGeneratedReports] = useState<Array<{
        id: string;
        type: ReportType;
        period: Period;
        generatedAt: Date;
        status: 'ready' | 'generating';
    }>>([]);

    const handleGenerateReport = async (type: ReportType, period: Period) => {
        const newReport = {
            id: `${type}-${period}-${Date.now()}`,
            type,
            period,
            generatedAt: new Date(),
            status: 'ready' as const,
        };
        setGeneratedReports(prev => [newReport, ...prev]);
    };

    const handleExport = (format: ExportFormat) => {
        // TODO: Implement actual export
        console.log(`Exporting as ${format}`);
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

            <Tabs defaultValue="generate" className="space-y-6">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="generate">Generate Reports</TabsTrigger>
                    <TabsTrigger value="history">Report History</TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-6">
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

                    {/* Quick Stats Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-green-600" />
                                Quick Analytics Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                                        <PieChart className="h-4 w-4" />
                                        <span className="text-sm font-medium">Request Status</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700">87%</p>
                                    <p className="text-xs text-blue-500">Completion Rate</p>
                                </div>
                                <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                                    <div className="flex items-center gap-2 text-green-600 mb-2">
                                        <TrendingUp className="h-4 w-4" />
                                        <span className="text-sm font-medium">Revenue Growth</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-700">+12%</p>
                                    <p className="text-xs text-green-500">vs Last Month</p>
                                </div>
                                <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
                                    <div className="flex items-center gap-2 text-orange-600 mb-2">
                                        <Users className="h-4 w-4" />
                                        <span className="text-sm font-medium">Avg Attendance</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-700">94%</p>
                                    <p className="text-xs text-orange-500">This Month</p>
                                </div>
                                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                                        <Clock className="h-4 w-4" />
                                        <span className="text-sm font-medium">Avg Response</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-700">2.5h</p>
                                    <p className="text-xs text-purple-500">Request to Assign</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Reports</CardTitle>
                            <CardDescription>Download or print previously generated reports</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {generatedReports.length === 0 ? (
                                <div className="text-center py-12 text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                    <p>No reports generated yet</p>
                                    <p className="text-sm">Generate a report from the Generate Reports tab</p>
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
                                                        <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
                                                            <File className="h-4 w-4 mr-1" />
                                                            PDF
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleExport('excel')}>
                                                            <FileSpreadsheet className="h-4 w-4 mr-1" />
                                                            Excel
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                                                            <Download className="h-4 w-4 mr-1" />
                                                            CSV
                                                        </Button>
                                                        <Button variant="outline" size="sm">
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
