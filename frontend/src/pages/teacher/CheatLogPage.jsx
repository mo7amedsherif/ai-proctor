import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/Navbar';

const CheatLogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [summary, setSummary] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentLogs, setStudentLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  useEffect(() => {
    fetchSummary();
  }, [id]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`/api/cheating-logs/exam/${id}/summary`);
      setSummary(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch cheating summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentLogs = async (studentId) => {
    try {
      const response = await axios.get(`/api/cheating-logs/exam/${id}/student/${studentId}`);
      setStudentLogs(response.data);
      setSelectedStudent(studentId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch student logs');
    }
  };

  const fetchFilteredLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterSeverity) params.append('severity', filterSeverity);
      
      const response = await axios.get(`/api/cheating-logs/exam/${id}?${params}`);
      setStudentLogs(response.data);
      setSelectedStudent(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch filtered logs');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Cheating Logs</h1>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6 flex space-x-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Types</option>
            <option value="tab_switch">Tab Switch</option>
            <option value="fullscreen_exit">Fullscreen Exit</option>
            <option value="camera_obstruction">Camera Obstruction</option>
            <option value="multiple_faces">Multiple Faces</option>
            <option value="no_face_detected">No Face Detected</option>
            <option value="phone_detected">Phone Detected</option>
            <option value="keyboard_shortcut">Keyboard Shortcut</option>
            <option value="copy_paste_attempt">Copy/Paste Attempt</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            onClick={fetchFilteredLogs}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Filter
          </button>
          <button
            onClick={() => {
              setFilterType('');
              setFilterSeverity('');
              setSelectedStudent(null);
              setStudentLogs([]);
            }}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Clear
          </button>
        </div>

        {!selectedStudent && studentLogs.length === 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Violations
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Critical
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    High
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Violation Types
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {summary.map((item) => (
                  <tr
                    key={item.student._id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => fetchStudentLogs(item.student._id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">
                      {item.student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                        {item.total}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">
                        {item.critical}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs">
                        {item.high}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {item.types.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedStudent && (
          <div>
            <button
              onClick={() => setSelectedStudent(null)}
              className="mb-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Back to Summary
            </button>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Severity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Confidence
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentLogs.map((log) => (
                    <tr key={log._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded text-xs ${getSeverityColor(log.severity)}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.confidence ? `${log.confidence}%` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {summary.length === 0 && !selectedStudent && (
          <div className="text-center text-gray-500 mt-10">
            No cheating violations recorded.
          </div>
        )}
      </div>
    </div>
  );
};

export default CheatLogPage;
