import DashboardLayout from '../components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

const DashboardPage = () => {
  return (
    <ProtectedRoute>

        <h1>Dashboard</h1>
        {/* Add dashboard-specific components here */}

    </ProtectedRoute>

  );
};

export default DashboardPage;
