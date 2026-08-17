import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getPostLoginRedirect } from "../../utils/planAccess";

const GoogleLoginButton = () => {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleSuccess = async (credentialResponse) => {
    setError("");
    try {
      const idToken = credentialResponse.credential;
      const result = await googleLogin(idToken);
      navigate(getPostLoginRedirect(result?.user || {}));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Google sign-in failed. Please try again.",
      );
    }
  };

  const handleError = () => {
    setError("Google sign-in failed. Please try again.");
  };

  return (
    <div>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        theme="filled_black"
        size="large"
      />
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
};

export default GoogleLoginButton;
