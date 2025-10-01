import {
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  CheckSquare,
  Clock,
  FileText,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectUser } from '@/store/slices/authSlice';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const features = [
    {
      icon: CheckSquare,
      title: 'Task Management',
      description:
        'Create, assign, and track tasks with ease. Set priorities, due dates, and monitor progress in real-time.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Assign tasks to team members, share updates, and maintain transparency across your organization.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: BarChart3,
      title: 'Progress Analytics',
      description:
        'Get insights into team productivity, track completion rates, and identify bottlenecks.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with role-based access control and data encryption.',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      icon: Zap,
      title: 'Real-time Updates',
      description:
        'Stay synchronized with instant notifications and live updates across all devices.',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      icon: Clock,
      title: 'Time Tracking',
      description:
        'Monitor time spent on tasks and projects to improve estimation and productivity.',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  const benefits = [
    'Increase team productivity by up to 40%',
    'Reduce project completion time by 25%',
    'Improve task visibility and accountability',
    'Streamline communication and collaboration',
    'Generate detailed productivity reports',
    'Scale efficiently as your team grows',
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleViewDemo = () => {
    navigate('/dashboard');
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
      {/* Navigation */}
      <nav className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <CheckSquare className='h-8 w-8 text-blue-600 mr-2' />
              <span className='text-xl font-bold text-gray-900'>Task Manager</span>
            </div>
            <div className='flex items-center space-x-4'>
              {isAuthenticated ? (
                <>
                  <Badge variant='outline'>
                    Welcome, {user ? `${user.firstName} ${user.lastName}` : ''}
                  </Badge>
                  <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                </>
              ) : (
                <>
                  <Button variant='ghost' onClick={() => navigate('/login')}>
                    Sign In
                  </Button>
                  <Button onClick={() => navigate('/register')}>Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='py-20 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto text-center'>
          <Badge className='mb-4' variant='secondary'>
            <Star className='h-3 w-3 mr-1' />
            Trusted by 10,000+ teams worldwide
          </Badge>

          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6'>
            Manage Tasks.
            <span className='text-blue-600'> Boost Productivity.</span>
            <br />
            Achieve More.
          </h1>

          <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
            The all-in-one task management platform that helps teams organize, track, and complete
            projects efficiently. Join thousands of teams already saving time and getting more done.
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button size='lg' onClick={handleGetStarted} className='text-lg px-8'>
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
              <ArrowRight className='ml-2 h-5 w-5' />
            </Button>
            <Button size='lg' variant='outline' onClick={handleViewDemo} className='text-lg px-8'>
              View Demo
            </Button>
          </div>

          {/* Stats */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16'>
            <div>
              <div className='text-3xl font-bold text-gray-900 mb-2'>10,000+</div>
              <div className='text-gray-600'>Active Teams</div>
            </div>
            <div>
              <div className='text-3xl font-bold text-gray-900 mb-2'>1M+</div>
              <div className='text-gray-600'>Tasks Completed</div>
            </div>
            <div>
              <div className='text-3xl font-bold text-gray-900 mb-2'>99.9%</div>
              <div className='text-gray-600'>Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Everything you need to manage tasks effectively
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Powerful features designed to streamline your workflow and boost team productivity.
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className='hover:shadow-lg transition-shadow'>
                  <CardHeader>
                    <div
                      className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}
                    >
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className='text-xl'>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className='text-gray-600'>
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className='py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 mb-6'>
                Why teams choose Task Manager
              </h2>
              <p className='text-lg text-gray-600 mb-8'>
                Join thousands of teams who have transformed their productivity with our platform.
              </p>

              <div className='space-y-4'>
                {benefits.map((benefit, index) => (
                  <div key={index} className='flex items-center'>
                    <CheckCircle2 className='h-5 w-5 text-green-600 mr-3 flex-shrink-0' />
                    <span className='text-gray-700'>{benefit}</span>
                  </div>
                ))}
              </div>

              <div className='mt-8'>
                <Button size='lg' onClick={handleGetStarted}>
                  Start Your Free Trial
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Button>
              </div>
            </div>

            <div className='grid grid-cols-2 gap-6'>
              <Card className='text-center p-6'>
                <TrendingUp className='h-8 w-8 text-green-600 mx-auto mb-2' />
                <div className='text-2xl font-bold text-gray-900 mb-1'>40%</div>
                <div className='text-sm text-gray-600'>Productivity Increase</div>
              </Card>

              <Card className='text-center p-6'>
                <Calendar className='h-8 w-8 text-blue-600 mx-auto mb-2' />
                <div className='text-2xl font-bold text-gray-900 mb-1'>25%</div>
                <div className='text-sm text-gray-600'>Faster Completion</div>
              </Card>

              <Card className='text-center p-6'>
                <FileText className='h-8 w-8 text-purple-600 mx-auto mb-2' />
                <div className='text-2xl font-bold text-gray-900 mb-1'>50%</div>
                <div className='text-sm text-gray-600'>Fewer Missed Deadlines</div>
              </Card>

              <Card className='text-center p-6'>
                <Users className='h-8 w-8 text-orange-600 mx-auto mb-2' />
                <div className='text-2xl font-bold text-gray-900 mb-1'>90%</div>
                <div className='text-sm text-gray-600'>Team Satisfaction</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-blue-600'>
        <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
          <h2 className='text-3xl font-bold text-white mb-4'>
            Ready to transform your team's productivity?
          </h2>
          <p className='text-xl text-blue-100 mb-8'>
            Join thousands of teams already using Task Manager to get more done.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button
              size='lg'
              variant='secondary'
              onClick={handleGetStarted}
              className='text-lg px-8'
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='text-lg px-8 bg-transparent border-white text-white hover:bg-white hover:text-blue-600'
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div className='col-span-1 md:col-span-2'>
              <div className='flex items-center mb-4'>
                <CheckSquare className='h-8 w-8 text-blue-400 mr-2' />
                <span className='text-xl font-bold'>Task Manager</span>
              </div>
              <p className='text-gray-400 mb-4'>
                The complete task management solution for modern teams. Organize, track, and
                complete projects with ease.
              </p>
            </div>

            <div>
              <h3 className='font-semibold mb-4'>Product</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a href='#' className='hover:text-white'>
                    Features
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white'>
                    Pricing
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white'>
                    Integrations
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white'>
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold mb-4'>Support</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <a href='#' className='hover:text-white'>
                    Help Center
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white'>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white'>
                    Status
                  </a>
                </li>
                <li>
                  <a href='#' className='hover:text-white'>
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
            <p>&copy; 2024 Task Manager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
