// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./mwdao.sol";

contract MwdaoCharity2020 is Ownable, ERC20 {

  // #### I. ATTRIBUTES ####

  Mwdao private mwdao;

  mapping(uint256 => Organization) private organizations;
  mapping(address => bool) private minted;

  uint256 private organizationCount = 0;

  struct Organization {
    // @notice Unique id for looking up an organization
    uint256 id;

    // @notice Name of the organization
    string name;

    // @notice Accumulated fund
    uint256 fund;
  }

  // #### II. EVENTS ####

  // @notice An event emitted when tokens got minted
  event TokensMinted(address donor, uint256 token);

  // @notice An event emitted when donation was sent
  event DonationSent(address donor, uint256 organizationId, uint256 tokens);

  // #### III. CONSTRUCTOR ####

  constructor(address _mwdao) public ERC20("MWDAO Charity 2020 Token", "MWC") {
    mwdao = Mwdao(_mwdao);

    _setupDecimals(0);

    organizations[1] = Organization({
      id: 1,
      name: "Frank Polster Stiftung",
      fund: 0
    });

    organizations[2] = Organization({
      id: 2,
      name: "Bill Gates foundation",
      fund: 0
    });

    organizations[3] = Organization({
      id: 3,
      name: "Third organization",
      fund: 0
    });

    organizations[4] = Organization({
      id: 4,
      name: "And so on...",
      fund: 0
    });

    organizationCount = 4;
  }

  function mintToken() public {
    require(mwdao.isMember(_msgSender()), "msg.sender must be a member of the MaiborWolff DAO");
    require(!minted[_msgSender()], "msg.sender already minted his tokens");

    _mint(_msgSender(), 4);
    minted[_msgSender()] = true;

    emit TokensMinted(_msgSender(), 4);
  }

  function supportOrganization(uint256 organizationId, uint256 tokens) external {
    require(tokens > 0, "At least one token is required");
    require(balanceOf(_msgSender()) >= tokens || ( !minted[_msgSender()] && tokens <= 4), "msg.sender hasn't enoght tokens");

    if (!minted[_msgSender()]) {
      mintToken();
    }

    organizations[organizationId].fund = organizations[organizationId].fund.add(tokens.mul(50));

    _burn(_msgSender(), tokens);

    emit DonationSent(_msgSender(), organizationId, tokens);
  }

  // #### V. GETTER ####

  function getOrganizationCount() public view returns (uint256 count) { return organizationCount; }

  function getOrganization(uint256 organizationId) public view returns (Organization memory organization) {
    return organizations[organizationId];
  }

  // #### VI. HELPER ####

  function incrementOrganizationCount() internal onlyOwner { organizationCount++; }
}
