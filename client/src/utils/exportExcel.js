import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const formatDate = (value) => {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleDateString("en-GB");
};

const formatCurrency = (value) =>
    Number(value || 0).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });

export const exportOrdersToExcel = (
    orders = [],
    summary = {},
    filters = {}
) => {
    if (!orders.length) {
        window.alert(
            "No records are available for export."
        );

        return;
    }

    const generatedAt = new Date();

    /*
     * SUMMARY SHEET
     */
    const summaryRows = [
        ["SHIVALIK DRAGON FARM"],
        ["Orders and Payments Report"],
        [],
        [
            "Generated On",
            generatedAt.toLocaleString("en-IN")
        ],
        [
            "Start Date",
            filters.startDate
                ? formatDate(
                      `${filters.startDate}T00:00:00`
                  )
                : "All"
        ],
        [
            "End Date",
            filters.endDate
                ? formatDate(
                      `${filters.endDate}T00:00:00`
                  )
                : "All"
        ],
        [
            "Customer",
            filters.customerSearch || "All"
        ],
        [
            "Payment Status",
            filters.paymentStatus || "All"
        ],
        [
            "Payment Mode",
            filters.paymentMode || "All"
        ],
        [],
        ["REPORT SUMMARY"],
        [
            "Total Orders",
            Number(summary.totalOrders || 0)
        ],
        [
            "Total Weight",
            `${Number(
                summary.totalWeight || 0
            ).toLocaleString("en-IN", {
                maximumFractionDigits: 2
            })} kg`
        ],
        [
            "Total Amount",
            `₹ ${formatCurrency(
                summary.totalAmount
            )}`
        ],
        [
            "Paid Orders",
            Number(summary.paidOrders || 0)
        ],
        [
            "Paid Amount",
            `₹ ${formatCurrency(
                summary.paidAmount
            )}`
        ],
        [
            "Unpaid Orders",
            Number(summary.unpaidOrders || 0)
        ],
        [
            "Unpaid Amount",
            `₹ ${formatCurrency(
                summary.unpaidAmount
            )}`
        ],
        [
            "Cash Amount",
            `₹ ${formatCurrency(
                summary.cashAmount
            )}`
        ],
        [
            "Online Amount",
            `₹ ${formatCurrency(
                summary.onlineAmount
            )}`
        ]
    ];

    const summaryWorksheet =
        XLSX.utils.aoa_to_sheet(summaryRows);

    summaryWorksheet["!merges"] = [
        {
            s: { r: 0, c: 0 },
            e: { r: 0, c: 1 }
        },
        {
            s: { r: 1, c: 0 },
            e: { r: 1, c: 1 }
        },
        {
            s: { r: 10, c: 0 },
            e: { r: 10, c: 1 }
        }
    ];

    summaryWorksheet["!cols"] = [
        { wch: 24 },
        { wch: 34 }
    ];

    summaryWorksheet["!rows"] = [
        { hpt: 28 },
        { hpt: 22 }
    ];

    /*
     * ORDERS SHEET
     */
    const orderRows = orders.map(
        (order, index) => ({
            "Sr. No.": index + 1,

            Date: formatDate(
                order.date || order.createdAt
            ),

            Customer:
                order.customerName || "-",

            "Weight (kg)":
                Number(order.weight) || 0,

            "Amount (₹)":
                Number(order.amount) || 0,

            "Payment Mode":
                order.paymentMode || "-",

            "Payment Status":
                order.paymentStatus || "-"
        })
    );

    const ordersWorksheet =
        XLSX.utils.json_to_sheet(orderRows);

    ordersWorksheet["!cols"] = [
        { wch: 10 },
        { wch: 15 },
        { wch: 28 },
        { wch: 16 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 }
    ];

    ordersWorksheet["!autofilter"] = {
        ref: `A1:G${orderRows.length + 1}`
    };

    /*
     * CREATE WORKBOOK
     */
    const workbook = XLSX.utils.book_new();

    workbook.Props = {
        Title:
            "Shivalik Dragon Farm Orders Report",

        Subject:
            "Filtered orders and payment report",

        Author: "Shivalik Dragon Farm",

        Company: "Shivalik Dragon Farm",

        CreatedDate: generatedAt
    };

    XLSX.utils.book_append_sheet(
        workbook,
        summaryWorksheet,
        "Report Summary"
    );

    XLSX.utils.book_append_sheet(
        workbook,
        ordersWorksheet,
        "Order Details"
    );

    const excelBuffer = XLSX.write(
        workbook,
        {
            bookType: "xlsx",
            type: "array"
        }
    );

    const excelBlob = new Blob(
        [excelBuffer],
        {
            type:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        }
    );

    const fileDate = generatedAt
        .toISOString()
        .slice(0, 10);

    saveAs(
        excelBlob,
        `Shivalik_Orders_Report_${fileDate}.xlsx`
    );
};