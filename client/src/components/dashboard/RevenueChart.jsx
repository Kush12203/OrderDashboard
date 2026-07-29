import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

function RevenueChart({ data }) {
    const formatCurrency = (value) =>
        `₹${Number(value || 0).toLocaleString("en-IN")}`;

    return (
        <div className="analytics-card revenue-chart-card">
            <div className="analytics-card-header">
                <div>
                    <h2>Revenue Trend</h2>
                    <p>Monthly order revenue</p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="chart-empty">
                    No revenue data available.
                </div>
            ) : (
                <div className="chart-container">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <LineChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 15,
                                left: 5,
                                bottom: 5
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="4 4"
                                vertical={false}
                                stroke="#e8edf4"
                            />

                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{
                                    fill: "#64748b",
                                    fontSize: 12
                                }}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{
                                    fill: "#64748b",
                                    fontSize: 12
                                }}
                                tickFormatter={(value) =>
                                    `₹${Number(
                                        value
                                    ).toLocaleString(
                                        "en-IN",
                                        {
                                            notation:
                                                "compact",
                                            maximumFractionDigits: 1
                                        }
                                    )}`
                                }
                            />

                            <Tooltip
                                formatter={(value) => [
                                    formatCurrency(value),
                                    "Revenue"
                                ]}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border:
                                        "1px solid #e2e8f0",
                                    boxShadow:
                                        "0 10px 25px rgba(15, 23, 42, 0.1)"
                                }}
                            />

                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#4f46e5"
                                strokeWidth={3}
                                dot={{
                                    r: 4,
                                    fill: "#4f46e5",
                                    strokeWidth: 2,
                                    stroke: "#ffffff"
                                }}
                                activeDot={{
                                    r: 6
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

export default RevenueChart;