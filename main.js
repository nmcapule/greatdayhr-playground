import "dotenv/config";
import colors from "colors";
import { Greatday, ENDPOINT_SUPERVISOR } from "./greatday.js";
import fs from "fs";
import ps from "prompt-sync";

function formatWeirdDDMMYYYY(input) {
  return `${input.slice(6, 10)}-${input.slice(3, 5)}-${input.slice(0, 2)}`;
}

function extractTime(isodate) {
  if (!isodate) return "-----";
  return isodate?.slice(11, 16);
}

(async () => {
  if (!fs.existsSync("./.env")) {
    console.log(
      "The .env does not exist in the current directory. Setting it up."
    );
    const prompt = ps();
    const username = prompt("Your GreatdayHR username? ");
    const password = prompt.hide("Your GreatdayHR password (hidden)? ");
    fs.writeFileSync(
      "./.env",
      `\
GDHR_USER=${username}
GDHR_PASS=${password}
`
    );
    process.env.GDHR_USER = username;
    process.env.GDHR_PASS = password;
  }

  const client = new Greatday();
  await client.login(process.env.GDHR_USER, process.env.GDHR_PASS);

  // const supervisor = await client.req(ENDPOINT_SUPERVISOR);
  // console.log(supervisor);

  // Note: Only up to 20 entries :P
  const attendances = await client.attendanceList({});

  for (const att of attendances.data) {
    if (
      !att.productivehours ||
      att.otherStatus.includes("HLDY") ||
      att.otherStatus.includes("VL")
    ) {
      att.shiftstarttime = null;
      att.shiftendtime = null;
    }

    const shiftstarttime = extractTime(att.shiftstarttime);
    const shiftendtime = extractTime(att.shiftendtime);
    const starttime = extractTime(att.starttime);
    const endtime = extractTime(att.endtime);

    const startOk =
      !att.shiftstarttime || (att.starttime && starttime <= shiftstarttime);
    const start = `${
      !startOk ? colors.red.bold(starttime) : colors.green(starttime)
    }/${colors.dim(shiftstarttime)}`;
    const endOk = !att.shiftendtime || (att.endtime && endtime >= shiftendtime);
    const end = `${
      !endOk ? colors.red.bold(endtime) : colors.green(endtime)
    }/${colors.dim(shiftendtime)}`;

    const date = formatWeirdDDMMYYYY(att.time);

    console.log(
      `> ${colors.bold(date)}  ${start} to ${end} ${att.otherStatus}`
    );
  }

  await client.logout();
})();
