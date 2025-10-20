import { registerModelIdentifier } from "@mittwald/react-async-proxy";
import { Blog } from "../Blog";

registerModelIdentifier((model) =>
  model instanceof Blog ? model.id : undefined,
);
