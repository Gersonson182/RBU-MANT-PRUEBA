import { ChevronRight } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover';
import { Link } from 'react-router-dom';

type BreadcrumbsProps = {
  items: {
    title: string;
    url?: string;
    links?: {
      title: string;
      url?: string;
    }[];
  }[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <h1 className='important! flex items-center text-xl text-white max-md:gap-2'>
      {items.map((item, i) => (
        <span key={item.title} className='flex items-center'>
          {item.url ? (
            <a href={item.url} className='text-white hover:underline'>
              {item.title}
            </a>
          ) : (
            <Popover>
              <PopoverTrigger className='hover:underline'>
                {item.title}
              </PopoverTrigger>
              {item.links && item.links.length > 0 && (
                <PopoverContent className='w-full max-w-[160px]'>
                  <ul className='flex flex-col gap-1'>
                    {item.links?.map((link) => (
                      <li
                        key={link.title}
                        className='text-sm font-medium text-neutral-600'
                      >
                        {link.url ? (
                          <Link to={link.url} className='hover:underline'>
                            {link.title}
                          </Link>
                        ) : (
                          <span>{link.title}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </PopoverContent>
              )}
            </Popover>
          )}

          {i < items.length - 1 && <ChevronRight />}
        </span>
      ))}
    </h1>
  );
}
