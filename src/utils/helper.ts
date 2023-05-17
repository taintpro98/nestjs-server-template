export const delay = (ms: number) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const calculateTimes = (day?: Date) => {
  if (!day) day = new Date();
  const nextDay = new Date(day);
  nextDay.setDate(day.getDate() + 1); // same time in next day
  nextDay.setUTCHours(0, 0, 0, 0); // first time in next day

  const dayAfterNextDay = new Date(nextDay);
  dayAfterNextDay.setDate(nextDay.getDate() + 1);

  return {
    start_time: nextDay,
    end_time: dayAfterNextDay,
    reward_time: new Date(dayAfterNextDay.getTime() + 3600000),
  };
};

export const convertISOString2Seconds = (isoTime: string | Date): number =>
  Math.floor(new Date(isoTime).getTime() / 1000);

export const roundNumber = (num: number, decimals: number): number =>
  Number(num.toFixed(decimals));

export const roundDownNumber = (num: number, decimals: number): number =>
  Math.floor(num * Math.pow(10, decimals)) / Math.pow(10, decimals); // lam tron 9 chu so thap phan

export const convertDateToUnixTimestamp = () =>
  Math.floor(new Date().getTime() / 1000);
