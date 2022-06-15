# GreatdayHR Playground

An attempt to reverse engineer the APIs from app.greatdayhr.com, but only working for now for Hexaware employees :P

Currently, it only displays your schedule and highlights which ones you are marked absent as.

```s
$ node main.js --help
Usage: gd [options]

Quickly peek on your latest GreatdayHR schedules and attendances.

Options:
  -V, --version             output the version number
  -s, --start-date <value>  attendances to retrieve from date (default: null)
  -e, --end-date <value>    attendances to retrieve until date (default: null)
  -a, --days-ago <value>    attendances until days ago (default: null)
  -h, --help                display help for command
$ node main.js
logging in...
> 2022-01-20  14:53/14:53 to 22:58/22:53 OTREG,PRS
> 2022-01-19  14:50/14:50 to 23:00/22:50 OTREG,PRS
> 2022-01-18  08:58/08:58 to 18:00/16:58 PRS
> 2022-01-17  08:25/08:25 to 17:54/16:25 PRS
> 2022-01-16  -----/----- to -----/----- RESTDAY
> 2022-01-15  -----/----- to -----/----- RESTDAY
> 2022-01-14  10:04/10:04 to 19:00/18:04 PRS
> 2022-01-13  10:03/10:03 to 19:00/18:03 PRS
> 2022-01-12  10:02/10:02 to 18:43/18:02 PRS
> 2022-01-11  10:01/10:01 to 18:50/18:01 PRS
> 2022-01-10  10:00/10:00 to 19:00/18:00 PRS
> 2022-01-09  -----/----- to -----/----- RESTDAY
> 2022-01-08  -----/----- to -----/----- RESTDAY
> 2022-01-07  08:07/08:07 to 18:35/16:07 PRS
> 2022-01-06  06:31/06:31 to 16:00/14:31 PRS
> 2022-01-05  06:30/06:30 to 15:00/14:30 PRS
> 2022-01-04  11:27/11:27 to 19:52/19:27 PRS
> 2022-01-03  11:01/11:01 to 20:00/19:01 PRS
> 2022-01-02  -----/----- to -----/----- RESTDAY
> 2022-01-01  -----/----- to -----/----- HLDY
logging out...
```

## How to use

Create a .env file with contents of your username and password.

```env
GDHR_USER=ME0101
GDHR_PASS=mypasswold
```

## Building

```sh
$ npx caxa -i . -o gd -- "{{caxa}}/node_modules/.bin/node" "{{caxa}}/main.js"
```
