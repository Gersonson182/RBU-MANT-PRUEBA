import FadeInContainer from '../components/ui/FadeInContainer';
import ModulesGrid from '../components/modules/ModuleGrid';

export default function HomePage() {
  return (
    <FadeInContainer className='py-20'>
      <ModulesGrid />
    </FadeInContainer>
  );
}
