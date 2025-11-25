import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, Filter, Plus, LogIn, Shield, PencilLine, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExerciseCard } from '@/components/ExerciseCard';
import { exerciseAPI, defaultExerciseAPI } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast as sonnerToast } from 'sonner';

const defaultExerciseTemplate = {
  _id: null,
  name: '',
  description: '',
  category: 'strength',
  difficulty: 'beginner',
  targetMusclesText: '',
  equipmentText: '',
  instructionsText: '',
  sets: '',
  reps: '',
  duration: '',
  caloriesBurned: '',
};

export default function ExerciseLibrary() {
  const { toast } = useToast();
  const { isAuthenticated, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [exercises, setExercises] = useState([]);
  const [defaultExercises, setDefaultExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Default exercise management
  const [isDefaultDialogOpen, setIsDefaultDialogOpen] = useState(false);
  const [defaultFormMode, setDefaultFormMode] = useState('create');
  const [defaultExerciseForm, setDefaultExerciseForm] = useState(defaultExerciseTemplate);
  const [defaultDeleteTarget, setDefaultDeleteTarget] = useState(null);
  const [isDefaultSubmitting, setIsDefaultSubmitting] = useState(false);

  // Custom exercise form state
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('strength');
  const [newExerciseDifficulty, setNewExerciseDifficulty] = useState('beginner');
  const [newExerciseEquipment, setNewExerciseEquipment] = useState('');
  const [newExerciseTargetMuscles, setNewExerciseTargetMuscles] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('');
  const [newExerciseReps, setNewExerciseReps] = useState('');
  const [newExerciseDuration, setNewExerciseDuration] = useState('');

  const fetchExercises = useCallback(async () => {
    try {
      setLoading(true);
      const requireAuth = !!isAuthenticated;
      const libraryResponse = await exerciseAPI.getAll({ requireAuth });

      if (libraryResponse.success) {
        const list = libraryResponse.data || [];
        setExercises(list);
        if (!isAdmin) {
          setDefaultExercises(list.filter((item) => item.isDefault));
        }
      }

      if (isAdmin) {
        const defaultResponse = await defaultExerciseAPI.getAll();
        if (defaultResponse.success) {
          setDefaultExercises(defaultResponse.data || []);
        }
      }
    } catch (error) {
      sonnerToast.error('Failed to load exercises');
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  }, [isAdmin, isAuthenticated]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const allExercises = useMemo(() => exercises, [exercises]);

  const filteredExercises = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return allExercises.filter((exercise) => {
      const matchesSearch =
        exercise.name.toLowerCase().includes(q) ||
        exercise.description.toLowerCase().includes(q) ||
        (exercise.targetMuscles || []).some((m) => m.toLowerCase().includes(q));

      const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter;
      const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [allExercises, searchQuery, categoryFilter, difficultyFilter]);

  const handleCreateExercise = async () => {
    if (!isAuthenticated) {
      sonnerToast.error('Please login to create exercises');
      return;
    }
    if (!newExerciseName.trim()) {
      toast({
        title: 'Error',
        description: 'Exercise name is required',
        variant: 'destructive',
      });
      return;
    }

    const asPositiveInt = (value, min = 1) => {
      const parsed = parseInt(value, 10);
      return Number.isFinite(parsed) && parsed >= min ? parsed : undefined;
    };

    const setsInt = asPositiveInt(newExerciseSets);
    const repsInt = asPositiveInt(newExerciseReps);
    const durationInt = asPositiveInt(newExerciseDuration, 0);

    if ((newExerciseSets && !setsInt) || (newExerciseReps && !repsInt)) {
      toast({
        title: 'Error',
        description: 'Sets and reps must be positive integers.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const exerciseData = {
        name: newExerciseName.trim(),
        description: newExerciseDescription.trim() || 'Custom exercise',
        category: newExerciseCategory,
        difficulty: newExerciseDifficulty,
        targetMuscles: newExerciseTargetMuscles
          ? newExerciseTargetMuscles.split(',').map((m) => m.trim()).filter(Boolean)
          : ['Custom'],
        equipment: newExerciseEquipment
          ? newExerciseEquipment.split(',').map((eq) => eq.trim()).filter(Boolean)
          : [],
        instructions: ['Perform exercise as needed'],
        sets: setsInt,
        reps: repsInt,
        duration: durationInt,
        caloriesBurned:
          durationInt ?? (setsInt && repsInt ? setsInt * 20 : 50),
      };

      const response = await exerciseAPI.create(exerciseData);
      if (response.success) {
        setExercises([response.data, ...exercises]);
        setIsCreateDialogOpen(false);
        setNewExerciseName('');
        setNewExerciseDescription('');
        setNewExerciseCategory('strength');
        setNewExerciseDifficulty('beginner');
        setNewExerciseEquipment('');
        setNewExerciseTargetMuscles('');
        setNewExerciseSets('');
        setNewExerciseReps('');
        setNewExerciseDuration('');
        toast({ title: 'Success', description: 'Custom exercise created successfully!' });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create exercise',
        variant: 'destructive',
      });
    }
  };

  const resetDefaultExerciseForm = () => {
    setDefaultExerciseForm({ ...defaultExerciseTemplate });
    setDefaultFormMode('create');
  };

  const openDefaultExerciseDialog = (exercise = null) => {
    if (exercise) {
      setDefaultFormMode('edit');
      setDefaultExerciseForm({
        _id: exercise._id,
        name: exercise.name || '',
        description: exercise.description || '',
        category: exercise.category || 'strength',
        difficulty: exercise.difficulty || 'beginner',
        targetMusclesText: (exercise.targetMuscles || []).join(', '),
        equipmentText: (exercise.equipment || []).join(', '),
        instructionsText: (exercise.instructions || []).join('\n'),
        sets: exercise.sets || '',
        reps: exercise.reps || '',
        duration: exercise.duration || '',
        caloriesBurned: exercise.caloriesBurned || '',
      });
    } else {
      resetDefaultExerciseForm();
    }
    setIsDefaultDialogOpen(true);
  };

  const parseCommaSeparated = (value) =>
    value
      ? value.split(',').map((item) => item.trim()).filter(Boolean)
      : [];

  const parseInstructions = (value) =>
    value
      ? value.split('\n').map((line) => line.trim()).filter(Boolean)
      : [];

  const toNumeric = (value) => {
    if (value === '' || value === null || value === undefined) {
      return undefined;
    }
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
  };

  const handleDefaultExerciseSubmit = async () => {
    if (!defaultExerciseForm.name.trim()) {
      toast({
        title: 'Error',
        description: 'Default exercise name is required',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      name: defaultExerciseForm.name.trim(),
      description: defaultExerciseForm.description.trim(),
      category: defaultExerciseForm.category,
      difficulty: defaultExerciseForm.difficulty,
      targetMuscles: parseCommaSeparated(defaultExerciseForm.targetMusclesText),
      equipment: parseCommaSeparated(defaultExerciseForm.equipmentText),
      instructions: parseInstructions(defaultExerciseForm.instructionsText),
      sets: toNumeric(defaultExerciseForm.sets),
      reps: toNumeric(defaultExerciseForm.reps),
      duration: toNumeric(defaultExerciseForm.duration),
      caloriesBurned: toNumeric(defaultExerciseForm.caloriesBurned) ?? 0,
    };

    try {
      setIsDefaultSubmitting(true);
      if (defaultFormMode === 'edit' && defaultExerciseForm._id) {
        await defaultExerciseAPI.update(defaultExerciseForm._id, payload);
        toast({ title: 'Default exercise updated' });
      } else {
        await defaultExerciseAPI.create(payload);
        toast({ title: 'Default exercise created' });
      }
      setIsDefaultDialogOpen(false);
      resetDefaultExerciseForm();
      fetchExercises();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save default exercise',
        variant: 'destructive',
      });
    } finally {
      setIsDefaultSubmitting(false);
    }
  };

  const confirmDeleteDefaultExercise = (exercise) => {
    setDefaultDeleteTarget(exercise);
  };

  const handleDeleteDefaultExercise = async () => {
    if (!defaultDeleteTarget?._id) return;
    try {
      setIsDefaultSubmitting(true);
      await defaultExerciseAPI.delete(defaultDeleteTarget._id);
      toast({ title: 'Default exercise deleted' });
      setDefaultDeleteTarget(null);
      fetchExercises();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete default exercise',
        variant: 'destructive',
      });
    } finally {
      setIsDefaultSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8 space-y-2">
          <h1 className="page-title">Exercise Library</h1>
          <p className="text-lg text-muted-foreground">
            Explore exercises curated by our coaches plus your personal creations.
          </p>
        </div>

        {isAdmin && (
          <Card className="mb-8 border-dashed">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Default Exercise Manager</CardTitle>
                  <CardDescription>Share curated movements with every user</CardDescription>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit">
                {defaultExercises.length} templates
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => openDefaultExerciseDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Default Exercise
                </Button>
              </div>
              {defaultExercises.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {defaultExercises.map((exercise) => (
                    <div
                      key={exercise._id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 bg-muted/40"
                    >
                      <div>
                        <p className="font-semibold">{exercise.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {exercise.category} • {exercise.difficulty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => openDefaultExerciseDialog(exercise)}
                          aria-label={`Edit ${exercise.name}`}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => confirmDeleteDefaultExercise(exercise)}
                          aria-label={`Delete ${exercise.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No default exercises yet. Create one to help users get started quickly.
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises by name, muscle group, or equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} disabled={!isAuthenticated}>
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Exercise
            </Button>
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

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading exercises...' : `Showing ${filteredExercises.length} of ${allExercises.length} exercises`}
          </p>
        </div>

        {/* Exercise Grid */}
        {!isAuthenticated ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <LogIn className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <CardTitle className="text-2xl mb-2">Log in to see your exercises!</CardTitle>
              <CardDescription className="mb-6">
                Create and manage your custom exercises by logging in to your account.
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
            <p className="text-lg text-muted-foreground">Loading exercises...</p>
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredExercises.map((exercise) => (
              <Link
                key={exercise._id || exercise.id}
                to={`/exercise/${exercise._id || exercise.id}`}
                className="block h-full"
                state={{ exercise }}
              >
                <ExerciseCard exercise={exercise} />
              </Link>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <CardTitle className="text-2xl mb-2">No exercises yet</CardTitle>
              <CardDescription className="mb-6">
                Start building your exercise library by creating custom exercises.
              </CardDescription>
              <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Exercise
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Exercise Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Custom Exercise</DialogTitle>
            <DialogDescription>Add a new exercise to your library</DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="exercise-name">Exercise Name *</Label>
                <Input
                  id="exercise-name"
                  placeholder="e.g., Custom Squat Variation"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="exercise-description">Description</Label>
                <Textarea
                  id="exercise-description"
                  placeholder="Describe the exercise..."
                  value={newExerciseDescription}
                  onChange={(e) => setNewExerciseDescription(e.target.value)}
                  rows={6}
                  className="min-h-[140px]"
                />
              </div>
              <div>
                <Label htmlFor="exercise-category">Category</Label>
                <Select value={newExerciseCategory} onValueChange={setNewExerciseCategory}>
                  <SelectTrigger id="exercise-category">
                    <SelectValue placeholder="Select a category" />
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
                <Label htmlFor="exercise-difficulty">Difficulty</Label>
                <Select value={newExerciseDifficulty} onValueChange={setNewExerciseDifficulty}>
                  <SelectTrigger id="exercise-difficulty">
                    <SelectValue placeholder="Select a difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="exercise-equipment">Equipment (comma-separated)</Label>
                <Input
                  id="exercise-equipment"
                  placeholder="e.g., Dumbbells, Bench"
                  value={newExerciseEquipment}
                  onChange={(e) => setNewExerciseEquipment(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="exercise-target-muscles">Target Muscles (comma-separated)</Label>
                <Input
                  id="exercise-target-muscles"
                  placeholder="e.g., Chest, Triceps, Shoulders"
                  value={newExerciseTargetMuscles}
                  onChange={(e) => setNewExerciseTargetMuscles(e.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="exercise-sets">Sets (for strength)</Label>
                  <Input
                    id="exercise-sets"
                    type="number"
                    placeholder="e.g., 3"
                    value={newExerciseSets}
                    onChange={(e) => setNewExerciseSets(e.target.value)}
                    min={1}
                    step={1}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                  />
                </div>
                <div>
                  <Label htmlFor="exercise-reps">Reps (for strength)</Label>
                  <Input
                    id="exercise-reps"
                    type="number"
                    placeholder="e.g., 12"
                    value={newExerciseReps}
                    onChange={(e) => setNewExerciseReps(e.target.value)}
                    min={1}
                    step={1}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="exercise-duration">Duration in minutes (for cardio/flexibility)</Label>
                <Input
                  id="exercise-duration"
                  type="number"
                  placeholder="e.g., 20"
                  value={newExerciseDuration}
                  onChange={(e) => setNewExerciseDuration(e.target.value)}
                  min={0}
                  step={1}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onKeyDown={(e) => ['-', '+', 'e', 'E'].includes(e.key) && e.preventDefault()}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-6">
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateExercise}>Create Exercise</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Default Exercise Dialog */}
      <Dialog
        open={isDefaultDialogOpen}
        onOpenChange={(open) => {
          setIsDefaultDialogOpen(open);
          if (!open) {
            resetDefaultExerciseForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[850px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {defaultFormMode === 'edit' ? 'Edit Default Exercise' : 'Add Default Exercise'}
            </DialogTitle>
            <DialogDescription>
              {defaultFormMode === 'edit'
                ? 'Update the shared exercise template'
                : 'Create an exercise that will appear for every user'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="default-name">Exercise Name *</Label>
                <Input
                  id="default-name"
                  value={defaultExerciseForm.name}
                  onChange={(e) =>
                    setDefaultExerciseForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Classic Push-Up"
                />
              </div>
              <div>
                <Label htmlFor="default-description">Description</Label>
                <Textarea
                  id="default-description"
                  value={defaultExerciseForm.description}
                  onChange={(e) =>
                    setDefaultExerciseForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Give users a helpful overview..."
                  rows={5}
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={defaultExerciseForm.category}
                  onValueChange={(value) =>
                    setDefaultExerciseForm((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
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
                <Label>Difficulty</Label>
                <Select
                  value={defaultExerciseForm.difficulty}
                  onValueChange={(value) =>
                    setDefaultExerciseForm((prev) => ({ ...prev, difficulty: value }))
                  }
                >
                  <SelectTrigger>
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

            <div className="space-y-4">
              <div>
                <Label htmlFor="default-targets">Target Muscles (comma separated)</Label>
                <Input
                  id="default-targets"
                  value={defaultExerciseForm.targetMusclesText}
                  onChange={(e) =>
                    setDefaultExerciseForm((prev) => ({ ...prev, targetMusclesText: e.target.value }))
                  }
                  placeholder="Chest, Shoulders, Triceps"
                />
              </div>
              <div>
                <Label htmlFor="default-equipment">Equipment (comma separated)</Label>
                <Input
                  id="default-equipment"
                  value={defaultExerciseForm.equipmentText}
                  onChange={(e) =>
                    setDefaultExerciseForm((prev) => ({ ...prev, equipmentText: e.target.value }))
                  }
                  placeholder="Mat, Resistance band"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="default-sets">Sets</Label>
                  <Input
                    id="default-sets"
                    type="number"
                    min="1"
                    value={defaultExerciseForm.sets}
                    onChange={(e) =>
                      setDefaultExerciseForm((prev) => ({ ...prev, sets: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="default-reps">Reps</Label>
                  <Input
                    id="default-reps"
                    type="number"
                    min="1"
                    value={defaultExerciseForm.reps}
                    onChange={(e) =>
                      setDefaultExerciseForm((prev) => ({ ...prev, reps: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="default-duration">Duration (minutes)</Label>
                  <Input
                    id="default-duration"
                    type="number"
                    min="0"
                    value={defaultExerciseForm.duration}
                    onChange={(e) =>
                      setDefaultExerciseForm((prev) => ({ ...prev, duration: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="default-calories">Calories Burned</Label>
                  <Input
                    id="default-calories"
                    type="number"
                    min="0"
                    value={defaultExerciseForm.caloriesBurned}
                    onChange={(e) =>
                      setDefaultExerciseForm((prev) => ({ ...prev, caloriesBurned: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="default-instructions">Instructions (one per line)</Label>
                <Textarea
                  id="default-instructions"
                  value={defaultExerciseForm.instructionsText}
                  onChange={(e) =>
                    setDefaultExerciseForm((prev) => ({ ...prev, instructionsText: e.target.value }))
                  }
                  placeholder={'Keep your core tight\nLower until elbows reach 90 degrees'}
                  rows={5}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsDefaultDialogOpen(false);
                resetDefaultExerciseForm();
              }}
              disabled={isDefaultSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleDefaultExerciseSubmit} disabled={isDefaultSubmitting}>
              {isDefaultSubmitting ? 'Saving...' : 'Save Default Exercise'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Default Exercise Dialog */}
      <Dialog
        open={Boolean(defaultDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDefaultDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Default Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{defaultDeleteTarget?.name}" for every user?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDefaultDeleteTarget(null)} disabled={isDefaultSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDefaultExercise} disabled={isDefaultSubmitting}>
              {isDefaultSubmitting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
