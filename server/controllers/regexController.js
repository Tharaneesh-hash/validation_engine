/**
 * Regex Playground Controller
 * Provides secure server-side regular expression execution, matching,
 * catastrophic backtracking checks, and execution-time benchmarking.
 */

// Basic ReDoS safety heuristic: detect exponential backtracking hazard patterns
function detectPotentialReDoS(pattern) {
  // Checks for nested quantifiers like (a+)+, (.*)*, ([a-z]+)*
  const nestedQuantifiers = /(\([^)]*[+*]\)[+*])|(\[[^\]]*[+*]\][+*])/;
  return nestedQuantifiers.test(pattern);
}

export const testRegex = (req, res) => {
  const { pattern, flags = '', testStrings = [], testString = '' } = req.body;

  if (pattern === undefined || pattern === null) {
    return res.status(400).json({
      success: false,
      message: 'Regular expression pattern is required.'
    });
  }

  // 1. Length safety restriction
  if (pattern.length > 500) {
    return res.status(400).json({
      success: false,
      message: 'Regular expression pattern exceeds maximum safe limit of 500 characters.'
    });
  }

  // 2. ReDoS Warning / Guard
  const hasReDoSRisk = detectPotentialReDoS(pattern);

  // 3. Syntax Compilation Check
  let regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (compileErr) {
    return res.status(400).json({
      success: false,
      errorCategory: 'SYNTAX_ERROR',
      message: `Invalid Regular Expression syntax: ${compileErr.message}`,
      details: compileErr.message
    });
  }

  // 4. Prepare strings to test (support both single string and array of test cases)
  const inputsToTest = Array.isArray(testStrings) && testStrings.length > 0 
    ? testStrings 
    : [testString];

  // Maximum 20 batch inputs per request to prevent resource exhaustion
  if (inputsToTest.length > 20) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 20 test strings allowed per batch verification.'
    });
  }

  const results = [];
  const startTotal = performance.now();

  for (const input of inputsToTest) {
    const str = String(input);
    if (str.length > 10000) {
      results.push({
        input: str.slice(0, 50) + '... (truncated)',
        isMatch: false,
        error: 'Test string exceeded maximum length limit of 10,000 characters.'
      });
      continue;
    }

    const startSingle = performance.now();
    try {
      // Re-initialize regex for global flag state reset
      const testRegexInstance = new RegExp(pattern, flags);
      const isMatch = testRegexInstance.test(str);

      // Extract detailed matches
      let matches = [];
      if (isMatch) {
        if (flags.includes('g')) {
          const matchAll = str.matchAll(new RegExp(pattern, flags));
          for (const m of matchAll) {
            matches.push({
              match: m[0],
              index: m.index,
              groups: m.groups || (m.slice(1).length > 0 ? m.slice(1) : undefined)
            });
            if (matches.length >= 100) break; // Limit match results
          }
        } else {
          const m = str.match(new RegExp(pattern, flags));
          if (m) {
            matches.push({
              match: m[0],
              index: m.index,
              groups: m.groups || (m.slice(1).length > 0 ? m.slice(1) : undefined)
            });
          }
        }
      }

      const durationSingle = parseFloat((performance.now() - startSingle).toFixed(4));

      results.push({
        input: str,
        isMatch,
        matches,
        executionTimeMs: durationSingle
      });
    } catch (execErr) {
      results.push({
        input: str,
        isMatch: false,
        error: `Execution error: ${execErr.message}`
      });
    }
  }

  const totalTimeMs = parseFloat((performance.now() - startTotal).toFixed(4));

  return res.status(200).json({
    success: true,
    pattern,
    flags,
    hasReDoSRisk,
    results,
    metadata: {
      totalTimeMs,
      testCasesCount: results.length,
      timestamp: new Date().toISOString(),
      engine: 'Node.js V8 RegExp Engine (ECMAScript 2024)'
    }
  });
};
