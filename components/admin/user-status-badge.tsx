import { Badge } from '@/components/ui/badge';
import { UserDetails } from '@/lib/admin-service';

interface UserStatusBadgeProps {
  user: UserDetails;
}

export function UserStatusBadge({ user }: UserStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (user.membership_health) {
      case 'active':
        return {
          variant: 'default' as const,
          text: 'Active',
          className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
        };
      case 'expiring_soon':
        return {
          variant: 'secondary' as const,
          text: 'Expiring Soon',
          className: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
        };
      case 'expired':
        return {
          variant: 'destructive' as const,
          text: 'Expired',
          className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
        };
      default:
        return {
          variant: 'outline' as const,
          text: 'No Membership',
          className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={config.className}>
      {config.text}
    </Badge>
  );
}