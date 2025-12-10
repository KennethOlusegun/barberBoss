import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
  @ApiProperty({ description: 'Página atual' })
  currentPage: number;

  @ApiProperty({ description: 'Itens por página' })
  itemsPerPage: number;

  @ApiProperty({ description: 'Total de itens' })
  totalItems: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;

  @ApiProperty({ description: 'Indica se há página anterior' })
  hasPreviousPage: boolean;

  @ApiProperty({ description: 'Indica se há próxima página' })
  hasNextPage: boolean;
}

export class PaginatedResult<T> {
  @ApiProperty({ description: 'Dados da página atual', isArray: true })
  data: T[];

  @ApiProperty({ description: 'Metadados de paginação', type: PaginationMeta })
  meta: PaginationMeta;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
      hasPreviousPage: page > 1,
      hasNextPage: page < Math.ceil(total / limit),
    };
  }
}
