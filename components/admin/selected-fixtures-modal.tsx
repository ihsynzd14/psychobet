import { FixtureV2 } from '@/lib/api-v2';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, X } from 'lucide-react';

interface SelectedFixturesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFixturesData: FixtureV2[];
  onFixtureDeselect: (fixtureId: string) => void;
}

export function SelectedFixturesModal({ 
  open, 
  onOpenChange, 
  selectedFixturesData, 
  onFixtureDeselect 
}: SelectedFixturesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] dark:bg-gray-800 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Selected Fixtures ({selectedFixturesData.length})</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto max-h-[60vh]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>Match</TableHead>
                <TableHead>Competition</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedFixturesData.map((fixture, index) => (
                <TableRow key={fixture.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {fixture.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {fixture.homeCompetitor.name} vs {fixture.competitors.find(c => c.id !== fixture.homeCompetitor.id)?.name || 'Opponent'}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-900 dark:text-white">
                    {fixture.competition.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(fixture.startDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      fixture.eventStatusType === 'Notstarted' ? 'secondary' : 
                      fixture.eventStatusType === 'Live' ? 'default' : 'outline'
                    }>
                      <Clock className="mr-1 h-3 w-3" />
                      {fixture.eventStatusType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onFixtureDeselect(fixture.id.toString())}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {selectedFixturesData.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No fixtures selected
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => onOpenChange(false)}
            className="dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}