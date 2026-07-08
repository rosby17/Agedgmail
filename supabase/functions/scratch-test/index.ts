import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
serve(async (req) => {
  const apiKey = Deno.env.get("SMSCODES_API_KEY");
  
  // Try checking the service list properly
  const res = await fetch(`https://code.smscodes.io/api/sms/GetServices?key=${apiKey}`);
  const services = await res.json();
  
  const target = "8a97735e-9a14-427e-8a88-e9d999bf3429";
  
  return new Response(JSON.stringify({ 
    "services_response": services,
    "has_target": Array.isArray(services.Services) ? services.Services.some(s => s.Id === target) : false
  }), { headers: { "Content-Type": "application/json" } });
});
