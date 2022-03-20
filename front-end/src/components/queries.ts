// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import gql from 'graphql-tag';

export const GET_REFRESH_TOKEN = gql`
query GET_REFRESH_TOKEN {
    token {
        token
    }
}
`;

export const GET_CALENDER_EVENTS = gql`
query GET_CALENDER_EVENTS($network: String!) {
    calender_events(where: {network: {_ilike: $network}}) {
        content
        end_time
        id
        module
        network
        start_time
        title
        url
  }
}
`;