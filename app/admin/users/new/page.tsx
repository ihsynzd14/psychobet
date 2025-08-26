'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { adminService } from '@/lib/admin-service';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addMonths, addYears } from 'date-fns';
import { CalendarIcon, Check, ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const createUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['user', 'admin'], {
    required_error: 'Please select a role',
  }),
  start_date: z.date({
    required_error: 'Start date is required',
  }),
  expiry_date: z.date({
    required_error: 'Expiry date is required',
  })
}).refine((data) => {
  return data.expiry_date > data.start_date;
}, {
  message: 'Expiry date must be after start date',
  path: ['expiry_date'],
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface FormState {
  loading: boolean;
  submitting: boolean;
  error: string | null;
}



export default function NewUserPage() {
  const router = useRouter();
  const [state, setState] = useState<FormState>({
    loading: true,
    submitting: false,
    error: null
  });

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      start_date: new Date(),
      expiry_date: addYears(new Date(), 1), // Default to 1 year from today
      role: 'user'
    }
  });

  const watchedStartDate = form.watch('start_date');
  const watchedExpiryDate = form.watch('expiry_date');

  useEffect(() => {
    // No data fetching needed anymore
    setState(prev => ({ ...prev, loading: false }));
  }, []);

  // Remove the calculateExpiryDate function since we're using direct expiry date input

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      setState(prev => ({ ...prev, submitting: true }));

      // Create the user
      const { user, error } = await adminService.createUser({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role
      });

      if (error || !user) {
        throw new Error(error?.message || 'Failed to create user');
      }

      // Create membership with the selected expiry date
      let membershipId: string | undefined;
      if (watchedExpiryDate) {
        const membership = await adminService.createUserMembership({
          user_id: user.id,
          start_date: format(data.start_date, 'yyyy-MM-dd'),
          expiry_date: format(data.expiry_date, 'yyyy-MM-dd')
        });
        membershipId = membership.id;
      }

      // League access is managed separately via Wix purchases

      // Log activity
      await adminService.logActivity(
        'user_created',
        `Created user: ${data.email}`,
        user.id,
        {
          role: data.role
        }
      );

      toast.success('User created successfully');
      router.push('/admin/users');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create user');
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  };

  if (state.loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Loading form data...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (state.error) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Error Loading Form
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mb-4">{state.error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/users">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Users
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New User
              </h1>
              <p className="text-gray-500 dark:text-gray-400">
                Add a new user with membership
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5" />
                      User Information
                    </CardTitle>
                    <CardDescription>
                      Basic user account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input placeholder="user@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="Enter password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Minimum 6 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* Membership Dates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Membership Period</CardTitle>
                    <CardDescription>
                      Set specific membership start and expiry dates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onDateChange={field.onChange}
                              placeholder="Pick start date"
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            The membership start date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiry_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <DatePicker
                              date={field.value}
                              onDateChange={field.onChange}
                              placeholder="Pick expiry date"
                              disabled={(date) => {
                                const today = new Date();
                                today.setHours(0, 0, 0, 0);
                                const startDate = watchedStartDate || today;
                                return date <= startDate;
                              }}
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            Must be after the start date
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchedStartDate && watchedExpiryDate && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Duration:</strong> {Math.ceil((watchedExpiryDate.getTime() - watchedStartDate.getTime()) / (1000 * 60 * 60 * 24))} days
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-6">
                <Button asChild variant="outline">
                  <Link href="/admin/users">Cancel</Link>
                </Button>
                <Button type="submit" disabled={state.submitting}>
                  {state.submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create User
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}