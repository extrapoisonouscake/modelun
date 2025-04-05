import { CommitteePage } from "@/app/committee";
import { CreateCommitteePage } from "@/app/create";
import { BrowserRouter, Route, Routes } from "react-router";
import { Home } from "../app/home";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateCommitteePage />} />
        <Route path="/committee" element={<CommitteePage />} />
      </Routes>
    </BrowserRouter>
  );
}
