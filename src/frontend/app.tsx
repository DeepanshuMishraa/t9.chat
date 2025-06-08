import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./routes/Home";
import Layout, { ChatLayout } from "./routes/Layout";
import Chat from "./routes/Chat";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index path="/" element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route
          path="/chat"
          element={
            <ChatLayout>
              <Chat />
            </ChatLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
