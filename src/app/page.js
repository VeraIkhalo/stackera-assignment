"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function Home() {
  const [btcData, setBtcData] = useState({
    lastPrice: null,
    markPrice: null,
    high24h: null,
    low24h: null,
    turnover24h: null,
    percentChange24h: null,
  });
  const [priceChange, setPriceChange] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const ws = new WebSocket("wss://stream.bybit.com/v5/public/linear");

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          op: "subscribe",
          args: ["tickers.BTCUSDT"],
        })
      );
    };

    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data); // Debugging incoming data
      const data = JSON.parse(event.data);
      if (data.topic === "tickers.BTCUSDT") {
        const ticker = data.data[0];
        setPriceChange(
          btcData.lastPrice && ticker.lastPrice > btcData.lastPrice
            ? "increase"
            : ticker.lastPrice < btcData.lastPrice
            ? "decrease"
            : null
        );
        setBtcData({
          lastPrice: ticker.lastPrice,
          markPrice: ticker.markPrice,
          high24h: ticker.highPrice24h,
          low24h: ticker.lowPrice24h,
          turnover24h: ticker.turnover24h,
          percentChange24h: ticker.priceChangePercent24h,
        });
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => ws.close();
  }, [btcData.lastPrice]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        theme === "light" ? "bg-white text-black" : "bg-black text-white"
      }`}
    >
      <button
        onClick={toggleTheme}
        className="mb-4 p-2 border rounded bg-gray-200 dark:bg-gray-800"
      >
        Toggle {theme === "light" ? "Dark" : "Light"} Mode
      </button>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          className={`p-4 border rounded shadow-md ${
            priceChange === "increase"
              ? "bg-green-100"
              : priceChange === "decrease"
              ? "bg-red-100"
              : ""
          }`}
        >
          <h2 className="text-lg font-bold">BTC/USDT</h2>
          <p>Last Price: {btcData.lastPrice || "Loading..."}</p>
          <p>Mark Price: {btcData.markPrice || "Loading..."}</p>
          <p>24h High: {btcData.high24h || "Loading..."}</p>
          <p>24h Low: {btcData.low24h || "Loading..."}</p>
          <p>24h Turnover: {btcData.turnover24h || "Loading..."}</p>
          <p>24h Change: {btcData.percentChange24h || "Loading..."}%</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">TradingView Chart</h2>
        <div id="tradingview-widget-container">
          <div id="tradingview-widget"></div>
        </div>
        <Script
          src="https://s3.tradingview.com/tv.js"
          onLoad={() => {
            new TradingView.widget({
              container_id: "tradingview-widget",
              autosize: true,
              symbol: "BINANCE:BTCUSDT",
              interval: "1",
              timezone: "Etc/UTC",
              theme: theme,
              style: "1",
              locale: "en",
              toolbar_bg: "#f1f3f6",
              enable_publishing: false,
              allow_symbol_change: true,
              details: true,
              hotlist: true,
            });
          }}
        />
      </div>
    </div>
  );
}
