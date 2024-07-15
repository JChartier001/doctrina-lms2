import React from 'react';
import { LoadingModal } from '@devshop24/component-library';

const Loading = ({ loading }: { loading: boolean }) => {
  return (
    <LoadingModal
      loading={loading}
      backdropColor="#fff"
      loaderColor="#c084fc"
    />
  );
};
export default Loading;
