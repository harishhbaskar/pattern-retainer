import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 dark:text-indigo-400 mb-4">404</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-6">This page doesn't exist.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors cursor-pointer"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
