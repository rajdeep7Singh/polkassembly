// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styled from '@xstyled/styled-components';
import React, { useContext, useEffect, useState } from 'react';
import { Grid } from 'semantic-ui-react';
import { ApiContext } from 'src/context/ApiContext';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import NothingFoundCard from 'src/ui-components/NothingFoundCard';
import formatBnBalance from 'src/util/formatBnBalance';

import Address from '../../../../ui-components/Address';
import Card from '../../../../ui-components/Card';
import Loader from '../../../../ui-components/Loader';

interface Props {
	className?: string
	onChainId: string
}

// const Median = (data: any) => {
//     let median = new BN(0);

//     if(data.tips.length > 0){
//         const values: BN[] = data.tips.map(([, value]: [string, BN]) => value);
//         console.log('valuess:', values);
//         const midIndex = Math.floor(values.length / 2);
//         median = values.length
//             ? values.length % 2
//             ? values[midIndex]
//             : values[midIndex - 1].add(values[midIndex]).divn(2)
//             : new BN(0);
//     }

//     return median;
// }

const TipInfo = ({ className, onChainId }: Props) => {

	const { api, apiReady } = useContext(ApiContext);
	const [tips, setTips] = useState<any>(null);
	const [isTippersLoading, setIsTippersLoading] = useState(true);
	//const [median, setMedian] = useState<BN>(new BN(0));

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		let unsubscribe: () => void;

		api.query.tips.tips.multi([onChainId]).then(tips => {
			setTips(tips[0]?.toJSON());
			setIsTippersLoading(false);
			//setMedian(Median(tips[0]?.toJSON()));
		});

		return () => unsubscribe && unsubscribe();
	}, [api, apiReady, isTippersLoading, onChainId]);

	return (
		<>
			{tips?.tips.length > 0 ?
				<Card className={className}>
					<h3>Tippers <HelperTooltip content='Amount tipped by council members' /></h3>
					<Grid className='tippers'>
						{tips?.tips.map((tip: any[]) =>
							<Grid.Row key={tip[0]}>
								<Grid.Column width={12}>
									<div className='item'>
										<Address address={tip[0]} />
									</div>
								</Grid.Column>
								<Grid.Column width={4}>
									{formatBnBalance(tip[1], { numberAfterComma: 2, withUnit: true })}
								</Grid.Column>
							</Grid.Row>
						)}
					</Grid>
					{/* <Grid className='tippers'>
                <Grid.Row><Grid.Column width={12}><div className='item'>
                    Final Tip<HelperTooltip content='The final value of the tip is decided based on the median of all tips issued by the tippers'/></div></Grid.Column><Grid.Column width={4}>{formatBnBalance(median, { numberAfterComma: 2, withUnit: true })}</Grid.Column></Grid.Row>
                </Grid> */}
				</Card>
				: isTippersLoading ? <Loader text={'Requesting Tippers'} /> : <NothingFoundCard className={className} text='There are currently no tippers.' />}
		</>
	);
};

export default styled(TipInfo)`
.tippers {
    margin-top: 2em;
}

@media only screen and (max-width: 768px) {
    .ui.form {
        padding: 0rem;
    }
}
`;