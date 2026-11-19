import express from 'express';
import {
  inspectRequestHeaders,
  inspectResponseHeaders,
  validateHeaderFormat,
  validateCookie,
  createSession,
  activateSession,
  expireSession,
  revokeSession,
  getSessionById,
  getAllSessions,
  getDfaGraph,
  getDashboardStats,
  getSecurityWarnings
} from '../controllers/httpInspectionController.js';

const router = express.Router();

// HTTP Header & Cookie Inspection routes
router.post('/http/inspect-request', inspectRequestHeaders);
router.post('/http/inspect/request', inspectRequestHeaders);
router.post('/http/inspect-response', inspectResponseHeaders);
router.post('/http/inspect/response', inspectResponseHeaders);
router.post('/http/validate-header', validateHeaderFormat);
router.post('/http/validate/header', validateHeaderFormat);
router.post('/http/validate-cookie', validateCookie);
router.post('/http/validate/cookie', validateCookie);
router.get('/http/dashboard-stats', getDashboardStats);
router.get('/http/dashboard/stats', getDashboardStats);
router.get('/http/security-warnings', getSecurityWarnings);
router.get('/http/warnings', getSecurityWarnings);

// DFA Session Cookie State Machine routes
router.post('/sessions/create', createSession);
router.post('/sessions/activate', activateSession);
router.post('/sessions/expire', expireSession);
router.post('/sessions/revoke', revokeSession);
router.get('/sessions/dfa-graph', getDfaGraph);
router.get('/sessions', getAllSessions);
router.get('/sessions/:id', getSessionById);

export default router;
