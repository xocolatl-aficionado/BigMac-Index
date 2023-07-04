<script>
  import { afterUpdate, onMount } from 'svelte';

  export let countries;
  export let selectedCountry1;
  export let selectedCountry2;
  let exchangeRate;
  let valuation;
  const bigMacPrices = { "CAD": 6.77, "CNY": 24, "INR": 191, "USD": 5.15, "EUR": 4.65, "CHF": 6.5 }; // hardcoded
  let showBigMacContainer = false;

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
    showBigMacContainer = true;
  }

  onMount(async () => {
    await handleCountryChange();
    valuation = calculateValuation();
  });
  
    function formatNumber(value) {
    return Number(value).toFixed(2);
  }

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
    {#key selectedCountry1, selectedCountry2}
    <div class="result-container">
      <p class="valuation">{valuation}</p>
      <p class="exchange-rate">Exchange Rate: {formatNumber(exchangeRate)}</p>
      <p class="implied-exchange-rate">Implied Exchange Rate: {formatNumber(bigMacPrices[selectedCountry2.code] / bigMacPrices[selectedCountry1.code])}</p>
    </div>
    <div class="big-mac-container {showBigMacContainer ? 'show' : ''}">
      <div class="big-mac-info">
        <p>
          A Big Mac bought in {selectedCountry1.name} for {formatNumber(bigMacPrices[selectedCountry1.code])} {selectedCountry1.code}
          would be valued at {formatNumber(bigMacPrices[selectedCountry2.code] / exchangeRate)} {selectedCountry1.code} in {selectedCountry2.name}
        </p>
      </div>
      <div class="image-container">
        <div>
          <img class="big-mac-image" src="https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off" alt="Big Mac">
          <p class="label">{formatNumber(bigMacPrices[selectedCountry1.code])} {selectedCountry1.code}</p>
        </div>
        <div>
          <img class="big-mac-image" src="https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off" alt="Big Mac">
          <p class="label">{formatNumber(bigMacPrices[selectedCountry2.code] / exchangeRate)} {selectedCountry1.code}</p>
        </div>
      </div>
    </div>
    {/key}
  {/if}
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');

  main {
    text-align: center;
    padding: 1em;
    max-width: 400px;
    margin: 0 auto;
  }

  .big-mac-container {
    opacity: 0;
    transition: opacity 1s;
  }

  .big-mac-container.show {
    opacity: 1;
  }
  .image-container {
    display: flex;
    flex-direction: row;
    margin-top: 20px;
    justify-content: center;
  }
  .image-container > div {
    text-align: center; /* Add this line to center align the image and label within each div */
    margin-right: 20px; /* Add this line to create some spacing between the image and the label */
  }

  .big-mac-image {
    width: 500px;

  }

  .label {
    text-align: center;
    margin-top: 10px;
    font-family: 'Permanent Marker', cursive;
    font-size: 25pt
  }


</style>
