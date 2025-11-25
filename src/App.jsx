import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Navbar } from "./components/Navbar";
import Homepage from "./pages/Homepage";
import WorkoutDashboard from "./pages/WorkoutDashboard";
import LogWorkout from "./pages/LogWorkout";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import WorkoutDetails from "./pages/WorkoutDetails";
import ExerciseDetails from "./pages/ExerciseDetails";
import UserProgress from "./pages/UserProgress";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
const queryClient = new QueryClient();
const App = () => (<QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Homepage />}/>
                <Route path="/dashboard" element={<WorkoutDashboard />}/>
                <Route path="/log-workout" element={<LogWorkout />}/>
                <Route path="/exercises" element={<ExerciseLibrary />}/>
                <Route path="/exercise/:id" element={<ExerciseDetails />}/> 
                <Route path="/workout/:id" element={<WorkoutDetails />}/>
                <Route path="/progress" element={<UserProgress />}/>
                <Route path="/profile" element={<Profile />}/>
                <Route path="/login" element={<Login />}/>
                <Route path="/register" element={<Register />}/>
                <Route path="*" element={<NotFound />}/>
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>);
export default App;
