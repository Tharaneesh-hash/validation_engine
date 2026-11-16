import ValidationHistory from '../models/ValidationHistory.js';
import mongoose from 'mongoose';

// Fallback in-memory store if MongoDB is not connected
export const inMemoryHistory = [];

export const getHistory = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      fieldId, 
      isValid, 
      search, 
      startDate, 
      endDate 
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = Math.min(parseInt(limit, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    // Build filter query
    const filter = {};
    if (fieldId && fieldId !== 'all') {
      filter.fieldId = fieldId;
    }
    if (isValid !== undefined && isValid !== 'all') {
      filter.isValid = isValid === 'true';
    }
    if (search) {
      filter.$or = [
        { ruleName: { $regex: search, $options: 'i' } },
        { errorMessage: { $regex: search, $options: 'i' } }
      ];
    }
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (mongoose.connection.readyState === 1) {
      const total = await ValidationHistory.countDocuments(filter);
      const items = await ValidationHistory.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      return res.status(200).json({
        success: true,
        data: items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1
        }
      });
    } else {
      // In-memory fallback
      let filtered = inMemoryHistory.filter(item => {
        if (fieldId && fieldId !== 'all' && item.fieldId !== fieldId) return false;
        if (isValid !== undefined && isValid !== 'all' && item.isValid !== (isValid === 'true')) return false;
        return true;
      });

      const total = filtered.length;
      const items = filtered.slice(skip, skip + limitNum);

      return res.status(200).json({
        success: true,
        data: items,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1
        }
      });
    }
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to retrieve validation history: ${err.message}`
    });
  }
};

export const deleteHistoryItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await ValidationHistory.findByIdAndDelete(id);
    } else {
      const idx = inMemoryHistory.findIndex(h => h._id === id);
      if (idx !== -1) inMemoryHistory.splice(idx, 1);
    }

    return res.status(200).json({
      success: true,
      message: `Validation record ${id} successfully removed.`
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to delete record: ${err.message}`
    });
  }
};

export const clearAllHistory = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await ValidationHistory.deleteMany({});
    } else {
      inMemoryHistory.length = 0;
    }

    return res.status(200).json({
      success: true,
      message: 'All validation audit history records purged.'
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Failed to clear history: ${err.message}`
    });
  }
};
