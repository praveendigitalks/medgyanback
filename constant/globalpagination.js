export const queryOptions = (Model) => async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;


    const filter = {};
    const reservedKeys = ['page', 'limit', 'sortBy', 'sortOrder', 'search'];


    for (const key in req.query) {
      if (!reservedKeys.includes(key)) {
        filter[key] = new RegExp(req.query[key], 'i');
      }
    }


    if (req.query.search && Model.searchableFields) {
      filter.$or = Model.searchableFields.map(field => ({
        [field]: new RegExp(req.query.search, 'i')
      }));
    }


    const total = await Model.countDocuments(filter);
    const data = await Model.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // ✅ Prevents circular structure


    res.paginatedResults = {
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
      data,
    };


    next();
  } catch (error) {
    next(error);
  }
};
