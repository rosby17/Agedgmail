import fetch from 'node-fetch';

async function main() {
  try {
    const res = await fetch('https://api.chariow.com/v1/checkout', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk_a5le4y2z_c0ab32217cf43c832d3ec96b8bede947',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product_id: 'prd_x13id6vj',
        quantity: 1,
        amount: 5,
        customer_email: 'test@example.com',
        success_url: 'https://example.com'
      })
    });
    const data = await res.json();
    console.log("Response:", data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

main();
