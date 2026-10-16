const getMyCareerPreferences = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      preferences: {
        message: "Career preferences are managed through separate sections.",
      },
    },
  });
};

module.exports = {
  getMyCareerPreferences,
};