import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./routes/Home";
import Appbar from "@/components/Appbar";
import Layout from "./routes/Layout";
import Docs from "./routes/Docs";
import Contact from "./routes/Contact";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
