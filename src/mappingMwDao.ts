import { MemberAdded } from '../generated/Mwdao/Mwdao';
import { MwDaoMember } from '../generated/schema';

export function handleMemberAdded(event: MemberAdded): void {
  // event MemberAdded(uint256 id, address member, uint256 token)
  let id = event.params.member.toHex();
  let mwDaoId = event.params.id;
  let amountMwg = event.params.token;

  let mwDaoMember = new MwDaoMember(id);

  mwDaoMember.mwDaoId = mwDaoId;
  mwDaoMember.tokensMwg = amountMwg;
  mwDaoMember.transfersMwc = [];

  mwDaoMember.save();
}
