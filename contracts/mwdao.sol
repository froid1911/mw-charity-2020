// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Mwdao is Ownable, ERC20 {

  // #### I. ATTRIBUTES ####

  mapping(uint256 => Proposal) private proposals;

  uint256 private proposalCount = 0;
  uint256 private memberCount   = 0;

  struct Proposal {
    // @notice Unique id for looking up a proposal
    uint256 id;

    // @notice Creator of the proposal
    address proposer;

    // @notice Proposal description
    string description;

    // @notice the ordered list of target addresses for calls to be made
    // address[] targets;

    // @notice The ordered list of values (i.e. msg.value) to be passed to the calls to be made
    // uint[] values;

    // @notice The block at which voting begins: holders must delegate their votes prior to this block
    uint256 startBlock;

    // @notice The block at which voting ends: votes must be cast prior to this block
    uint256 endBlock;

    // @notice Current number of votes in favor of this proposal
    uint256 forVotes;

    // @notice Current number of votes in opposition to this proposal
    uint256 againstVotes;

    // @notice Flag marking whether the proposal has been executed
    // bool executed;

    // @notice Set of all voters for this proposal
    mapping (address => Receipt) receipts;
  }

  // @notice Ballot receipt record for a voter
  struct Receipt {
    // @notice Whether or not a vote has been cast
    bool hasVoted;

    // @notice Whether or not the voter supports the proposal
    bool support;

    // @notice The number of votes the voter had, which were cast
    uint256 votes;
  }

  // @notice Possible states that a proposal may be in
  enum ProposalState {
      Pending,
      Active,
      Defeated,
      Succeeded,
      Executed
  }

  // #### II. EVENTS ####

  // @notice An event emitted when a new proposal is created
  event MemberAdded(uint256 id, address member, uint256 token);

  // @notice An event emitted when a new proposal is created
  event ProposalCreated(uint256 id, address proposer, string description, uint256 startBlock, uint256 endBlock);

  // @notice An event emitted when a vote has been cast on a proposal
  event VoteCasted(address voter, uint256 proposalId, bool support, uint256 votes);

  // #### III. CONSTRUCTOR ####

  constructor(uint256 initalToken) public ERC20("MaibornWolff Governance Token", "MWG") {
    addMember(_msgSender(), initalToken);
  }

  // #### IV. FUNCTIONS ####

  function addMember(address member, uint256 token) public onlyOwner {
    require(balanceOf(member) == 0, "User is already a member of this DAO");

    _mint(member, token);
    incrementMemberCount();

    emit MemberAdded(
      getMemberCount(),
      member,
      token
    );
  }

  function removeMember(address member) external onlyOwner {
    _burn(member, balanceOf(member));
    decrementMemberCount();
  }

  function createProposal(string calldata description) external returns(uint256 proposalId) {
    require(isMember(_msgSender()), "msg.sender isn't a member of this DAO");

    uint256 startBlock = block.number.add(0);
    uint256 endBlock = startBlock.add(10);

    incrementProposalCount();

    Proposal memory newProposal = Proposal({
      id: proposalCount,
      proposer: _msgSender(),
      description: description,
      // targets: targets,
      startBlock: startBlock,
      endBlock: endBlock,
      forVotes: 0,
      againstVotes: 0
    });

    proposals[newProposal.id] = newProposal;

    emit ProposalCreated(
      newProposal.id,
      _msgSender(),
      description,
      // targets,
      startBlock,
      endBlock
    );

    return newProposal.id;
  }

  function castVote(uint256 proposalId, bool support) external {
    require(state(proposalId) == ProposalState.Active, "Voting is closed");

    Proposal storage proposal = proposals[proposalId];
    Receipt storage receipt = proposal.receipts[_msgSender()]; //getReceipt();

    require(receipt.hasVoted == false, "Voter already voted");

    uint256 votes = balanceOf(_msgSender());

    if (support) {
      proposal.forVotes = proposal.forVotes.add(votes);
    } else {
      proposal.againstVotes = proposal.againstVotes.add(votes);
    }

    receipt.hasVoted = true;
    receipt.support = support;
    receipt.votes = votes;

    emit VoteCasted(_msgSender(), proposalId, support, votes);
  }

  function state(uint256 proposalId) public view returns (ProposalState) {
    require(proposalCount >= proposalId && proposalId > 0, "Invalid proposal id");

    Proposal storage proposal = proposals[proposalId];

    if (block.number <= proposal.startBlock) {
      return ProposalState.Pending;
    } else if (block.number <= proposal.endBlock) {
      return ProposalState.Active;
    } else if (proposal.forVotes <= proposal.againstVotes) {
      return ProposalState.Defeated;
    }
  }

  // #### V. GETTER ####

  function getMemberCount() public view returns (uint256 count) { return memberCount; }
  function getProposalCount() public view returns (uint256 count) { return proposalCount; }

  function getProposal(uint256 id) public view returns (
    address proposer,
    string memory description,
    uint256 startBlock,
    uint256 endBlock,
    uint256 forVotes,
    uint256 againstVotes
  )
  {
    Proposal memory proposal = proposals[id];

    return(
      proposal.proposer,
      proposal.description,
      proposal.startBlock,
      proposal.endBlock,
      proposal.forVotes,
      proposal.againstVotes
    );
  }

  function getReceipt(uint256 proposalId, address voter) public view returns (Receipt memory receipt) {
    return proposals[proposalId].receipts[voter];
  }

  // #### VI. HELPER ####

  function incrementMemberCount() internal onlyOwner { memberCount++; }
  function decrementMemberCount() internal onlyOwner { memberCount--; }
  function incrementProposalCount() internal { proposalCount++; }

  function isMember(address _member) public view returns(bool member) {
    return balanceOf(_member) > 0;
  }
}
