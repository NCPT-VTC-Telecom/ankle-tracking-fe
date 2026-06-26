import { useContext } from 'react';

// auth provider
import AuthContext from 'shared/contexts/JWTContext';
// import AuthContext from 'shared/contexts/FirebaseContext';
// import AuthContext from 'shared/contexts/AWSCognitoContext';
// import AuthContext from 'shared/contexts/Auth0Context';

// ==============================|| HOOKS - AUTH ||============================== //

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) throw new Error('context must be use inside provider');

  return context;
};

export default useAuth;
