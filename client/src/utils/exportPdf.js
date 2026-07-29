import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

export const exportOrdersToPdf = (
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

    const document = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });

    const generatedAt = new Date();

    document.setFont("helvetica", "bold");
    document.setFontSize(20);

    document.text(
        "SHIVALIK DRAGON FARM",
        14,
        16
    );

    document.setFontSize(13);

    document.text(
        "Orders and Payments Report",
        14,
        24
    );

    document.setFont("helvetica", "normal");
    document.setFontSize(9);

    document.text(
        `Generated On: ${generatedAt.toLocaleString(
            "en-IN"
        )}`,
        14,
        31
    );

    const filterText = [
        `Start Date: ${
            filters.startDate
                ? formatDate(
                      `${filters.startDate}T00:00:00`
                  )
                : "All"
        }`,
        `End Date: ${
            filters.endDate
                ? formatDate(
                      `${filters.endDate}T00:00:00`
                  )
                : "All"
        }`,
        `Customer: ${
            filters.customerSearch || "All"
        }`,
        `Status: ${
            filters.paymentStatus || "All"
        }`,
        `Mode: ${
            filters.paymentMode || "All"
        }`
    ].join("    |    ");

    document.text(
        filterText,
        14,
        37
    );

    autoTable(document, {
        startY: 43,

        head: [
            [
                "Total Orders",
                "Total Weight",
                "Total Amount",
                "Paid Amount",
                "Unpaid Amount",
                "Cash Amount",
                "Online Amount"
            ]
        ],

        body: [
            [
                summary.totalOrders || 0,

                `${Number(
                    summary.totalWeight || 0
                ).toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                })} kg`,

                `Rs. ${formatCurrency(
                    summary.totalAmount
                )}`,

                `Rs. ${formatCurrency(
                    summary.paidAmount
                )}`,

                `Rs. ${formatCurrency(
                    summary.unpaidAmount
                )}`,

                `Rs. ${formatCurrency(
                    summary.cashAmount
                )}`,

                `Rs. ${formatCurrency(
                    summary.onlineAmount
                )}`
            ]
        ],

        theme: "grid",

        styles: {
            fontSize: 8,
            cellPadding: 3,
            halign: "center"
        },

        headStyles: {
            fillColor: [79, 70, 229],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        }
    });

    autoTable(document, {
        startY:
            document.lastAutoTable.finalY + 10,

        head: [
            [
                "Sr. No.",
                "Date",
                "Customer",
                "Weight",
                "Amount",
                "Payment Mode",
                "Payment Status"
            ]
        ],

        body: orders.map(
            (order, index) => [
                index + 1,

                formatDate(
                    order.date ||
                        order.createdAt
                ),

                order.customerName || "-",

                `${Number(
                    order.weight || 0
                ).toLocaleString("en-IN", {
                    maximumFractionDigits: 2
                })} kg`,

                `Rs. ${formatCurrency(
                    order.amount
                )}`,

                order.paymentMode || "-",

                order.paymentStatus || "-"
            ]
        ),

        theme: "striped",

        styles: {
            fontSize: 8,
            cellPadding: 3,
            textColor: [51, 65, 85]
        },

        headStyles: {
            fillColor: [15, 23, 42],
            textColor: [255, 255, 255],
            fontStyle: "bold"
        },

        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },

        columnStyles: {
            0: {
                halign: "center",
                cellWidth: 15
            },

            1: {
                cellWidth: 24
            },

            2: {
                cellWidth: 50
            },

            3: {
                halign: "right",
                cellWidth: 25
            },

            4: {
                halign: "right",
                cellWidth: 30
            },

            5: {
                halign: "center",
                cellWidth: 30
            },

            6: {
                halign: "center",
                cellWidth: 32
            }
        },

        didDrawPage: (data) => {
            const pageCount =
                document.internal.getNumberOfPages();

            document.setFontSize(8);
            document.setTextColor(
                100,
                116,
                139
            );

            document.text(
                `Page ${pageCount}`,
                document.internal.pageSize.getWidth() -
                    25,
                document.internal.pageSize.getHeight() -
                    8
            );

            document.text(
                "Shivalik Dragon Farm",
                14,
                document.internal.pageSize.getHeight() -
                    8
            );
        }
    });

    const fileDate = generatedAt
        .toISOString()
        .slice(0, 10);

    document.save(
        `Shivalik_Orders_Report_${fileDate}.pdf`
    );
};