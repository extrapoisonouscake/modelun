import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "../app";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
