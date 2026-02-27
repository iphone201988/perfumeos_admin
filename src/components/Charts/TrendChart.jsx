import React, { useMemo, useRef } from "react";
import { Chart } from "primereact/chart";

export default function TrendChart({
    data = [],
    label = "Data",
    color = "#352AA4",
    type = "line",
}) {
    const chartRef = useRef(null);

    const safeData = Array.isArray(data) ? data : [];

    const chartData = useMemo(() => {
        const labels = safeData.length ? safeData.map((i) => i._id) : ["No Data"];
        const values = safeData.length ? safeData.map((i) => i.count) : [0];

        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r},${g},${b},${alpha})`;
        };

        return {
            labels,
            datasets: [
                {
                    label,
                    data: values,
                    fill: true,
                    backgroundColor: (ctx) => {
                        const { chartArea, ctx: context } = ctx.chart;
                        if (!chartArea) return "transparent";

                        const gradient = context.createLinearGradient(
                            0,
                            chartArea.bottom,
                            0,
                            chartArea.top
                        );

                        gradient.addColorStop(0, hexToRgba(color, 0.05));
                        gradient.addColorStop(1, hexToRgba(color, 0.35));

                        return gradient;
                    },
                    borderColor: color,
                    borderWidth: type === "bar" ? 0 : 3,
                    borderRadius: type === "bar" ? 6 : 0,
                    barThickness: type === "bar" ? 28 : undefined,
                    tension: 0.4,
                    type,
                },
            ],
        };
    }, [safeData, label, color, type]);

    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        layout: {
            padding: 0,
        },
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
            },
            y: {
                grid: { color: "#f1f5f9", borderDash: [5, 5] },
                border: { display: false },
                beginAtZero: true,
            },
        },
    }), []);

    // Create a dynamic key based on data length and type to force re-render when structure changes significantly
    const chartKey = `${type}-${safeData.length}-${label}`;

    return (
        <div className="w-full h-full">
            <Chart key={chartKey} ref={chartRef} type={type} data={chartData} options={chartOptions} height={300} />
        </div>
    );
}
