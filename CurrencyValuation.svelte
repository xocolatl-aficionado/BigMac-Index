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
  <h1>Big Mac Index</h1>
  <h1>How valuable is <span class="different-color">your</span>  currency?</h1>
  
  <select bind:value={selectedCountry1} on:change={handleCountryChange} id="country1-dropdown">
    {#each countries as country}
      <option value={country}>{country.name}</option>
    {/each}
  </select>
  <select bind:value={selectedCountry2} on:change={handleCountryChange} id="country2-dropdown">
    {#each countries as country}
      <option value={country}>{country.name}</option>
    {/each}
  </select>

  {#if valuation}
    {#key selectedCountry1, selectedCountry2}
    <div class="result-container">
      <p class="valuation">{valuation} 
      <br>
      Exchange Rate: <span class="bold-number">{formatNumber(exchangeRate)}</span> Implied Exchange Rate: <span class="bold-number">{formatNumber(bigMacPrices[selectedCountry2.code] / bigMacPrices[selectedCountry1.code])}</span>
      <br>
      A Big Mac bought in {selectedCountry1.name} for <span class="bold-number">{formatNumber(bigMacPrices[selectedCountry1.code])} {selectedCountry1.code} </span>
          <br> would be valued at <span class="bold-number">{formatNumber(bigMacPrices[selectedCountry2.code] / exchangeRate)} {selectedCountry1.code}</span> in {selectedCountry2.name}
      </p>
    </div>
    <div class="big-mac-container {showBigMacContainer ? 'show' : ''}">
    
      <div class="image-container">
        <div>
          <img class="big-mac-image" src="https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off" alt="Big Mac">
          <p class="label">
            <span class="flag-icon flag-icon-{selectedCountry1.code.toLowerCase()}"></span>
            {formatNumber(bigMacPrices[selectedCountry1.code])} {selectedCountry1.code}
          </p>        
        </div>
        <div>
          <img class="big-mac-image" src="https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off" alt="Big Mac">
          <p class="label">
            <span class="flag-icon flag-icon-{selectedCountry2.code.toLowerCase()}"></span>
            {formatNumber(bigMacPrices[selectedCountry2.code] / exchangeRate)} {selectedCountry1.code}
          </p>        
          </div>
      </div>
    </div>
    {/key}
  {/if}
</main>

<style>
  @import url('https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@200&display=swap');
  select,
  p {
    font-family: 'Oswald', sans-serif;
    font-size: 20pt;
  }
  
  main {
    text-align: center;
    padding: 1em;
    max-width: 400px;
    margin: 0 auto;
  }
  
  h1{
     /* font-family: 'Permanent Marker', cursive; */
     margin-top: 0;
     margin-bottom: 0;
     font-family: 'Oswald', sans-serif;
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
    margin-top: 0;
    justify-content: center;
    align-items: center; 
    position: relative;
  }
  .image-container > div {
    text-align: center; /* Add this line to center align the image and label within each div */
    margin-right: 20px; /* Add this line to create some spacing between the image and the label */
  }

  .big-mac-image {
    width: 300px;

  }

  .label {
    text-align: center;
    margin-top: 10px;
    font-family: 'Permanent Marker', cursive;
    font-size: 20pt
  }
  
  .flag-icon {
    display: inline-block;
    width: 1.5em;
    height: 1em;
    background-position: 50%;
    background-repeat: no-repeat;
    font-size: 1.5em;
  }

  /* Example styles for flag icons using the flag-icon-css library */
  .flag-icon.flag-icon-cad {
    width: 1.5em;
    height: 1em;
    background-image: url('https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/flags/1x1/ca.svg');
  }

  .flag-icon.flag-icon-cny {
    background-image: url('https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/flags/1x1/cn.svg');
  }

  .flag-icon.flag-icon-inr {
    background-image: url('https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/flags/1x1/in.svg');
  }

  .flag-icon.flag-icon-usd {
    background-image: url('https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/flags/1x1/us.svg');
  }

  .flag-icon.flag-icon-eur {
    background-image: url('https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/flags/1x1/eu.svg');
  }

  .flag-icon.flag-icon-chf {
    background-image: url('https://cdn.jsdelivr.net/npm/flag-icon-css@3.5.0/flags/1x1/ch.svg');
  }
  .different-color {
  color: red; 
  font-style: italic;
  }
#country2-dropdown {
  border: 2px solid red; /* Specify the desired border width and color */
  border-radius: 4px; /* Add rounded corners to the border if desired */
  padding: 8px; /* Add padding to create some space between the text and the border */
}

#country1-dropdown {
  border-radius: 4px; /* Add rounded corners to the border if desired */
  padding: 8px; /* Add padding to create some space between the text and the border */
}
 
 .bold-number {
  font-weight: bold;
}
.result-container p {
    white-space: nowrap;
  
  }
  .result-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }


</style>
