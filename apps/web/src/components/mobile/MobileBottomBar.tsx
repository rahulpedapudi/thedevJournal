// import { useNavigate, useLocation } from "react-router-dom";
// import { LayoutGrid, Plus, Folder, LogOut, FileText } from "lucide-react";
// import { LoadingSpinner } from "../LoadingSpinner";

// interface MobileBottomBarProps {
//   onNewNote: () => void;
//   isCreatingNote?: boolean;
//   onOpenSidebar: () => void;
//   onSignOut: () => void;
// }

// export function MobileBottomBar({
//   onNewNote,
//   isCreatingNote,
//   onOpenSidebar,
//   onSignOut,
// }: MobileBottomBarProps) {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const isHome = location.pathname === "/";

//   return (
//     <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-bg-surface/95 backdrop-blur-md border-t border-border-subtle z-[1000] px-4 flex items-center justify-around shadow-lg">
//       {/* Drive / Home */}
//       <button
//         onClick={() => navigate("/")}
//         className={`flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer border-none bg-transparent ${
//           isHome ? "text-accent" : "text-text-secondary hover:text-text-primary"
//         }`}
//       >
//         <LayoutGrid size={18} />
//         <span>Drive</span>
//       </button>

//       {/* Projects */}
//       <button
//         onClick={onOpenSidebar}
//         className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer border-none bg-transparent"
//       >
//         <Folder size={18} />
//         <span>Projects</span>
//       </button>

//       {/* Floating Action Button (FAB) for New Note */}
//       <div className="relative -top-4">
//         <button
//           onClick={onNewNote}
//           disabled={isCreatingNote}
//           className="w-12 h-12 rounded-full bg-accent text-white shadow-lg flex items-center justify-center hover:bg-blue-600 active:scale-95 transition-all border-2 border-bg-surface cursor-pointer disabled:opacity-50"
//           aria-label="Create Note"
//         >
//           {isCreatingNote ? (
//             <LoadingSpinner style={{ borderColor: "rgba(255,255,255,0.3)", borderLeftColor: "#fff" }} />
//           ) : (
//             <Plus size={24} />
//           )}
//         </button>
//       </div>

//       {/* Sidebar Drawer */}
//       <button
//         onClick={onOpenSidebar}
//         className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer border-none bg-transparent"
//       >
//         <FileText size={18} />
//         <span>Notes</span>
//       </button>

//       {/* Sign Out */}
//       <button
//         onClick={onSignOut}
//         className="flex flex-col items-center gap-0.5 text-[10px] font-medium text-text-secondary hover:text-red-600 transition-colors cursor-pointer border-none bg-transparent"
//       >
//         <LogOut size={18} />
//         <span>Exit</span>
//       </button>
//     </div>
//   );
// }
