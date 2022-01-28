import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { Observable } from "rxjs";
import { NgxDataSource, SortFT } from "ngx-data-source";
import { MaterialPaginatorConnector } from "./material-paginator-connector";
import { CompareFunctions, extractEventStreamFromSorts } from "./plugins-for-sort";

export class MaterialSortAndPaginatorConnector<T, F = keyof T> {

    private paginatorConnector: MaterialPaginatorConnector<T, F> | undefined = undefined

    constructor(private dataSource: NgxDataSource<T, F>){}

    addSorts(comparators: CompareFunctions<T, F>, ...sorts: MatSort[]): void {
        const stream$: Observable<SortFT<T, F>> = extractEventStreamFromSorts(comparators, ...sorts);
        this.dataSource.getInputPlummer().connectSortPipe(stream$);
    }

    addPaginators(...paginators: MatPaginator[]): void {
        this.paginatorConnector = new MaterialPaginatorConnector(this.dataSource, ...paginators);
    }

    disconnect(): void {
        this.paginatorConnector?.disconnect();
    } 
}