import { Clock, Flame, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

export const WorkoutCard = ({ workout }) => {
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
    return (<Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-xl mb-2">{workout.name}</CardTitle>
            <CardDescription className="line-clamp-2">{workout.description}</CardDescription>
          </div>
          <Badge className={getCategoryColor(workout.category)} variant="outline">
            {workout.category}
          </Badge>
        </div>
        {workout.isDefault && (
          <Badge variant="secondary" className="w-fit">
            Default
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4"/>
            <span>{workout.duration} min</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Flame className="h-4 w-4"/>
            <span>{workout.caloriesBurned} cal</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4"/>
            <Badge className={getDifficultyColor(workout.difficulty)} variant="secondary">
              {workout.difficulty}
            </Badge>
          </div>
        </div>
        <Link to={`/workout/${workout._id || workout.id}`} state={{ workout }}>
          <Button className="w-full" variant="default">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>);
};
