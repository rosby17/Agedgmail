const https = require('https');

// Remplace ceci par ta vraie clé API (temporairement juste pour lancer ce script)
const API_KEY = "TA_CLE_API_ICI";

if (API_KEY === "TA_CLE_API_ICI") {
  console.log("⚠️ Veuillez remplacer TA_CLE_API_ICI par votre vraie clé API dans le script.");
  process.exit(1);
}

const url = `https://code.smscodes.io/api/sms/GetServiceCodes?key=${API_KEY}`;

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      if (response.Status === "200") {
        console.log(`✅ Succès ! ${response.ActiveServices} services trouvés.\n`);
        
        // Chercher spécifiquement YouTube ou Google
        const keywords = ['youtube', 'google', 'gmail'];
        console.log("🔍 Recherche des services liés à YouTube/Google :");
        
        const matches = response.Services.filter(s => 
          keywords.some(k => s.name.toLowerCase().includes(k))
        );
        
        if (matches.length > 0) {
          matches.forEach(m => console.log(`- Nom: ${m.name} | Service ID: ${m.id}`));
        } else {
          console.log("Aucun service correspondant n'a été trouvé. Voici la liste complète :");
          console.log(response.Services.map(s => `${s.name} (ID: ${s.id})`).join('\n'));
        }
      } else {
        console.error("❌ Erreur de l'API :", response);
      }
    } catch (e) {
      console.error("❌ Erreur lors du parsing :", e);
    }
  });

}).on('error', (err) => {
  console.error("❌ Erreur réseau :", err.message);
});
