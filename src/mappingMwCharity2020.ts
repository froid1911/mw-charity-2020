import { BigInt, Address } from '@graphprotocol/graph-ts';
import { Transfer, TokensMinted } from '../generated/MwdaoCharity2020/MwdaoCharity2020';
import { TransferMwc, MintMwc, Charity, DailyDonation, CharityDonation, MwDaoMember } from '../generated/schema';

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export function handleTransfer(event: Transfer): void {
  // event Transfer(indexed address from, indexed address to, uint256 value)
  let from = event.params.from.toHex();
  let to = event.params.to.toHex();
  let timestamp = event.block.timestamp;
  let blockNumber = event.block.number;
  let amountMwc = event.params.value;
  let id = timestamp.toString() + "-" + event.transaction.hash.toHex() + "-" + from + "-" + to;

  if (from != ZERO_ADDRESS) {
    let transferMwc = new TransferMwc(id);
    transferMwc.from = from;
    transferMwc.to = to;
    transferMwc.tokensMwc = amountMwc;
    transferMwc.timestamp = timestamp;
    transferMwc.blockNumber = blockNumber;

    let mwDaoMember = MwDaoMember.load(from);
    if (mwDaoMember != null) {
      mwDaoMember.transfersMwc.push(transferMwc.id);
      mwDaoMember.tokensMwc = mwDaoMember.tokensMwc.minus(amountMwc);

      let toMwDaoMember = MwDaoMember.load(to);
      if (toMwDaoMember != null) {
        toMwDaoMember.tokensMwc = toMwDaoMember.tokensMwc.plus(amountMwc);
        toMwDaoMember.save();
      } else {
        let charity = Charity.load(to);
        if (charity == null) {
          charity = new Charity(to);
        }
        charity.tokensMwc = charity.tokensMwc.plus(amountMwc);

        //let timestampInMs = timestamp.times(BigInt.fromI32(1000));
        //let date = new Date(timestampInMs.toI32());
        //let dailyDonationId = date.toISOString().slice(0,10);
        //let dailyDonationId = new Intl.DateTimeFormat('en-US').format(date)
        let dailyDonationId = fromUnixToDate(timestamp.toI32());
        let dailyDonation = DailyDonation.load(dailyDonationId);
        if (dailyDonation == null) {
          dailyDonation = new DailyDonation(dailyDonationId);
        }
        dailyDonation.transfersMwc.push(transferMwc.id);
        dailyDonation.tokensMwc = dailyDonation.tokensMwc.plus(amountMwc);

        //let charityDonationId = date.toISOString().slice(0,10) + "-" + charity.id.toString();
        let charityDonationId = dailyDonationId + "-" + charity.id;
        let charityDonation = CharityDonation.load(charityDonationId);
        if (charityDonation == null) {
          charityDonation = new CharityDonation(charityDonationId);
        }
        charityDonation.charity = charity.id;
        charityDonation.transfersMwc.push(transferMwc.id);
        charityDonation.tokensMwc = charityDonation.tokensMwc.plus(amountMwc);

        dailyDonation.charityDonations.push(charityDonation.id);

        charityDonation.save();
        dailyDonation.save();
        charity.save();
      }

      mwDaoMember.save();
    }

    transferMwc.save();
  }
}

export function handleTokensMinted(event: TokensMinted): void {
  // event TokensMinted(address donor, uint256 token)
  let timestamp = event.block.timestamp;
  let minter = event.params.donor.toHex();
  let amountMwc = event.params.token;

  let mintMwcId = timestamp.toString() + "-" + minter;

  let mwDaoMember = MwDaoMember.load(minter);
  if (mwDaoMember != null) {
    let mintMwc = MintMwc.load(mintMwcId);
    if (mintMwc == null) {
      mintMwc = new MintMwc(mintMwcId);
    }

    mintMwc.timestamp = timestamp;
    mintMwc.minter = minter;
    mintMwc.minted = true;
    mintMwc.tokensMwc = amountMwc;

    mwDaoMember.mintMwc = mintMwc.id;
    mwDaoMember.tokensMwc = mwDaoMember.tokensMwc.plus(amountMwc);

    mintMwc.save();
    mwDaoMember.save();
  }
}

// https://stackoverflow.com/questions/11188621/how-can-i-convert-seconds-since-the-epoch-to-hours-minutes-seconds-in-java/11197532#11197532
function fromUnixToDate(timestampInSeconds : number) : string {
  let daysSinceJan1stNonLeapYear = new Array<number>(13);
  daysSinceJan1stNonLeapYear = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
  let daysSinceJan1stLeapYear = new Array<number>(13);
  daysSinceJan1stLeapYear = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366];

  let sec = timestampInSeconds + 11644473600;
  let wday = Math.floor((sec / 86400 + 1) % 7); // day of week

  let quadricentennials = Math.floor(sec / 12622780800); // 400*365.2425*24*3600
  sec %= 12622780800;

  let centennials = Math.floor(sec / 3155673600); // 100*(365+24/100)*24*3600
  if (centennials > 3) {
    centennials = 3;
  }
  sec -= centennials * 3155673600;

  let quadrennials = Math.floor(sec / 126230400); // 4*(365+1/4)*24*3600
  if (quadrennials > 24) {
    quadrennials = 24;
  }
  sec -= quadrennials * 126230400;

  let annuals = Math.floor(sec / 31536000); // 365*24*3600
  if (annuals > 3) {
    annuals = 3;
  }
  sec -= annuals * 31536000;

  let year =
    1601 +
    quadricentennials * 400 +
    centennials * 100 +
    quadrennials * 4 +
    annuals;

  let leap = false;
  if ((year % 4 == 0) && (!(year % 100 == 0) || (year % 400 == 0))){
    leap = true;
  }

  let yday = sec / 86400;
  sec %= 86400;
  let hour = sec / 3600;
  sec %= 3600;
  let min = sec / 60;
  sec %= 60;

  let mday : number;
  let month : number;
  if (leap) {
    for (mday = month = 1; month < 13; month++) {
      if (yday < daysSinceJan1stLeapYear[month]) {
        mday += yday - daysSinceJan1stLeapYear[month - 1];
        break;
      }
    }
  } else {
    for (mday = month = 1; month < 13; month++) {
      if (yday < daysSinceJan1stNonLeapYear[month]) {
        mday += yday - daysSinceJan1stNonLeapYear[month - 1];
        break;
      }
    }
  }
  mday = Math.floor(mday);

  return year.toString() + "-" + month.toString() + "-" + mday.toString();
}
