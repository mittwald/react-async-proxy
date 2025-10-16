import { SimpleBlogView } from "./components/SimpleBlogView";
import { BlogProxy } from "./models/react/BlogProxy";

function App() {
  const blog = BlogProxy.ofId("1");
  return <SimpleBlogView blog={blog} />;
}

export default App;
