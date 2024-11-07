
import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import CompanyRegPage from '../pages/registration/CompanyRegPage';
import Contact from '../pages/Contact';
import AboutUs from '../pages/AboutUs';
import Test from '../pages/Test';
import Blog from '../pages/Blog';
import UserRegPage from '../pages/registration/UserRegPage';
import HowItWorks from '../pages/HowItWorks';


const routes = [
  {
    name: "Home",
    path: "/",
    component: Home,
  },
  {
    name: "Register Company",
    path: "/register-company",
    component: CompanyRegPage,
  },
  {
    name: "Register User",
    path: "/register-user",
    component: UserRegPage,
  },
   
  {
    name: "Contact Us",
    path: "/contact-us",
    component: Contact,
  },
  {
    name: "About Us",
    path: "/about-us",
    component: AboutUs,
  },
   
  {
    name: "Test",
    path: "/test",
    component: Test,
  },
  {
    name: "Blog",
    path: "/blog",
    component: Blog,
  },
  {
    name: "How It Works",
    path: "/how-it-works",
    component: HowItWorks,
  },
];

const renderRoutes = (routes, basePath = '') => {
    return routes.map((route, index) => {
        const { group, path, component: Component } = route;
        const fullPath = group ? `${basePath}${group}${path || ''}` : `${basePath}${path || ''}`;

        if (!Component) {
            return null; // Skip rendering if component is missing
        }

        return <Route key={index} path={fullPath} element={<Component />} />;
    });
};

const MainRoutes = () => {
    return <Routes>{renderRoutes(routes)}</Routes>;
};

export { routes, MainRoutes };
