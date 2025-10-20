import { SimpleBlogView } from "./components/SimpleBlogView";
import { BlogProxy } from "./models/react/BlogProxy";
import { Suspense, useState } from "react";
import "./models/react/init";

const Fallback = () => {
  console.log("Loading...");
  return <div>Loading...</div>;
};

function App() {
  const [blogId, setBlogId] = useState("1");
  const blog = BlogProxy.ofId(blogId);

  return (
    <>
      <input
        value={blogId}
        onChange={(e) => {
          setBlogId(e.target.value);
        }}
      />
      <Suspense fallback={<Fallback />}>
        <SimpleBlogView blog={blog} />
      </Suspense>
    </>
  );
}

export default App;
