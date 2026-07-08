const bestPrices = new Map();
const fivesimCountryToIso = {
  'usa': 'US', 'england': 'GB', 'france': 'FR', 'germany': 'DE', 'russia': 'RU',
  'canada': 'CA', 'spain': 'ES', 'italy': 'IT', 'ukraine': 'UA', 'poland': 'PL',
  'india': 'IN', 'indonesia': 'ID', 'brazil': 'BR', 'mexico': 'MX', 'vietnam': 'VN',
  'romania': 'RO', 'egypt': 'EG',
};
const res = await fetch('https://5sim.net/v1/guest/prices');
const data = await res.json();

let count = 0;
if (data) {
  for (const [countryName, products] of Object.entries(data as any)) {
    if (products && (products as any).google) {
      const operators = (products as any).google;
      let lowest = Infinity;
      for (const [opName, opData] of Object.entries(operators as any)) {
        if (opData.cost && opData.cost < lowest && opData.count > 0) {
          lowest = opData.cost;
        }
      }
      if (lowest < Infinity) {
        const costUsd = lowest * 0.011; 
        let targetIso = fivesimCountryToIso[countryName.toLowerCase()];
        if (!targetIso) { targetIso = "XX_" + count++; }
        
        bestPrices.set(targetIso, {
          Country: countryName,
          Price: costUsd
        });
      }
    }
  }
}
console.log("Total countries found with google in stock:", bestPrices.size);
console.log("Russia price:", bestPrices.get('RU')?.Price);
