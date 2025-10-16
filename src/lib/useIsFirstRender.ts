import { useRef } from "react";

export const useIsFirstRender = () => {
  const firstRender = useRef(true);

  if (firstRender.current) {
    firstRender.current = false;
    return true;
  }
  return false;
};
