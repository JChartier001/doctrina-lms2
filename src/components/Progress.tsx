import { LinearProgress } from '@mui/material';

const Progress = ({ progress }: { progress: number | null }) => {
  if(progress === null) return null;

  return <LinearProgress variant="determinate" value={progress} />;
};
export default Progress;
