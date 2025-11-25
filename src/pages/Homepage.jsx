import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Target, TrendingUp, Users } from 'lucide-react';
import heroImage from '@/assets/hero-fitness.jpg';
import strengthIcon from '@/assets/strength-icon.jpg';
import cardioIcon from '@/assets/cardio-icon.jpg';
import flexibilityIcon from '@/assets/flexibility-icon.jpg';
export default function Homepage() {
    const features = [
        {
            icon: <Dumbbell className="h-8 w-8"/>,
            title: 'Custom Workouts',
            description: 'Create and track personalized workout routines tailored to your goals.',
        },
        {
            icon: <Target className="h-8 w-8"/>,
            title: 'Goal Setting',
            description: 'Set and achieve your fitness goals with our progress tracking system.',
        },
        {
            icon: <TrendingUp className="h-8 w-8"/>,
            title: 'Progress Analytics',
            description: 'Visualize your fitness journey with detailed progress reports and charts.',
        },
        {
            icon: <Users className="h-8 w-8"/>,
            title: 'Exercise Library',
            description: 'Access hundreds of exercises with detailed instructions and demonstrations.',
        },
    ];
    const categories = [
        {
            name: 'Strength Training',
            description: 'Build muscle and increase power',
            image: strengthIcon,
            color: 'from-primary to-primary-glow',
        },
        {
            name: 'Cardio',
            description: 'Improve endurance and burn calories',
            image: cardioIcon,
            color: 'from-destructive to-red-600',
        },
        {
            name: 'Flexibility',
            description: 'Enhance mobility and reduce injury risk',
            image: flexibilityIcon,
            color: 'from-accent to-orange-500',
        },
    ];
    return (<div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
            backgroundImage: `url(${heroImage})`,
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60"/>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-glow to-destructive bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Transform Your Fitness Journey
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
            Track workouts, monitor progress, and achieve your fitness goals with our comprehensive
            fitness tracker.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
            <Link to="/register">
              <Button size="lg" variant="hero" className="text-lg px-8">
                Get Started Free
              </Button>
            </Link>
<Link to="/dashboard">
  <Button size="lg" variant="hero" className="text-lg px-8 custom-hover">
    View Workouts
  </Button>
</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our comprehensive platform provides all the tools you need to reach your fitness goals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (<Card key={index} className="text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Workout Categories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from a variety of workout types to match your fitness goals and preferences.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (<Card key={index} className="overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                <div className="relative h-48 overflow-hidden">
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"/>
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`}/>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                  </div>
                </div>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">{category.description}</p>
                </CardContent>
              </Card>))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-primary-glow to-destructive">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your Fitness Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have transformed their lives with FitTrack.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Sign Up Now
            </Button>
          </Link>
        </div>
      </section>
    </div>);
}
