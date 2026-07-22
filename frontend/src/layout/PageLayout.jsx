import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import '../styles/global.css';

function PageLayout({ children }) {
  return (
    <div className='app-shell'>
      <Navbar />
      <main>{children ?? <Outlet />}</main>
      <Footer />
    </div>
  );
}

export default PageLayout;
