import CalisthenicsTracker from '@/components/CalisthenicsTracker';

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Calisthenics Tracker</h1>
      <CalisthenicsTracker />
    </div>
  );
}