import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventType {
  id: string;
  label: string;
}

interface EventSettingsSheetProps {
  eventTypes: EventType[];
  visibleEvents: Set<string>;
  onVisibilityChange: (newVisibleEvents: Set<string>) => void;
}

export function EventSettingsSheet({ 
  eventTypes, 
  visibleEvents, 
  onVisibilityChange 
}: EventSettingsSheetProps) {
  const allEventsSelected = eventTypes.every(et => visibleEvents.has(et.id));
  const someEventsSelected = eventTypes.some(et => visibleEvents.has(et.id));

  const handleToggleAll = () => {
    if (allEventsSelected) {
      onVisibilityChange(new Set());
    } else {
      onVisibilityChange(new Set(eventTypes.map(et => et.id)));
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-secondary/80">
          <Settings2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="bottom" 
        className="h-[45vh] rounded-t-xl border-t-2"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between py-4 px-6 border-b">
            <h3 className="text-lg font-semibold">Event Settings</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {allEventsSelected ? 'Hide All' : 'Show All'}
              </span>
              <Switch
                checked={allEventsSelected}
                onCheckedChange={handleToggleAll}
                className={cn(
                  someEventsSelected && !allEventsSelected && "bg-primary/50"
                )}
              />
            </div>
          </div>

          <div className="px-6 flex-1 overflow-hidden">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-4 h-full overflow-y-auto pr-2 pb-6">
              {eventTypes.map((eventType) => (
                <div 
                  key={eventType.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 transition-colors hover:bg-secondary/10"
                >
                  <label className="text-sm font-medium leading-none cursor-pointer flex-1 mr-4">
                    {eventType.label}
                  </label>
                  <Switch
                    checked={visibleEvents.has(eventType.id)}
                    onCheckedChange={(checked) => {
                      const newSet = new Set(visibleEvents);
                      if (checked) {
                        newSet.add(eventType.id);
                      } else {
                        newSet.delete(eventType.id);
                      }
                      onVisibilityChange(newSet);
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 