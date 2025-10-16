import { SimpleBlogView } from "./components/SimpleBlogView";
import { Suspense, useState } from "react";
import "./models/react/init";
import { BlogGhost } from "./models/react/BlogGhost";

const Fallback = () => {
  console.log("Loading...");
  return <div>Loading...</div>;
};

function App() {
  const [blogId, setBlogId] = useState("1");
  const blog = BlogGhost.ofId(blogId);

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
