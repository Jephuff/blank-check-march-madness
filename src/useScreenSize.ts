import React from 'react';

const smallScreen = window.matchMedia('(max-width: 1200px)');

export const useIsSmall = () => {
  const [isSmall, setIsSmall] = React.useState(smallScreen.matches);
  React.useEffect(() => {
    const listener = () => setIsSmall(smallScreen.matches);
    smallScreen.addListener(listener);
    return () => smallScreen.removeListener(listener);
  }, []);
  return isSmall;
};

export const useSegmentWidth = () => {
  const isSmall = useIsSmall();
  return isSmall ? '16.6vw' : '10vw';
};
