const { RestClientV5 } = require('bybit-api');

const client = new RestClientV5({
  key: process.env.API_KEY,
  secret: process.env.API_SECRET,
  testnet: true // gunakan testnet
});

const SYMBOL = 'BTCUSDT';
const LEVERAGE = 25;
const USE_BALANCE_PERCENT = 0.95;

// ambil balance
async function getBalance() {
  const res = await client.getWalletBalance({
    accountType: 'UNIFIED'
  });

  const usdt = res.result.list[0].coin.find(c => c.coin === 'USDT');

  return parseFloat(usdt.availableToWithdraw);
}

// ambil harga
async function getPrice() {
  const ticker = await client.getTickers({
    category: 'linear',
    symbol: SYMBOL
  });

  return parseFloat(ticker.result.list[0].lastPrice);
}

// hitung qty
async function calculateQty() {
  const balance = await getBalance();
  const price = await getPrice();

  const qty = ((balance * USE_BALANCE_PERCENT) * LEVERAGE) / price;

  return qty.toFixed(3);
}

// set leverage
async function setLeverage() {
  await client.setLeverage({
    category: 'linear',
    symbol: SYMBOL,
    buyLeverage: LEVERAGE.toString(),
    sellLeverage: LEVERAGE.toString()
  });
}

// open short
async function openShort(qty) {
  const res = await client.submitOrder({
    category: 'linear',
    symbol: SYMBOL,
    side: 'Sell',
    orderType: 'Market',
    qty: qty
  });

  return res;
}

// set stop loss
async function setStopLoss(entryPrice) {
  const slPrice = entryPrice * 1.02; // 2% SL

  await client.setTradingStop({
    category: 'linear',
    symbol: SYMBOL,
    stopLoss: slPrice.toFixed(2)
  });
}

// main function
async function runBot() {
  try {
    console.log("🚀 BOT START");

    const balance = await getBalance();
    console.log("Balance:", balance);

    if (balance <= 1) {
      console.log("❌ Balance terlalu kecil");
      return;
    }

    await setLeverage();

    const price = await getPrice();
    console.log("Price:", price);

    const qty = await calculateQty();
    console.log("Qty:", qty);

    const order = await openShort(qty);
    console.log("✅ SHORT OPENED");

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

runBot();
