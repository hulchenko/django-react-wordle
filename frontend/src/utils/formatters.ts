const dateFormat = (date: string) => {
  if (!date) {
    return null;
  }
  const month = new Date(date).toLocaleString("en-CA", { month: "long" });
  const day = new Date(date).getDate();
  let hours: string | number = new Date(date).getHours();
  let minutes: string | number = new Date(date).getMinutes();

  if (hours >= 0 && hours <= 9) {
    hours = "0" + hours;
  }
  if (minutes >= 0 && minutes <= 9) {
    minutes = "0" + minutes;
  }

  return `${month} ${day}, ${hours}:${minutes}`;
};

const scoreFormat = (score: number) => {
  if (score === 0) return 0;
  if (!score) return "N/A";
  return score;
};

export { dateFormat, scoreFormat };
