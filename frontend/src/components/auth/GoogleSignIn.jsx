import { useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import jwt_decode from 'jwt-decode';
import api from '../../utils/api';

const GoogleSignIn = ({ onLogin }) => {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Decode the credential to get user info
      const decoded = jwt_decode(credentialResponse.credential);
      
      // Send the token to our backend for verification and user creation/login
      const response = await api.post('/auth/google', {
        token: credentialResponse.credential,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture
      });
      
      // Handle successful login
      onLogin(response.data.user, response.data.token);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <div className="mb-4 text-gray-600 text-sm">Or sign in with Google</div>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.log('Google Login Failed')}
        useOneTap
      />
    </div>
  );
};

export default GoogleSignIn;
