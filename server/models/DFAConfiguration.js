import mongoose from 'mongoose';

const DFAConfigurationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    pattern: {
      type: String,
      required: true
    },
    stateCount: {
      type: Number,
      required: true
    },
    alphabet: [String],
    isMinimized: {
      type: Boolean,
      default: false
    },
    transitions: {
      type: Object,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const DFAConfiguration = mongoose.model('DFAConfiguration', DFAConfigurationSchema);

export default DFAConfiguration;
