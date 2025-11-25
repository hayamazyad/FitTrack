//Nour
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, Flame, TrendingUp, Award, Play, CheckCircle2, Settings } from 'lucide-react';
import { progressAPI } from '@/services/api';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { toast as sonnerToast } from 'sonner';
import { useNavigate, Link } from 'react-router-dom';

export default function UserProgress() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [progressLogs, setProgressLogs] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalMinutes: 0,
    totalCalories: 0,
    averageCaloriesPerWorkout: 0,
  });
  const [loading, setLoading] = useState(true);
  const [ongoingWorkouts, setOngoingWorkouts] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        setLoading(true);
        const [logsResponse, statsResponse] = await Promise.all([
          progressAPI.getAll(),
          progressAPI.getStats(),
        ]);
        if (logsResponse.success) {
          setProgressLogs(logsResponse.data || []);
        }
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } catch (error) {
        sonnerToast.error('Failed to load progress data');
        console.error('Error fetching progress:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const stored = JSON.parse(sessionStorage.getItem('ongoingWorkouts') || '[]');
    setOngoingWorkouts(stored);

    const handleBeforeUnload = () => {
      sessionStorage.removeItem('ongoingWorkouts');
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isAuthenticated, navigate]);

  const handleCompleteWorkout = async (index) => {
    if (!isAuthenticated || !user) {
      sonnerToast.error('Please log in to complete workouts');
      return;
    }

    const w = ongoingWorkouts[index];

    try {
      // Save to backend
      const progressLogData = {
        workoutId: w.workoutId || null,
        workoutName: w.workoutName,
        date: w.startTime,
        duration: w.duration,
        caloriesBurned: w.caloriesBurned,
        completed: true,
        notes: 'Completed workout',
      };

      const response = await progressAPI.create(progressLogData);

      if (response.success) {
        // Remove from ongoing workouts
        const updated = ongoingWorkouts.filter((_, i) => i !== index);
        setOngoingWorkouts(updated);
        sessionStorage.setItem('ongoingWorkouts', JSON.stringify(updated));

        // Refresh stats and logs
        const [logsResponse, statsResponse] = await Promise.all([
          progressAPI.getAll(),
          progressAPI.getStats(),
        ]);
        if (logsResponse.success) {
          setProgressLogs(logsResponse.data || []);
        }
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

        toast({
          title: 'Workout Completed!',
          description: 'Great job! Your progress has been saved.',
        });
        sonnerToast.success('Workout completed and saved!');
      } else {
        throw new Error(response.message || 'Failed to save workout');
      }
    } catch (error) {
      console.error('Error completing workout:', error);
      sonnerToast.error(error.message || 'Failed to complete workout. Please try again.');
    }
  };

  const { totalWorkouts, totalMinutes, totalCalories, averageCaloriesPerWorkout } = stats;

  const inProgressSessionLogs = ongoingWorkouts.map((w, idx) => ({
    _id: `session-inprogress-${idx}-${w.startTime}`,
    userId: user?.id,
    workoutId: w.workoutId ?? null,
    workoutName: w.workoutName,
    date: w.startTime,           
    duration: w.duration,
    caloriesBurned: w.caloriesBurned,
    completed: false,
    notes: 'In progress (this session only)',
  }));

  // Combine in-progress workouts with completed progress logs
  const combinedRecent = [...inProgressSessionLogs, ...progressLogs]
    .sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <h1 className="page-title">My Progress</h1>
          <p className="text-lg text-muted-foreground">Track your fitness journey and achievements</p>
        </div>

        {/* Profile */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4 sm:flex-row sm:items-center sm:justify-between sm:text-left">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {user?.name?.split(' ').map((n) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">{user?.name || 'User'}</h2>
                    <Link to="/profile">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Profile">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <p className="text-muted-foreground">{user?.email || ''}</p>
                  {user?.joinDate && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Member since {format(new Date(user.joinDate), 'MMMM yyyy')}
                    </p>
                  )}

                  {/* Mobile badge */}
                  <div className="mt-2 sm:hidden flex justify-center">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 inline-flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Active Member
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop badge */}
              <div className="hidden sm:flex justify-end">
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 h-fit inline-flex items-center gap-1"
                >
                  <Award className="h-3 w-3" />
                  Active Member
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalWorkouts}</div>
              <p className="text-xs text-muted-foreground mt-1">Keep up the great work!</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMinutes}</div>
              <p className="text-xs text-muted-foreground mt-1">Minutes exercised</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 flex items-center gap-2">
              <Flame className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Calories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCalories}</div>
              <p className="text-xs text-muted-foreground mt-1">Calories burned</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg per Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageCaloriesPerWorkout}</div>
              <p className="text-xs text-muted-foreground mt-1">Calories on average</p>
            </CardContent>
          </Card>
        </div>

        {/* Ongoing */}
        {ongoingWorkouts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Ongoing Workouts</CardTitle>
              <CardDescription>Your active workout sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ongoingWorkouts.map((workout, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                        <Play className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{workout.workoutName}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{workout.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            <span>{workout.caloriesBurned} cal</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Started: {format(new Date(workout.startTime), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => handleCompleteWorkout(index)} variant="outline" size="sm">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest workout sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {combinedRecent.length > 0 ? (
              <div className="space-y-4">
                {combinedRecent.map((log) => {
                  // Handle ProgressLog format from backend
                  const displayName = log.workoutName || log.workoutId?.name || log.workout?.name || 'Workout';
                  const logDate = log.date || log.createdAt || new Date();
                  const logDuration = log.duration || 0;
                  const logCalories = log.caloriesBurned || 0;
                  const logNotes = log.notes || log.description || '';
                  const isCompleted = log.completed !== undefined ? log.completed : true;
                  const isInProgress = log._id?.startsWith('session-inprogress');
                  
                  return (
                    <div
                      key={log._id || log.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        {isCompleted ? (
                          <Award className="h-6 w-6 text-primary" />
                        ) : (
                          <Clock className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <h3 className="font-semibold">{displayName}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(logDate), 'MMM dd, yyyy')}</span>
                            </div>
                          </div>
                          {isInProgress ? (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              In Progress
                            </Badge>
                          ) : isCompleted ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                              Completed
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-2">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{logDuration} min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame className="h-3 w-3" />
                            <span>{logCalories} cal</span>
                          </div>
                        </div>
                        {logNotes && <p className="text-sm text-muted-foreground italic">"{logNotes}"</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No workout logs yet. Start logging your workouts to track your progress!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
