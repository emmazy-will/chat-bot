import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from './firebase';
import { useNavigate, Link } from 'react-router-dom';
import { Globe } from 'lucide-react';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/chat');
    } catch (err) {
      let errorMessage = 'Signup failed. Please try again.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already in use.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        default:
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      setError('');
      await signInWithPopup(auth, provider);
      navigate('/chat');
    } catch (err) {
      setError('Google sign-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #ff6b9e 100%)',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          color: '#333',
          fontSize: '1.8rem',
          fontWeight: '600',
          background: 'linear-gradient(to right, #667eea, #ff6b9e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Sign Up
        </h2>
        
        {error && (
          <div style={{
            color: '#d32f2f',
            backgroundColor: '#ffebee',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1.5rem',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              padding: '0.9rem',
              borderRadius: '6px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontSize: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              padding: '0.9rem',
              borderRadius: '6px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontSize: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            style={{
              padding: '0.9rem',
              borderRadius: '6px',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              fontSize: '1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              transition: 'all 0.3s ease',
              outline: 'none'
            }}
          />
          <button 
            type="submit" 
            disabled={loading}
            style={{
              padding: '0.9rem',
              borderRadius: '6px',
              border: 'none',
              background: 'linear-gradient(to right, #667eea, #764ba2)',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)'
              }
            }}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ 
          margin: '1.75rem 0',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div style={{
            height: '1px',
            background: 'linear-gradient(to right, transparent, rgba(0, 0, 0, 0.1), transparent)',
            marginBottom: '1.5rem'
          }}></div>
          <p style={{
            position: 'absolute',
            top: '-12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            padding: '0 1rem',
            color: '#666',
            fontSize: '0.9rem'
          }}>Or continue with</p>
        </div>

        <button 
          onClick={handleGoogleSignup} 
          disabled={loading} 
          style={{
            width: '100%',
            padding: '0.8rem',
            borderRadius: '6px',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            backgroundColor: '#fff',
            color: '#333',
            fontSize: '1rem',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            marginBottom: '1.5rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
            ':hover': {
              backgroundColor: '#f8f9fa'
            }
          }}
        >
          <Globe size={18} color="#4285F4" />
          Continue with Google
        </button>

        <p style={{ 
          textAlign: 'center', 
          color: '#555',
          fontSize: '0.95rem'
        }}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{ 
              color: '#667eea', 
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              ':hover': {
                color: '#764ba2',
                textDecoration: 'underline'
              }
            }}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;