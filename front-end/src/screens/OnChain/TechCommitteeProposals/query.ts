// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import gql from 'graphql-tag';
import { authorFields } from 'src/fragments/author';

// for techCommitteeProposal postType shoud be 2, postTopic should be 3
export const QUERY_LATEST_TECH_COMMITTEE_PROPOSALS = gql`
    query LatestTechCommitteeProposalPosts($postType: Int!, $limit: Int! = 5 ) {
        posts(limit: $limit, where: {
            type: {
                id: {
                    _eq: $postType
                }
            },
            onchain_link: {
                onchain_tech_committee_proposal_id: {
                    _is_null: false
                }
            }
        }, order_by: {
            onchain_link: {
                onchain_tech_committee_proposal_id: desc
            }
        }) {
            id
            title
            author {
                ...authorFields
            }
            created_at
            updated_at
            comments_aggregate {
                aggregate {
                    count
                }
            }
            type {
                name
                id
            }
            topic {
                id
                name
            }
            onchain_link {
                id
                onchain_tech_committee_proposal_id
                onchain_tech_committee_proposal(where: {NOT: {status_some: {OR: [{status: "Closed"}, {status: "Approved"}, {status: "Executed"}, {status: "Disapproved"}]}}}) {
                    id
                    status(last: 1) {
                        id
                        status
                    }
                    preimage {
                        id
                        method
                    }
                }
                proposer_address
            }
        }
    }
    ${authorFields}
`;

export const QUERY_COUNT_TECH_COMMITTE_PROPOSAL = gql`
    query TechCommitteeProposalCount($postType: Int!) {
        posts_aggregate(where: {type: {id: {_eq: $postType}}, onchain_link: {onchain_tech_committee_proposal_id: {_is_null: false}}}) {
            aggregate {
                count
            }
        }
    }
`;