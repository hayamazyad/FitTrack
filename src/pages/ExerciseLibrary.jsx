//Lynn

import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExerciseCard } from '@/components/ExerciseCard';
import { mockExercises } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ExerciseLibrary() {
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [customExercises, setCustomExercises] = useState([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newExerciseCategory, setNewExerciseCategory] = useState('strength');
  const [newExerciseDifficulty, setNewExerciseDifficulty] = useState('beginner');
  const [newExerciseEquipment, setNewExerciseEquipment] = useState('');
  const [newExerciseTargetMuscles, setNewExerciseTargetMuscles] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('');
  const [newExerciseReps, setNewExerciseReps] = useState('');
  const [newExerciseDuration, setNewExerciseDuration] = useState('');

  // Merge default and custom exercises
  const allExercises = [...mockExercises, ...customExercises];

  const filteredExercises = allExercises.filter((exercise) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      exercise.name.toLowerCase().includes(q) ||
      exercise.description.toLowerCase().includes(q) ||
      exercise.targetMuscles.some((m) => m.toLowerCase().includes(q));

    const matchesCategory = categoryFilter === 'all' || exercise.category === categoryFilter;
    const matchesDifficulty = difficultyFilter === 'all' || exercise.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleCreateExercise = () => {
    if (!newExerciseName.trim()) {
      toast({
        title: 'Error',
        description: 'Exercise name is required',
        variant: 'destructive',
      });
      return;
    }
    const asPositiveInt = (v, min = 1) => {
      const n = parseInt(v, 10);
      return Number.isFinite(n) && n >= min ? n : undefined;
    };
    const setsInt = newExerciseSets ? asPositiveInt(newExerciseSets, 1) : undefined;
    const repsInt = newExerciseReps ? asPositiveInt(newExerciseReps, 1) : undefined;
    const durationInt = newExerciseDuration ? asPositiveInt(newExerciseDuration, 1) : undefined; // use 0 if min=0

    if ((newExerciseSets && !setsInt) || (newExerciseReps && !repsInt)) {
      toast({
        title: 'Error',
        description: 'Sets and reps must be positive integers.',
        variant: 'destructive',
      });
      return;
    }

    const newExercise = {
      id: `custom-${Date.now()}`,
      name: newExerciseName,
      description: newExerciseDescription || 'Custom exercise',
      category: newExerciseCategory,
      difficulty: newExerciseDifficulty,
      targetMuscles: newExerciseTargetMuscles
        ? newExerciseTargetMuscles.split(',').map(m => m.trim()).filter(Boolean)
        : ['Custom'],
      equipment: newExerciseEquipment
        ? newExerciseEquipment.split(',').map(e => e.trim()).filter(Boolean)
        : [],
      instructions: ['Perform exercise as needed'],
      sets: setsInt,
      reps: repsInt,
      duration: durationInt,
      caloriesBurned: durationInt
        ? durationInt * 10
        : (setsInt && repsInt)
          ? setsInt * 20
          : 50,
    };


    const updated = [...customExercises, newExercise];
    setCustomExercises(updated);

    // reset 
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
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header (page title) */}
        <div className="mb-8">
          <h1 className="page-title">Exercise Library</h1>
          <p className="text-lg text-muted-foreground">
            Explore our comprehensive collection of exercises with detailed instructions
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises by name, muscle group, or equipment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
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

        {/* Count for results */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {filteredExercises.length} of {allExercises.length} exercises
            {customExercises.length > 0 && (
              <span className="ml-2 text-primary">({customExercises.length} custom)</span>
            )}
          </p>
        </div>

        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {filteredExercises.map((exercise) => (
              <Link
                key={exercise.id}
                to={`/exercise/${exercise.id}`}  
                state={{ exercise }}              
                className="block h-full"
              >
                <ExerciseCard exercise={exercise} />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              No exercises found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>

      {/* Create Exercise*/}
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
                  min={0}                // no negatives (set to 0 if you want to allow zero)
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
    </div>
  );
}

