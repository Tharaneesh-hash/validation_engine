# System Architecture & Academic Design

## 1. Project Abstract
The **Web Form Input Validation Engine** is an interdisciplinary, enterprise-grade web application integrating three core computer science disciplines:
1. **Formal Languages and Automata Theory (FLAT):** Thompson's Construction, Epsilon Closures, Subset Construction, DFA Simulation (\(O(n)\)), and Hopcroft's Minimization.
2. **Computer Networks:** Client-Server TCP/IP communication, RESTful APIs, HTTP status code semantics, round-trip latency measurement (RTT), and sensitive data protection.
3. **Full-Stack Web Development:** React 18, Vite, Node.js, Express, and MongoDB Atlas (MERN stack).

---

## 2. Subject Mapping Matrix

| Feature | Academic Discipline | Concept Demonstrated |
| :--- | :--- | :--- |
| **Regular Expression Parsing** | FLAT | Lexical analysis, Shunting-Yard infix-to-postfix conversion, operator precedence |
| **Thompson's Construction** | FLAT | Structural induction, &epsilon;-transitions, single start and accepting state invariance |
| **Subset Construction** | FLAT | Powerset reduction, &epsilon;-closure calculation, deterministic state mapping |
| **Hopcroft's Minimization** | FLAT | Equivalence class partitioning, \(O(k \cdot n \log n)\) canonical minimal state generation |
| **DFA Simulation Engine** | FLAT | State transition function \(\delta(q, a) = q'\), linear \(O(n)\) verification trace |
| **HTTP Request/Response Metrics** | Computer Networks | Application layer protocol, packet RTT, status code semantics (200, 400, 422, 500) |
| **Network Telemetry & Logging** | Computer Networks | Observability without plaintext credential logging, latency benchmarking |
| **Dual-Layer Validation** | Full-Stack Web Dev | Defense-in-depth: client-side instant feedback + server-side authoritative enforcement |
| **Database Persistence** | Full-Stack Web Dev | MongoDB Atlas schema design, compound indexing, query pagination |

---

## 3. High-Level System Architecture

```
+-------------------------------------------------------------------------+
|                         CLIENT TIER (React 18 + Vite)                   |
|  - Real-Time 9-Field Form   - Interactive SVG Visualizer (Head / Tape)  |
|  - Regex Playground         - Performance Analytics & Network Charts    |
|  - Axios Interceptors for RTT measurement                               |
+------------------------------------+------------------------------------+
                                     |  HTTP/1.1 REST (JSON over TCP/IP)
                                     v
+-------------------------------------------------------------------------+
|                       SERVER TIER (Node.js + Express)                   |
|  - CORS & JSON Body Parser Middlewares                                  |
|  - Network Monitoring Middleware (Tracks Latency, Status Codes)          |
|  - Centralized Error Handler                                            |
|                                                                         |
|  +-------------------------------------------------------------------+  |
|  |                       FLAT AUTOMATA ENGINE                        |  |
|  |  [Regex Parser] -> [Thompson NFA] -> [Subset DFA] -> [Minimizer]  |  |
|  |                        |                                          |  |
|  |                        v                                          |  |
|  |             [O(n) Linear DFA Simulator]                           |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |  Mongoose ODM (BSON over TCP/TLS)
                                     v
+-------------------------------------------------------------------------+
|                      DATABASE TIER (MongoDB Atlas)                      |
|  - ValidationHistory (Indexed by timestamp and fieldId)                 |
|  - ValidationRules   - DFAConfigurations                                |
+-------------------------------------------------------------------------+
```

---

## 4. Data Flow Diagram (DFD - Level 1)

```
[User Input String w]
        |
        v
[Client Lexer / Character Scanner] ---> (Immediate Syntax Error & Char Index)
        |
        v (HTTP POST /api/validate)
[Express Server Router]
        |
        +---> [Network Tracker] (Records timestamp & latency)
        |
        +---> [FLAT Validation Pipeline]
        |        |
        |        v
        |     [DFA Transition Evaluation: δ(q, a) = q']
        |        |
        |        +---> [Accepted / Rejected Result]
        |
        +---> [MongoDB Persistence Layer] (Logs fieldId, time, errorCategory)
        |
        v (HTTP 200 / 422 Response)
[Client UI Dashboard / Visualizer]
```

---

## 5. Entity-Relationship (ER) Diagram

```
+------------------------------------+       +------------------------------------+
|          ValidationRules           |       |         ValidationHistory          |
+------------------------------------+       +------------------------------------+
| _id (ObjectId, PK)                 |       | _id (ObjectId, PK)                 |
| fieldId (String, Unique)           |<------| fieldId (String, FK)               |
| label (String)                     |       | ruleName (String)                  |
| pattern (String)                   |       | isValid (Boolean)                  |
| required (Boolean)                 |       | algorithm (String)                 |
| minLength (Number)                 |       | executionTimeMs (Number)           |
| maxLength (Number)                 |       | errorCategory (Enum)               |
| createdAt (Date)                   |       | clientIp (String)                  |
| updatedAt (Date)                   |       | createdAt (Date, Indexed)          |
+------------------------------------+       +------------------------------------+
```

---

## 6. Security & Privacy Architecture
1. **Password Protection:** Plaintext passwords and confirmation passwords are never transmitted in history logs or stored in database audit collections. Only validation boolean results, length, and error categories are persisted.
2. **ReDoS Defense:** Regular expression input patterns are checked against nested quantifiers (e.g. `(a+)+`) and character lengths are capped at 500 characters to prevent algorithmic complexity attacks.
3. **Defense-in-Depth:** Client-side instant feedback is fully repeated on the Express server to prevent bypassed requests from unauthorized clients or curl scripts.
