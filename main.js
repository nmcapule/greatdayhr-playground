import "dotenv/config";
import { Greatday, ENDPOINT_SUPERVISOR } from "./greatday.js";

(async () => {
  const client = new Greatday();
  await client.login(process.env.GDHR_USER, process.env.GDHR_PASS);

  const output = await client.req(ENDPOINT_SUPERVISOR);
  console.log(output);

  await client.logout();
})();
