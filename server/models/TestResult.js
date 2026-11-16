import mongoose from 'mongoose';

/**
 * TestResult Mongoose Schema
 * Stores results of test suite runs, differential testing, and benchmark comparisons.
 */
const TestResultSchema = new mongoose.Schema(
  {
    testSuiteName: {
      type: String,
      required: true
    },
    pattern: {
      type: String,
      required: true
    },
    totalCases: {
      type: Number,
      required: true
    },
    passedCases: {
      type: Number,
      required: true
    },
    failedCases: {
      type: Number,
      default: 0
    },
    differentialParity: {
      type: Boolean,
      default: true
    },
    averageExecutionTimeMs: {
      type: Number,
      required: true
    },
    testedBy: {
      type: String,
      default: 'Automated Suite'
    }
  },
  {
    timestamps: true
  }
);

const TestResult = mongoose.model('TestResult', TestResultSchema);

export default TestResult;
