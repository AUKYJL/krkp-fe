import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import ReactDOM from "react-dom/client";

import App from "./app/App";
import "./index.css";

const rootElement = document.getElementById("root")!;
gsap.registerPlugin(useGSAP, MotionPathPlugin);

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
