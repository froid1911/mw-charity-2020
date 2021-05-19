import { BigInt, Address, log } from '@graphprotocol/graph-ts';
import { MemberAdded } from '../generated/Mwdao/Mwdao';
import { MwDaoMember } from '../generated/schema';

const BIG_INT_ZERO = BigInt.fromI32(0);

export function handleMemberAdded(event: MemberAdded): void {
  // event MemberAdded(uint256 id, address member, uint256 token)
  let id = event.params.member.toHex();
  let mwDaoId = event.params.id;
  let amountMwg = event.params.token;

  let mwDaoMember = new MwDaoMember(id);

  mwDaoMember.mwDaoId = mwDaoId;
  mwDaoMember.tokensMwg = amountMwg;
  mwDaoMember.tokensMwc = BIG_INT_ZERO;

  mwDaoMember.save();
}
