import { useEffect, useRef } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import axios from '../../api/axios';

const ProctoringEngine = ({ examId }) => {
  const webcamRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const violationLogRef = useRef({});
  const modelRef = useRef(null);
  const devToolsRef = useRef({ threshold: 160 });

  const logViolation = (type, confidence, description) => {
    const now = Date.now();
    const lastLog = violationLogRef.current[type];
    if (lastLog && now - lastLog < 10000) return;
    violationLogRef.current[type] = now;

    axios.post('/api/cheating-logs', {
      examId,
      type,
      confidence,
      description,
    }).catch((err) => {
      console.error('Failed to log violation:', err.message);
    });
  };

  const loadModel = async () => {
    await tf.ready();
    modelRef.current = await cocoSsd.load();
    console.log('Proctoring model loaded');
  };

  const runDetection = async () => {
    const webcam = webcamRef.current;
    if (!webcam?.video) return;

    const video = webcam.video;
    if (video.readyState !== 4) return;
    if (!modelRef.current) return;

    const predictions = await modelRef.current.detect(video);

    // --- Person / face detection via coco-ssd ---
    const persons = predictions.filter(p => p.class === 'person');
    const phoneClasses = ['cell phone', 'remote', 'book'];
    const prohibitedClasses = ['laptop', 'tv'];

    if (persons.length === 0) {
      logViolation('no_face_detected', 85, 'No person detected in webcam frame');
    } else if (persons.length > 1) {
      logViolation('multiple_faces', 90, `${persons.length} persons detected in webcam frame`);
    }

    // --- Object detection ---
    for (const pred of predictions) {
      const label = pred.class.toLowerCase();
      const confidence = Math.round(pred.score * 100);

      if (phoneClasses.includes(label)) {
        logViolation('phone_detected', confidence, `${pred.class} detected with ${confidence}% confidence`);
      } else if (prohibitedClasses.includes(label)) {
        logViolation('unauthorized_device', confidence, `Prohibited device detected: ${pred.class}`);
      }
    }

    // --- DevTools detection ---
    const widthThreshold = window.outerWidth - window.innerWidth > devToolsRef.current.threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > devToolsRef.current.threshold;
    if (widthThreshold || heightThreshold) {
      logViolation('browser_dev_tools', 80, 'Browser DevTools appears to be open');
    }
  };

  useEffect(() => {
    loadModel().then(() => {
      detectionIntervalRef.current = setInterval(runDetection, 3000);
    }).catch((err) => {
      console.error('Failed to load proctoring model:', err);
    });

    const handleVisibilityChange = () => {
      if (document.hidden) logViolation('tab_switch', 85, 'Student switched to another tab');
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) logViolation('fullscreen_exit', 50, 'Student exited fullscreen mode');
    };
    const handleCopy = () => logViolation('copy_paste_attempt', 70, 'Student attempted to copy text');
    const handleCut = () => logViolation('copy_paste_attempt', 70, 'Student attempted to cut text');
    const handleContextMenu = (e) => {
      e.preventDefault();
      logViolation('right_click_attempt', 40, 'Student attempted right-click');
    };
    const handleKeyDown = (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        logViolation('keyboard_shortcut', 80, 'F12 key pressed');
        return;
      }
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'i', 'j'].includes(e.key)) {
        e.preventDefault();
        logViolation('browser_dev_tools', 85, 'DevTools keyboard shortcut used');
        return;
      }
      if (e.ctrlKey && ['u', 'U'].includes(e.key)) {
        e.preventDefault();
        logViolation('keyboard_shortcut', 75, 'Ctrl+U view source attempted');
        return;
      }
      if (e.ctrlKey && ['c', 'v', 'C', 'V'].includes(e.key)) {
        logViolation('copy_paste_attempt', 70, 'Copy/paste keyboard shortcut used');
      }
    };
    const handleBlur = () => logViolation('tab_switch', 75, 'Browser window lost focus');

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);

    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        logViolation('fullscreen_exit', 50, 'Student denied fullscreen request');
      });
    }

    return () => {
      if (detectionIntervalRef.current) clearInterval(detectionIntervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [examId]);

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}>
      <Webcam
        ref={webcamRef}
        audio={false}
        style={{
          width: 160,
          height: 120,
          borderRadius: 8,
          border: '2px solid #4f46e5',
          opacity: 0.85,
        }}
        videoConstraints={{ width: 320, height: 240, facingMode: 'user' }}
      />
      <p style={{
        textAlign: 'center',
        fontSize: 11,
        color: '#4f46e5',
        margin: '4px 0 0',
        fontWeight: 600,
      }}>
        Proctoring Active
      </p>
    </div>
  );
};

export default ProctoringEngine;
