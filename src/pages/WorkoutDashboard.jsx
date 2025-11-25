import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, LogIn, Plus, Shield, PencilLine, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutCard } from '@/components/WorkoutCard';
import { workoutAPI, defaultWorkoutAPI, defaultExerciseAPI } from '@/services/api';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

const defaultWorkoutTemplate = {
  _id: null,
  name: '',
  description: '',
  category: 'strength',
  difficulty: 'intermediate',
  duration: '',
  caloriesBurned: '',
  exercises: [],
  instructionsText: '',
};

export default function WorkoutDashboard() {
  const location = useLocation();
  const { isAuthenticated, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [workouts, setWorkouts] = useState([]);
  const [defaultWorkouts, setDefaultWorkouts] = useState([]);
  const [defaultExercises, setDefaultExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isDefaultWorkoutDialogOpen, setIsDefaultWorkoutDialogOpen] = useState(false);
  const [defaultWorkoutMode, setDefaultWorkoutMode] = useState('create');
  const [defaultWorkoutForm, setDefaultWorkoutForm] = useState(defaultWorkoutTemplate);
  const [defaultWorkoutDeleteTarget, setDefaultWorkoutDeleteTarget] = useState(null);
  const [isDefaultWorkoutSubmitting, setIsDefaultWorkoutSubmitting] = useState(false);

  const fetchWorkouts = useCallback(async () => {
    if (!isAuthenticated) {
      setWorkouts([]);
      setDefaultWorkouts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const workoutResponse = await workoutAPI.getAll();
      if (workoutResponse.success) {
        const list = workoutResponse.data || [];
        setWorkouts(list);
        if (!isAdmin) {
          setDefaultWorkouts(list.filter((workout) => workout.isDefault));
        }
      }

      if (isAdmin) {
        const defaultResponse = await defaultWorkoutAPI.getAll();
        if (defaultResponse.success) {
          setDefaultWorkouts(defaultResponse.data || []);
        }
      }
    } catch (error) {
      toast.error('Failed to load workouts');
      console.error('Error fetching workouts:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    fetchWorkouts();
  }, [fetchWorkouts]);

  useEffect(() => {
    const handleFocus = () => {
      if (isAuthenticated) {
        fetchWorkouts();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchWorkouts, isAuthenticated, location.pathname]);

  useEffect(() => {
    const fetchDefaultExercises = async () => {
      if (!isAdmin) {
        setDefaultExercises([]);
        return;
      }
      try {
        const response = await defaultExerciseAPI.getAll();
        if (response.success) {
          setDefaultExercises(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching default exercises:', error);
      }
    };
    fetchDefaultExercises();
  }, [isAdmin]);

  const allWorkouts = useMemo(() => workouts, [workouts]);

  const filteredWorkouts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return allWorkouts.filter((workout) => {
      const matchesSearch =
        workout.name?.toLowerCase().includes(query) ||
        workout.description?.toLowerCase().includes(query);
      const matchesCategory = categoryFilter === 'all' || workout.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || workout.difficulty === difficultyFilter;
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [allWorkouts, searchQuery, categoryFilter, difficultyFilter]);

  const resetDefaultWorkoutForm = () => {
    setDefaultWorkoutForm({ ...defaultWorkoutTemplate });
    setDefaultWorkoutMode('create');
  };

  const openDefaultWorkoutDialog = (workout = null) => {
    if (workout) {
      setDefaultWorkoutMode('edit');
      setDefaultWorkoutForm({
        _id: workout._id,
        name: workout.name || '',
        description: workout.description || '',
        category: workout.category || 'strength',
        difficulty: workout.difficulty || 'intermediate',
        duration: workout.duration || '',
        caloriesBurned: workout.caloriesBurned || '',
        exercises: (workout.exercises || []).map((exercise) => exercise._id || exercise.id),
        instructionsText: (workout.instructions || []).join('\n'),
      });
    } else {
      resetDefaultWorkoutForm();
    }
    setIsDefaultWorkoutDialogOpen(true);
  };

  const parseInstructions = (value) =>
    value
      ? value.split('\n').map((step) => step.trim()).filter(Boolean)
      : [];

  const toNumeric = (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const handleDefaultWorkoutSubmit = async () => {
    if (!defaultWorkoutForm.name.trim()) {
      toast.error('Workout name is required');
      return;
    }
    if (!defaultWorkoutForm.exercises.length) {
      toast.error('Select at least one default exercise');
      return;
    }

    const payload = {
      name: defaultWorkoutForm.name.trim(),
      description: defaultWorkoutForm.description.trim(),
      category: defaultWorkoutForm.category,
      difficulty: defaultWorkoutForm.difficulty,
      duration: toNumeric(defaultWorkoutForm.duration) ?? 0,
      caloriesBurned: toNumeric(defaultWorkoutForm.caloriesBurned) ?? 0,
      exercises: defaultWorkoutForm.exercises,
      instructions: parseInstructions(defaultWorkoutForm.instructionsText),
    };

    try {
      setIsDefaultWorkoutSubmitting(true);
      if (defaultWorkoutMode === 'edit' && defaultWorkoutForm._id) {
        await defaultWorkoutAPI.update(defaultWorkoutForm._id, payload);
        toast.success('Default workout updated');
      } else {
        await defaultWorkoutAPI.create(payload);
        toast.success('Default workout created');
      }
      setIsDefaultWorkoutDialogOpen(false);
      resetDefaultWorkoutForm();
      fetchWorkouts();
    } catch (error) {
      console.error('Error saving default workout:', error);
      toast.error(error.message || 'Failed to save default workout');
    } finally {
      setIsDefaultWorkoutSubmitting(false);
    }
  };

  const confirmDeleteDefaultWorkout = (workout) => {
    setDefaultWorkoutDeleteTarget(workout);
  };

  const handleDeleteDefaultWorkout = async () => {
    if (!defaultWorkoutDeleteTarget?._id) return;
    try {
      setIsDefaultWorkoutSubmitting(true);
      await defaultWorkoutAPI.delete(defaultWorkoutDeleteTarget._id);
      toast.success('Default workout deleted');
      setDefaultWorkoutDeleteTarget(null);
      fetchWorkouts();
    } catch (error) {
      console.error('Error deleting default workout:', error);
      toast.error(error.message || 'Failed to delete default workout');
    } finally {
      setIsDefaultWorkoutSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="page-title">Workout Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Browse curated workouts and your custom plans in one view.
          </p>
        </div>

        {isAdmin && (
          <Card className="mb-8 border-dashed">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Default Workout Manager</CardTitle>
                  <CardDescription>Control the workouts shown to every user</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit">
                {defaultWorkouts.length} templates
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => openDefaultWorkoutDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Default Workout
                </Button>
              </div>
              {defaultWorkouts.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {defaultWorkouts.map((workout) => (
                    <div
                      key={workout._id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 bg-muted/40"
                    >
                      <div>
                        <p className="font-semibold">{workout.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {workout.category} • {workout.difficulty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openDefaultWorkoutDialog(workout)}
                          aria-label={`Edit ${workout.name}`}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDeleteDefaultWorkout(workout)}
                          aria-label={`Delete ${workout.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No default workouts yet. Create one to help users get started quickly.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workouts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Link to="/log-workout">
              <Button className="w-full md:w-auto">Log New Workout</Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="strength">Strength</SelectItem>
                  <SelectItem value="cardio">Cardio</SelectItem>
                  <SelectItem value="flexibility">Flexibility</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading workouts...' : `Showing ${filteredWorkouts.length} of ${allWorkouts.length} workouts`}
          </p>
        </div>

        {!isAuthenticated ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <LogIn className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="text-2xl mb-2">Log in to see your workouts!</CardTitle>
              <CardDescription className="mb-6">
                Create and manage your custom workouts by logging in to your account.
              </CardDescription>
              <Link to="/login">
                <Button size="lg">
                  <LogIn className="mr-2 h-4 w-4" />
                  Log In
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Loading workouts...</p>
          </div>
        ) : filteredWorkouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkouts.map((workout) => (
              <WorkoutCard key={workout._id || workout.id} workout={workout} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <CardTitle className="text-2xl mb-2">No workouts yet</CardTitle>
              <CardDescription className="mb-6">
                Start creating your workouts by logging a new workout session.
              </CardDescription>
              <Link to="/log-workout">
                <Button size="lg">Log New Workout</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <Dialog
          open={isDefaultWorkoutDialogOpen}
          onOpenChange={(open) => {
            setIsDefaultWorkoutDialogOpen(open);
            if (!open) {
              resetDefaultWorkoutForm();
            }
          }}
        >
          <DialogContent className="sm:max-w-[850px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {defaultWorkoutMode === 'edit' ? 'Edit Default Workout' : 'Add Default Workout'}
              </DialogTitle>
              <DialogDescription>
                {defaultWorkoutMode === 'edit'
                  ? 'Update the shared workout template'
                  : 'Create a workout that will appear in every user’s library'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="default-workout-name">Workout Name *</Label>
                  <Input
                    id="default-workout-name"
                    value={defaultWorkoutForm.name}
                    onChange={(e) =>
                      setDefaultWorkoutForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Total Body Blast"
                  />
                </div>
                <div>
                  <Label htmlFor="default-workout-category">Category</Label>
                  <Select
                    value={defaultWorkoutForm.category}
                    onValueChange={(value) =>
                      setDefaultWorkoutForm((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger id="default-workout-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="flexibility">Flexibility</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="default-workout-difficulty">Difficulty</Label>
                  <Select
                    value={defaultWorkoutForm.difficulty}
                    onValueChange={(value) =>
                      setDefaultWorkoutForm((prev) => ({ ...prev, difficulty: value }))
                    }
                  >
                    <SelectTrigger id="default-workout-difficulty">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="default-workout-duration">Duration (minutes)</Label>
                  <Input
                    id="default-workout-duration"
                    type="number"
                    min="0"
                    value={defaultWorkoutForm.duration}
                    onChange={(e) =>
                      setDefaultWorkoutForm((prev) => ({ ...prev, duration: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="default-workout-calories">Calories Burned</Label>
                  <Input
                    id="default-workout-calories"
                    type="number"
                    min="0"
                    value={defaultWorkoutForm.caloriesBurned}
                    onChange={(e) =>
                      setDefaultWorkoutForm((prev) => ({ ...prev, caloriesBurned: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="default-workout-description">Description</Label>
                <Textarea
                  id="default-workout-description"
                  value={defaultWorkoutForm.description}
                  onChange={(e) =>
                    setDefaultWorkoutForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Highlight goals, focus areas, or pacing tips"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="default-workout-instructions">Instructions (one per line)</Label>
                <Textarea
                  id="default-workout-instructions"
                  value={defaultWorkoutForm.instructionsText}
                  onChange={(e) =>
                    setDefaultWorkoutForm((prev) => ({ ...prev, instructionsText: e.target.value }))
                  }
                  placeholder={'Warm up for 5 minutes\nRest 60 seconds between sets'}
                  rows={4}
                />
              </div>
              <div>
                <Label>Default Exercises ({defaultWorkoutForm.exercises.length} selected)</Label>
                <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-md p-4">
                  {defaultExercises.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {isAdmin
                        ? 'Create default exercises first to build workouts.'
                        : 'No default exercises available.'}
                    </p>
                  ) : (
                    defaultExercises.map((exercise) => {
                      const exerciseId = exercise._id || exercise.id;
                      const isSelected = defaultWorkoutForm.exercises.includes(exerciseId);
                      return (
                        <label
                          key={exerciseId}
                          className="flex items-center gap-3 p-2 rounded hover:bg-accent/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const isNowChecked = Boolean(checked);
                              setDefaultWorkoutForm((prev) => ({
                                ...prev,
                                exercises: isNowChecked
                                  ? [...prev.exercises, exerciseId]
                                  : prev.exercises.filter((id) => id !== exerciseId),
                              }));
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{exercise.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {exercise.category} • {exercise.difficulty}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDefaultWorkoutDialogOpen(false);
                  resetDefaultWorkoutForm();
                }}
                disabled={isDefaultWorkoutSubmitting}
              >
                Cancel
              </Button>
              <Button onClick={handleDefaultWorkoutSubmit} disabled={isDefaultWorkoutSubmitting}>
                {isDefaultWorkoutSubmitting ? 'Saving...' : 'Save Default Workout'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={Boolean(defaultWorkoutDeleteTarget)}
          onOpenChange={(open) => {
            if (!open) {
              setDefaultWorkoutDeleteTarget(null);
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Default Workout</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{defaultWorkoutDeleteTarget?.name}"?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDefaultWorkoutDeleteTarget(null)}
                disabled={isDefaultWorkoutSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteDefaultWorkout}
                disabled={isDefaultWorkoutSubmitting}
              >
                {isDefaultWorkoutSubmitting ? 'Deleting...' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

