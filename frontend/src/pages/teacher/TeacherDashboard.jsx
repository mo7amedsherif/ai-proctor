import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/Navbar';

const TeacherDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await axios.get('/api/exams');
      setExams(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam?')) return;

    try {
      await axios.delete(`/api/exams/${examId}`);
      setExams(exams.filter((exam) => exam._id !== examId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete exam');
    }
  };

  const handleToggleActive = async (examId, currentStatus) => {
    try {
      await axios.put(`/api/exams/${examId}`, { isActive: !currentStatus });
      setExams(
        exams.map((exam) =>
          exam._id === examId ? { ...exam, isActive: !currentStatus } : exam
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update exam');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
          <button
            onClick={() => navigate('/teacher/create-exam')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Exam
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exams.map((exam) => (
            <div key={exam._id} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-2">{exam.title}</h3>
              <p className="text-gray-600 mb-4">{exam.description}</p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">
                  Duration: {exam.duration} min
                </span>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    exam.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {exam.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => navigate(`/teacher/exam/${exam._id}`)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                >
                  View
                </button>
                <button
                  onClick={() => navigate(`/teacher/exam/${exam._id}/results`)}
                  className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition"
                >
                  Results
                </button>
                <button
                  onClick={() => navigate(`/teacher/exam/${exam._id}/cheating`)}
                  className="flex-1 bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
                >
                  Logs
                </button>
                <button
                  onClick={() => handleToggleActive(exam._id, exam.isActive)}
                  className="flex-1 bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 transition"
                >
                  {exam.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDelete(exam._id)}
                  className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {exams.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No exams found. Create your first exam!
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
