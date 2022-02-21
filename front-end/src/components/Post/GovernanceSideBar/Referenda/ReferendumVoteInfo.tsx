// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { getFailingThreshold, getPassingThreshold } from '@polkassembly/util';
import styled from '@xstyled/styled-components';
import BN from 'bn.js';
import React, { useContext, useEffect, useMemo,useState } from 'react';
import { Grid } from 'semantic-ui-react';
import { ApiContext } from 'src/context/ApiContext';
import { LoadingStatusType, VoteThreshold } from 'src/types';
import Card from 'src/ui-components/Card';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import Loader from 'src/ui-components/Loader';
import PassingInfo from 'src/ui-components/PassingInfo';
import VoteProgress from 'src/ui-components/VoteProgress';
import formatBnBalance from 'src/util/formatBnBalance';
import getNetwork from 'src/util/getNetwork';

interface Props {
	className?: string
	referendumId: number
	threshold?: VoteThreshold
}

const ZERO = new BN(0);

const NETWORK = getNetwork();

const SUBSCAN_API_KEY = process.env.SUBSCAN_API_KEY;

const ReferendumVoteInfo = ({ className, referendumId, threshold }: Props) => {
	const { api, apiReady } = useContext(ApiContext);
	const [turnout, setTurnout] = useState(ZERO);
	const [totalIssuance, setTotalIssuance] = useState(ZERO);
	const [ayeVotes, setAyeVotes] = useState(ZERO);
	const [nayVotes, setNayVotes] = useState(ZERO);
	const [nayVotesWithoutConviction, setNayVotesWithoutConviction] = useState(ZERO);
	const [ayeVotesWithoutConviction, setAyeVotesWithoutConviction] = useState(ZERO);
	const [isPassing, setIsPassing] = useState<boolean | null>(null);
	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: true, message:'Loading votes' });
	const turnoutPercentage = useMemo( () => {
		if (totalIssuance.isZero()) {
			return 0;
		}
		// BN doens't handle floats. If we devide a number by a bigger number (12/100 --> 0.12), the result will be 0
		// therefore, we first multiply by 10 000, which gives (120 000/100 = 1200) go to Number which supports floats
		// and devide by 100 to have percentage --> 12.00%
		return turnout.muln(10000).div(totalIssuance).toNumber()/100;
	} , [turnout, totalIssuance]);

	const getThreshold = useMemo(
		() => {
			if (!threshold || isPassing === null) return ZERO;
			// if the referendum is passing, we're interesed in the failing threshold
			if (isPassing) {
				const res = getFailingThreshold({ ayes: ayeVotes, ayesWithoutConviction: ayeVotesWithoutConviction, threshold, totalIssuance });
				return res.isValid && res.failingThreshold ? res.failingThreshold : ZERO;
			} else {
				const res = getPassingThreshold({ nays: nayVotes, naysWithoutConviction: nayVotesWithoutConviction, threshold, totalIssuance });
				return res.isValid && res.passingThreshold ? res.passingThreshold : ZERO;
			}
		},
		[ayeVotes, ayeVotesWithoutConviction, isPassing, nayVotes, nayVotesWithoutConviction, threshold, totalIssuance]
	);

	if (!SUBSCAN_API_KEY){
		throw Error('Please set the SUBSCAN_API_KEY environment variable');
	}

	useEffect(() => {

		const response = async () => {
			const getreferenda = {
				body: JSON.stringify({
					referendum_index: referendumId
				}),
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
					'X-API-Key': SUBSCAN_API_KEY
				},
				method: 'POST'
			};

			const api = `https://${NETWORK}.api.subscan.io/api/scan/democracy/referendum`;

			const post = await fetch(api, getreferenda);

			const { errors, data } = await post.json();

			if (errors) {
				throw Error('Something went wrong with subscan api');
			}

			if (data) {
				setLoadingStatus({ isLoading: false, message: '' });
				setIsPassing(false); //TODO
				setNayVotesWithoutConviction(new BN(data.info.nay_without_conviction));
				setAyeVotesWithoutConviction(new BN(data.info.aye_without_conviction));
				setAyeVotes(new BN(data.info.aye_amount));
				setNayVotes(new BN(data.info.nay_amount));
				setTurnout(new BN(data.info.turnout));
			}
		};
		response();

	}, [api, apiReady, referendumId]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		let unsubscribe: () => void;

		api.query.balances.totalIssuance((result) => {
			setTotalIssuance(result);
		})
			.then( unsub => {unsubscribe = unsub;})
			.catch(console.error);

		return () => unsubscribe && unsubscribe();
	},[api, apiReady]);

	return (
		<>
			<PassingInfo isPassing={isPassing}/>
			<Card className={loadingStatus.isLoading ? `LoaderWrapper ${className}` : className}>
				{loadingStatus.isLoading
					? <Loader text={loadingStatus.message} timeout={30000} timeoutText='Api is unresponsive.'/>
					: <>
						{
							isPassing === null
								? <Loader className={'progressLoader'} text={'Loading vote progress'} timeout={30000} timeoutText='Vote calculation failed'/>
								: <VoteProgress
									ayeVotes={ayeVotes}
									className='vote-progress'
									isPassing={isPassing}
									threshold={getThreshold}
									nayVotes={nayVotes}
								/>
						}

						<Grid columns={3} divided>
							<Grid.Row>
								<Grid.Column>
									<h6>Turnout {turnoutPercentage > 0 && <span className='turnoutPercentage'>({turnoutPercentage}%)</span>}</h6>
									<div>{formatBnBalance(turnout, { numberAfterComma: 2, withUnit: true })}</div>
								</Grid.Column>
								<Grid.Column>
									<h6>Aye <HelperTooltip content='Aye votes without taking conviction into account'/></h6>
									<div>{formatBnBalance(ayeVotesWithoutConviction, { numberAfterComma: 2, withUnit: true })}</div>
								</Grid.Column>
								<Grid.Column>
									<h6>Nay <HelperTooltip content='Nay votes without taking conviction into account'/></h6>
									<div>{formatBnBalance(nayVotesWithoutConviction, { numberAfterComma: 2, withUnit: true })}</div>
								</Grid.Column>
							</Grid.Row>
						</Grid>
					</>
				}
			</Card>
		</>
	);
};

export default styled(ReferendumVoteInfo)`
	margin-bottom: 1rem;

	.vote-progress {
		margin-bottom: 5rem;
	}

	.LoaderWrapper {
		height: 15rem;
		position: absolute;
		width: 100%;
	}

	.turnoutPercentage {
		font-weight: normal;
		font-size: sm;
	}

	.progressLoader{
		position: inherit;
		height: 10rem;
	}
`;
