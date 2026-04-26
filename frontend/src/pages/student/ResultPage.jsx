import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            No result data found. Please submit an exam first.
          </div>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const getPassStatus = () => {
    if (result.percentage >= 70) {
      return { text: 'Passed', color: 'bg-green-100 text-green-800' };
    } else if (result.percentage >= 50) {
      return { text: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { text: 'Failed', color: 'bg-red-100 text-red-800' };
    }
  };

  const status = getPassStatus();

  return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">Exam Result</h1>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center mb-8">
            <div className="text-6xl font-bold mb-2">{result.percentage}%</div>
            <span className={`px-4 py-2 rounded-full text-lg font-semibold ${status.color}`}>
              {status.text}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Score</div>
              <div className="text-2xl font-semibold">{result.score}</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500">Total Marks</div>
              <div className="text-2xl font-semibold">{result.totalMarks}</div>
            </div>
          </div>

          <div className="text-center text-gray-500 mb-6">
            Submitted at: {new Date(result.submittedAt).toLocaleString()}
          </div>

          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
