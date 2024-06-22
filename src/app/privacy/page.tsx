'use client';
import React, { useState, useEffect } from 'react';
import { getPrivacyPolicy } from '@/lib/connectors/contentful';
import ContentfulRenderer from '@/components/ContentfulRenderer';
import { Document } from '@contentful/rich-text-types';
import Loading from '@/components/modals/LoadingModal';
export const dynamic = 'force-dynamic';

const PrivacyLayout = () => {
	const [privacyPolicy, setPrivacyPolicy] = useState<Document | null>(null);

	useEffect(() => {
		const fetchPrivacyPolicy = async () => {
			const entry = await getPrivacyPolicy();
			if (entry) {
				const richTextDocument = entry?.privacyPolicy as Document;
				if (richTextDocument) {
					setPrivacyPolicy(richTextDocument);
				}
			}
		};

		fetchPrivacyPolicy();
	}, []);

	if (!privacyPolicy) return <Loading loading={!privacyPolicy} />;

	return (
		<div>
			<ContentfulRenderer richTextDocument={privacyPolicy} />
		</div>
	);
};

export default PrivacyLayout;
