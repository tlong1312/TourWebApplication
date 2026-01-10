import React, { useEffect, useState } from 'react'
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import api from '../../utils/api/api';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);
import "./BookingAdminPage.css"


const StatisticsPage = () => {
    const [type, setType] = useState("yearly");
    const [data, setData] = useState([]);
    const [labels, setLabels] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                if (type === "yearly") {
                    const res = await api.get("/api/bookings/revenue/yearly");
                    if (res.data.length > 0) {
                        setLabels([res.data[0].year]);
                        setData([res.data[0].revenue]);
                    } else {
                        setLabels([]);
                        setData([]);
                    }
                } else {
                    const res = await api.get("/api/bookings/revenue/monthly");
                    if (res.data.length > 0) {
                        setLabels([`Tháng ${res.data[0].month}/${res.data[0].year}`]);
                        setData([res.data[0].revenue]);
                    } else {
                        setLabels([]);
                        setData([]);
                    }
                }
            } catch (err) {
                setLabels([]);
                setData([]);
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [type]);

    const getGradient = (ctx, chartArea) => {
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, "#3b82f6");
        gradient.addColorStop(1, "#d946ef");
        return gradient;
    };

    const chartData = {
        labels,
        datasets: [
            {
                label: "Doanh thu (VNĐ)",
                data,
                backgroundColor: (context) => {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;
                    if (!chartArea) return "#3b82f6";
                    return getGradient(ctx, chartArea);
                },
                barThickness: 60,
            },
        ],
    };

    return (
        <div style={{ maxWidth: 600, margin: "40px auto", background: "#fff", padding: 32, borderRadius: 12 }}>
            <h1 className="statistics-title">Thống kê doanh thu</h1>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
                <select value={type} onChange={e => setType(e.target.value)} style={{ padding: 8, borderRadius: 6 }}>
                    <option value="yearly">Theo năm</option>
                    <option value="monthly">Theo tháng</option>
                </select>
            </div>
            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <Bar data={chartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            )}
        </div>
    );
}

export default StatisticsPage