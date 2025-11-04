import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export const ExerciseCard = ({ exercise, onClick }) => {
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

  
  const rightStats = (() => {
    const parts = [];
    if (exercise.sets && exercise.reps) parts.push(`${exercise.sets}×${exercise.reps}`);
    if (typeof exercise.duration === 'number') parts.push(`${exercise.duration} min`);
    if (typeof exercise.caloriesBurned === 'number') parts.push(`~${exercise.caloriesBurned} cal`);
    return parts.join(' • ');
  })();

  return (
    <Card
      className="h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-2 cursor-pointer"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{exercise.name}</CardTitle>
          <Badge className={getCategoryColor(exercise.category)} variant="outline">
            {exercise.category}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {exercise.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-2 mb-6">
          {exercise.targetMuscles.slice(0, 3).map((muscle) => (
            <Badge key={muscle} variant="secondary" className="text-xs">
              {muscle}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <Badge className={getDifficultyColor(exercise.difficulty)} variant="secondary">
            {exercise.difficulty}
          </Badge>
          {rightStats ? (
            <span className="text-xs text-muted-foreground">{rightStats}</span>
          ) : (
            <span className="text-xs text-muted-foreground"> </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
