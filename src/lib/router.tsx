import { createBrowserRouter } from 'react-router-dom';
import Layout from '@/layout/Layout';
import HomePage from '../pages/HomePage';
import NotFoundPage from '../pages/NotFoundPage';

// OT
import OrdenTrabajoIndex from '../pages/OT/OrdeTrabajoIndex';
import OrdenTrabajoPage from '../pages/OT/OrdenTrabajoPage';
// import ControlCalidadPage from '../pages/OT/ControlCalidadPage';

const router = createBrowserRouter([
  { path: '*', element: <NotFoundPage /> },
  {
    path: '/',
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },

  // módulo raíz OT
  {
    path: '/OTMenu',
    element: (
      <Layout>
        <OrdenTrabajoIndex />
      </Layout>
    ),
  },

  // submódulos DE OT
  {
    path: '/OrdenDeTrabajo',
    element: (
      <Layout>
        <OrdenTrabajoPage />
      </Layout>
    ),
  },
  // { path: '/control-calidad', element: <Layout><ControlCalidadPage /></Layout> },
]);

export { router };
