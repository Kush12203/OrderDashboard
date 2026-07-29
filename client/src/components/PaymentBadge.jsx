function PaymentBadge({ paymentMode }) {

    return (

        <span
            className={
                paymentMode==="Cash"
                ?
                "cash"
                :
                "online"
            }
        >

            {paymentMode}

        </span>

    );

}

export default PaymentBadge;