<script>
  import { onMount } from "svelte";

  export let countries;
  export let selectedCountry1;
  export let selectedCountry2;
  let exchangeRate;
  let valuation;
  const bigMacPrices = { "CAD": 6.77, "CNY": 24, "INR": 191, "USD": 5.15, "EUR": 4.65, "CHF": 6.5 }; // hardcoded

  async function fetchExchangeRate(foreignCountry) {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${selectedCountry1.code}`);
    const data = await response.json();
    return data.rates[foreignCountry];
  }

  function calculateValuation() {
    const price1 = bigMacPrices[selectedCountry1.code];
    const price2 = bigMacPrices[selectedCountry2.code];

    const impliedExchangeRate = price2 / price1;
    const foreignPrice = price2 / exchangeRate;

    if (impliedExchangeRate > exchangeRate) {
      return `${selectedCountry2.code} is overvalued relative to ${selectedCountry1.code}`;
    } else if (impliedExchangeRate < exchangeRate) {
      return `${selectedCountry2.code} is undervalued relative to ${selectedCountry1.code}`;
    } else {
      return `${selectedCountry2.code} is fairly valued relative to ${selectedCountry1.code}`;
    }
  }

  async function handleCountryChange() {
    exchangeRate = await fetchExchangeRate(selectedCountry2.code);
    valuation = calculateValuation();
  }

 

  onMount(async () => {
    await handleCountryChange();
    valuation = calculateValuation();
  });
</script>

<main>
  <h1>Big Mac Index Currency Valuation</h1>
  <select bind:value={selectedCountry1} on:change={handleCountryChange}>
    {#each countries as country}
    <option value={country}>{country.name}</option>
    {/each}
  </select>
  <select bind:value={selectedCountry2} on:change={handleCountryChange}>
    {#each countries as country}
    <option value={country}>{country.name}</option>
    {/each}
  </select>

  {#if valuation}
  <p>
    Valuation: {valuation}
    <br>
    Exchange rate: {exchangeRate}
    <br>
    Implied Exchange rate: {bigMacPrices[selectedCountry2.code] / bigMacPrices[selectedCountry1.code]}
  </p>

  <p>
    A Big Mac bought in {selectedCountry1.name} for {bigMacPrices[selectedCountry1.code]} {selectedCountry1.code}
    would be valued at {bigMacPrices[selectedCountry2.code] / exchangeRate} {selectedCountry1.code} in {selectedCountry2.name}
  </p>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 1em;
    max-width: 400px;
    margin: 0 auto;
  }
</style>
