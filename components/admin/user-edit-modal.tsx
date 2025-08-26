'use client'

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService, UserDetails, League, UserLeagueAccess } from '@/lib/admin-service';
import { format, addMonths, addYears } from 'date-fns';
import { CalendarIcon, Crown, User, Shield, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const editUserSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  role: z.enum(['user', 'admin'], {
    required_error: 'Please select a role',
  }),
  start_date: z.date().optional(),
  expiry_date: z.date().optional(),
  league_ids: z.array(z.string()).default([]),
});

type EditUserFormData = z.infer<typeof editUserSchema>;

interface UserEditModalProps {
  user: UserDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserUpdated: () => void;
}

interface ModalState {
  leagues: League[];
  userLeagues: UserLeagueAccess[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

function LeagueSelector({
  leagues,
  selectedLeagues,
  onSelectionChange
}: {
  leagues: League[];
  selectedLeagues: string[];
  onSelectionChange: (leagueIds: string[]) => void;
}) {
  const handleLeagueToggle = (leagueId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedLeagues, leagueId]);
    } else {
      onSelectionChange(selectedLeagues.filter(id => id !== leagueId));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">League Access</Label>
        <Badge variant="secondary">
          {selectedLeagues.length} selected
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
        {leagues.map((league) => {
          const isSelected = selectedLeagues.includes(league.id);
          
          return (
            <div
              key={league.id}
              className={cn(
                "flex items-center space-x-3 p-2 rounded border transition-colors cursor-pointer hover:border-gray-300 dark:hover:border-gray-600",
                isSelected 
                  ? "border-blue-300 bg-blue-50 dark:border-blue-700 dark:bg-blue-950"
                  : "border-gray-200 dark:border-gray-700"
              )}
              onClick={() => handleLeagueToggle(league.id, !isSelected)}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked: boolean) => handleLeagueToggle(league.id, checked)}
              />
              <div className="flex-1 flex items-center space-x-2">
                <Crown className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{league.display_name}</span>
                {league.country && (
                  <span className="text-xs text-gray-500">({league.country})</span>
                )}
              </div>
              {isSelected && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function UserEditModal({ user, open, onOpenChange, onUserUpdated }: UserEditModalProps) {
  const [state, setState] = useState<ModalState>({
    leagues: [],
    userLeagues: [],
    loading: false,
    submitting: false,
    error: null
  });

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: '',
      role: 'user',
      league_ids: []
    }
  });

  const watchedStartDate = form.watch('start_date');
  const watchedExpiryDate = form.watch('expiry_date');

  // Load form data when modal opens
  useEffect(() => {
    if (open && user) {
      const fetchData = async () => {
        try {
          setState(prev => ({ ...prev, loading: true, error: null }));
          
          const [leagues, userLeagues] = await Promise.all([
            adminService.getAllLeagues(),
            adminService.getUserLeagueAccess(user.id)
          ]);
          
          // Set form values
          form.reset({
            full_name: user.full_name || '',
            role: user.role as 'user' | 'admin',
            league_ids: userLeagues.map(ul => ul.league_id)
          });

          setState(prev => ({
            ...prev,
            leagues,
            userLeagues,
            loading: false
          }));
        } catch (error) {
          console.error('Error fetching modal data:', error);
          setState(prev => ({
            ...prev,
            error: 'Failed to load user data',
            loading: false
          }));
        }
      };

      fetchData();
    }
  }, [open, user, form]);

  // Remove the calculateExpiryDate function since we're using direct expiry date input

  const onSubmit = async (data: EditUserFormData) => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, submitting: true }));

      // Update user profile
      await adminService.updateUser(user.id, {
        full_name: data.full_name,
        role: data.role
      });

      // Update league access
      await adminService.replaceUserLeagueAccess(user.id, data.league_ids);

      // Create new membership if dates are provided
      if (data.start_date && data.expiry_date) {
        await adminService.createUserMembership({
          user_id: user.id,
          start_date: format(data.start_date, 'yyyy-MM-dd'),
          expiry_date: format(data.expiry_date, 'yyyy-MM-dd')
        });
      }

      // Log activity
      await adminService.logActivity(
        'user_updated',
        `Updated user: ${user.email}`,
        user.id,
        {
          updated_fields: ['profile', 'leagues'],
          leagues_count: data.league_ids.length
        }
      );

      toast.success('User updated successfully');
      onUserUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit User: {user?.email}
          </DialogTitle>
          <DialogDescription>
            Update user information, role, and league access
          </DialogDescription>
        </DialogHeader>

        {state.loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading user data...</span>
          </div>
        ) : state.error ? (
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400">{state.error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="membership">Membership</TabsTrigger>
                  <TabsTrigger value="leagues">Leagues</TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile" className="space-y-4">
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
                        <Select onValueChange={field.onChange} value={field.value}>
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

                  {/* Current membership status */}
                  {user && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium mb-2">Current Status</h4>
                      <div className="space-y-1 text-sm">
                        <p><strong>Status:</strong> {user.membership_status || 'Inactive'}</p>
                        {user.expiry_date && (
                          <p><strong>Expires:</strong> {format(new Date(user.expiry_date), 'PPP')}</p>
                        )}
                        <p><strong>Leagues:</strong> {user.league_count} leagues</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="membership" className="space-y-4">
                  <div className="space-y-4">
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
                              className="w-full"
                            />
                          </FormControl>
                          <FormDescription>
                            Optional: Set to create a new membership
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
                              disabled={watchedStartDate ? (date) => date < watchedStartDate : undefined}
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
                  </div>
                </TabsContent>

                <TabsContent value="leagues" className="space-y-4">
                  <LeagueSelector
                    leagues={state.leagues}
                    selectedLeagues={form.watch('league_ids')}
                    onSelectionChange={(leagueIds) => form.setValue('league_ids', leagueIds)}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={state.submitting}>
                  {state.submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update User'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}