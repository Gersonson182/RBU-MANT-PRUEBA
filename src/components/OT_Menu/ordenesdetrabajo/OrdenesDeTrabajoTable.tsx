import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import type {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { useOTMenu } from '@/hooks/OT/OTMenu/useOTMenu';
import type {
  OrdenDeTrabajo,
  GetOrdenesTrabajoInput,
  DataFiltrosMant,
} from '@/types/OT/OTMenu';

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

// Icons
import { ArrowUpDown, CalendarIcon, Search, Dock } from 'lucide-react';

export default function OTMenuTable() {
  const { getOrdenes, getAllFiltros } = useOTMenu();

  // Estados tabla
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fechas
  const [fechaIngreso, setFechaIngreso] = useState<Date>();
  const [fechaSalida, setFechaSalida] = useState<Date>();

  // Filtros dinámicos
  const [filtros, setFiltros] = useState<DataFiltrosMant | null>(null);
  const [selectedTaller, setSelectedTaller] = useState<number | undefined>();
  const [selectedEstado, setSelectedEstado] = useState<number | undefined>();
  const [selectedTipo, setSelectedTipo] = useState<number | undefined>();
  const [selectedBus, setSelectedBus] = useState<number | undefined>();
  const [selectedManager, setSelectedManager] = useState<number | undefined>();
  const [searchOT, setSearchOT] = useState<string>('');
  const [pageIndex, setPageIndex] = useState(0);

  // Query tabla
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ordenes-trabajo', pageIndex],
    queryFn: () =>
      getOrdenes({
        nroOT: searchOT ? Number(searchOT) : undefined,
        codTaller: selectedTaller,
        estadoOT: selectedEstado,
        tipoOT: selectedTipo,
        nroBus: selectedBus,
        nroManager: selectedManager,
        fechaIngreso: fechaIngreso?.toISOString().split('T')[0],
        fechaSalida: fechaSalida?.toISOString().split('T')[0],
        pagina: pageIndex,
      }),
    keepPreviousData: true,
  });

  // Traer filtros al cargar
  useEffect(() => {
    getAllFiltros().then((res) => {
      if (res) setFiltros(res);
    });
  }, []);

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
      cell: ({ row }) => <span>{row.original.estadoOrden}</span>,
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

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // 👈 MUY IMPORTANTE: la paginación viene del backend
    pageCount: Math.ceil((data?.total ?? 0) / 50), // 👈 total / tamaño fijo (ej: 50 filas)
    state: {
      sorting,
      columnFilters,
      pagination: {
        pageIndex, // 👈 controlado por React
        pageSize: 50, // 👈 fijo porque tu SP no soporta cambiarlo
      },
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function'
          ? updater({ pageIndex, pageSize: 50 })
          : updater;
      setPageIndex(newState.pageIndex);
    },
  });

  const handleClearFilters = () => {
    setSelectedTaller(undefined);
    setSelectedEstado(undefined);
    setSelectedTipo(undefined);
    setSelectedBus(undefined);
    setSelectedManager(undefined);
    setSearchOT('');
    setFechaIngreso(undefined);
    setFechaSalida(undefined);
    toast.info('Filtros limpiados');
    refetch();
  };

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
                <div className='grid grid-cols-3 gap-6'>
                  {/* Nº OT */}
                  <div>
                    <label className='text-sm font-semibold text-primary'>
                      Nº OT
                    </label>
                    <Input
                      value={searchOT}
                      onChange={(e) => setSearchOT(e.target.value)}
                      placeholder='Ej: 215890'
                    />
                  </div>

                  {/* Taller */}
                  <div>
                    <label className='text-sm font-semibold text-primary'>
                      Taller
                    </label>
                    <Select
                      value={selectedTaller?.toString()}
                      onValueChange={(val) => setSelectedTaller(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Todos' />
                      </SelectTrigger>
                      <SelectContent>
                        {filtros?.talleres?.map((t) => (
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

                  {/* Estado OT */}
                  <div>
                    <label className='text-sm font-semibold text-primary'>
                      Estado
                    </label>
                    <Select
                      value={selectedEstado?.toString()}
                      onValueChange={(val) => setSelectedEstado(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Todos' />
                      </SelectTrigger>
                      <SelectContent>
                        {filtros?.estadosOt?.map((e) => (
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
                  <div>
                    <label className='text-sm font-semibold text-primary'>
                      Tipo OT
                    </label>
                    <Select
                      value={selectedTipo?.toString()}
                      onValueChange={(val) => setSelectedTipo(Number(val))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Todos' />
                      </SelectTrigger>
                      <SelectContent>
                        {filtros?.tiposOt?.map((t) => (
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
                  <div>
                    <label className='text-sm font-semibold text-primary'>
                      Fecha Ingreso
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-start text-left font-normal'
                        >
                          <CalendarIcon className='mr-2 h-4 w-4 text-fuchsia-900' />
                          {fechaIngreso
                            ? format(fechaIngreso, 'dd-MM-yyyy')
                            : 'Seleccione'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align='start' className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={fechaIngreso}
                          onSelect={(date) => setFechaIngreso(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Fecha salida */}
                  <div>
                    <label className='text-sm font-semibold text-primary'>
                      Fecha Salida
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant='outline'
                          className='w-full justify-start text-left font-normal'
                        >
                          <CalendarIcon className='mr-2 h-4 w-4 text-fuchsia-900' />
                          {fechaSalida
                            ? format(fechaSalida, 'dd-MM-yyyy')
                            : 'Seleccione'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align='start' className='w-auto p-0'>
                        <Calendar
                          mode='single'
                          selected={fechaSalida}
                          onSelect={(date) => setFechaSalida(date)}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Botones */}
                <div className='mt-4 flex flex-wrap justify-end gap-4'>
                  <Button
                    onClick={() => refetch()}
                    className='bg-fuchsia-900 text-white hover:bg-fuchsia-900'
                  >
                    <Dock className='mr-2 h-4 w-4' /> Actualizar
                  </Button>
                  <Button variant='secondary' onClick={handleClearFilters}>
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
              <TableRow key={headerGroup.id}>
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
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
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
