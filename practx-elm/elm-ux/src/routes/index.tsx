import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const Home = () => {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-primary">
          Environment: {import.meta.env.VITE_ENV_NAME ?? 'Local'}
        </p>
        <h1 className="text-3xl font-bold text-brand-text">Equipment Lifecycle Management</h1>
        <p className="max-w-2xl text-base text-brand-muted">
          Monitor devices, manage warranties, and track services for every clinic. Select a clinic to explore its inventory.
        </p>
      </header>
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild>
          <Link to="/clinics/22222222-2222-2222-2222-222222222222/devices">View Clinic Devices</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/login">Switch account</Link>
        </Button>
      </div>
    </section>
  );
};

export default Home;
