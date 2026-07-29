function StatusBadge({ status }) {

    return (

        <span
            className={
                status==="Paid"
                ?
                "paid"
                :
                "unpaid"
            }
        >

            {status}

        </span>

    );

}

export default StatusBadge;