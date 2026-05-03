function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitUntilTarget() {
  const targetHour = 23;
  const targetMinute = 0;

  while (true) {
    const now = new Date();

    // convert ke WIB
    const wib = new Date(now.getTime() + (7 * 60 * 60 * 1000));

    const hour = wib.getUTCHours();
    const minute = wib.getUTCMinutes();

    console.log(`WIB Time: ${hour}:${minute}`);

    if (hour === targetHour && minute >= targetMinute) {
      console.log("✅ Reached 23:00 WIB");
      break;
    }

    await sleep(5000);
  }
}

waitUntilTarget();
