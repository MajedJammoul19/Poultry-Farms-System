// Mortality alert threshold, as a percentage.
// Kept as a simple constant on purpose - no admin UI/settings table needed.
// If you later want the Admin to configure this from the dashboard, move it
// into a one-document "Settings" collection and read it in the route instead.
module.exports = {
  MORTALITY_THRESHOLD_PERCENT: 5,
};