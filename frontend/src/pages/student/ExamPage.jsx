import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Navbar from '../../components/Navbar';
import ProctoringEngine from '../../components/proctoring/ProctoringEngine';

const ExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExamData();
  }, [id]);

  useEffect(() => {
    if (!exam) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam]);

  const fetchExamData = async () => {
    try {
      const [examRes, questionsRes] = await Promise.all([
        axios.get(`/api/exams/${id}`),
        axios.get(`/api/exams/${id}/questions`),
      ]);
      setExam(examRes.data);
      setQuestions(questionsRes.data);
      setTimeLeft(examRes.data.duration * 60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch exam data');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const answersArray = questions.map((q) => ({
      question: q._id,
      selectedOption: answers[q._id] !== undefined ? answers[q._id] : null,
    }));

    try {
      const response = await axios.post('/api/results', {
        examId: id,
        answers: answersArray,
      });
      navigate('/student/result', { state: { result: response.data } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit exam');
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div>
      <Navbar />
      <ProctoringEngine examId={id} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{exam?.title}</h1>
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Time Remaining: {formatTime(timeLeft)}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {questions.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                Question {currentQuestion + 1} of {questions.length}
              </span>
            </div>
            <h2 className="text-xl font-semibold mb-6">
              {questions[currentQuestion].text}
            </h2>
            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerChange(questions[currentQuestion]._id, index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition ${
                    answers[questions[currentQuestion]._id] === index
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <span className="font-semibold mr-2">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition disabled:bg-gray-400"
          >
            Previous
          </button>
          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded ${
                  currentQuestion === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition disabled:bg-green-400"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </button>
          ) : (
            <button
              onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
