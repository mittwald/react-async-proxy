import { registerModelIdentifier } from "@mittwald/react-ghostmaker";
import { Blog } from "../Blog";

registerModelIdentifier((model) =>
  model instanceof Blog ? model.id : undefined,
);
