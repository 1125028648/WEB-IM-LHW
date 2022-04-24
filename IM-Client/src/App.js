import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Test from './pages/Test';
import HomePage from './pages/HomePage';
import Register from './pages/Register';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test />}/>
        <Route path="/homePage" element={<HomePage/>}/>
        <Route path="/register" element={<Register/>}/>
      </Routes>
    </Router>
  )
}

export default App;