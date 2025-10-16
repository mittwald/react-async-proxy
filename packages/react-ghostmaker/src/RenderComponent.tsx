import { memo, type FC } from "react";

interface Props {
  render: () => unknown;
}

export const RenderComponent: FC<Props> = memo((props) => (
  <>{props.render()}</>
));
