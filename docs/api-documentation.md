# REST API Documentation

Base URL: `http://localhost:5000/api`

---

## 1. System Diagnostic Endpoints

### `GET /api/health`
Returns live system health, Node.js process telemetry, MongoDB connection status, and Computer Networks latency counters.

#### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptimeSeconds": 124,
    "environment": "development",
    "server": {
      "runtime": "Node.js",
      "version": "v24.13.0",
      "platform": "win32",
      "cpuCount": 12,
      "processMemoryUsageMB": { "heapUsed": "22.4" }
    },
    "database": {
      "state": "connected",
      "host": "127.0.0.1",
      "dbName": "validation_engine"
    },
    "network": {
      "totalRequests": 18,
      "averageLatencyMs": 1.42
    }
  }
}
```

---

## 2. Form Validation Endpoint

### `POST /api/validate`
Performs dual-layer validation across all 9 registration form fields using server-side grammars and logs audit history to MongoDB.

#### Request Body
```json
{
  "fullName": "Alan Turing",
  "email": "alan.turing@automata.edu",
  "mobile": "9876543210",
  "username": "turing_1912",
  "password": "Password@123",
  "confirmPassword": "Password@123",
  "pincode": "560001",
  "website": "https://automata.edu",
  "dob": "1995-06-23"
}
```

#### Response (200 OK - Valid)
```json
{
  "success": true,
  "isValid": true,
  "message": "All form inputs strictly satisfied server-side syntactic grammars.",
  "errors": {},
  "metadata": {
    "executionTimeMs": 1.25,
    "timestamp": "2026-11-09T13:30:00.000Z"
  }
}
```

#### Response (422 Unprocessable Entity - Invalid)
```json
{
  "success": true,
  "isValid": false,
  "message": "Form validation failed against server-side regular expressions.",
  "errors": {
    "email": "Email address must follow the syntactic standard: local-part@domain.tld"
  },
  "firstInvalidIndices": {
    "email": 12
  }
}
```

---

## 3. Regular Expression Workbench

### `POST /api/regex/test`
Compiles and tests regular expressions on the backend with catastrophic backtracking (ReDoS) hazard checks.

#### Request Body
```json
{
  "pattern": "^[a-z0-9]+$",
  "flags": "i",
  "testStrings": ["test123", "bad#string"]
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "hasReDoSRisk": false,
  "results": [
    { "input": "test123", "isMatch": true, "executionTimeMs": 0.05 },
    { "input": "bad#string", "isMatch": false, "executionTimeMs": 0.04 }
  ],
  "metadata": { "totalTimeMs": 0.12 }
}
```

---

## 4. Automata Theory Endpoints

### `POST /api/automata/nfa`
Generates Thompson's ε-NFA and formal transition table.
- Body: `{ "pattern": "(a|b)*abb" }`

### `POST /api/automata/dfa`
Executes Subset Construction to produce deterministic automata.
- Body: `{ "pattern": "(a|b)*abb", "includeDeadState": false }`

### `POST /api/automata/minimize`
Executes Hopcroft's DFA Minimization algorithm.
- Body: `{ "pattern": "(a|b)*abb" }`
- Returns: `originalStateCount`, `minimizedStateCount`, `reductionPercentage`, `partitionTrace`, `minimizedDFA`.

### `POST /api/automata/simulate`
Simulates linear \(O(n)\) character transitions and performs differential testing against Node.js RegExp.
- Body: `{ "pattern": "(a|b)*abb", "inputString": "ababb" }`
- Returns: `isAccepted`, `finalState`, `executionTrace`, `differentialTesting`.

---

## 5. Persistence & Analytics Endpoints

### `GET /api/history`
Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 20)
- `fieldId`: Filter by field ID (e.g. `email`)
- `isValid`: `true` or `false`
- `search`: Search text

### `DELETE /api/history/:id`
Deletes an individual audit record.

### `DELETE /api/history`
Purges all audit records from MongoDB.

### `GET /api/analytics`
Returns aggregate statistics, success rate, error categories, and field breakdowns.
