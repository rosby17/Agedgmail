import { Chariow } from 'chariow-sdk';

async function main() {
  try {
    const client = new Chariow('sk_a5le4y2z_c0ab32217cf43c832d3ec96b8bede947');
    
    console.log("Creating webhook...");
    // Assuming hooks is on the client instance directly
    const result = await client.hooks.create({
      url: 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/chariow-webhook',
      events: ['payment.succeeded'],
    });
    console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
