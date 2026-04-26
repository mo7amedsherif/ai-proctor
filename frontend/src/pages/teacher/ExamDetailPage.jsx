import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/Navbar';

const ExamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctOption: 0,
    marks: 1,
  });

  useEffect(() => {
    fetchExamData();
  }, [id]);

  const fetchExamData = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        axios.get(`/api/exams/${id}`),
        axios.get(`/api/exams/${id}/questions`),
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exam data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/exams/${id}/questions`, newQuestion);
      setQuestions([...questions, response.data]);
      setNewQuestion({
        text: '',
        options: ['', '', '', ''],
        correctOption: 0,
        marks: 1,
      });
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await axios.delete(`/api/exams/${id}/questions/${questionId}`);
      setQuestions(questions.filter((q) => q._id !== questionId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete question');
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6">{exam?.title}</h1>
        <p className="text-gray-600 mb-6">{exam?.description}</p>
        <p className="text-sm text-gray-500 mb-6">Duration: {exam?.duration} minutes</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            {showAddForm ? 'Cancel' : 'Add Question'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddQuestion} className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h3 className="text-xl font-semibold mb-4">Add New Question</h3>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Question Text</label>
              <textarea
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Options</label>
              {newQuestion.options.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...newQuestion.options];
                    newOptions[index] = e.target.value;
                    setNewQuestion({ ...newQuestion, options: newOptions });
                  }}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                  placeholder={`Option ${index + 1}`}
                  required
                />
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Correct Option (0-3)</label>
              <select
                value={newQuestion.correctOption}
                onChange={(e) => setNewQuestion({ ...newQuestion, correctOption: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Option 1</option>
                <option value={1}>Option 2</option>
                <option value={2}>Option 3</option>
                <option value={3}>Option 4</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Marks</label>
              <input
                type="number"
                value={newQuestion.marks}
                onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
            >
              Add Question
            </button>
          </form>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Questions ({questions.length})</h2>
          {questions.map((question, index) => (
            <div key={question._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">
                  Q{index + 1}: {question.text}
                </h3>
                <button
                  onClick={() => handleDeleteQuestion(question._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-2 rounded ${
                      optIndex === question.correctOption
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-50'
                    }`}
                  >
                    {option} {optIndex === question.correctOption && '✓'}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Marks: {question.marks}</p>
            </div>
          ))}
        </div>

        {questions.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No questions yet. Add your first question!
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetailPage;
