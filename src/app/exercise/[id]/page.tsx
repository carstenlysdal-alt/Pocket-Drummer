import ExerciseClient from './ExerciseClient';
import { initialExercises } from '@/lib/mockData';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return initialExercises.map((exercise) => ({
    id: exercise.id,
  }));
}

export default function ExercisePage({ params }: PageProps) {
  return <ExerciseClient params={params} />;
}
