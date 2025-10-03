import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table';

import { toast } from 'sonner';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { useOTMenu } from '@/hooks/OT/OTMenu/useOTMenu';
import type { OrdenDeTrabajo } from '@/types/OT/OTMenu';

// UI ShadCN
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { DataTablePagination } from '../../DataTablePagination';
import { cn } from '@/lib/utils';
import OTDeleteDialog from './OrdenesDeTrabajoDelete';
import {
  Trash2,
  Settings,
  User,
  Package,
  FileText,
  MoreVertical,
} from 'lucide-react';

import { VirtualizedSearchSelect } from '@/components/ui/VirtualizedSelect';

// Icons
import { ArrowUpDown, CalendarIcon, Search, Dock } from 'lucide-react';

import { estadoColors } from './helpers/statusColors';

import { useFiltroStore } from '@/store/OT/useFilterStore';

dayjs.extend(utc);

export default function OTMenuTable() {
  const { filtros: filtrosCache, setFiltros: setFiltrosCache } =
    useFiltroStore();

  const { getOrdenes, getAllFiltros } = useOTMenu();

  // Estados tabla
  const [sorting] = useState<SortingState>([]);
  const [columnFilters] = useState<ColumnFiltersState>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fechas
  const [fechaIngreso, setFechaIngreso] = useState<Date>();
  const [fechaSalida, setFechaSalida] = useState<Date>();

  // Filtros dinámicos

  const [selectedTaller, setSelectedTaller] = useState<number | undefined>();
  const [selectedEstado, setSelectedEstado] = useState<number | undefined>();
  const [selectedTipo, setSelectedTipo] = useState<number | undefined>();
  const [selectedBus, setSelectedBus] = useState<number | undefined>();
  const [selectedManager, setSelectedManager] = useState<number | undefined>();

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [pageIndex, setPageIndex] = useState(0);
  const [busOpen, setBusOpen] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);

  const [tempSearchOT, setTempSearchOT] = useState('');
  const [searchOT, setSearchOT] = useState('');

  // Query tabla
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'ordenes-trabajo',
      pageIndex,
      selectedTaller,
      selectedEstado,
      selectedTipo,
      selectedBus,
      selectedManager,
      fechaIngreso ? dayjs(fechaIngreso).utc().format('YYYY-MM-DD') : null,
      fechaSalida ? dayjs(fechaSalida).utc().format('YYYY-MM-DD') : null,
    ],
    queryFn: () =>
      getOrdenes({
        nroOT: searchOT ? Number(searchOT) : undefined,
        codTaller: selectedTaller,
        estadoOT: selectedEstado,
        tipoOT: selectedTipo,
        nroBus: selectedBus,
        nroManager: selectedManager,
        fechaIngreso: fechaIngreso
          ? dayjs(fechaIngreso).utc().format('YYYY-MM-DD')
          : undefined,
        fechaSalida: fechaSalida
          ? dayjs(fechaSalida).utc().format('YYYY-MM-DD')
          : undefined,

        pagina: pageIndex,
      }),
  });

  // Traer filtros al cargar
  useEffect(() => {
    let mounted = true;

    (async () => {
      if (filtrosCache.talleres.length === 0) {
        const all = await getAllFiltros();
        if (mounted && all) {
          setFiltrosCache(all);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [filtrosCache, getAllFiltros, setFiltrosCache]);

  useEffect(() => {
    const timer = setTimeout(() => setSearchOT(tempSearchOT), 350);
    return () => clearTimeout(timer);
  }, [tempSearchOT]);

  const handleClearFilters = () => {
    setSelectedTaller(undefined);
    setSelectedEstado(undefined);
    setSelectedTipo(undefined);
    setSelectedBus(undefined);
    setSelectedManager(undefined);
    setSearchOT('');
    setFechaIngreso(undefined);
    setFechaSalida(undefined);

    //  Forzar refetch en el siguiente ciclo
    setTimeout(() => {
      refetch();
      toast.info('Filtros limpiados');
    }, 0);
  };

  const handleSelectFechaIngreso = (date?: Date) => {
    setFechaIngreso(date);
    if (date) {
      setFechaSalida(undefined);
    }
  };

  const handleSelectFechaSalida = (date?: Date) => {
    setFechaSalida(date);
    if (date) {
      setFechaIngreso(undefined);
    }
  };

  const columns: ColumnDef<OrdenDeTrabajo>[] = [
    {
      accessorKey: 'numeroOrden',
      header: 'Nº OT',
      cell: ({ row }) => <span>{row.original.numeroOrden}</span>,
    },
    {
      accessorKey: 'patente',
      header: 'Patente',
      cell: ({ row }) => <span>{row.original.patente}</span>,
    },
    {
      accessorKey: 'numeroBus',
      header: 'Nº Bus',
      cell: ({ row }) => <span>{row.original.numeroBus}</span>,
    },
    {
      accessorKey: 'tipoOrden',
      header: 'Tipo',
      cell: ({ row }) => <span>{row.original.tipoOrden}</span>,
    },
    {
      accessorKey: 'estadoOrden',
      header: 'Estado',
      cell: ({ row }) => {
        const estado = row.original.estadoOrden;
        return (
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              estadoColors[estado] ?? 'bg-slate-300 text-black'
            }`}
          >
            {estado}
          </span>
        );
      },
    },

    {
      accessorKey: 'nombreTerminal',
      header: 'Terminal',
      cell: ({ row }) => <span>{row.original.nombreTerminal}</span>,
    },
    {
      accessorKey: 'ultMantencion',
      header: 'Ult. Mantención',
      cell: ({ row }) => {
        return <span>{row.original.ultMantencion?.toString() ?? '-'}</span>;
      },
    },
    {
      accessorKey: 'fechaIngreso',
      header: 'F. Ingreso',
      cell: ({ row }) => <span>{row.original.fechaIngreso}</span>,
    },
    {
      accessorKey: 'fechaCierre',
      header: 'F. Cierre',
      cell: ({ row }) => {
        return <span>{row.original.fechaCierre?.toString() ?? '-'}</span>;
      },
    },

    {
      accessorKey: 'kilometraje',
      header: 'Km',
      cell: ({ row }) => <span>{row.original.kilometraje}</span>,
    },

    {
      id: 'acciones',
      header: 'Acciones',
      cell: ({ row }) => {
        const idOrden = row.original.numeroOrden;

        return (
          <div className='flex flex-wrap gap-2'>
            {/* Botones visibles solo en pantallas grandes */}
            <div className='hidden gap-2 2xl:flex'>
              <Button
                variant='outline'
                size='sm'
                className='border-fuchsia-300 text-fuchsia-700'
              >
                <Settings className='mr-1 h-4 w-4' /> Sistema
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='border-fuchsia-300 text-fuchsia-700'
              >
                <User className='mr-1 h-4 w-4' /> Personal
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='border-fuchsia-300 text-fuchsia-700'
              >
                <Package className='mr-1 h-4 w-4' /> Insumos
              </Button>
              <Button
                variant='outline'
                size='sm'
                className='border-fuchsia-300 text-fuchsia-700'
              >
                <FileText className='mr-1 h-4 w-4' /> Ver Detalles
              </Button>
              <Button variant='destructive' size='sm'>
                <Trash2 className='mr-1 h-4 w-4' /> Eliminar
              </Button>
            </div>

            {/* Dropdown solo en pantallas menores a lg */}
            <div className='2xl:hidden'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    size='sm'
                    className='border-fuchsia-300 text-fuchsia-700'
                  >
                    <MoreVertical className='h-4 w-4' />
                    Acciones
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => console.log('Sistema', idOrden)}
                  >
                    <Settings className='mr-2 h-4 w-4 text-fuchsia-700' />{' '}
                    Sistema
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log('Personal', idOrden)}
                  >
                    <User className='mr-2 h-4 w-4 text-fuchsia-700' /> Personal
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log('Insumos', idOrden)}
                  >
                    <Package className='mr-2 h-4 w-4 text-fuchsia-700' />{' '}
                    Insumos
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log('Ver Detalles', idOrden)}
                  >
                    <FileText className='mr-2 h-4 w-4 text-fuchsia-700' /> Ver
                    Detalles
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => console.log('Eliminar', idOrden)}
                    className='text-red-600'
                  >
                    <Trash2 className='mr-2 h-4 w-4 text-red-600' /> Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      },
    },
  ];

  const pageSize = 15;
  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: Math.ceil((data?.total ?? 0) / pageSize),
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
    },
  });

  if (isLoading) return <p className='p-4'>Cargando órdenes...</p>;

  return (
    <>
      {/* Accordion filtros */}
      <div className='relative'>
        <Accordion
          type='single'
          collapsible
          value={isFilterOpen ? 'filters' : ''}
          onValueChange={(val) => setIsFilterOpen(val === 'filters')}
        >
          <AccordionItem value='filters'>
            <AccordionTrigger
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-fuchsia-500 px-4 py-1.5 text-sm font-semibold shadow-sm transition',
                isFilterOpen
                  ? 'bg-fuchsia-100 text-fuchsia-800'
                  : 'bg-white text-fuchsia-700 hover:bg-fuchsia-100 hover:text-fuchsia-800',
              )}
            >
              <div className='flex items-center gap-2'>
                <span className='flex h-6 w-6 items-center justify-center rounded-full border border-fuchsia-500 bg-white'>
                  <Search className='h-4 w-4 text-fuchsia-950' />
                </span>
                <span>
                  {isFilterOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
                </span>
              </div>
            </AccordionTrigger>

            <div className='absolute left-0 top-[100%] z-10 w-full shadow-lg'>
              <AccordionContent className='space-y-6 rounded-md border bg-muted p-6'>
                <div className='grid grid-cols-4 gap-4'>
                  {/* Nº OT */}
                  <div className='flex flex-col space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      N° OT
                    </label>
                    <Input
                      value={tempSearchOT}
                      onChange={(e) => setTempSearchOT(e.target.value)}
                      placeholder='Ej: 215890'
                      className='h-9'
                    />
                  </div>

                  {/* Taller */}
                  <div className='flex flex-col space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      Taller
                    </label>
                    <Select
                      value={selectedTaller?.toString()}
                      onValueChange={(val) => setSelectedTaller(Number(val))}
                    >
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Todos' />
                      </SelectTrigger>
                      <SelectContent>
                        {filtrosCache?.talleres?.map((t) => (
                          <SelectItem
                            key={t.codigo_taller}
                            value={t.codigo_taller.toString()}
                          >
                            {t.nombre_taller}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Estado */}
                  <div className='flex flex-col space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      Estado
                    </label>
                    <Select
                      value={selectedEstado?.toString()}
                      onValueChange={(val) => setSelectedEstado(Number(val))}
                    >
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Todos' />
                      </SelectTrigger>
                      <SelectContent>
                        {filtrosCache?.estadosOt?.map((e) => (
                          <SelectItem
                            key={e.id_estado_solicitud}
                            value={e.id_estado_solicitud.toString()}
                          >
                            {e.detalle_estado_solicitud}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tipo OT */}
                  <div className='flex flex-col space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      Tipo OT
                    </label>
                    <Select
                      value={selectedTipo?.toString()}
                      onValueChange={(val) => setSelectedTipo(Number(val))}
                    >
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Todos' />
                      </SelectTrigger>
                      <SelectContent>
                        {filtrosCache?.tiposOt?.map((t) => (
                          <SelectItem
                            key={t.id_tipo_orden}
                            value={t.id_tipo_orden.toString()}
                          >
                            {t.detalle_tipo_orden}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fecha ingreso */}
                  <div className='flex flex-col space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      Fecha Ingreso
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='h-9 justify-start font-normal'
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {fechaIngreso
                            ? dayjs(fechaIngreso).format('DD-MM-YYYY')
                            : 'Seleccione'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align='start' className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={fechaIngreso}
                          onSelect={handleSelectFechaIngreso}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Fecha cierre */}
                  <div className='flex flex-col space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      Fecha Cierre
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='h-9 justify-start font-normal'
                        >
                          <CalendarIcon className='mr-2 h-4 w-4' />
                          {fechaSalida
                            ? dayjs(fechaSalida).format('DD-MM-YYYY')
                            : 'Seleccione'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align='start' className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={fechaSalida}
                          onSelect={handleSelectFechaSalida}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Bus */}
                  <div className='flex flex-col space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      Bus
                    </label>
                    <Select
                      open={busOpen}
                      onOpenChange={setBusOpen}
                      value={selectedBus?.toString()}
                      onValueChange={(val) => setSelectedBus(Number(val))}
                    >
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Todos'>
                          {selectedBus
                            ? `${
                                filtrosCache?.buses.find(
                                  (b) => b.numero_interno === selectedBus,
                                )?.placa_patente
                              } - ${
                                filtrosCache?.buses.find(
                                  (b) => b.numero_interno === selectedBus,
                                )?.numero_interno
                              }`
                            : 'Todos'}
                        </SelectValue>
                      </SelectTrigger>

                      <VirtualizedSearchSelect
                        items={filtrosCache?.buses ?? []}
                        getKey={(b) => b.codigo_flota}
                        getLabel={(b) =>
                          `${b.placa_patente} - ${b.numero_interno}`
                        }
                        getValue={(b) => b.numero_interno}
                        open={busOpen}
                      />
                    </Select>
                  </div>
                  {/* OT Manager */}
                  <div className='flex flex-col space-y-1'>
                    <label className='text-xs font-medium text-muted-foreground'>
                      OT Manager
                    </label>
                    <Select
                      open={managerOpen}
                      onOpenChange={setManagerOpen}
                      value={selectedManager?.toString()}
                      onValueChange={(val) => setSelectedManager(Number(val))}
                    >
                      <SelectTrigger className='h-9'>
                        <SelectValue placeholder='Todos'>
                          {selectedManager
                            ? (filtrosCache?.nrosManager.find(
                                (m) => m.ot_manager === selectedManager,
                              )?.nombre_manager ?? selectedManager.toString())
                            : 'Todos'}
                        </SelectValue>
                      </SelectTrigger>

                      <VirtualizedSearchSelect
                        items={filtrosCache?.nrosManager ?? []}
                        getKey={(m) => m.ot_manager}
                        getLabel={(m) =>
                          m.nombre_manager
                            ? `${m.nombre_manager} (${m.ot_manager})`
                            : m.ot_manager.toString()
                        }
                        getValue={(m) => m.ot_manager}
                        open={managerOpen}
                      />
                    </Select>
                  </div>
                </div>

                {/* Botones */}
                <div className='mt-4 flex justify-end gap-3'>
                  <Button
                    onClick={() => refetch()}
                    className='h-9 bg-fuchsia-900 text-white hover:bg-fuchsia-900'
                  >
                    <Dock className='mr-2 h-4 w-4' /> Actualizar
                  </Button>
                  <Button
                    variant='secondary'
                    className='h-9'
                    onClick={handleClearFilters}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </AccordionContent>
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Tabla */}
      <div className='mt-6 max-h-[550px] overflow-y-auto rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} isHeader>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row, i) => (
                <TableRow key={row.id} index={i}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  Sin resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className='flex items-center justify-center'>
        <DataTablePagination table={table} />
      </div>

      {isDeleteOpen && selectedId && (
        <OTDeleteDialog
          open={isDeleteOpen}
          setOpen={setIsDeleteOpen}
          idOrden={selectedId}
        />
      )}
    </>
  );
}
