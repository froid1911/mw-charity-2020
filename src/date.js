const timestamp = 1620652724;

function fromUnixToDate(timestampInSeconds) {
  let sec;
  let quadricentennials, centennials, quadrennials, annuals;
  let year, leap;
  let yday, hour, min;
  let month, mday, wday;
  const daysSinceJan1st = [
    [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365], // 365 days, non-leap
    [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366], // 366 days, leap
  ];

  sec = timestampInSeconds + 11644473600;
  wday = Math.floor((sec / 86400 + 1) % 7); // day of week

  quadricentennials = Math.floor(sec / 12622780800); // 400*365.2425*24*3600
  sec %= 12622780800;

  centennials = Math.floor(sec / 3155673600); // 100*(365+24/100)*24*3600
  if (centennials > 3) {
    centennials = 3;
  }
  sec -= centennials * 3155673600;

  quadrennials = Math.floor(sec / 126230400); // 4*(365+1/4)*24*3600
  if (quadrennials > 24) {
    quadrennials = 24;
  }
  sec -= quadrennials * 126230400;

  annuals = Math.floor(sec / 31536000); // 365*24*3600
  if (annuals > 3) {
    annuals = 3;
  }
  sec -= annuals * 31536000;

  year =
    1601 +
    quadricentennials * 400 +
    centennials * 100 +
    quadrennials * 4 +
    annuals;
    
  leap = 0;
  if (year % 4 == 0 && (!(year % 100 == 0) || year % 400 == 0)) {
    leap = 1;
  }

  yday = sec / 86400;
  sec %= 86400;
  hour = sec / 3600;
  sec %= 3600;
  min = sec / 60;
  sec %= 60;

  for (mday = month = 1; month < 13; month++) {
    if (yday < daysSinceJan1st[leap][month]) {
      mday += yday - daysSinceJan1st[leap][month - 1];
      break;
    }
  }

  return {
    sec,
    min,
    hour,
    mday,
    month: month,
    year: year,
    wday,
    yday,
  };
}

console.log(fromUnixToDate(timestamp));
