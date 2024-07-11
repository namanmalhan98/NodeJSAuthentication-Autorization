const registerUser = (req, res) => {
    res.json({ message: "Register User" });
  };
  
  const loginUser = (req, res) => {
    res.json({ message: "Login User" });
  };
  
  const getLoggedInUser = (req, res) => {
    res.json({ message: "Logged In User data" });
  };
  
  module.exports = {
    registerUser,
    loginUser,
    getLoggedInUser,
  };