import { memo, type FC } from "react";

interface Props {
  render: () => unknown;
}

export const Render: FC<Props> = memo((props) => <>{props.render()}</>);
