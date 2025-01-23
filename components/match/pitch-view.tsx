interface PitchViewProps {
  fixtureId: string;
}

function PitchView({ fixtureId }: PitchViewProps) {
  return (
    <iframe 
      id="gsm-game-tracker" 
      scrolling="no" 
      src={`https://gsm-widgets.betstream.betgenius.com/multisportgametracker/?fixtureId=${fixtureId}&productName=gsmdemo-dark&widget=court`}
      width="100%" 
      height="100%" 
      style={{ border: 0, minHeight: '300px' }}
      title="Pitch Track"
    />
  );
}

export default PitchView; 