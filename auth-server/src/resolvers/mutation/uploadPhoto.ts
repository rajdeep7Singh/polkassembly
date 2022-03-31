// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import AuthService from '../../services/auth';
import { UploadImageArgs, MessageType } from '../../types';
import messages from '../../utils/messages';

export default async (parent: void, { token, image }: UploadImageArgs): Promise<MessageType> => {
	const authServiceInstance = new AuthService();
	await authServiceInstance.UploadImage(token, image);

	return { message: messages.IMAGE_UPLOAD_SUCCESSFULL };
};