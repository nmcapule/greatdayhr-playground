import "dotenv/config";
import colors from "colors";
import { Greatday, ENDPOINT_SUPERVISOR } from "./greatday.js";
import fs from "fs";
import ps from "prompt-sync";
import { Command } from "commander";

function formatWeirdDDMMYYYY(input) {
  return `${input.slice(6, 10)}-${input.slice(3, 5)}-${input.slice(0, 2)}`;
}

function extractTime(isodate) {
  if (!isodate) return "-----";
  return isodate?.slice(11, 16);
}

async function main(options) {
  let username, password;
  if (!fs.existsSync("./.env")) {
    console.log(
      "The .env does not exist in the current directory. Setting it up."
    );
    const prompt = ps();
    username = prompt("Your GreatdayHR username? ");
    password = prompt.hide("Your GreatdayHR password (hidden)? ");
    fs.writeFileSync(
      "./.env",
      `\
GDHR_USER=${username}
GDHR_PASS=${Buffer.from(password).toString("base64")}
`
    );
  } else {
    username = process.env.GDHR_USER;
    password = Buffer.from(process.env.GDHR_PASS, "base64").toString("ascii");
  }

  const client = new Greatday();

  try {
    await client.login(username, password);
  } catch (e) {
    console.error(colors.red.bold(e));
    return;
  }

  // const supervisor = await client.req(ENDPOINT_SUPERVISOR);
  // console.log(supervisor);

  // Note: Only up to 20 entries :P
  const attendances = await client.attendanceList(options);

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
}

const program = new Command();
program
  .name("gd")
  .description(
    "Quickly peek on your latest GreatdayHR schedules and attendances."
  )
  .version("0.0.1");

program
  .option("-s, --start-date <value>", "attendances to retrieve from date", null)
  .option("-e, --end-date <value>", "attendances to retrieve until date", null)
  .option("-a, --days-ago <value>", "attendances until days ago", null)
  .action(main);

program.parse();
