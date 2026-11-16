# Formal Languages & Automata Theory (FLAT) Algorithms

This document provides formal mathematical specifications, pseudocode, and complexity analysis for all six automata algorithms implemented in the engine.

---

## 1. Regular Expression Parsing (Shunting-Yard)

### Mathematical Basis
Regular expressions operate on an alphabet \(\Sigma\) using operations:
1. Concatenation: \(L_1 \cdot L_2 = \{xy \mid x \in L_1, y \in L_2\}\)
2. Union: \(L_1 \cup L_2 = \{x \mid x \in L_1 \lor x \in L_2\}\)
3. Kleene Closure: \(L^* = \bigcup_{i=0}^\infty L^i\)

### Precedence Hierarchy
1. Highest (3): Unary operators `*`, `+`, `?`
2. Intermediate (2): Explicit concatenation `.`
3. Lowest (1): Union `|`

### Complexity
- **Time Complexity:** \(O(m)\), where \(m\) is the length of the regular expression.
- **Space Complexity:** \(O(m)\) for the operator stack and output postfix queue.

---

## 2. Thompson's Construction (Regex &rarr; NFA)

### Mathematical Definition
An **Nondeterministic Finite Automaton (NFA)** is a 5-tuple:
\[
M = (Q, \Sigma, \delta, q_0, F)
\]
where:
- \(Q\) is a finite set of states.
- \(\Sigma\) is a finite alphabet of input symbols.
- \(\delta: Q \times (\Sigma \cup \{\varepsilon\}) \to \mathcal{P}(Q)\) is the transition function.
- \(q_0 \in Q\) is the initial state.
- \(F \subseteq Q\) is the set of accepting (final) states.

### Inductive Base Cases
1. **Symbol \(a \in \Sigma\):**
   \[
   q_0 \xrightarrow{a} q_1, \quad Q = \{q_0, q_1\}, \quad F = \{q_1\}
   \]
2. **Concatenation \(A \cdot B\):**
   Connect \(A\)'s accept state to \(B\)'s start state with \(\varepsilon\).
3. **Union \(A \mid B\):**
   Create new start \(s\) and accept \(f\).
   \[
   s \xrightarrow{\varepsilon} A_{start}, \quad s \xrightarrow{\varepsilon} B_{start}, \quad A_{accept} \xrightarrow{\varepsilon} f, \quad B_{accept} \xrightarrow{\varepsilon} f
   \]
4. **Kleene Star \(A^*\):**
   \[
   s \xrightarrow{\varepsilon} A_{start}, \quad s \xrightarrow{\varepsilon} f, \quad A_{accept} \xrightarrow{\varepsilon} A_{start}, \quad A_{accept} \xrightarrow{\varepsilon} f
   \]

### Complexity
- **Time Complexity:** \(O(m)\) linear in regex length.
- **Space Complexity:** At most \(2m\) states and \(4m\) transitions.

---

## 3. Epsilon Closure (&epsilon;-Closure)

### Mathematical Definition
For a state set \(T \subseteq Q\), \(\varepsilon\text{-closure}(T)\) is the smallest set containing \(T\) closed under \(\varepsilon\)-transitions:
\[
\varepsilon\text{-closure}(T) = T \cup \{ q' \in Q \mid \exists q \in \varepsilon\text{-closure}(T) \text{ such that } q' \in \delta(q, \varepsilon) \}
\]

### Algorithm
```
function getEpsilonClosure(T, transitions):
    stack = copy(T)
    closure = set(T)
    while stack is not empty:
        t = stack.pop()
        for each state u in transitions[t][ε]:
            if u not in closure:
                closure.add(u)
                stack.push(u)
    return closure
```

### Complexity
- **Time Complexity:** \(O(|Q| + |E_\varepsilon|)\) via Depth-First Search.
- **Space Complexity:** \(O(|Q|)\).

---

## 4. Subset Construction (NFA &rarr; DFA)

### Mathematical Definition
Converts NFA \(M = (Q_N, \Sigma, \delta_N, q_0, F_N)\) to DFA \(D = (Q_D, \Sigma, \delta_D, d_0, F_D)\):
1. \(d_0 = \varepsilon\text{-closure}(\{q_0\})\).
2. For each \(U \in Q_D\) and \(a \in \Sigma\):
   \[
   \delta_D(U, a) = \varepsilon\text{-closure}\left( \bigcup_{q \in U} \delta_N(q, a) \right)
   \]
3. \(F_D = \{ U \in Q_D \mid U \cap F_N \neq \emptyset \}\).

### Complexity
- **Worst-Case Time Complexity:** \(O(2^{|Q_N|} \cdot |\Sigma|)\).
- **Practical Time Complexity:** Linear to polynomial for typical practical input grammars.
- **Safety Boundary:** Guarded by an upper limit of 250 states to prevent memory exhaustion.

---

## 5. DFA Simulation Engine

### Mathematical Definition
For input string \(w = a_1 a_2 \dots a_n \in \Sigma^*\):
\[
q_i = \delta(q_{i-1}, a_i) \quad \text{for } i = 1, \dots, n
\]
The string is accepted if and only if \(q_n \in F\).

### Complexity
- **Time Complexity:** Strict \(O(n)\) linear time where \(n = |w|\), assuming \(O(1)\) transition table lookup.
- **Space Complexity:** \(O(n)\) to record the execution trace.

---

## 6. Hopcroft's DFA Minimization

### Mathematical Foundation
Two states \(p, q \in Q\) are **equivalent** (\(p \equiv q\)) if for all \(w \in \Sigma^*\):
\[
\hat{\delta}(p, w) \in F \iff \hat{\delta}(q, w) \in F
\]

### Algorithm
1. Remove all unreachable states from \(q_0\).
2. Initialize partition \(P = \{F, Q \setminus F\}\).
3. Initialize worklist \(W = \{F, Q \setminus F\}\).
4. While \(W \neq \emptyset\):
   - Choose and remove set \(A\) from \(W\).
   - For each \(c \in \Sigma\):
     - Let \(X = \{ q \in Q \mid \delta(q, c) \in A \}\).
     - For each \(Y \in P\) where \(Y \cap X \neq \emptyset\) and \(Y \setminus X \neq \emptyset\):
       - Split \(Y\) into \(Y_1 = Y \cap X\) and \(Y_2 = Y \setminus X\).
       - Replace \(Y\) in \(P\) with \(Y_1, Y_2\).
       - Update \(W\) accordingly.

### Complexity
- **Time Complexity:** \(O(k \cdot n \log n)\), where \(n = |Q|\) and \(k = |\Sigma|\).
- **Language Invariance:** Guarantees \(L(M) = L(M_{min})\).
