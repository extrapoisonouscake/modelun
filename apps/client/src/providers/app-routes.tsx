import { CommitteePage } from "@/app/committee";
import { CreateCommitteePage } from "@/app/create";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router";
import { Home } from "../app/home";

function CodeRedirect() {
  const { code } = useParams();
  return <Navigate to={`/?code=${code}`} replace />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/c/:code" element={<CodeRedirect />} />
        <Route path="/create" element={<CreateCommitteePage />} />
        <Route path="/committee" element={<CommitteePage />} />
      </Routes>
    </BrowserRouter>
  );
}
