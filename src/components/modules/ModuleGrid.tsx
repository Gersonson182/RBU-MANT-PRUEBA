import { MODULES } from '../../constants';
import ModuleItem from './ModuleItem';

export default function ModulesGrid() {
  return (
    <div className='grid w-full grid-cols-1 gap-6 px-6 pt-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'>
      {MODULES.map((module) => (
        <ModuleItem key={module.name} module={module} />
      ))}
    </div>
  );
}
