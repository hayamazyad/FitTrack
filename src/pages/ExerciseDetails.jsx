import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exerciseAPI } from "@/services/api";
import { Clock, Flame, TrendingUp, Dumbbell, Edit, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ExerciseDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const passedExercise = location.state?.exercise;
  const [exercise, setExercise] = useState(passedExercise);
  const [loading, setLoading] = useState(!passedExercise);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category: 'strength',
    difficulty: 'beginner',
    duration: 0,
    caloriesBurned: 0,
    sets: 0,
    reps: 0,
    targetMuscles: [],
    equipment: [],
    instructions: [],
  });
  const [targetMuscleInput, setTargetMuscleInput] = useState('');
  const [equipmentInput, setEquipmentInput] = useState('');
  const [instructionInput, setInstructionInput] = useState('');

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);
        const response = await exerciseAPI.getById(id);
        if (response.success) {
          const exerciseData = response.data;
          setExercise(exerciseData);
          // Pre-fill edit form
          setEditFormData({
            name: exerciseData.name || '',
            description: exerciseData.description || '',
            category: exerciseData.category || 'strength',
            difficulty: exerciseData.difficulty || 'beginner',
            duration: exerciseData.duration || 0,
            caloriesBurned: exerciseData.caloriesBurned || 0,
            sets: exerciseData.sets || 0,
            reps: exerciseData.reps || 0,
            targetMuscles: exerciseData.targetMuscles || [],
            equipment: exerciseData.equipment || [],
            instructions: exerciseData.instructions || [],
          });
        } else {
          toast.error('Exercise not found');
        }
      } catch (error) {
        toast.error('Failed to load exercise');
        console.error('Error fetching exercise:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (!passedExercise) {
      fetchExercise();
    } else {
      // Pre-fill edit form with passed exercise
      setEditFormData({
        name: passedExercise.name || '',
        description: passedExercise.description || '',
        category: passedExercise.category || 'strength',
        difficulty: passedExercise.difficulty || 'beginner',
        duration: passedExercise.duration || 0,
        caloriesBurned: passedExercise.caloriesBurned || 0,
        sets: passedExercise.sets || 0,
        reps: passedExercise.reps || 0,
        targetMuscles: passedExercise.targetMuscles || [],
        equipment: passedExercise.equipment || [],
        instructions: passedExercise.instructions || [],
      });
    }
  }, [id, passedExercise]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-lg text-muted-foreground">Loading exercise...</p>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Exercise Not Found</h1>
        <Link to="/exercises" className="underline">
          Back to Exercise Library
        </Link>
      </div>
    );
  }

  const isCustom = Boolean(exercise?.createdBy);
  const isDefaultExercise = Boolean(exercise?.isDefault);
  
  // Helper function to normalize IDs for comparison
  const normalizeId = (id) => {
    if (!id) return null;
    if (typeof id === 'string') return id;
    if (typeof id === 'object' && id._id) return String(id._id);
    if (typeof id === 'object' && id.id) return String(id.id);
    return String(id);
  };

  const isOwner =
    Boolean(
      exercise &&
        user &&
        isAuthenticated &&
        exercise.createdBy &&
        normalizeId(exercise.createdBy) === normalizeId(user.id)
    ) && !isDefaultExercise;

  const handleEdit = () => {
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editFormData.name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await exerciseAPI.update(id, editFormData);
      if (response.success) {
        setExercise(response.data);
        setEditDialogOpen(false);
        toast.success('Exercise updated successfully');
      } else {
        throw new Error(response.message || 'Failed to update exercise');
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      const errorMessage = error.message || 'Failed to update exercise';
      if (error.status === 403 || errorMessage.toLowerCase().includes('authorized') || errorMessage.includes('403')) {
        toast.error('You are not authorized to edit this exercise. Only the creator can edit it.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const response = await exerciseAPI.delete(id);
      if (response.success) {
        toast.success('Exercise deleted successfully');
        navigate('/exercises');
      } else {
        throw new Error(response.message || 'Failed to delete exercise');
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      const errorMessage = error.message || 'Failed to delete exercise';
      if (error.status === 403 || errorMessage.toLowerCase().includes('authorized') || errorMessage.includes('403')) {
        toast.error('You are not authorized to delete this exercise. Only the creator can delete it.');
      } else {
        toast.error(errorMessage);
      }
      setDeleteDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTargetMuscle = () => {
    if (targetMuscleInput.trim() && !editFormData.targetMuscles.includes(targetMuscleInput.trim())) {
      setEditFormData({
        ...editFormData,
        targetMuscles: [...editFormData.targetMuscles, targetMuscleInput.trim()],
      });
      setTargetMuscleInput('');
    }
  };

  const removeTargetMuscle = (muscle) => {
    setEditFormData({
      ...editFormData,
      targetMuscles: editFormData.targetMuscles.filter((m) => m !== muscle),
    });
  };

  const addEquipment = () => {
    if (equipmentInput.trim() && !editFormData.equipment.includes(equipmentInput.trim())) {
      setEditFormData({
        ...editFormData,
        equipment: [...editFormData.equipment, equipmentInput.trim()],
      });
      setEquipmentInput('');
    }
  };

  const removeEquipment = (item) => {
    setEditFormData({
      ...editFormData,
      equipment: editFormData.equipment.filter((e) => e !== item),
    });
  };

  const addInstruction = () => {
    if (instructionInput.trim()) {
      setEditFormData({
        ...editFormData,
        instructions: [...editFormData.instructions, instructionInput.trim()],
      });
      setInstructionInput('');
    }
  };

  const removeInstruction = (index) => {
    setEditFormData({
      ...editFormData,
      instructions: editFormData.instructions.filter((_, i) => i !== index),
    });
  };

  // match ExerciseCard styles
  const getCategoryColor = (category) => {
    switch (category) {
      case "strength":
        return "bg-primary/10 text-primary border-primary/20";
      case "cardio":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "flexibility":
        return "bg-accent/10 text-accent border-accent/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "";
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{exercise.name}</h1>
          {isDefaultExercise && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              Default
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOwner && (
            <>
              <Button 
                onClick={handleEdit} 
                variant="outline" 
                size="sm"
              >
                <Edit className="mr-2 h-4 w-4"/>
                Edit
              </Button>
              <Button 
                onClick={() => setDeleteDialogOpen(true)} 
                variant="outline" 
                size="sm"
                className="border-orange-500 text-orange-600 hover:bg-orange-50 hover:text-orange-700 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-950/30"
              >
                <Trash2 className="mr-2 h-4 w-4"/>
                Delete
              </Button>
            </>
          )}
          <Link to="/exercises">
            <Button variant="ghost" size="sm">Back to Exercise Library</Button>
          </Link>
        </div>
      </div>
      {isDefaultExercise && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>
            This exercise is part of the shared library.
            {isAdmin
              ? ' Use the Default Exercise Manager on the library page to update or remove it.'
              : ' Default exercises cannot be edited or deleted.'}
          </span>
        </div>
      )}

      {/* Top stats row: Duration, Calories, Difficulty, Category */}
      <div className="flex flex-wrap items-center gap-8">
        {/* Duration */}
        {exercise.duration && (
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-semibold">{exercise.duration} minutes</p>
            </div>
          </div>
        )}

        {/* Calories */}
        {exercise.caloriesBurned && (
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Calories</p>
              <p className="font-semibold">{exercise.caloriesBurned} kcal</p>
            </div>
          </div>
        )}

        {/* Difficulty */}
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Difficulty</p>
            <Badge
              className={getDifficultyColor(exercise.difficulty)}
              variant="secondary"
            >
              {exercise.difficulty}
            </Badge>
          </div>
        </div>

        {/* Category (new, aligned with the others) */}
        <div className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Category</p>
            <Badge
              className={getCategoryColor(exercise.category)}
              variant="outline"
            >
              {exercise.category}
            </Badge>
          </div>
        </div>
      </div>

      {/* Sets × reps chip (kept below stats row) */}
      {exercise.sets && exercise.reps && (
        <Badge variant="outline" className="rounded-full">
          {exercise.sets} sets × {exercise.reps} reps
        </Badge>
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{exercise.description}</p>
        </CardContent>
      </Card>

      {/* Target muscles with badges */}
      {!!exercise.targetMuscles?.length && (
        <Card>
          <CardHeader>
            <CardTitle>Target muscles</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 pt-2">
            {exercise.targetMuscles.map((m) => (
              <Badge key={m} variant="secondary">
                {m}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Equipment Needed — same badge style as target muscles */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Needed</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pt-2">
          {Array.isArray(exercise.equipment) && exercise.equipment.length > 0 ? (
            exercise.equipment.map((eq) => (
              <Badge key={eq} variant="secondary">
                {eq}
              </Badge>
            ))
          ) : (
            <Badge variant="secondary">None</Badge>
          )}
        </CardContent>
      </Card>

      {/* How to perform — dot bullets for custom, numbers for built-ins */}
      {!!exercise.instructions?.length && (
        <Card>
          <CardHeader>
            <CardTitle>How to perform</CardTitle>
          </CardHeader>
          <CardContent>
            {isCustom ? (
              <ol className="space-y-3 list-none pl-0">
                {exercise.instructions.map((s, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">{s}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ol className="space-y-3">
                {exercise.instructions.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                      {i + 1}
                    </span>
                    <span className="text-muted-foreground pt-0.5">{s}</span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Exercise</DialogTitle>
            <DialogDescription>Update your exercise details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Exercise name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Exercise description"
                rows={3}
              />
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
                <Label htmlFor="edit-sets">Sets</Label>
                <Input
                  id="edit-sets"
                  type="number"
                  min="0"
                  value={editFormData.sets}
                  onChange={(e) => setEditFormData({ ...editFormData, sets: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-reps">Reps</Label>
                <Input
                  id="edit-reps"
                  type="number"
                  min="0"
                  value={editFormData.reps}
                  onChange={(e) => setEditFormData({ ...editFormData, reps: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-duration">Duration (minutes)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  min="0"
                  value={editFormData.duration}
                  onChange={(e) => setEditFormData({ ...editFormData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="edit-calories">Calories Burned</Label>
                <Input
                  id="edit-calories"
                  type="number"
                  min="0"
                  value={editFormData.caloriesBurned}
                  onChange={(e) => setEditFormData({ ...editFormData, caloriesBurned: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <Label>Target Muscles</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={targetMuscleInput}
                  onChange={(e) => setTargetMuscleInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTargetMuscle())}
                  placeholder="Add target muscle"
                />
                <Button type="button" onClick={addTargetMuscle} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {editFormData.targetMuscles.map((muscle) => (
                  <Badge key={muscle} variant="secondary" className="cursor-pointer" onClick={() => removeTargetMuscle(muscle)}>
                    {muscle} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Equipment</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={equipmentInput}
                  onChange={(e) => setEquipmentInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                  placeholder="Add equipment"
                />
                <Button type="button" onClick={addEquipment} variant="outline">Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {editFormData.equipment.map((item) => (
                  <Badge key={item} variant="secondary" className="cursor-pointer" onClick={() => removeEquipment(item)}>
                    {item} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>Instructions</Label>
              <div className="flex gap-2 mt-2">
                <Textarea
                  value={instructionInput}
                  onChange={(e) => setInstructionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
                  placeholder="Add instruction step"
                  rows={2}
                />
                <Button type="button" onClick={addInstruction} variant="outline">Add</Button>
              </div>
              <ol className="space-y-2 mt-2">
                {editFormData.instructions.map((instruction, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="font-semibold">{idx + 1}.</span>
                    <span className="flex-1">{instruction}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeInstruction(idx)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ol>
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
            <DialogTitle>Delete Exercise</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{exercise?.name}"? This action cannot be undone.
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
    </div>
  );
}
