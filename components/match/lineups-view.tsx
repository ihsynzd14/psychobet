interface LineupsViewProps {
  fixtureId: string;
}

function LineupsView({ fixtureId }: LineupsViewProps) {
  return (
    <iframe 
      id="gsm-game-tracker" 
      scrolling="no" 
      src={`https://gsm-widgets.betstream.betgenius.com/multisportgametracker/?fixtureId=${fixtureId}&productName=gsmdemo-dark&widget=lineups`}
      width="100%" 
      height="100%" 
      style={{ border: 0, minHeight: '300px' }}
      title="Lineups"
    />
  );
}

export default LineupsView; 