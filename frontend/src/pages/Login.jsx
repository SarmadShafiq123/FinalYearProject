import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoginForm from "../components/auth/LoginForm";
import useAuth from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { getPostLoginRedirect } from "../utils/planAccess";

const Login = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!loading && user) {
      // If we were sent here from /pricing with a redirect param, honour it
      const redirect = searchParams.get("redirect");
      const plan = searchParams.get("plan");
      if (redirect) {
        const dest = plan ? `${redirect}?plan=${plan}` : redirect;
        navigate(dest, { replace: true });
      } else {
        navigate(getPostLoginRedirect(user), { replace: true });
      }
    }
  }, [user, loading, navigate, searchParams]);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Sign in to your CloudStore account
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;
