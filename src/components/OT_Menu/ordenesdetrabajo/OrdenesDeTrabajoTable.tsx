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
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { DataTablePagination } from '../../DataTablePagination';
import { cn } from '@/lib/utils';

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
      header: ({ column }) => (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nº OT <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      ),
      cell: ({ row }) => <span>{row.original.numeroOrden}</span>,
    },
    {
      accessorKey: 'patente',
      header: 'Patente',
      cell: ({ row }) => <span>{row.original.patente}</span>,
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
      accessorKey: 'fechaIngreso',
      header: 'F. Ingreso',
      cell: ({ row }) => <span>{row.original.fechaIngreso}</span>,
    },

    {
      accessorKey: 'kilometraje',
      header: 'Km',
      cell: ({ row }) => <span>{row.original.kilometraje}</span>,
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
    </>
  );
}
