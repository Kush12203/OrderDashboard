import { FaCrown } from "react-icons/fa";

function TopCustomers({ customers }) {
    const formatCurrency = (value) =>
        Number(value || 0).toLocaleString(
            "en-IN",
            {
                maximumFractionDigits: 2
            }
        );

    return (
        <div className="top-customers-card">
            <div className="top-customers-header">
                <div>
                    <h2>Top Customers</h2>

                    <p>
                        Customers with the highest
                        total order value.
                    </p>
                </div>

                <div className="top-customers-icon">
                    <FaCrown />
                </div>
            </div>

            {customers.length === 0 ? (
                <div className="top-customers-empty">
                    No customer data available.
                </div>
            ) : (
                <div className="top-customers-table-wrapper">
                    <table className="top-customers-table">
                        <thead>
                            <tr>
                                <th>Rank</th>
                                <th>Customer</th>
                                <th>Orders</th>
                                <th>Weight</th>
                                <th>Total Amount</th>
                            </tr>
                        </thead>

                        <tbody>
                            {customers.map(
                                (customer, index) => (
                                    <tr
                                        key={
                                            customer.name
                                        }
                                    >
                                        <td>
                                            <span
                                                className={`customer-rank customer-rank-${
                                                    index +
                                                    1
                                                }`}
                                            >
                                                {index +
                                                    1}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="top-customer-profile">
                                                <div className="top-customer-avatar">
                                                    {customer.name
                                                        .charAt(
                                                            0
                                                        )
                                                        .toUpperCase()}
                                                </div>

                                                <strong>
                                                    {
                                                        customer.name
                                                    }
                                                </strong>
                                            </div>
                                        </td>

                                        <td>
                                            {
                                                customer.orders
                                            }
                                        </td>

                                        <td>
                                            {Number(
                                                customer.weight ||
                                                    0
                                            ).toLocaleString(
                                                "en-IN",
                                                {
                                                    maximumFractionDigits: 2
                                                }
                                            )}{" "}
                                            kg
                                        </td>

                                        <td>
                                            <strong className="top-customer-amount">
                                                ₹{" "}
                                                {formatCurrency(
                                                    customer.amount
                                                )}
                                            </strong>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default TopCustomers;