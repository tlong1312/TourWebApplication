import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import api from "../../utils/api/api";
import { FiTrendingUp, FiCalendar, FiDollarSign, FiBarChart2 } from "react-icons/fi";

ChartJS.register(
    CategoryScale, LinearScale, BarElement,
    LineElement, PointElement,
    Title, Tooltip, Legend, Filler
);

const formatCurrency = (val) => {
    if (!val && val !== 0) return "—";
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} tỷ`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} triệu`;
    return val.toLocaleString("vi-VN") + " ₫";
};

const StatisticsPage = () => {
    const [yearlyData, setYearlyData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [yearlyRes, monthlyRes] = await Promise.all([
                    api.get("/api/bookings/revenue/yearly"),
                    api.get("/api/bookings/revenue/monthly"),
                ]);
                setYearlyData(yearlyRes.data || []);
                setMonthlyData(monthlyRes.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);
    const totalYearly = yearlyData.reduce((s, d) => s + (d.revenue || 0), 0);
    const latestMonth = monthlyData[monthlyData.length - 1];
    const avgMonthly = monthlyData.length
        ? monthlyData.reduce((s, d) => s + (d.revenue || 0), 0) / monthlyData.length
        : 0;

    const statCards = [
        {
            label: "Tổng doanh thu",
            value: formatCurrency(totalYearly),
            icon: <FiDollarSign size={22} />,
            color: "from-blue-500 to-blue-700",
            bg: "bg-blue-50",
            text: "text-blue-600",
        },
        {
            label: "Tháng gần nhất",
            value: latestMonth ? formatCurrency(latestMonth.revenue) : "—",
            sub: latestMonth ? `Tháng ${latestMonth.month}/${latestMonth.year}` : "",
            icon: <FiCalendar size={22} />,
            color: "from-purple-500 to-purple-700",
            bg: "bg-purple-50",
            text: "text-purple-600",
        },
        {
            label: "Trung bình/tháng",
            value: formatCurrency(Math.round(avgMonthly)),
            icon: <FiTrendingUp size={22} />,
            color: "from-emerald-500 to-emerald-700",
            bg: "bg-emerald-50",
            text: "text-emerald-600",
        },
        {
            label: "Số tháng có dữ liệu",
            value: monthlyData.length,
            sub: `trong ${yearlyData.length} năm`,
            icon: <FiBarChart2 size={22} />,
            color: "from-orange-500 to-orange-700",
            bg: "bg-orange-50",
            text: "text-orange-600",
        },
    ];
    const yearlyChartData = {
        labels: yearlyData.map((d) => `Năm ${d.year}`),
        datasets: [
            {
                label: "Doanh thu (VNĐ)",
                data: yearlyData.map((d) => d.revenue),
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: c, chartArea } = chart;
                    if (!chartArea) return "#003580";
                    const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
                    g.addColorStop(0, "#0057b8");
                    g.addColorStop(1, "#003580");
                    return g;
                },
                borderRadius: 8,
                borderSkipped: false,
                barThickness: Math.max(40, Math.min(80, 400 / Math.max(yearlyData.length, 1))),
            },
        ],
    };

    const yearlyChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` ${formatCurrency(ctx.raw)}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: "#f1f5f9" },
                ticks: {
                    callback: (val) => formatCurrency(val),
                    font: { size: 12 },
                    color: "#64748b",
                },
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 13, weight: "600" }, color: "#334155" },
            },
        },
    };
    const monthlyChartData = {
        labels: monthlyData.map((d) => `T${d.month}/${d.year}`),
        datasets: [
            {
                label: "Doanh thu (VNĐ)",
                data: monthlyData.map((d) => d.revenue),
                borderColor: "#7c3aed",
                backgroundColor: "rgba(124,58,237,0.12)",
                pointBackgroundColor: "#7c3aed",
                pointBorderColor: "#fff",
                pointRadius: 5,
                pointHoverRadius: 7,
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const monthlyChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => ` ${formatCurrency(ctx.raw)}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: "#f1f5f9" },
                ticks: {
                    callback: (val) => formatCurrency(val),
                    font: { size: 12 },
                    color: "#64748b",
                },
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 12 }, color: "#334155" },
            },
        },
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-light px-6 py-10">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <FiBarChart2 className="text-white/80" size={28} />
                        <h1 className="text-3xl font-bold text-white">Thống Kê Doanh Thu</h1>
                    </div>
                    <p className="text-white/75 text-sm pl-10">
                        Tổng quan hiệu quả kinh doanh theo tháng và năm
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {statCards.map((card, i) => (
                        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-11 h-11 ${card.bg} ${card.text} rounded-xl flex items-center justify-center`}>
                                    {card.icon}
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${card.bg} ${card.text}`}>
                                    Live
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm mb-1">{card.label}</p>
                            <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
                            {card.sub && <p className="text-gray-400 text-xs mt-1">{card.sub}</p>}
                        </div>
                    ))}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Biểu đồ theo Năm */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Doanh Thu Theo Năm</h2>
                                <p className="text-gray-400 text-sm mt-0.5">Tổng doanh thu từng năm</p>
                            </div>
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                <FiDollarSign size={18} />
                            </div>
                        </div>
                        {yearlyData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <FiBarChart2 size={40} className="mb-2 opacity-30" />
                                <p className="text-sm">Chưa có dữ liệu</p>
                            </div>
                        ) : (
                            <Bar data={yearlyChartData} options={yearlyChartOptions} />
                        )}
                    </div>

                    {/* Biểu đồ theo Tháng */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Doanh Thu Theo Tháng</h2>
                                <p className="text-gray-400 text-sm mt-0.5">Xu hướng doanh thu hàng tháng</p>
                            </div>
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <FiTrendingUp size={18} />
                            </div>
                        </div>
                        {monthlyData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                                <FiTrendingUp size={40} className="mb-2 opacity-30" />
                                <p className="text-sm">Chưa có dữ liệu</p>
                            </div>
                        ) : (
                            <Line data={monthlyChartData} options={monthlyChartOptions} />
                        )}
                    </div>
                </div>

                {/* Bảng chi tiết theo tháng */}
                {monthlyData.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Chi Tiết Doanh Thu Theo Tháng</h2>
                                <p className="text-gray-400 text-sm mt-0.5">Bảng số liệu đầy đủ từng tháng</p>
                            </div>
                            <FiCalendar className="text-gray-300" size={22} />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-xs uppercase text-gray-500 tracking-wider">
                                        <th className="px-6 py-3 text-left font-semibold">Tháng</th>
                                        <th className="px-6 py-3 text-left font-semibold">Năm</th>
                                        <th className="px-6 py-3 text-right font-semibold">Doanh thu</th>
                                        <th className="px-6 py-3 text-left font-semibold">Tỉ lệ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {[...monthlyData].reverse().map((d, i) => {
                                        const pct = totalYearly > 0 ? Math.round((d.revenue / totalYearly) * 100) : 0;
                                        return (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm flex items-center justify-center">
                                                        T{d.month}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-600 font-medium">{d.year}</td>
                                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                                    {formatCurrency(d.revenue)}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 max-w-[80px]">
                                                            <div
                                                                className="bg-primary h-1.5 rounded-full"
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-500">{pct}%</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatisticsPage;