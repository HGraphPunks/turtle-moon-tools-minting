export const donation = async (xactClient, accountId, amount, setLoading) => {
    setLoading(true)
    /* HBAR donation account information */
    const hbarAmount = parseInt(amount);
    const toAccountId = '0.0.591814';
    const fromAccountId = accountId;
    
    /* Get Xact Fees */
    const xactFees = await xactClient.getXactFeesPayment(100);
    console.log(xactFees)
    
    /* Request for payment */
    await xactClient.pay({toAccountId, fromAccountId, hbarAmount});
    
    /* Listen for Payment's success */
    xactClient.paymentValidation().subscribe(payment => {
        console.log('new Payment', payment);
        if (payment?.status !== "Accepted") {
            alert("Donation transaction failed.")
        }
        alert("Thank you for the donation!")
        setLoading(false)
    });
}