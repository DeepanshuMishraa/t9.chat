import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./routes/Home";
import Layout from "./routes/Layout";
import Chat from "./routes/Chat";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route index path="/" element={<Home />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
