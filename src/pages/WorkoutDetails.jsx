import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, Flame, TrendingUp, ArrowLeft, Play, Edit, Trash2, ShieldCheck } from 'lucide-react';
import { workoutAPI, exerciseAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export default function WorkoutDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { user, isAuthenticated, isAdmin } = useAuth();
    const [workout, setWorkout] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        category: 'strength',
        difficulty: 'intermediate',
        duration: 0,
        caloriesBurned: 0,
        exercises: [],
    });
    const [availableExercises, setAvailableExercises] = useState([]);

    useEffect(() => {
        const fetchWorkout = async () => {
            try {
                setLoading(true);
                const response = await workoutAPI.getById(id);
                if (response.success) {
                    setWorkout(response.data);
                    // Pre-fill edit form
                    const workoutData = response.data;
                    setEditFormData({
                        name: workoutData.name || '',
                        description: workoutData.description || '',
                        category: workoutData.category || 'strength',
                        difficulty: workoutData.difficulty || 'intermediate',
                        duration: workoutData.duration || 0,
                        caloriesBurned: workoutData.caloriesBurned || 0,
                        exercises: workoutData.exercises?.map(ex => ex._id || ex.id) || [],
                    });
                } else {
                    sonnerToast.error('Workout not found');
                }
            } catch (error) {
                sonnerToast.error('Failed to load workout');
                console.error('Error fetching workout:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkout();
    }, [id]);

    useEffect(() => {
        const fetchExercises = async () => {
            try {
                const response = await exerciseAPI.getAll();
                if (response.success) {
                    setAvailableExercises(response.data || []);
                }
            } catch (error) {
                console.error('Error fetching exercises:', error);
            }
        };
        if (editDialogOpen) {
            fetchExercises();
        }
    }, [editDialogOpen]);

    // Calculate duration and calories based on selected exercises
    useEffect(() => {
        if (!editDialogOpen || availableExercises.length === 0) return;

        if (editFormData.exercises && editFormData.exercises.length > 0) {
            const selectedExerciseData = editFormData.exercises
                .map(exId => availableExercises.find(ex => (ex._id || ex.id) === exId))
                .filter(Boolean);

            const calculatedDuration = selectedExerciseData.reduce((sum, ex) => {
                return sum + (ex.duration || 10); // Default 10 minutes if no duration
            }, 0);

            const calculatedCalories = selectedExerciseData.reduce((sum, ex) => {
                return sum + (ex.caloriesBurned || 50); // Default 50 calories if none
            }, 0);

            // Only update if values actually changed to prevent infinite loops
            setEditFormData(prev => {
                if (prev.duration === calculatedDuration && prev.caloriesBurned === calculatedCalories) {
                    return prev;
                }
                return {
                    ...prev,
                    duration: calculatedDuration,
                    caloriesBurned: calculatedCalories,
                };
            });
        } else {
            // If no exercises selected, reset to 0
            setEditFormData(prev => {
                if (prev.duration === 0 && prev.caloriesBurned === 0) {
                    return prev;
                }
                return {
                    ...prev,
                    duration: 0,
                    caloriesBurned: 0,
                };
            });
        }
    }, [editFormData.exercises, availableExercises, editDialogOpen]);
    const handleStartWorkout = () => {
        if (!workout)
            return;
        // Store ongoing workout in sessionStorage
        const ongoingWorkout = {
            workoutId: workout._id || workout.id,
            workoutName: workout.name,
            startTime: new Date().toISOString(),
            duration: workout.duration,
            caloriesBurned: workout.caloriesBurned,
        };
        const existingWorkouts = JSON.parse(sessionStorage.getItem('ongoingWorkouts') || '[]');
        const withoutDup = existingWorkouts.filter((w) => String(w.workoutId) !== String(workout._id || workout.id));
        sessionStorage.setItem('ongoingWorkouts', JSON.stringify([...withoutDup, ongoingWorkout]));
        toast({
            title: 'Workout Started!',
            description: `${workout.name} is now in progress. Check your progress page.`,
        });
        navigate('/progress');
    };

    const handleEdit = () => {
        setEditDialogOpen(true);
    };

    const handleEditSubmit = async () => {
        if (!editFormData.name.trim() || !editFormData.duration) {
            sonnerToast.error('Please fill in all required fields');
            return;
        }

        // Ensure description has a default value if empty
        const submitData = {
            ...editFormData,
            description: editFormData.description.trim() || 'Custom workout',
        };

        try {
            setIsSubmitting(true);
            const response = await workoutAPI.update(id, submitData);
            if (response.success) {
                setWorkout(response.data);
                setEditDialogOpen(false);
                sonnerToast.success('Workout updated successfully');
            } else {
                throw new Error(response.message || 'Failed to update workout');
            }
        } catch (error) {
            console.error('Error updating workout:', error);
            const errorMessage = error.message || 'Failed to update workout';
            if (error.status === 403 || errorMessage.toLowerCase().includes('authorized') || errorMessage.includes('403')) {
                sonnerToast.error('You are not authorized to edit this workout. Only the creator can edit it.');
            } else {
                sonnerToast.error(errorMessage);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        try {
            setIsSubmitting(true);
            const response = await workoutAPI.delete(id);
            if (response.success) {
                sonnerToast.success('Workout deleted successfully');
                navigate('/dashboard');
            } else {
                throw new Error(response.message || 'Failed to delete workout');
            }
        } catch (error) {
            console.error('Error deleting workout:', error);
            const errorMessage = error.message || 'Failed to delete workout';
            if (error.status === 403 || errorMessage.toLowerCase().includes('authorized') || errorMessage.includes('403')) {
                sonnerToast.error('You are not authorized to delete this workout. Only the creator can delete it.');
            } else {
                sonnerToast.error(errorMessage);
            }
            setDeleteDialogOpen(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Helper function to normalize IDs for comparison
    const normalizeId = (id) => {
        if (!id) return null;
        if (typeof id === 'string') return id;
        if (typeof id === 'object' && id._id) return String(id._id);
        if (typeof id === 'object' && id.id) return String(id.id);
        return String(id);
    };

    const isDefaultWorkout = Boolean(workout?.isDefault);
    const isOwner =
        Boolean(
            workout &&
                user &&
                isAuthenticated &&
                workout.createdBy &&
                normalizeId(workout.createdBy) === normalizeId(user.id)
        ) && !isDefaultWorkout;
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-lg text-muted-foreground">Loading workout...</p>
                </div>
            </div>
        );
    }

    if (!workout) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Workout Not Found</h1>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>);
    }
    
    const workoutExercises = workout?.exercises || [];
    const getCategoryColor = (category) => {
        switch (category) {
            case 'strength':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'cardio':
                return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'flexibility':
                return 'bg-accent/10 text-accent border-accent/20';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'intermediate':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'advanced':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default:
                return '';
        }
    };
    return (<div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 -ml-2" aria-label="Back to Dashboard">
          <ArrowLeft className="mr-2 h-4 w-4"/>
          Back to Dashboard
        </Button>

        {/* Workout Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-destructive bg-clip-text text-transparent">
                  {workout.name}
                </h1>
                {isDefaultWorkout && (
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    Default
                  </Badge>
                )}
              </div>
              <p className="text-lg text-muted-foreground">{workout.description}</p>
            </div>
            <Badge className={getCategoryColor(workout.category)} variant="outline">
              {workout.category}
            </Badge>
          </div>

          {/* Workout Stats */}
          <div className="flex flex-wrap gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground"/>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{workout.duration} minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-muted-foreground"/>
              <div>
                <p className="text-sm text-muted-foreground">Calories</p>
                <p className="font-semibold">{workout.caloriesBurned} kcal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground"/>
              <div>
                <p className="text-sm text-muted-foreground">Difficulty</p>
                <Badge className={getDifficultyColor(workout.difficulty)} variant="secondary">
                  {workout.difficulty}
                </Badge>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 flex-wrap">
            <Button onClick={handleStartWorkout} className="flex-1 min-w-[150px]" size="lg" aria-label={`Start ${workout.name} workout`}>
              <Play className="mr-2 h-5 w-5"/>
              Start Workout
            </Button>
            {isOwner && (
              <>
                <Button 
                  onClick={handleEdit} 
                  variant="outline" 
                  size="lg" 
                  aria-label="Edit workout"
                >
                  <Edit className="mr-2 h-5 w-5"/>
                  Edit
                </Button>
                <Button 
                  onClick={() => setDeleteDialogOpen(true)} 
                  variant="outline" 
                  size="lg" 
                  className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950/30"
                  aria-label="Delete workout"
                >
                  <Trash2 className="mr-2 h-5 w-5"/>
                  Delete
                </Button>
              </>
            )}
          </div>
          {isDefaultWorkout && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>
                This workout is part of the shared library.{' '}
                {isAdmin ? 'Use the Default Workout Manager on the dashboard to update it.' : 'Default workouts cannot be edited or deleted.'}
              </span>
            </div>
          )}
        </div>

        {/* Exercises Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Exercises in This Workout</h2>
          <div className="space-y-4">
            {workoutExercises.map((exercise, index) => (<Card key={exercise.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">
                          {exercise.name}
                        </CardTitle>
                        <CardDescription>{exercise.description}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(exercise.category)} variant="outline">
                      {exercise.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-2">Target Muscles:</p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.targetMuscles?.length ? (exercise.targetMuscles.map((muscle) => (<Badge key={muscle} variant="secondary">
                              {muscle}
                            </Badge>))) : (<span className="text-sm text-muted-foreground">—</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Equipment:</p>
                      <div className="flex flex-wrap gap-2">
                        {exercise.equipment?.length ? (exercise.equipment.map((item) => (<Badge key={item} variant="outline">
                              {item}
                            </Badge>))) : (<span className="text-sm text-muted-foreground">No equipment needed</span>)}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2">Instructions:</p>
                      {exercise.instructions?.length ? (<ol className="space-y-2">
                          {exercise.instructions.map((instruction, idx) => (<li key={idx} className="text-sm text-muted-foreground pl-5 relative">
                              <span className="absolute left-0">{idx + 1}.</span>
                              {instruction}
                            </li>))}
                        </ol>) : (<span className="text-sm text-muted-foreground">No instructions</span>)}
                    </div>
                  </div>
                </CardContent>
              </Card>))}
          </div>
        </div>

        {Array.isArray(workout.instructions) && workout.instructions.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Workout Guidelines</CardTitle>
              <CardDescription>Tips to follow along</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {workout.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </span>
                    <span className="flex-1">{instruction}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workout</DialogTitle>
            <DialogDescription>Update your workout details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Workout name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Workout description (optional)"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to use default description
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editFormData.category}
                  onValueChange={(value) => setEditFormData({ ...editFormData, category: value })}
                >
                  <SelectTrigger id="edit-category">
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
              <div>
                <Label htmlFor="edit-difficulty">Difficulty</Label>
                <Select
                  value={editFormData.difficulty}
                  onValueChange={(value) => setEditFormData({ ...editFormData, difficulty: value })}
                >
                  <SelectTrigger id="edit-difficulty">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration (minutes) *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="0"
                  value={editFormData.duration}
                  onChange={(e) => setEditFormData({ ...editFormData, duration: parseInt(e.target.value) || 0 })}
                  className="bg-muted"
                  title="Automatically calculated from selected exercises"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-calculated from exercises
                </p>
              </div>
              <div>
                <Label htmlFor="edit-calories">Calories Burned</Label>
                <Input
                  id="edit-calories"
                  type="number"
                  min="0"
                  value={editFormData.caloriesBurned}
                  onChange={(e) => setEditFormData({ ...editFormData, caloriesBurned: parseInt(e.target.value) || 0 })}
                  className="bg-muted"
                  title="Automatically calculated from selected exercises"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Auto-calculated from exercises
                </p>
              </div>
            </div>
            <div>
              <Label>Exercises ({editFormData.exercises.length} selected)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Select or deselect exercises. Duration and calories will update automatically.
              </p>
              <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-4">
                {availableExercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Loading exercises...</p>
                ) : (
                  availableExercises.map((exercise) => {
                    const exerciseId = exercise._id || exercise.id;
                    const isSelected = editFormData.exercises.includes(exerciseId);
                    return (
                      <div key={exerciseId} className="flex items-center space-x-2 p-2 hover:bg-accent/50 rounded">
                        <input
                          type="checkbox"
                          id={`exercise-${exerciseId}`}
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // Adding exercise
                              setEditFormData({
                                ...editFormData,
                                exercises: [...editFormData.exercises, exerciseId],
                              });
                            } else {
                              // Removing exercise
                              setEditFormData({
                                ...editFormData,
                                exercises: editFormData.exercises.filter((id) => id !== exerciseId),
                              });
                            }
                          }}
                          className="rounded border-gray-300 cursor-pointer"
                        />
                        <label htmlFor={`exercise-${exerciseId}`} className="text-sm cursor-pointer flex-1">
                          <span className="font-medium">{exercise.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            ({exercise.duration || 10} min, {exercise.caloriesBurned || 50} cal)
                          </span>
                        </label>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{workout?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDelete} 
              disabled={isSubmitting}
              className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950/30"
            >
              {isSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>);
}
