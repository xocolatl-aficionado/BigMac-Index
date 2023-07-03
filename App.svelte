<script>
  import CurrencyValuation from './CurrencyValuation.svelte';

  const countries = [
    { name: "United States", code: "USD" },
    { name: "Eurozone", code: "EUR" },
    { name: "India", code: "INR" },
    { name: "China", code: "CNY" },
    { name: "Canada", code: "CAD" },
    // Add more countries as needed
  ];
</script>

<CurrencyValuation
  {countries}
  selectedCountry1={undefined}
  selectedCountry2={undefined}
/>
