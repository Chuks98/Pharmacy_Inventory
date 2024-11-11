export function generatePrintCompletedOrder(order, dateSold, calculateTotalPrice) {
    return `
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order ${order.purchaseCode}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background-color: #f9f9f9;
              color: #333;
              width: 300px;
              border: 1px solid #ddd;
              padding: 15px;
            }
            .header {
              text-align: center;
              margin-bottom: 10px;
            }
            .header img {
              max-width: 100px;
              height: auto;
              margin-bottom: 10px;
            }
            .header h1 {
              font-size: 17px;
              margin: 0;
            }
            .header p {
              font-size: 14px;
              margin: 0;
            }
            .order-summary, .totals {
              font-size: 13px;
              margin-top: 10px;
            }
            .order-summary h2, .totals h3 {
              font-size: 15px;
              border-bottom: 1px dashed #333;
              padding-bottom: 5px;
            }
            .order-summary p, .totals p {
              margin: 5px 0;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            .items-table th, .items-table td {
              text-align: left;
              padding: 5px;
              font-size: 14px;
              border-bottom: 1px dashed #ddd;
            }
            .paymentTypes {
                font-size: 12px;
                margin-bottom: 15px;
                border-bottom: 1px dashed #333;
            }
            .paymentTypes p {
                font-size: 13px;
                font-weight: bold;
            }
            .totals {
              text-align: right;
            }
            .totals p strong {
              color: #4CAF50;
            }
            .footer {
              font-size: 13px;
              text-align: center;
              margin-top: 20px;
              border-top: 1px dashed #333;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${process.env.PUBLIC_URL}/logo1.jpg" alt="Healthy You Pharmacy Logo">
            <h1>Healthy You Pharmacy</h1>
            <p>Commissioner Quarters Near Demonstration Junction, Awka<br>
            Anambra, Nigeria<br>
            support@healthyyoupharmacy.com<br>
            +234 123 456 7890</p>
          </div>
  
          <div class="order-summary">
            <h2>Order Summary</h2>
            <p><strong>Order Code:</strong> ${order.purchaseCode}</p>
            <p><strong>Sales Rep:</strong> ${order.staff_name || order.userType}</p>
            <p><strong>Date:</strong> ${dateSold}</p>
          </div>
  
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.soldItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>₦${parseFloat(item.price).toFixed(2)}</td>
                  <td>${item.quantity}</td>
                  <td>₦${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="paymentTypes">
            <p>Payment Type(s)</p>
            ${typeof order.paymentType === 'object' && !Array.isArray(order.paymentType) ? 
              Object.entries(order.paymentType).map(([type, amount]) => `
                <span style="margin-right: 7px;">
                  <strong>${type}:</strong> ₦${amount}
                </span>
              `).join('') :
              `<span>${order.paymentType}</span>`
            }
          </div>
  
          <div class="totals">
            <p><strong>Total:</strong> ₦${new Intl.NumberFormat().format(calculateTotalPrice(order.soldItems))}.00</p>
            <p><strong>Discount:</strong> ₦${order.discount || "0.00"}</p>
            <p><strong>Paid:</strong> ₦${new Intl.NumberFormat().format(order.totalAmount)}.00</p>
            <p><strong>Balance:</strong> ₦${order.balance || "0.00"}</p>
          </div>
  
          <div class="footer">
            <p>Please confirm your goods before leaving. We shall not be liable for any shortage thereafter.</p>
            <p>Thank you for shopping with us. Please come again!</p>
            <p>Powered By: SalubreTech (08169564675)</p>
          </div>
        </body>
      </html>
    `;
  }
  