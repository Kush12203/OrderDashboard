import { FaEdit, FaTrash } from "react-icons/fa";

import PaymentBadge from "./PaymentBadge";

import StatusBadge from "./StatusBadge";

function OrderTable({ orders }) {

    return (

        <div className="table-card">

            <table>

                <thead>

                    <tr>

                        <th>Customer</th>

                        <th>Product</th>

                        <th>Weight</th>

                        <th>Rate</th>

                        <th>Amount</th>

                        <th>Payment</th>

                        <th>Status</th>

                        <th>Action</th>

                    </tr>

                </thead>

                <tbody>

                    {

                        orders.length===0 ?

                        (

                            <tr>

                                <td colSpan="8">

                                    No Orders Found

                                </td>

                            </tr>

                        )

                        :

                        (

                            orders.map(order=>(

                                <tr key={order._id}>

                                    <td>{order.customerName}</td>

                                    <td>{order.product}</td>

                                    <td>{order.weight} kg</td>

                                    <td>₹ {order.rate}</td>

                                    <td>₹ {order.amount}</td>

                                    <td>

                                        <PaymentBadge paymentMode={order.paymentMode}/>

                                    </td>

                                    <td>

                                        <StatusBadge status={order.paymentStatus}/>

                                    </td>

                                    <td>

                                        <button className="icon-btn">

                                            <FaEdit/>

                                        </button>

                                        <button className="icon-btn delete">

                                            <FaTrash/>

                                        </button>

                                    </td>

                                </tr>

                            ))

                        )

                    }

                </tbody>

            </table>

        </div>

    );

}

export default OrderTable;