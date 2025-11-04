//Lynn

import { useParams, Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockExercises } from "@/data/mockData";
import { Clock, Flame, TrendingUp, Dumbbell } from "lucide-react";

export default function ExerciseDetails() {
  const { id } = useParams();
  const location = useLocation();
  const passedExercise = location.state?.exercise;

  const exercise =
    passedExercise || mockExercises.find((e) => String(e.id) === String(id));

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

  const isCustom = String(exercise.id).startsWith("custom-");

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
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold">{exercise.name}</h1>
        <Link to="/exercises" className="underline">
          Back to Exercise Library
        </Link>
      </div>

      
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

        {/* Category */}
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

      {/* Sets × reps */}
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

      {/* Target muscles */}
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

      {/* Equipment Needed */}
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

      {/* How to perform */}
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
    </div>
  );
}

