// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

exports.up = function(knex) {
	return knex.schema.table('users', (table) => {
		table.text('image');
	});
};

exports.down = function(knex) {
	return knex.schema.table('users', (table) => {
		table.dropColumn('image');
	});
};