import AppShell from '@/components/AppShell';

export const metadata = {
  title: 'Echoes — Discovery Map',
  description: 'Explore echo points on the campus map',
};

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden" style={{ background: '#f0ede8' }}>
      <AppShell />
    </main>
  );
}
