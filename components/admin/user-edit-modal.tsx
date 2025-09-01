'use client'

import { useState, useEffect, useCallback } from 'react';
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
import { SimpleDatePicker } from '@/components/ui/simple-date-picker';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminService, UserDetails, League, UserLeagueAccess } from '@/lib/admin-service';
import { format, addMonths, addYears } from 'date-fns';
import { Crown, User, Shield, Loader2, Check, X, Mail, CalendarDays, Users, Settings } from 'lucide-react';
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
  // Full Bundle league ID - this is the special league that when selected disables others
  const FULL_BUNDLE_ID = '987123645';
  
  // Check if Full Bundle is selected
  const isFullBundleSelected = selectedLeagues.includes(FULL_BUNDLE_ID);
  
  // Filter leagues to separate Full Bundle from others
  const fullBundleLeague = leagues.find(league => league.id === FULL_BUNDLE_ID);
  const otherLeagues = leagues.filter(league => league.id !== FULL_BUNDLE_ID);

  const handleLeagueToggle = (leagueId: string, checked: boolean) => {
    if (leagueId === FULL_BUNDLE_ID) {
      // If toggling Full Bundle
      if (checked) {
        // Select only Full Bundle, deselect all others
        onSelectionChange([FULL_BUNDLE_ID]);
      } else {
        // Deselect Full Bundle
        onSelectionChange(selectedLeagues.filter(id => id !== FULL_BUNDLE_ID));
      }
    } else {
      // If toggling individual league
      if (isFullBundleSelected) {
        // Don't allow selecting individual leagues when Full Bundle is selected
        return;
      }
      
      if (checked) {
        onSelectionChange([...selectedLeagues, leagueId]);
      } else {
        onSelectionChange(selectedLeagues.filter(id => id !== leagueId));
      }
    }
  };

  const selectAll = () => {
    if (isFullBundleSelected) return; // Don't allow select all when Full Bundle is selected
    onSelectionChange(otherLeagues.map(league => league.id));
  };

  const deselectAll = () => {
    onSelectionChange([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Crown className="h-4 w-4 text-amber-500" />
          <Label className="text-sm font-medium text-gray-900 dark:text-gray-100">
            League Access
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {selectedLeagues.length} / {leagues.length}
          </Badge>
          {!isFullBundleSelected && selectedLeagues.length > 0 && selectedLeagues.length < otherLeagues.length && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={selectAll}
              className="h-6 px-2 text-xs"
            >
              Select All
            </Button>
          )}
          {selectedLeagues.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={deselectAll}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid gap-2">
        {/* Full Bundle League - Always show first if it exists */}
        {fullBundleLeague && (
          <div className="mb-2">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-3 w-3 text-amber-500" />
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Full Bundle Option
              </span>
            </div>
            <label
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 cursor-pointer group hover:shadow-sm",
                isFullBundleSelected
                  ? "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30 shadow-sm ring-2 ring-amber-200 dark:ring-amber-800"
                  : "border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-600 hover:bg-amber-50/30 dark:hover:bg-amber-900/20"
              )}
            >
              <Checkbox
                checked={isFullBundleSelected}
                onCheckedChange={(checked: boolean) => handleLeagueToggle(fullBundleLeague.id, checked)}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {fullBundleLeague.display_name}
                  </span>
                  <Badge variant="outline" className="text-xs shrink-0 border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300">
                    All Leagues
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Access to all available leagues
                </p>
              </div>
              {isFullBundleSelected && (
                <Check className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
            </label>
          </div>
        )}

        {/* Individual Leagues */}
        {otherLeagues.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-3 w-3 text-blue-500" />
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                Individual Leagues
              </span>
              {isFullBundleSelected && (
                <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                  Disabled - Full Bundle Selected
                </Badge>
              )}
            </div>
            <div className="grid gap-2">
              {otherLeagues.map((league) => {
                const isSelected = selectedLeagues.includes(league.id);
                const isDisabled = isFullBundleSelected;
                
                return (
                  <label
                    key={league.id}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 group hover:shadow-sm",
                      isDisabled
                        ? "cursor-not-allowed opacity-50 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50"
                        : "cursor-pointer",
                      !isDisabled && isSelected 
                        ? "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30 shadow-sm"
                        : !isDisabled && "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/30"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={(checked: boolean) => handleLeagueToggle(league.id, checked)}
                      className="shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-sm font-medium truncate",
                          isDisabled 
                            ? "text-gray-400 dark:text-gray-500" 
                            : "text-gray-900 dark:text-gray-100"
                        )}>
                          {league.display_name}
                        </span>
                        {league.country && (
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-xs shrink-0",
                              isDisabled 
                                ? "border-gray-300 text-gray-400 dark:border-gray-600 dark:text-gray-500"
                                : "border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400"
                            )}
                          >
                            {league.country}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {!isDisabled && isSelected && (
                      <Check className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}
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

  const [selectedLeagueIds, setSelectedLeagueIds] = useState<string[]>([]);

  const form = useForm<EditUserFormData>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      full_name: '',
      role: 'user',
      start_date: undefined,
      expiry_date: undefined,
      league_ids: []
    }
  });

  const watchedStartDate = form.watch('start_date');
  const watchedExpiryDate = form.watch('expiry_date');

  // Prevent form submission if modal is closed or no user
  const canSubmit = open && user && !state.submitting;

  // Handle modal close - defined early to be used in useEffect
  const handleModalClose = useCallback(() => {
    // Immediately call onOpenChange to close the modal
    onOpenChange(false);
    
    // Reset form and state after a short delay to ensure modal is closed
    setTimeout(() => {
      form.reset({
        full_name: '',
        role: 'user',
        start_date: undefined,
        expiry_date: undefined,
        league_ids: []
      });
      setSelectedLeagueIds([]);
      setState({
        leagues: [],
        userLeagues: [],
        loading: false,
        submitting: false,
        error: null
      });
    }, 100);
  }, [onOpenChange]); // Removed 'form' from dependencies

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
          
          // Parse dates if they exist
          const startDate = user.start_date ? new Date(user.start_date) : undefined;
          const expiryDate = user.expiry_date ? new Date(user.expiry_date) : undefined;
          
          // Set form values
          const initialLeagueIds = userLeagues.map(ul => ul.league_id);
          form.reset({
            full_name: user.full_name || '',
            role: user.role as 'user' | 'admin',
            start_date: startDate,
            expiry_date: expiryDate,
            league_ids: initialLeagueIds
          });

          // Set local state for league selection
          setSelectedLeagueIds(initialLeagueIds);

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
  }, [open, user]); // Removed 'form' from dependencies

  // Sync form values with local state
  useEffect(() => {
    form.setValue('league_ids', selectedLeagueIds);
  }, [selectedLeagueIds]); // Removed 'form' from dependencies

  // Clean up when modal is closed from parent
  useEffect(() => {
    if (!open && !state.loading) {
      // Reset state when modal is closed
      setState({
        leagues: [],
        userLeagues: [],
        loading: false,
        submitting: false,
        error: null
      });
      // Reset form to default values
      form.reset({
        full_name: '',
        role: 'user',
        start_date: undefined,
        expiry_date: undefined,
        league_ids: []
      });
      setSelectedLeagueIds([]);
    }
  }, [open, state.loading]); // Removed 'form' from dependencies

  // Force close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleModalClose();
      }
    };
    
    if (open) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, handleModalClose]);

  const onSubmit = async (data: EditUserFormData) => {
    if (!canSubmit) {
      console.warn('Form submission blocked: modal closed or no user');
      return;
    }

    try {
      setState(prev => ({ ...prev, submitting: true, error: null }));

      // Update user profile
      await adminService.updateUser(user.id, {
        full_name: data.full_name,
        role: data.role
      });

      // Update league access
      await adminService.replaceUserLeagueAccess(user.id, data.league_ids);

      // Handle membership dates
      if (data.start_date && data.expiry_date) {
        // Check if user already has a membership
        const memberships = await adminService.getUserMemberships(user.id);
        const existingMembership = memberships[0]; // Get the most recent membership
        
        if (existingMembership) {
          // Update existing membership
          await adminService.updateUserMembership(existingMembership.id, {
            start_date: format(data.start_date, 'yyyy-MM-dd'),
            expiry_date: format(data.expiry_date, 'yyyy-MM-dd')
          });
        } else {
          // Create new membership
          await adminService.createUserMembership({
            user_id: user.id,
            start_date: format(data.start_date, 'yyyy-MM-dd'),
            expiry_date: format(data.expiry_date, 'yyyy-MM-dd')
          });
        }
      }

      // Log activity
      await adminService.logActivity(
        'user_updated',
        `Updated user: ${user.email}`,
        user.id,
        {
          updated_fields: ['profile', 'leagues', 'membership'],
          leagues_count: data.league_ids.length
        }
      );

      toast.success('User updated successfully');
      
      // Close modal and trigger parent update
      onOpenChange(false);
      onUserUpdated();
    } catch (error) {
      console.error('Error updating user:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update user';
      setState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
    } finally {
      setState(prev => ({ ...prev, submitting: false }));
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleModalClose();
        }
      }}
      modal={true}
    >
      <DialogContent 
        className="w-full max-w-4xl h-[95vh] max-h-[900px] p-0 overflow-hidden flex flex-col bg-white dark:bg-gray-800/95 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader className="shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/40">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                  Edit User Profile
                </DialogTitle>
                <DialogDescription className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user?.email}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {state.loading ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-600" />
              <p className="text-sm text-gray-600 dark:text-gray-300">Loading user data...</p>
            </div>
          </div>
        ) : state.error ? (
          <div className="flex-1 flex items-center justify-center py-16">
            <div className="text-center max-w-md">
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-950 w-fit mx-auto mb-4">
                <X className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-50 mb-2">Error Loading Data</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">{state.error}</p>
              <div className="flex justify-center gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setState(prev => ({ ...prev, error: null, loading: false }))}
                >
                  Try Again
                </Button>
                <Button onClick={handleModalClose}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit(onSubmit)} 
                className="flex-1 flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Tabs defaultValue="profile" className="flex-1 flex flex-col overflow-hidden">
                  <div className="shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800/70">
                    <TabsList className="grid w-full grid-cols-3 h-10 bg-gray-100 dark:bg-gray-700/80">
                      <TabsTrigger value="profile" className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white">
                        <Settings className="h-4 w-4" />
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="membership" className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white">
                        <CalendarDays className="h-4 w-4" />
                        Membership
                      </TabsTrigger>
                      <TabsTrigger value="leagues" className="flex items-center gap-2 text-sm data-[state=active]:bg-white data-[state=active]:dark:bg-gray-800 data-[state=active]:text-gray-900 data-[state=active]:dark:text-white">
                        <Users className="h-4 w-4" />
                        Leagues
                      </TabsTrigger>
                    </TabsList>
                  </div>

                <div className="flex-1 overflow-y-auto dark:bg-gray-800/90">
                  <TabsContent value="profile" className="p-6 space-y-6 m-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="full_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-50">
                              Full Name
                            </FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter full name" 
                                {...field} 
                                className="h-10 bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                              />
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
                            <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-50">
                              User Role
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-10 bg-white border-gray-300 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                                <SelectItem value="user" className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    User
                                  </div>
                                </SelectItem>
                                <SelectItem value="admin" className="text-gray-900 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                                  <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Admin
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Current Status Card */}
                    {user && (
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <h4 className="font-medium text-gray-900 dark:text-gray-50">Current Status</h4>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                            <p className="font-medium text-gray-900 dark:text-gray-50">
                              {user.membership_status || 'Inactive'}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Expires</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {user.expiry_date ? format(new Date(user.expiry_date), 'MMM dd, yyyy') : 'N/A'}
                            </p>
                          </div>
                          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Leagues</p>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {user.league_count} leagues
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="membership" className="p-6 space-y-6 m-0">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="start_date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                Start Date
                              </FormLabel>
                              <FormControl>
                                <SimpleDatePicker
                                  date={field.value}
                                  onDateChange={field.onChange}
                                  placeholder="Pick start date"
                                  inputClassName="w-full h-10"
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
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
                              <FormLabel className="text-sm font-medium text-gray-900 dark:text-gray-50">
                                Expiry Date
                              </FormLabel>
                              <FormControl>
                                <SimpleDatePicker
                                  date={field.value}
                                  onDateChange={field.onChange}
                                  placeholder="Pick expiry date"
                                  disabled={watchedStartDate ? (date) => date < watchedStartDate : undefined}
                                  inputClassName="w-full h-10"
                                />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                                Must be after the start date
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {watchedStartDate && watchedExpiryDate && (
                        <div className="border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <h4 className="font-medium text-blue-900 dark:text-blue-50">Membership Duration</h4>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                            <div>
                              <p className="text-blue-700 dark:text-blue-300">
                                <strong>Start:</strong> {format(watchedStartDate, 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <div>
                              <p className="text-blue-700 dark:text-blue-300">
                                <strong>End:</strong> {format(watchedExpiryDate, 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <div>
                              <p className="text-blue-700 dark:text-blue-300">
                                <strong>Duration:</strong> {Math.ceil((watchedExpiryDate.getTime() - watchedStartDate.getTime()) / (1000 * 60 * 60 * 24))} days
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="leagues" className="p-6 space-y-6 m-0">
                    <LeagueSelector
                      leagues={state.leagues}
                      selectedLeagues={selectedLeagueIds}
                      onSelectionChange={setSelectedLeagueIds}
                    />
                  </TabsContent>
                </div>

                <div className="shrink-0 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/90">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="h-4 w-4" />
                      <span>Editing: {user?.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={handleModalClose}
                        className="h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={!canSubmit}
                        className="h-9 px-6 dark:bg-blue-700 dark:hover:bg-blue-600"
                      >
                        {state.submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Update User
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Tabs>
            </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}