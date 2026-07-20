import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryProvider } from "./QueryProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginScreen } from "./components/auth/LoginScreen";
import { JournalWorkspace } from "./pages/JournalWorkspace";

/**
 * Application entry — providers + route definitions only.
 * All business logic lives in the page and component layers below.
 */
export default function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen mode="signin" />} />
          <Route path="/signup" element={<LoginScreen mode="signup" />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <JournalWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notes/:noteId"
            element={
              <ProtectedRoute>
                <JournalWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId"
            element={
              <ProtectedRoute>
                <JournalWorkspace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/projects/:projectId/notes/:noteId"
            element={
              <ProtectedRoute>
                <JournalWorkspace />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryProvider>
  );
}
