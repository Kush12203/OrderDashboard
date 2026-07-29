import { useEffect, useState } from "react";

import {
    FaSearch,
    FaPlus,
    FaEdit,
    FaTrash
} from "react-icons/fa";

import { getOrders } from "../services/orderService";

import "../styles/records.css";

function Records() {

    const [orders, setOrders] = useState([]);

    const [filteredOrders, setFilteredOrders] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadOrders();

    }, []);

    useEffect(() => {

        const data = orders.filter(order =>

            order.customerName
                .toLowerCase()
                .includes(search.toLowerCase())

        );

        setFilteredOrders(data);

    }, [search, orders]);

    const loadOrders = async () => {

        try {

            const res = await getOrders();

            setOrders(res.data);

            setFilteredOrders(res.data);

        }

        catch (err) {

            console.log(err);

        }

        finally {

            setLoading(false);

        }

    };

    return (

        <div className="records-page">

            <div className="records-top">

                <h2>Orders Management</h2>

                <button className="add-order">

                    <FaPlus />

                    Add Order

                </button>

            </div>

            <div className="search-box">

                <FaSearch />

                <input

                    type="text"

                    placeholder="Search Customer..."

                    value={search}

                    onChange={(e)=>setSearch(e.target.value)}

                />

            </div>

            <div className="table-card">

                {

                    loading ?

                    <h3>Loading...</h3>

                    :

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

                                filteredOrders.length===0 ?

                                (

                                    <tr>

                                        <td colSpan="8">

                                            No Orders Found

                                        </td>

                                    </tr>

                                )

                                :

                                (

                                    filteredOrders.map(order=>(

                                        <tr key={order._id}>

                                            <td>{order.customerName}</td>

                                            <td>{order.product}</td>

                                            <td>{order.weight} kg</td>

                                            <td>₹ {order.rate}</td>

                                            <td>₹ {order.amount}</td>

                                            <td>

                                                <span className={

                                                    order.paymentMode==="Cash"

                                                    ?

                                                    "cash"

                                                    :

                                                    "online"

                                                }>

                                                    {order.paymentMode}

                                                </span>

                                            </td>

                                            <td>

                                                <span className={

                                                    order.paymentStatus==="Paid"

                                                    ?

                                                    "paid"

                                                    :

                                                    "unpaid"

                                                }>

                                                    {order.paymentStatus}

                                                </span>

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

                }

            </div>

        </div>

    );

}

export default Records;