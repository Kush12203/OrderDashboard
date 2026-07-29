import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

function WeightChart({ data }) {
    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <div>
                    <h2>Weight Sold</h2>
                    <p>Monthly weight in kilograms</p>
                </div>
            </div>

            {data.length === 0 ? (
                <div className="chart-empty">
                    No weight data available.
                </div>
            ) : (
                <div className="chart-container">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <BarChart
                            data={data}
                            margin={{
                                top: 10,
                                right: 15,
                                left: 0,
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
                                    `${value} kg`
                                }
                            />

                            <Tooltip
                                formatter={(value) => [
                                    `${Number(
                                        value || 0
                                    ).toLocaleString(
                                        "en-IN",
                                        {
                                            maximumFractionDigits: 2
                                        }
                                    )} kg`,
                                    "Weight"
                                ]}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border:
                                        "1px solid #e2e8f0",
                                    boxShadow:
                                        "0 10px 25px rgba(15, 23, 42, 0.1)"
                                }}
                            />

                            <Bar
                                dataKey="weight"
                                fill="#0f766e"
                                radius={[8, 8, 0, 0]}
                                maxBarSize={42}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

export default WeightChart;