const fetch = require("node-fetch");

const GRAPHQL_ENDPOINT = "http://localhost:8000/subgraphs/name/myronrotter/mw-charity-2020";

const DAILY_CHARITY_MWC_QUERY = `
  query {
      charityDailyDonationMwcs {
        id
        transfersMwc {
        id
        }
        tokensMwc
    }
  }
`

const MWDAO_MEMBERS_QUERY = `
  query {
      mwDaoMembers {
        mwDaoId
      }
  }
`

/*
fetch(GRAPHQL_ENDPOINT, {
    method: 'GET'
})
.then(res => console.log(res));
*/

fetch(GRAPHQL_ENDPOINT, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: DAILY_CHARITY_MWC_QUERY
  }),
})
  .then((res) => res.json())
  .then((result) => console.log(result.data));
