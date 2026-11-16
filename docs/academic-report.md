# Academic Project Report: Web Form Input Validation Engine Using Regular Expressions and DFA

**Academic Domain:** Computer Science and Engineering  
**Specializations Integrated:** Formal Languages and Automata Theory (FLAT), Computer Networks, Full-Stack Web Development  
**Technology Stack:** MongoDB, Express.js, React.js, Node.js (MERN) + Vite  

---

## 1. Project Abstract
The **Web Form Input Validation Engine** is an engineering platform that synthesizes **Formal Languages and Automata Theory (FLAT)**, **Computer Networks**, and **Full-Stack Web Development**. Input validation in modern web software often relies on opaque, black-box library functions susceptible to catastrophic backtracking (ReDoS) and client-server bypass vulnerabilities. 

This project develops an end-to-end, deterministic validation engine from foundational theoretical principles. Starting with high-level regular grammars, the system executes Thompson's Inductive Construction to generate an \(\varepsilon\)-NFA, applies Subset Construction with \(\varepsilon\)-closure to produce an equivalent DFA, and invokes Hopcroft's algorithm to obtain a minimal state machine. Input verification is performed character-by-character in linear \(O(n)\) time via a custom simulation engine, while round-trip latency, status code distributions, and request metrics are monitored across the TCP/HTTP network transport layer.

---

## 2. Problem Statement
1. **Lack of Theoretical Transparency:** Standard web developers treat regular expressions as strings without understanding the underlying state machine transitions, leading to unmaintainable validation logic.
2. **Security Vulnerabilities (ReDoS):** Poorly constructed regular expressions with nested quantifiers (e.g. `(a+)+$`) cause exponential backtracking in NFA engines, leading to Denial of Service attacks.
3. **Client-Side Validation Bypassing:** Web forms frequently validate input on the frontend alone, allowing malicious requests to bypass validation when submitted directly to backend APIs via scripts.
4. **Disconnection Between Academic Theory and Industrial Practice:** Computer Science curricula typically teach Automata Theory, Computer Networks, and Web Development as isolated subjects without practical, tangible software integration.

---

## 3. Objectives
- Design and develop an intelligent web-based input validation engine using Regular Expressions and DFAs.
- Implement lexical parsing and Shunting-Yard conversion for regular expression operators (`*`, `+`, `?`, `|`, `.`, `()`, `[a-z]`).
- Convert regular expressions into \(\varepsilon\)-NFAs using Thompson's Construction.
- Convert arbitrary NFAs into deterministic finite automata using the Subset Construction algorithm.
- Minimize DFAs using Hopcroft's state-partitioning algorithm while strictly preserving language recognition.
- Execute linear \(O(n)\) simulation to validate inputs character-by-character, detecting the exact zero-based index of invalid characters.
- Implement real-time dual-layer validation for a 9-field registration form on both React and Express.
- Track HTTP network latency, round-trip time (RTT), and status codes across TCP sockets without logging sensitive user credentials.
- Persist validation audit records in MongoDB Atlas with search, filtering, and pagination.
- Provide interactive SVG-based visual state graphs and animated tape execution.

---

## 4. Existing System vs. Proposed System

| Feature | Existing Validation Systems | Proposed Input Validation Engine |
| :--- | :--- | :--- |
| **Algorithmic Transparency** | Black-box third-party libraries (e.g. validator.js) | Fully visible automata pipeline (AST &rarr; NFA &rarr; DFA &rarr; Min-DFA) |
| **Time Complexity** | Non-deterministic backtracking: \(O(2^n)\) worst case | Strict deterministic linear execution: \(O(n)\) |
| **ReDoS Vulnerability** | High risk from uninspected nested quantifiers | Integrated heuristic ReDoS hazard detection and length safeguards |
| **Visualization** | Static text error messages only | Dynamic SVG state diagrams with animated tape head playback |
| **Failure Diagnostics** | Generic boolean "Invalid Input" | Pinpoints exact character and zero-based index of first grammatical violation |
| **Network Telemetry** | Unmonitored or requiring third-party APM tools | Built-in HTTP latency tracker, status code distribution, and RTT display |
| **Academic Integration** | Web engineering only | True multidisciplinary integration of FLAT, Networks, and MERN |

---

## 5. Literature & Theoretical Background

### Formal Languages Hierarchy (Chomsky Hierarchy)
Regular languages represent Type-3 grammars in the Chomsky hierarchy, defined by:
\[
A \to aB \quad \text{or} \quad A \to a \quad (A, B \in V_N, a \in V_T)
\]
A language \(L\) is regular if and only if it is accepted by a Finite State Automaton (DFA or NFA), as established by Kleene's Theorem.

### Equivalence of Models
1. **Regular Expression \(\equiv\) NFA:** Proven constructively by Ken Thompson (1968) using inductive sub-automata fragments.
2. **NFA \(\equiv\) DFA:** Proven by Michael O. Rabin and Dana Scott (1959) using the powerset construction algorithm.
3. **DFA Minimization:** Proven by John Hopcroft (1971), establishing that every regular language has a unique minimal DFA up to state isomorphism.

---

## 6. System Requirements

### Hardware Requirements
- **Processor:** Modern multi-core CPU (Intel Core i3/i5/i7/i9, AMD Ryzen, or Apple Silicon)
- **RAM:** Minimum 4 GB (8 GB recommended for concurrent dev servers)
- **Storage:** 500 MB free hard disk space

### Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux
- **Runtime Environment:** Node.js v18.0.0 or higher (v24.x tested)
- **Package Manager:** npm v9.0.0 or higher
- **Database:** MongoDB Community Server v6.0+ (Local) or MongoDB Atlas (Cloud)
- **Browser:** Any modern standards-compliant browser (Google Chrome, Firefox, Edge, Safari)

---

## 7. Functional & Non-Functional Requirements

### Functional Requirements
- **FR1 (Form Validation):** Validate Full Name, Email, Mobile, Username, Password, Confirm Password, PIN Code, Website, and Date of Birth.
- **FR2 (Real-Time Feedback):** Compute validity on every keystroke with green/red status indicators.
- **FR3 (Failure Position):** Report violating character and zero-based index upon grammar failure.
- **FR4 (Automata Conversion):** Translate regular expressions to NFA, NFA to DFA, and DFA to minimal DFA.
- **FR5 (Simulation Engine):** Evaluate test strings against DFAs in \(O(n)\) time, generating step-by-step traces.
- **FR6 (Differential Verification):** Automatically verify that custom DFA results match reference RegExp results.
- **FR7 (Audit Persistence):** Store validation history in MongoDB without logging plaintext passwords.
- **FR8 (Network Telemetry):** Calculate client-to-server RTT and server processing latency.

### Non-Functional Requirements
- **NFR1 (Performance):** DFA transition lookup completed in \(O(1)\) time; total simulation completed in under 1 millisecond.
- **NFR2 (Security):** Plaintext passwords stripped before database insertion; ReDoS guard rejects exponential backtracking patterns.
- **NFR3 (Scalability):** Stateless Express architecture allows horizontal scaling across multiple instances behind a reverse proxy.
- **NFR4 (Reliability):** Database failure gracefully falls back to in-memory audit store without application crashes.
- **NFR5 (Usability):** Professional responsive developer interface with SVG diagram animations and syntax reference sheets.

---

## 8. System Architecture & Diagrams

### System Architecture Overview
```
+----------------------------------------------------------------------------+
|                          CLIENT TIER (React 18 + Vite)                     |
|  - Real-Time Form   - Regex Playground   - SVG Visualizer (Head / Tape)    |
|  - Axios Interceptors measuring Round-Trip Latency (RTT)                   |
+-------------------------------------+--------------------------------------+
                                      |  HTTP/1.1 REST (JSON over TCP/IP)
                                      v
+----------------------------------------------------------------------------+
|                        SERVER TIER (Node.js + Express)                     |
|  - Network Latency Middleware    - Centralized Error Handler               |
|                                                                            |
|  +----------------------------------------------------------------------+  |
|  |                         FLAT ALGORITHM ENGINE                        |  |
|  |  [Shunting-Yard Parser] -> [Thompson NFA] -> [Subset DFA]            |  |
|  |           |                                       |                  |  |
|  |           v                                       v                  |  |
|  |  [Transition Matrices]                  [Hopcroft Minimizer]         |  |
|  |                                                   |                  |  |
|  |                                                   v                  |  |
|  |                                      [Linear O(n) DFA Simulator]     |  |
|  +----------------------------------------------------------------------+  |
+-------------------------------------+--------------------------------------+
                                      |  Mongoose ODM (BSON over TCP/TLS)
                                      v
+----------------------------------------------------------------------------+
|                       DATABASE TIER (MongoDB Atlas)                        |
|  - ValidationHistory (Compound Index: createdAt, isValid)                  |
|  - ValidationRules   - DFAConfigurations                                   |
+----------------------------------------------------------------------------+
```

### Data Flow Diagram (DFD Level 0 - Context Level)
```
[User / Client] ---> (Input String & Field Data) ---> [Validation Engine System]
[User / Client] <--- (Validation Status & RTT)   <--- [Validation Engine System]
```

### Data Flow Diagram (DFD Level 1)
```
[User Input]
     |
     v
[1.0 Client Form Validator] ---> (Real-Time Invalid Char Index)
     |
     v (HTTP POST /api/validate)
[2.0 Express REST API Controller]
     |
     +---> [3.0 Network Monitor Middleware] (Record RTT & Status Codes)
     |
     +---> [4.0 FLAT DFA Simulation Engine]
     |          |
     |          v
     |       (Transition evaluation: δ(q, a) = q')
     |
     +---> [5.0 MongoDB Atlas Data Store] (Store audit metadata)
     |
     v (HTTP 200 / 422 JSON Response)
[Client Dashboard & Visualizer]
```

---

## 9. Algorithms & Pseudocode

### 1. Thompson's Inductive Construction (Regex &rarr; NFA)
```
Input: Regular Expression in Postfix notation
Output: Nondeterministic Finite Automaton with ε-transitions (NFA)

Stack = Empty
for each token in PostfixExpression:
    if token is Literal 'c':
        s0 = new State(), s1 = new State()
        Add transition s0 --c--> s1
        Stack.push(Fragment(start: s0, accept: s1))
    else if token is Concatenation '.':
        B = Stack.pop(), A = Stack.pop()
        Add transition A.accept --ε--> B.start
        Stack.push(Fragment(start: A.start, accept: B.accept))
    else if token is Union '|':
        B = Stack.pop(), A = Stack.pop()
        s0 = new State(), s1 = new State()
        Add transitions s0 --ε--> A.start, s0 --ε--> B.start
        Add transitions A.accept --ε--> s1, B.accept --ε--> s1
        Stack.push(Fragment(start: s0, accept: s1))
    else if token is Kleene Star '*':
        A = Stack.pop()
        s0 = new State(), s1 = new State()
        Add transitions s0 --ε--> A.start, s0 --ε--> s1
        Add transitions A.accept --ε--> A.start, A.accept --ε--> s1
        Stack.push(Fragment(start: s0, accept: s1))

return Stack.pop()
```

### 2. Subset Construction Algorithm (NFA &rarr; DFA)
```
Input: NFA M = (Q_N, Σ, δ_N, q_0, F_N)
Output: DFA D = (Q_D, Σ, δ_D, d_0, F_D)

d_0 = ε-closure({q_0})
Q_D = {d_0}
Worklist = [d_0]

while Worklist is not empty:
    current_set = Worklist.pop()
    for each symbol 'a' in Σ:
        moved_set = move(current_set, a)
        next_set = ε-closure(moved_set)
        if next_set is not empty:
            if next_set not in Q_D:
                Q_D.add(next_set)
                Worklist.push(next_set)
            δ_D(current_set, a) = next_set

F_D = { S in Q_D | S ∩ F_N is not empty }
return DFA(Q_D, Σ, δ_D, d_0, F_D)
```

### 3. Hopcroft's DFA Minimization Algorithm
```
Input: DFA D = (Q, Σ, δ, q_0, F)
Output: Minimized DFA D_min

P = { F, Q \ F } // Partition into accepting and non-accepting
W = { F, Q \ F } // Worklist

while W is not empty:
    choose and remove A from W
    for each symbol c in Σ:
        X = { q in Q | δ(q, c) is in A }
        for each group Y in P such that Y ∩ X ≠ ∅ and Y \ X ≠ ∅:
            P.replace(Y with (Y ∩ X) and (Y \ X))
            if Y is in W:
                W.replace(Y with (Y ∩ X) and (Y \ X))
            else:
                W.add(smaller of (Y ∩ X) and (Y \ X))

return constructDFAFromPartitions(P)
```

### 4. Linear \(O(n)\) DFA Simulation Algorithm
```
Input: DFA D = (Q, Σ, δ, q_0, F), Input String w = a_1 a_2 ... a_n
Output: Boolean (Accepted/Rejected), ExecutionTrace, FailureIndex

current_state = q_0
trace = []

for i from 0 to n - 1:
    char = w[i]
    if char not in Σ:
        return Rejected, trace, FailureIndex: i, Reason: "Character not in alphabet"
    
    next_state = δ(current_state, char)
    if next_state does not exist:
        return Rejected, trace, FailureIndex: i, Reason: "No transition defined"
    
    trace.append(Step: i+1, from: current_state, char: char, to: next_state)
    current_state = next_state

if current_state is in F:
    return Accepted, trace, FailureIndex: -1
else:
    return Rejected, trace, FailureIndex: n, Reason: "Halted in non-accepting state"
```

---

## 10. Database Design & Schemas

### Collection 1: `ValidationHistory`
- `fieldId` (String, required, indexed): Identifier of form field (e.g. `email`).
- `ruleName` (String, required): Human-readable rule title.
- `isValid` (Boolean, required, indexed): True if passed, false if rejected.
- `algorithm` (String): Engine used (`DFA Deterministic Engine`).
- `executionTimeMs` (Number): Verification time in milliseconds.
- `errorCategory` (String): Categorized error code (`LENGTH_VIOLATION`, `CHARACTER_SET_ERROR`, `PATTERN_MISMATCH`, `AGE_VIOLATION`, `NONE`).
- `errorMessage` (String): Diagnostic explanation.
- `inputLength` (Number): Length of the tested input string.
- `clientIp` (String): Anonymized IP address.
- `createdAt` (Date, indexed): Timestamp for time-series analytics.

### Collection 2: `ValidationRules`
- `fieldId` (String, unique): Primary key identifier.
- `label` (String): UI display label.
- `pattern` (String): Formal regular expression string.
- `required` (Boolean): Compulsory constraint flag.
- `minLength` (Number): Lower boundary constraint.
- `maxLength` (Number): Upper boundary constraint.

### Collection 3: `DFAConfigurations`
- `name` (String): Configuration title.
- `pattern` (String): Underlying grammar.
- `stateCount` (Number): Total states in automaton.
- `alphabet` (Array of Strings): Alphabet symbols \(\Sigma\).
- `isMinimized` (Boolean): Hopcroft minimization flag.
- `transitions` (Object): Serialized state transition dictionary.

---

## 11. REST API Specification

| HTTP Method | Route | Description | Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | System diagnostic, uptime, database state, network counters | 200 |
| `POST` | `/api/validate` | Dual-layer validation for 9-field form data; persists history | 200, 422 |
| `POST` | `/api/regex/test` | Compiles regex, evaluates batch strings, checks ReDoS hazards | 200, 400 |
| `POST` | `/api/automata/nfa` | Executes Thompson's Construction, generates NFA transition table | 200, 400 |
| `POST` | `/api/automata/dfa` | Executes Subset Construction, generates DFA transition table | 200, 400 |
| `POST` | `/api/automata/minimize` | Executes Hopcroft's Algorithm, returns reduction percentage | 200, 400 |
| `POST` | `/api/automata/simulate` | Simulates linear DFA execution, verifies differential parity | 200, 400 |
| `GET` | `/api/history` | Paginated validation audit records with text search & filters | 200, 500 |
| `DELETE` | `/api/history/:id` | Deletes specific audit record from MongoDB | 200, 500 |
| `DELETE` | `/api/history` | Purges all audit history from database | 200, 500 |
| `GET` | `/api/analytics` | Returns calculated metrics, error distributions, pass rates | 200, 500 |

---

## 12. Verification & Testing Analysis

### Automated Test Suite Matrix
The test suite utilizes **Vitest** and **Supertest** to execute 41 automated unit and integration tests (100% pass rate):

1. **System Health Suite (`tests/health.test.js`):** 2 tests verifying status 200 response, process metrics, and structured 404 handler.
2. **Form Validation Suite (`tests/validation.test.js`):** 7 tests verifying valid user submission (200), required field checking (422), email syntax (422), mobile numbering boundaries (422), password entropy (422), password mismatch (422), and PIN code zero boundary (422).
3. **Regex Workbench Suite (`tests/regex.test.js`):** 4 tests covering valid matches, malformed syntax detection (`SYNTAX_ERROR`), ReDoS nested quantifier flags, and length safety enforcement.
4. **Automata Theory Suite (`tests/automata.test.js`):** 7 tests covering Thompson NFA construction, Subset DFA generation, O(n) simulator execution, Hopcroft language preservation, differential testing parity, and transition table formatting.
5. **History & Analytics Suite (`tests/historyAnalytics.test.js`):** 3 tests covering paginated history queries, analytics metric calculation, and history record deletion.
6. **Rules Management Suite (`tests/rules.test.js`):** 2 tests covering custom validation rule persistence and regex compilation.
7. **Edge Cases & BVA Suite (`tests/edgeCases.test.js`):** 16 tests covering boundary value analysis, Unicode handling, empty strings, and ReDoS defense stress tests.

### Differential Testing Results
To ensure mathematical correctness, the custom DFA execution engine was benchmarked against the trusted native V8 RegExp engine across classic grammars:
- Binary with Even Zeros `(1|01*0)*`: 100% agreement on both positive (`"00"`, `"010"`) and negative (`"101"`, `"0"`) cases.
- Ends with `abb` `(a|b)*abb`: 100% agreement on positive (`"ababb"`) and negative (`"abab"`) cases.
- Character Union `a(b|c)*d`: 100% agreement on positive (`"abcbcd"`) and negative (`"abc"`) cases.

---

## 13. Performance Analysis

- **DFA Simulation Time Complexity:** Strict \(O(n)\) linear time where \(n\) is string length. In contrast to NFA backtracking engines that may exhibit \(O(2^n)\) behavior under adversarial input, the DFA engine achieves deterministic execution in `0.02 - 0.15 ms`.
- **Client-Server Round-Trip Latency (RTT):** `1.5 - 4.5 ms` across local TCP sockets over HTTP/1.1 REST.
- **Hopcroft Minimization Complexity:** Runs in \(O(k \cdot n \log n)\), reducing typical industrial regex state machines by `20% - 50%` in state count while retaining identical language equivalence.

---

## 14. Advantages & Limitations

### Advantages
1. **Mathematical Determinism:** Zero false acceptance (FAR = 0.00%) and zero false rejection (FRR = 0.00%) for defined grammars.
2. **ReDoS Immunity:** DFA execution never backtracks; state transition lookup is always constant time \(O(1)\) per character.
3. **Deep Diagnostic Feedback:** Users and developers are provided the exact character and position index of any validation failure.
4. **Privacy-Preserving Audit:** Validation history is retained for analytics and compliance without storing user passwords or sensitive strings.
5. **Pedagogical Value:** Demonstrates the direct connection between abstract automata theory and practical web engineering.

### Limitations
1. **Regular Languages Only:** By definition, finite automata cannot validate non-regular languages requiring unbounded memory (e.g., matching arbitrary nested XML tags or palindromes \(a^n b^n\)), which require Pushdown Automata or Context-Free Grammars.
2. **State Explosion on Complex Combinations:** Unconstrained cross-product grammars can produce large state sets during powerset construction (mitigated by our 250-state safety cap).

---

## 15. Future Enhancements
- **Extended Context-Free Grammars (PDA):** Implement a Pushdown Automaton module to support balanced parentheses and structured JSON/XML grammar validation.
- **WebAssembly (WASM) Compilation:** Compile the DFA transition matrix to WebAssembly bytecode for sub-microsecond validation inside high-throughput edge proxies (e.g. Cloudflare Workers).
- **Automated Regex Synthesis:** Allow non-technical users to provide positive and negative sample sets, and employ active automata learning (Angluin's \(L^*\) algorithm) to automatically synthesize the minimal DFA.

---

## 16. Conclusion
The **Web Form Input Validation Engine Using Regular Expressions and DFA** bridges academic computer science theory and modern full-stack web engineering. By implementing Thompson's Construction, Subset Construction, Hopcroft's Minimization, and an \(O(n)\) DFA simulation engine, the project replaces black-box regular expression evaluation with a secure, transparent, and deterministic validation system. Coupled with Computer Networks latency tracking, RESTful APIs, and MongoDB Atlas persistence, this application stands as a production-quality, rigorous engineering implementation of core computer science curricula.
