import { useQuery } from "@tanstack/react-query";

interface ExchangeRates {
  [currency: string]: number;
}

const POPULAR_CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦" },
  { code: "ZAR", name: "South African Rand", symbol: "R" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺" },
  { code: "PKR", name: "Pakistani Rupee", symbol: "₨" },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳" },
];

export const CURRENCIES = POPULAR_CURRENCIES;

export const useExchangeRates = () => {
  return useQuery({
    queryKey: ["exchange-rates"],
    queryFn: async (): Promise<ExchangeRates> => {
      // Using the free exchangerate.host API
      const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
      if (!res.ok) throw new Error("Failed to fetch exchange rates");
      const data = await res.json();
      return data.rates as ExchangeRates;
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    retry: 2,
  });
};

export const convertPrice = (usdAmount: number, rate: number): string => {
  const converted = usdAmount * rate;
  // For currencies with large values (like JPY, KRW, IDR), show no decimals
  if (converted >= 100) {
    return converted.toFixed(0);
  }
  return converted.toFixed(2);
};
