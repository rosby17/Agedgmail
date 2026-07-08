import { Chariow } from 'chariow-sdk';

async function main() {
  try {
    const client = new Chariow('sk_a5le4y2z_c0ab32217cf43c832d3ec96b8bede947');
    
    // Attempt with unit_price
    const payment = await client.pay.checkout({
      items: [{ product_id: 'prd_x13id6vj', quantity: 1, unit_price: 5.50 }],
      customer_email: 'test@example.com',
      currency: 'USD',
      success_url: 'https://example.com'
    });
    console.log("Success with unit_price:", payment.checkout_url);
  } catch (err) {
    console.error("Error with unit_price:", err.message);
  }
}

main();
