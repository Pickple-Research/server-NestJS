export const getCurrentTime = () => {
  const GMT0 = new Date();
  GMT0.setHours(GMT0.getHours() + 24);
  return GMT0;
};
