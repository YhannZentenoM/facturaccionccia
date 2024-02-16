import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabase/client";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      //   setUser(session?.user ?? null)
      if (session == null) {
        navigate("/", { replace: true });
      } else {
        setUser(session?.user);
        navigate("/home", { replace: true });
      }
    });
    return () => {
      data.subscription
    };
  }, []);

  async function signInWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error("Credenciales incorrectas");
      return data;
    } catch (error) {
        setError(error.message)
      console.log(error);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error);
  }

  return (
    <AuthContext.Provider value={{ signInWithEmail, signOut, user, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useUserAuth = () => {
  return useContext(AuthContext);
};
