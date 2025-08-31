function getRandomFloat(max) {
  return Math.random() * (max - 0) + 0;
}

function GetTimeAndDate() {
  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes();
  if (hours < 10) hours = "0" + hours;
  if (minutes < 10) minutes = "0" + minutes;

  const timeString = `${hours}:${minutes}`;
  const dateString = formatDate(now); // 👉 dd-mm-yyyy

  return { date: dateString, time: timeString };
}

function formatDate(date) {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  if (day < 10) day = "0" + day;
  if (month < 10) month = "0" + month;

  return `${day}-${month}-${year}`;
}


module.exports = { getRandomFloat, GetTimeAndDate };