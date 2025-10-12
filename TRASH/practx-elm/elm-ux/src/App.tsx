import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './routes';
import Login from './routes/Login';
import ClinicDevices from './routes/ClinicDevices';
import DeviceDetail from './routes/DeviceDetail';
import { ToastProviderWithQueue } from './components/ui/use-toast';

const App = () => {
  return (
    <ToastProviderWithQueue>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="clinics/:clinicId/devices" element={<ClinicDevices />} />
          <Route path="devices/:deviceId" element={<DeviceDetail />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProviderWithQueue>
  );
};

export default App;
