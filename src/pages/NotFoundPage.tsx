import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export default function NotFoundPage() {
  return (
    <div className='relative flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-primary/70 px-4'>
      <div className='absolute left-1/2 top-0 w-80 -translate-x-1/2 rounded-b-lg bg-neutral-50 p-2'>
        <h1>Error</h1>
      </div>

      <div className='max-w-2xl text-center text-neutral-50'>
        <h2 className='text-6xl font-bold lg:text-9xl'>404</h2>
        <h3 className='text-3xl font-bold lg:text-6xl'>Página no encontrada</h3>

        <p className='my-6 lg:text-xl'>
          Lo sentimos, la página a la que intentaste acceder no se encuentra
          disponible o simplemente no existe. Prueba volver al inicio para
          iniciar de nuevo.
        </p>

        <Button variant='ghost' className='lg:text-lg' asChild>
          <Link to='/'>Volver al inicio</Link>
        </Button>
      </div>
    </div>
  );
}
