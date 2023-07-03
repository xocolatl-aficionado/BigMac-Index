<script>
  export let countries;
  export let selectedCountry1;
  export let selectedCountry2;
  let impliedExchangeRate;
  let exchangeRate;
  let bigMacPrices;
  let foreignPrice;
  let price1;
  let price2;

  async function fetchExchangeRate() {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${selectedCountry1.code}`
    );
    const data = await response.json();
    exchangeRate = data.rates[selectedCountry2.code];
    
    // const bigMacResponse = await fetch('https://api.example.com/bigmacindex');
    // const bigMacData = await bigMacResponse.json();
    bigMacPrices = {"CAD": 6.77, "CNY": 24, "INR": 191, "USD": 5.15, "EUR": 4.65 } //hardcoded
  }

function calculateValuation() {
  if (!exchangeRate) return "";
  console.log("selectedCountry2.code: " + selectedCountry2.code);

  price1 = bigMacPrices[selectedCountry1.code];
  price2 = bigMacPrices[selectedCountry2.code];

  if (price1 && price2) {
    impliedExchangeRate = price2 / price1;
    console.log("implied: " + impliedExchangeRate);
    console.log("real: " + exchangeRate)
    foreignPrice =  price2/exchangeRate;

    if (impliedExchangeRate > exchangeRate) {
      return `${selectedCountry2.code} is overvalued relative to ${selectedCountry1.code}`;
    } else if (impliedExchangeRate < exchangeRate) {
      return `${selectedCountry2.code} is undervalued relative to ${selectedCountry1.code}`;
    } else {
      return `${selectedCountry2.code} is fairly valued relative to ${selectedCountry1.code}`;
    }
  } else {
    return "";
  }
}

 $: {
    if (selectedCountry1 || selectedCountry2) {
      fetchExchangeRate().then(rate => {
        exchangeRate = rate;
        calculateValuation();
      });
    }
 }
  
</script>

<main>
  <h1>Big Mac Index Currency Valuation</h1>
  <select bind:value={selectedCountry1}>
    {#each countries as country}
      <option value={country}>{country.name}</option>
    {/each}
  </select>
  <select bind:value={selectedCountry2}>
    {#each countries as country}
      <option value={country}>{country.name}</option>
    {/each}
  </select>

  <p>
    {#if exchangeRate}
      Valuation: {calculateValuation()}
      
      Exchange rate: {exchangeRate}
      Implied Exchange rate: {impliedExchangeRate}
    {/if}
    {#if bigMacPrices}
      A Big Mac bought in {selectedCountry1.name} for {price1} {selectedCountry1.code} would be valued at {foreignPrice} {selectedCountry1.code} in {selectedCountry2.name}!
    {/if}

  </p>
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 400px;
    margin: 0 auto;
  }
</style>
