interface EventMessageProps {
  message: string;
}

export function EventMessage({ message }: EventMessageProps) {
  return (
    <p className="mt-2 text-sm text-muted-foreground break-words">
      {message}
    </p>
  );
}