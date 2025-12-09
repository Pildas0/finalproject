function calculateWater() {
  const weight = document.getElementById("weight").value;
  if (!weight || weight <= 0) {
    document.getElementById("water-result").textContent = "Please enter a valid weight.";
    return;
  }
 
  const ml = weight * 30;
  const glasses = Math.round(ml / 250);
  document.getElementById("water-result").textContent =
    `Recommended daily water intake: ~${glasses} glasses (${ml} ml).`;
}

function suggestFasting() {
  const type = document.getElementById("fasting-type").value;
  const start = document.getElementById("start-time").value;
  if (!start) {
    document.getElementById("fasting-result").textContent = "Please select a start time.";
    return;
  }

  let startHour = parseInt(start.split(":")[0]);
  let endHour;

  if (type === "16-8") {
    endHour = (startHour + 8) % 24;
  } else if (type === "5-2") {
    // For 5:2, suggest a 12h eating window
    endHour = (startHour + 12) % 24;
  } else if (type === "ADF") {
    // Alternate Day Fasting → 24h cycle
    endHour = (startHour + 24) % 24;
  } else if (type === "TRF") {
    // Time Restricted Feeding → 10h eating window
    endHour = (startHour + 10) % 24;
  }

  document.getElementById("fasting-result").textContent =
    `Suggested eating window: from ${startHour}:00 to ${endHour}:00.`;
}