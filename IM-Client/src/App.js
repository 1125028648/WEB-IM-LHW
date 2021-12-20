import './App.css';
import { BrowserRouter as Router, Route, Routes  } from 'react-router-dom';
import Login from './pages/Login';
import Welcome from './pages/Welcome';
import Test from './pages/Test';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/test" element={<Test/>}/>
      </Routes>
    </Router>
  )
}

export default App;
