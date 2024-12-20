import React, { useState } from "react";
import axios from "axios";
import { Lock, User, Loader2 } from "lucide-react";

interface AuthProps {
  onAuthSuccess: (username: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const response = await axios.post(
        `http://localhost:5003${endpoint}`,
        {
          username,
          password,
        },
        {
          withCredentials: true,
        }
      );
      onAuthSuccess(response.data.username);
    } catch (err: any) {
      setError(err.response?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <img src="logo.png" alt="logo" className="mx-auto mb-6 h-16 w-auto" />
          <h1 className="text-2xl font-bold text-gray-900">Login</h1>
          <p className="text-gray-600 mt-2">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter username"
                  required
                  minLength={3}
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="Enter password"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all duration-200 flex items-center justify-center space-x-2 disabled:bg-blue-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Please wait...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="w-full text-sm text-gray-600 hover:text-blue-600 text-center mt-4 transition-colors duration-200"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
