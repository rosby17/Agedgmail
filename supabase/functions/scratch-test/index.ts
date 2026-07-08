import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { getCode } from "https://esm.sh/country-list@2.3.0";
serve(async (req) => {
  const apiKey = Deno.env.get("PVAPINS_API_KEY");
  const res = await fetch('https://api.pvapins.com/user/api/load_countries.php');
  const countries = await res.json();
  const mapped = countries.map(c => ({
    name: c.full_name,
    iso: getCode(c.full_name) || (c.full_name === 'UK' ? 'GB' : c.full_name === 'USA' ? 'US' : c.full_name === 'Russia' ? 'RU' : null)
  })).filter(c => c.iso);
  return new Response(JSON.stringify(mapped), { headers: { "Content-Type": "application/json" } });
});
