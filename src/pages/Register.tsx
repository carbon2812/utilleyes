import React from 'react';
import { Navigate } from 'react-router-dom';

// Redirect to login page since we're handling both login and signup there
const Register: React.FC = () => {
  return <Navigate to="/login" replace />;
};

export default Register;