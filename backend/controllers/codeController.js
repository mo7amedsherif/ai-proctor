const asyncHandler = require('express-async-handler');
const axios = require('axios');

// @desc    Run code via Judge0 API
// @route   POST /api/code/run
// @access  Private
const runCode = asyncHandler(async (req, res) => {
  const {
    source_code,
    language_id = 71, // Python default
    stdin = '',
    expected_output = '',
    cpu_time_limit = 2,
    memory_limit = 128000,
    additional_files = []
  } = req.body;

  if (!source_code) {
    res.status(400);
    throw new Error('Source code is required');
  }

  try {
    const response = await axios.post(
      `${process.env.JUDGE0_API_URL}/submissions`,
      {
        source_code,
        language_id,
        stdin,
        expected_output,
        cpu_time_limit,
        memory_limit,
        additional_files
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );

    // Poll for results
    const token = response.data.token;
    let result = await getSubmissionResult(token);
    
    // If still processing, wait and poll again
    let attempts = 0;
    while (result.status.id <= 2 && attempts < 10) { // 1=Queued, 2=Processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      result = await getSubmissionResult(token);
      attempts++;
    }

    res.json({
      token,
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      compile_output: result.compile_output,
      time: result.time,
      memory: result.memory,
      exit_code: result.exit_code
    });

  } catch (error) {
    console.error('Judge0 API Error:', error.response?.data || error.message);
    res.status(500);
    throw new Error('Code execution failed');
  }
});

// @desc    Get supported languages
// @route   GET /api/code/languages
// @access  Private
const getLanguages = asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.JUDGE0_API_URL}/languages`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        }
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error('Judge0 Languages API Error:', error.response?.data || error.message);
    res.status(500);
    throw new Error('Failed to fetch languages');
  }
});

// @desc    Get submission status
// @route   GET /api/code/submissions/:token
// @access  Private
const getSubmissionStatus = asyncHandler(async (req, res) => {
  const { token } = req.params;

  try {
    const result = await getSubmissionResult(token);
    res.json(result);
  } catch (error) {
    console.error('Judge0 Submission API Error:', error.response?.data || error.message);
    res.status(500);
    throw new Error('Failed to get submission status');
  }
});

// @desc    Health check for code execution service
// @route   GET /api/code/health
// @access  Private
const healthCheck = asyncHandler(async (req, res) => {
  try {
    // Test Judge0 API availability
    const response = await axios.get(
      `${process.env.JUDGE0_API_URL}/system`,
      {
        headers: {
          'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
        },
        timeout: 5000
      }
    );

    res.json({
      status: 'healthy',
      judge0_status: 'connected',
      timestamp: new Date().toISOString(),
      system_info: response.data
    });
  } catch (error) {
    res.json({
      status: 'unhealthy',
      judge0_status: 'disconnected',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Helper function to get submission result
const getSubmissionResult = async (token) => {
  const response = await axios.get(
    `${process.env.JUDGE0_API_URL}/submissions/${token}`,
    {
      headers: {
        'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      }
    }
  );
  return response.data;
};

module.exports = {
  runCode,
  getLanguages,
  getSubmissionStatus,
  healthCheck
};
