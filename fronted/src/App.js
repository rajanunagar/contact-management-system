import './App.css';
import { Route, Routes } from 'react-router';
import About from './components/About';
import Header from './components/Header';
import Home from './components/Home';
import Login from './components/Login';
import Registration from './components/Registration';
import Logout from './components/Logout';
import Profile from './components/Profile';
import ContactList from './components/ContactList';
import ForgotPassword from './components/ForgotPassword';
import UserList from './components/UserList';
import NoPageFound from './components/NoPageFound';
import { useState, createContext } from 'react';
export const ThemeContext = createContext(null);

function App() {

  const [theme, setTheme] = useState("dark");

  const toggleTheme = () => {
    setTheme((curr) => (curr === "light" ? "dark" : "light"));
  };

  return (
    // <ThemeContext.Provider value={{ theme, toggleTheme }}>
    // <div className="App" id={theme}>
    <div className='App'>
    
      <Routes>
        <Route path='/' element={<Header />}>
          <Route index element={<Home />}></Route>
          <Route path='/profile' element={<Profile />}></Route>
          <Route path='/contact' element={<ContactList />}></Route>
          <Route path='/about' element={<About />}></Route>
          <Route path='/user' element={<UserList />}></Route>
          <Route path='/logout' element={<Logout />}></Route>
        </Route>
        <Route path='/login' element={<Login />}></Route>
        <Route path='/register' element={<Registration />}></Route>
        <Route path='/forgotpassword' element={<ForgotPassword />}></Route>
        <Route path='*' element={<NoPageFound />}></Route>
      </Routes>
</div>
    // </ThemeContext.Provider>ß
  );
}

export default App;
