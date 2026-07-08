const { Chariow } = require('chariow-sdk');
const { HooksAPI } = require('chariow-sdk/hooks');

async function main() {
  try {
    const client = new Chariow('sk_a5le4y2z_c0ab32217cf43c832d3ec96b8bede947');
    const hooks = new HooksAPI(client);
    
    console.log("Creating webhook...");
    const result = await hooks.create({
      url: 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/chariow-webhook',
      events: ['payment.succeeded'],
    });
    console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err);
  }
}

main();
