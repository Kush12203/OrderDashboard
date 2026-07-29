import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip
} from "recharts";

const COLORS = ["#22c55e", "#ef4444"];

function PaymentStatusChart({ data }) {
    const hasData = data.some(
        (item) => Number(item.value) > 0
    );

    return (
        <div className="analytics-card">
            <div className="analytics-card-header">
                <div>
                    <h2>Payment Status</h2>
                    <p>Paid and unpaid order amounts</p>
                </div>
            </div>

            {!hasData ? (
                <div className="chart-empty">
                    No payment status data available.
                </div>
            ) : (
                <div className="pie-chart-container">
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="46%"
                                innerRadius={58}
                                outerRadius={88}
                                paddingAngle={4}
                            >
                                {data.map(
                                    (entry, index) => (
                                        <Cell
                                            key={entry.name}
                                            fill={
                                                COLORS[
                                                    index %
                                                        COLORS.length
                                                ]
                                            }
                                        />
                                    )
                                )}
                            </Pie>

                            <Tooltip
                                formatter={(value) => [
                                    `₹${Number(
                                        value || 0
                                    ).toLocaleString(
                                        "en-IN"
                                    )}`,
                                    "Amount"
                                ]}
                                contentStyle={{
                                    borderRadius: "12px",
                                    border:
                                        "1px solid #e2e8f0",
                                    boxShadow:
                                        "0 10px 25px rgba(15, 23, 42, 0.1)"
                                }}
                            />

                            <Legend
                                verticalAlign="bottom"
                                iconType="circle"
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

export default PaymentStatusChart;